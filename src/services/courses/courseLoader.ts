/**
 * Course loader — pipeline orchestration.
 *
 * This module assembles the full data pipeline for both simulation modes.
 * It is the ONLY place where the fetch, normalisation, and persistence layers
 * are composed together.
 *
 * Design decisions:
 *   - Returns a `Result<T, E>` discriminated union so screens never need to
 *     handle raw exceptions.
 *   - Firestore is injected so there is no global Firebase dependency.
 *   - 3DEP fetches for multiple greens are parallelised with `Promise.all`.
 *   - Cache staleness is configurable per call-site (default 30 days).
 *   - The loader logs diagnostics but never logs personally identifying data.
 */

import type { CourseData, ProcessedGreen, PuttingGreenData } from "@/models/course"
import type { LatLng } from "@/models/geo"
import {
    fetchCourseGeometry,
    fetchCourseIdsByLocation,
    fetchPuttingGreenByLocation,
} from "@/services/osm/osm.client"
import type { OsmCourseCandidate } from "@/services/osm/osm.types"
import { fetch3DEPSamples } from "@/services/usgs/usgs.client"
import {
    extractCourseFeatures,
    extractPuttingGreenBoundary,
} from "@/utils/courses/normalize/osm.normalizer"
import { buildLidarGrid } from "@/utils/courses/normalize/usgs.normalizer"
import type { Firestore } from "firebase/firestore"
import {
    getCachedCourse,
    getCachedPuttingGreen,
    isCacheStale,
    saveCourse,
    savePuttingGreen,
} from "./courseRepository"

// ---------------------------------------------------------------------------
// Result type
// ---------------------------------------------------------------------------

/**
 * Lightweight Result monad.  Avoids unhandled promise rejections in screens.
 */
export type Result<T, E> =
  | { ok: true; value: T }
  | { ok: false; error: E }

// ---------------------------------------------------------------------------
// Default constants
// ---------------------------------------------------------------------------

/** 30 days in milliseconds. */
const DEFAULT_COURSE_CACHE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000

// ---------------------------------------------------------------------------
// Full-course pipeline
// ---------------------------------------------------------------------------

export type CourseLoadError =
  | { type: "no_osm_result" }
  | { type: "osm_ambiguous"; candidates: OsmCourseCandidate[] }
  | { type: "osm_fetch_failed"; cause: unknown }
  | { type: "no_greens_identified"; unmatchedCount: number }
  | { type: "network_error"; cause: unknown }

/**
 * Load the full course dataset for the simulation screens.
 *
 * Pipeline:
 *   1. Check Firestore cache.  If fresh → return immediately.
 *   2. `fetchCourseIdsByLocation` → find the OSM course id at `location`.
 *   3. `fetchCourseGeometry`      → download all feature geometry.
 *   4. `extractCourseFeatures`    → normalise OSM → identified greens + bunkers + fairways.
 *   5. `fetch3DEPSamples` (parallel) → elevation samples for every green.
 *   6. `buildLidarGrid`            → validate and structure each grid.
 *   7. Assemble `CourseData` → persist → return.
 *
 * When the OSM lookup returns multiple candidates (e.g. a course with multiple
 * areas in the same bounding box), the first candidate is used.  The returned
 * `CourseData.osmId` identifies which one was chosen, allowing the caller to
 * surface disambiguation UI if needed.
 *
 * @param location       - Reference coordinate (player's GPS position).
 * @param db             - Injected Firestore instance.
 * @param signal         - Optional AbortSignal for request cancellation.
 * @param cacheMaxAgeMs  - Cache TTL in milliseconds (default 30 days).
 */
export async function loadCourseData(params: {
  location: LatLng
  db: Firestore
  signal?: AbortSignal
  cacheMaxAgeMs?: number
}): Promise<Result<CourseData, CourseLoadError>> {
  const {
    location,
    db,
    signal,
    cacheMaxAgeMs = DEFAULT_COURSE_CACHE_MAX_AGE_MS,
  } = params

  try {
    // ── Step 1: OSM id lookup ───────────────────────────────────────────────

    let candidates: OsmCourseCandidate[]
    try {
      candidates = await fetchCourseIdsByLocation(
        location.latitude,
        location.longitude,
        undefined,
        signal,
      )
    } catch (cause) {
      return { ok: false, error: { type: "osm_fetch_failed", cause } }
    }

    if (candidates.length === 0) {
      return { ok: false, error: { type: "no_osm_result" } }
    }

    // Use the first candidate.  When there are multiple we still proceed —
    // the caller can inspect `CourseData.osmId` to see which was chosen.
    const candidate = candidates[0]
    const osmId = candidate.id

    // ── Step 2: Firestore cache check ───────────────────────────────────────

    const cached = await getCachedCourse(db, osmId)
    if (cached && !isCacheStale(cached.lastFetchedAt, cacheMaxAgeMs)) {
      return { ok: true, value: cached }
    }

    // ── Step 3: Fetch full course geometry ──────────────────────────────────

    let osmResponse
    try {
      osmResponse = await fetchCourseGeometry(osmId, signal)
    } catch (cause) {
      return { ok: false, error: { type: "osm_fetch_failed", cause } }
    }

    // ── Step 4: Normalise OSM response ──────────────────────────────────────

    const features = extractCourseFeatures(osmResponse)

    if (features.identifiedGreens.length === 0) {
      return {
        ok: false,
        error: {
          type: "no_greens_identified",
          unmatchedCount: features.unmatchedGreenCount,
        },
      }
    }

    if (features.unmatchedGreenCount > 0) {
      console.warn(
        `[courseLoader] ${features.unmatchedGreenCount} green(s) could not be matched to a hole.`,
      )
    }

    // ── Step 5: Fetch 3DEP elevation for each green (parallelised) ──────────

    const greensWithLidar: ProcessedGreen[] = await Promise.all(
      features.identifiedGreens.map(async (green) => {
        try {
          const rawSamples = await fetch3DEPSamples(green.bbox, signal)
          const lidarResult = buildLidarGrid(rawSamples)

          if (!lidarResult.ok) {
            console.warn(
              `[courseLoader] No lidar for green ${green.hole}: ${lidarResult.reason}`,
            )
            return { ...green, lidar: null }
          }

          return { ...green, lidar: lidarResult.grid }
        } catch {
          // 3DEP failure for one green must not abort the whole load.
          console.warn(
            `[courseLoader] 3DEP fetch failed for green ${green.hole}; lidar set to null.`,
          )
          return { ...green, lidar: null }
        }
      }),
    )

    // ── Step 6: Assemble and persist ────────────────────────────────────────

    const courseData: CourseData = {
      osmId,
      name: candidate.name ?? `Course ${osmId}`,
      greens: greensWithLidar,
      bunkers: features.bunkers,
      fairways: features.fairways,
      lastFetchedAt: Date.now(),
    }

    try {
      await saveCourse(db, courseData)
    } catch (e) {
      // Persistence failure is non-fatal — return the data anyway.
      console.warn("[courseLoader] Failed to persist course to Firestore:", e)
    }

    return { ok: true, value: courseData }
  } catch (cause) {
    return { ok: false, error: { type: "network_error", cause } }
  }
}

