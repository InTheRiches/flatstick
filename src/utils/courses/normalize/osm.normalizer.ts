/**
 * OSM / Overpass normalizer.
 *
 * Pure functions that convert raw `OverpassResponse` payloads into typed
 * domain objects.  No network I/O.  No state.  No side effects.
 *
 * Layer contract:
 *   - Input:  types from `@/services/osm/osm.types`
 *   - Output: types from `@/models/course` and `@/models/geo`
 */

import type { BunkerPolygon, FairwayPolygon, HolePath, ProcessedGreen, TeeBox } from "@/models/course"
import type { BoundingBox, LatLng, XYPoint } from "@/models/geo"
import type { OverpassElement, OverpassResponse } from "@/services/osm/osm.types"
import { isPointInPolygonXY } from "@/utils/courses/geometry/polygon.utils"

// ---------------------------------------------------------------------------
// Public result types
// ---------------------------------------------------------------------------

/**
 * The structured result of extracting course features from an Overpass body
 * response.  Greens do not yet have `lidar` — that is populated separately
 * by the course loader after the 3DEP fetch.
 */
export type OsmCourseFeatures = {
  /** Greens with polygon and bbox but without lidar data. */
  identifiedGreens: Array<Omit<ProcessedGreen, "lidar">>
  bunkers: BunkerPolygon[]
  fairways: FairwayPolygon[]
  teeBoxes: TeeBox[]
  holes: HolePath[]
  /**
   * Count of green polygons that could not be matched to any hole line.
   * Used for diagnostics / warnings — not an error that aborts loading.
   */
  unmatchedGreenCount: number
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Build a lookup map of node id → LatLng from an Overpass response. */
function buildNodeMap(elements: OverpassElement[]): Map<number, LatLng> {
  const map = new Map<number, LatLng>()
  for (const el of elements) {
    if (el.type === "node") {
      map.set(el.id, { latitude: el.lat, longitude: el.lon })
    }
  }
  return map
}

/**
 * Resolve the ordered coordinate array for a `way` element using the node map.
 * Returns an empty array when any node id is missing (incomplete OSM data).
 */
function resolveWayCoords(
  nodes: number[],
  nodeMap: Map<number, LatLng>,
): LatLng[] {
  const coords: LatLng[] = []
  for (const id of nodes) {
    const pt = nodeMap.get(id)
    if (pt === undefined) return [] // abort on missing node
    coords.push(pt)
  }
  return coords
}

/**
 * Compute the bounding box of a LatLng coordinate array.
 * Returns null on empty input.
 */
function computeBbox(coords: LatLng[]): BoundingBox | null {
  if (coords.length === 0) return null
  let xmin = Infinity, ymin = Infinity
  let xmax = -Infinity, ymax = -Infinity
  for (const { latitude: y, longitude: x } of coords) {
    if (x < xmin) xmin = x
    if (x > xmax) xmax = x
    if (y < ymin) ymin = y
    if (y > ymax) ymax = y
  }
  return { xmin, ymin, xmax, ymax }
}

/** Convert a LatLng polygon to XY (GeoJSON) convention. */
function toXYPolygon(coords: LatLng[]): XYPoint[] {
  return coords.map(({ latitude, longitude }) => ({
    x: longitude,
    y: latitude,
  }))
}

// ---------------------------------------------------------------------------
// Public normalizers
// ---------------------------------------------------------------------------

/**
 * Extract all course features from a raw Overpass body response.
 *
 * The response must have been fetched with `out body; >; out skel qt;` so
 * that node coordinates are available as standalone `node` elements.
 *
 * Algorithm:
 *   1. Build a node-id → LatLng map from all node elements.
 *   2. Separate ways/relations into greens, hole-lines, bunkers, fairways.
 *   3. For each green polygon, find a hole line that contains one of its nodes
 *      (OSM convention: the hole line passes through the green).
 *   4. Associate the hole's `ref` tag as the hole number.
 *
 * @param response - Raw OverpassResponse from `fetchCourseGeometry`.
 */
export function extractCourseFeatures(
  response: OverpassResponse,
): OsmCourseFeatures {
  const elements = response.elements ?? []
  const nodeMap = buildNodeMap(elements)

  // ── Collect raw feature arrays ──────────────────────────────────────────

  /** Green polygon coordinates (LatLng).  One entry per green way. */
  const rawGreens: LatLng[][] = []

  /** Hole lines: { ref: hole-number-string, nodes: LatLng[] } */
  const rawHoles: Array<{ ref: string; nodes: LatLng[] }> = []

  const rawBunkers: BunkerPolygon[] = []
  const rawFairways: FairwayPolygon[] = []
  const rawTeeBoxes: TeeBox[] = []

  for (const el of elements) {
    if (el.type === "node" && el.tags?.golf === "tee") {
      rawTeeBoxes.push({
        osmId: el.id,
        coordinates: [{ latitude: el.lat, longitude: el.lon }],
      })
    }

    if (el.type === "node" && el.tags?.golf === "bunker") {
      rawBunkers.push({
        osmId: el.id,
        coordinates: [{ latitude: el.lat, longitude: el.lon }],
      })
    }

    if (el.type === "way" && el.nodes) {
      const coords = resolveWayCoords(el.nodes, nodeMap)
      const golf = el.tags?.golf

      if (golf === "hole" && el.tags?.ref) {
        rawHoles.push({ ref: el.tags.ref, nodes: coords })
      }

      if (golf === "tee") {
        rawTeeBoxes.push({
          osmId: el.id,
          coordinates: coords,
        })
      }

      if (coords.length < 3) continue // polygons need ≥ 3 points

      if (golf === "green") {
        rawGreens.push(coords)
      } else if (golf === "bunker") {
        rawBunkers.push({ osmId: el.id, coordinates: coords })
      } else if (golf === "fairway") {
        rawFairways.push({ osmId: el.id, coordinates: coords })
      }
    }

    if (el.type === "relation" && el.tags?.golf === "fairway" && el.members) {
      // Flatten relation members into individual fairway way polygons.
      for (const member of el.members) {
        if (member.type !== "way") continue
        const way = elements.find(
          (e) => e.type === "way" && e.id === member.ref,
        )
        if (!way || way.type !== "way" || !way.nodes) continue
        // Skip greens/bunkers that are relation members — they are handled above.
        if (way.tags?.golf === "green" || way.tags?.golf === "bunker") continue
        const coords = resolveWayCoords(way.nodes, nodeMap)
        if (coords.length < 3) continue
        rawFairways.push({ osmId: way.id, coordinates: coords })
      }
    }
  }

  // ── Associate greens → hole numbers ────────────────────────────────────

  const identifiedGreens: Array<Omit<ProcessedGreen, "lidar">> = []
  let unmatchedGreenCount = 0

  for (const greenCoords of rawGreens) {
    const greenXY = toXYPolygon(greenCoords)

    const matchedHole = rawHoles.find((hole) =>
      hole.nodes.some((node) =>
        isPointInPolygonXY({ x: node.longitude, y: node.latitude }, greenXY),
      ),
    )

    if (!matchedHole) {
      unmatchedGreenCount++
      continue
    }

    // Deduplicate: if a green for this hole number already exists, skip.
    if (identifiedGreens.some((g) => g.hole === matchedHole.ref)) continue

    const bbox = computeBbox(greenCoords)
    if (!bbox) continue

    identifiedGreens.push({
      hole: matchedHole.ref,
      polygon: greenXY,
      bbox,
    })
  }

  return {
    identifiedGreens,
    bunkers: rawBunkers,
    fairways: rawFairways,
    teeBoxes: rawTeeBoxes,
    holes: rawHoles.map((h) => ({ hole: h.ref, coordinates: h.nodes })),
    unmatchedGreenCount,
  }
}

/**
 * Extract a putting green's boundary polygon from a `fetchPuttingGreenByLocation`
 * or `fetchPuttingGreenById` response.
 *
 * The response must have been fetched with `out geom;` so geometry is inlined.
 *
 * Returns:
 *   - `{ osmId, boundary }` when a valid green is found.
 *   - `null` when the response contains no usable green element.
 */
export function extractPuttingGreenBoundary(
  response: OverpassResponse,
): { osmId: number; boundary: LatLng[] } | null {
  for (const el of response.elements) {
    if (el.type !== "way" || !el.geometry || el.geometry.length < 3) continue

    const boundary: LatLng[] = el.geometry.map(({ lat, lon }) => ({
      latitude: lat,
      longitude: lon,
    }))

    return { osmId: el.id, boundary }
  }

  return null
}
