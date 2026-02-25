/**
 * Raw response shapes from the Overpass API.
 *
 * These types exist ONLY in the fetch and normalization layers.
 * No file above `osm.normalizer.ts` should import from this module.
 */

// ---------------------------------------------------------------------------
// Overpass element variants
// ---------------------------------------------------------------------------

/** Geometry point as returned by `out geom;` queries. */
export type OverpassGeomPoint = {
  lat: number
  lon: number
}

export type OverpassNodeElement = {
  type: "node"
  id: number
  lat: number
  lon: number
  tags?: Record<string, string>
}

/**
 * A way element.
 * `nodes` is present when `out body; >;` is used (node-id list).
 * `geometry` is present when `out geom;` is used (inlined lat/lon).
 * Both can be present simultaneously.
 */
export type OverpassWayElement = {
  type: "way"
  id: number
  nodes?: number[]
  geometry?: OverpassGeomPoint[]
  tags?: Record<string, string>
}

export type OverpassRelationMember = {
  type: "node" | "way" | "relation"
  ref: number
  role: string
}

export type OverpassRelationElement = {
  type: "relation"
  id: number
  members: OverpassRelationMember[]
  tags?: Record<string, string>
}

export type OverpassElement =
  | OverpassNodeElement
  | OverpassWayElement
  | OverpassRelationElement

export type OverpassResponse = {
  version?: number
  generator?: string
  elements: OverpassElement[]
}

// ---------------------------------------------------------------------------
// Derived types returned by the fetch layer (not raw JSON)
// ---------------------------------------------------------------------------

/**
 * A candidate OSM course identity returned by `fetchCourseIdsByLocation`.
 * Callers choose which candidate to use (usually the first, but disambiguation
 * is explicit rather than implicit).
 */
export type OsmCourseCandidate = {
  id: number
  type: "way" | "relation"
  /** Name from the `name` tag, or null when not present. */
  name: string | null
}
