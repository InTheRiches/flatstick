/**
 * OSM / Overpass fetch layer.
 *
 * Each function is a thin wrapper around a single Overpass query.
 * Responsibilities:
 *   - Build the Overpass QL query string
 *   - Execute the HTTP request
 *   - Deserialise the JSON response
 *   - Propagate network errors (throw) — but do NOT transform the data
 *
 * Transformation and normalisation live in `osm.normalizer.ts`.
 */

import type {
    OsmCourseCandidate,
    OverpassResponse,
} from "./osm.types"

const OVERPASS_URL = "https://overpass-api.de/api/interpreter"
const USER_AGENT = "Flatstick/2.0 (contact: support@flatstick.app)"

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** POST a raw Overpass QL query and return the parsed JSON response. */
async function postOverpassQuery(
  query: string,
  signal?: AbortSignal,
): Promise<OverpassResponse> {
  const res = await fetch(OVERPASS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "User-Agent": USER_AGENT,
    },
    body: "data=" + encodeURIComponent(query),
    signal,
  })

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(
      `Overpass HTTP ${res.status}: ${text.slice(0, 300) || res.statusText}`,
    )
  }

  const json = await res.json()

  if (!Array.isArray(json?.elements)) {
    throw new Error("Overpass response missing `elements` array")
  }

  return json as OverpassResponse
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Find OSM golf course IDs near a lat/lon coordinate.
 *
 * Returns an array of candidates (ordered as returned by Overpass).
 * The caller is responsible for disambiguation when multiple candidates
 * exist — this function never silently picks one.
 *
 * @param lat - Latitude of the reference point.
 * @param lon - Longitude of the reference point.
 * @param marginDeg - Bounding-box half-width in degrees (default 0.01 ≈ 1 km).
 * @param signal - Optional AbortSignal for cancellation.
 */
export async function fetchCourseIdsByLocation(
  lat: number,
  lon: number,
  marginDeg = 0.01,
  signal?: AbortSignal,
): Promise<OsmCourseCandidate[]> {
  const s = lat - marginDeg
  const n = lat + marginDeg
  const w = lon - marginDeg
  const e = lon + marginDeg

  const query = [
    `[out:json][timeout:25];`,
    `(`,
    `  way["leisure"="golf_course"](${s},${w},${n},${e});`,
    `  relation["leisure"="golf_course"](${s},${w},${n},${e});`,
    `);`,
    `out ids tags;`,
  ].join("\n")

  const data = await postOverpassQuery(query, signal)

  return data.elements
    .filter((el) => el.type === "way" || el.type === "relation")
    .map((el) => ({
      id: el.id,
      type: el.type as "way" | "relation",
      name: (el as { tags?: Record<string, string> }).tags?.name ?? null,
    }))
}

/**
 * Fetch all golf feature geometry for a given OSM course id.
 *
 * The query retrieves ways/relations tagged with golf=green, golf=hole,
 * golf=bunker, and golf=fairway that fall within the area of the given
 * course element, plus the node coordinates needed to assemble them.
 *
 * @param osmId - The OSM way or relation id of the course.
 * @param signal - Optional AbortSignal for cancellation.
 */
export async function fetchCourseGeometry(
  osmId: number,
  signal?: AbortSignal,
): Promise<OverpassResponse> {
  const query = [
    `[out:json][timeout:25];`,
    `(`,
    `  way(${osmId});`,
    `  relation(${osmId});`,
    `)->.course_geometry;`,
    `.course_geometry map_to_area -> .course_area;`,
    `(`,
    `  way["golf"="green"](area.course_area);`,
    `  way["golf"="hole"](area.course_area);`,
    `  way["golf"="bunker"](area.course_area);`,
    `  relation["golf"="fairway"](area.course_area);`,
    `  way["golf"="fairway"](area.course_area);`,
    `);`,
    `out body;`,
    `>;`,
    `out skel qt;`,
  ].join("\n")

  return postOverpassQuery(query, signal)
}

/**
 * Fetch a single putting green polygon by location.
 *
 * Uses a tight bounding box to find the green the user is standing on.
 * The response includes full geometry (`out geom;`) so the normalizer can
 * build the boundary polygon directly without a separate node lookup.
 *
 * @param lat - Latitude of the player's current position.
 * @param lon - Longitude of the player's current position.
 * @param latMargin - Half-height of the search box in degrees (default ≈ 15 m).
 * @param lonMargin - Half-width of the search box in degrees (default ≈ 17 m).
 * @param signal - Optional AbortSignal for cancellation.
 */
export async function fetchPuttingGreenByLocation(
  lat: number,
  lon: number,
  latMargin = 0.00014,
  lonMargin = 0.00019,
  signal?: AbortSignal,
): Promise<OverpassResponse> {
  const s = lat - latMargin
  const n = lat + latMargin
  const w = lon - lonMargin
  const e = lon + lonMargin

  const query = [
    `[out:json][timeout:25];`,
    `(`,
    `  way["golf"="green"](${s},${w},${n},${e});`,
    `);`,
    `out geom;`,
  ].join("\n")

  return postOverpassQuery(query, signal)
}

/**
 * Fetch a known putting green polygon by its OSM way id.
 *
 * @param osmId - The OSM way id of the putting green.
 * @param signal - Optional AbortSignal for cancellation.
 */
export async function fetchPuttingGreenById(
  osmId: number,
  signal?: AbortSignal,
): Promise<OverpassResponse> {
  const query = [
    `[out:json][timeout:25];`,
    `(`,
    `  way(${osmId});`,
    `);`,
    `out geom;`,
  ].join("\n")

  return postOverpassQuery(query, signal)
}