// ---------------------------------------------------------------------------
// Putting-green pipeline
// ---------------------------------------------------------------------------

export type GreenLoadError =
  | { type: "no_green_at_location" }
  | { type: "no_lidar_data"; reason: "empty" | "non_rectangular" }
  | { type: "network_error"; cause: unknown }

/**
 * Load the putting-green dataset for the practice simulation.
 *
 * Pipeline:
 *   1. Check Firestore cache.  If fresh → return immediately.
 *   2. `fetchPuttingGreenByLocation` → find the green the player is standing on.
 *   3. `extractPuttingGreenBoundary` → normalise boundary polygon.
 *   4. `fetch3DEPSamples`           → elevation samples for the green's bbox.
 *   5. `buildLidarGrid`             → validate and structure the grid.
 *   6. Assemble `PuttingGreenData` → persist → return.
 *
 * Unlike the course loader, a missing or non-rectangular lidar grid is a hard
 * failure here because the putting-green simulation has no useful fallback.
 *
 * @param location      - Player's current GPS position (on the green).
 * @param db            - Injected Firestore instance.
 * @param signal        - Optional AbortSignal for request cancellation.
 * @param cacheMaxAgeMs - Cache TTL in milliseconds (default 30 days).
 */
export async function loadPuttingGreenData(params: {
  location: LatLng
  db: Firestore
  signal?: AbortSignal
  cacheMaxAgeMs?: number
}): Promise<Result<PuttingGreenData, GreenLoadError>> {
  const {
    location,
    db,
    signal,
    cacheMaxAgeMs = DEFAULT_COURSE_CACHE_MAX_AGE_MS,
  } = params

  try {
    // ── Step 1: Fetch green boundary from OSM ───────────────────────────────

    let osmResponse
    try {
      osmResponse = await fetchPuttingGreenByLocation(
        location.latitude,
        location.longitude,
        undefined,
        undefined,
        signal,
      )
    } catch (cause) {
      return { ok: false, error: { type: "network_error", cause } }
    }

    const greenInfo = extractPuttingGreenBoundary(osmResponse)
    if (!greenInfo) {
      return { ok: false, error: { type: "no_green_at_location" } }
    }

    const { osmId, boundary } = greenInfo

    // ── Step 2: Firestore cache check ───────────────────────────────────────

    const cached = await getCachedPuttingGreen(db, osmId)
    if (cached && !isCacheStale(cached.lastFetchedAt, cacheMaxAgeMs)) {
      return { ok: true, value: cached }
    }

    // ── Step 3: Compute bbox from boundary ──────────────────────────────────

    const lats = boundary.map((p) => p.latitude)
    const lons = boundary.map((p) => p.longitude)
    const bbox = {
      xmin: Math.min(...lons),
      ymin: Math.min(...lats),
      xmax: Math.max(...lons),
      ymax: Math.max(...lats),
    }

    // ── Step 4: Fetch and validate 3DEP elevation ───────────────────────────

    let rawSamples
    try {
      rawSamples = await fetch3DEPSamples(bbox, signal)
    } catch (cause) {
      return { ok: false, error: { type: "network_error", cause } }
    }

    const lidarResult = buildLidarGrid(rawSamples)
    if (!lidarResult.ok) {
      return { ok: false, error: { type: "no_lidar_data", reason: lidarResult.reason } }
    }

    // ── Step 5: Assemble and persist ────────────────────────────────────────

    const greenData: PuttingGreenData = {
      osmId,
      boundary,
      lidar: lidarResult.grid,
      lastFetchedAt: Date.now(),
    }

    try {
      await savePuttingGreen(db, osmId, greenData)
    } catch (e) {
      console.warn(
        "[courseLoader] Failed to persist putting green to Firestore:",
        e,
      )
    }

    return { ok: true, value: greenData }
  } catch (cause) {
    return { ok: false, error: { type: "network_error", cause } }
  }
}
