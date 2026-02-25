/**
 * Core geographic primitive types used throughout the application.
 *
 * These are the ONLY coordinate types the business logic layer works with.
 * Raw API types (OverpassElement, USGS samples) are kept in their own
 * service-layer modules and never leak above the normalizer layer.
 */

// ---------------------------------------------------------------------------
// Canonical coordinate types
// ---------------------------------------------------------------------------

/**
 * A geographic coordinate in latitude/longitude form.
 * Used for all user-facing data: taps, pin locations, user location, bunkers,
 * fairway vertices, etc.
 */
export type LatLng = {
  latitude: number
  longitude: number
}

/**
 * A geographic coordinate in XY (GeoJSON) convention.
 *   x = longitude
 *   y = latitude
 *
 * Used ONLY for:
 *   - Green polygon vertices stored in ProcessedGreen
 *   - The elevation grid (LidarGrid) produced from 3DEP data
 *
 * It is the caller's responsibility to always use the right variant of any
 * geometry utility that accepts coordinates (see polygon.utils.ts).
 */
export type XYPoint = {
  x: number // longitude
  y: number // latitude
}

// ---------------------------------------------------------------------------
// Bounding box
// ---------------------------------------------------------------------------

/**
 * An axis-aligned bounding box in geographic lon/lat space.
 * Matches the coordinate convention used by both Overpass (bbox query args)
 * and the USGS 3DEP API (esriGeometryEnvelope).
 */
export type BoundingBox = {
  xmin: number // min longitude (west)
  ymin: number // min latitude  (south)
  xmax: number // max longitude (east)
  ymax: number // max latitude  (north)
}

// ---------------------------------------------------------------------------
// Viewport / SVG projection
// ---------------------------------------------------------------------------

/**
 * A square viewport calculated from a set of geographic features.
 * Used to project LatLng / XY coordinates into an SVG pixel space.
 *
 * The `range` value is max(latRange, lonRange), i.e. the single scale that
 * covers both axes without distortion. Both axes are projected using this
 * same value to preserve aspect ratio.
 *
 * SVG projection formulas:
 *   svgX = ((lon - minLon) / range) * svgSize
 *   svgY = ((maxLat - lat) / range) * svgSize    ← Y is inverted
 */
export type ViewBounds = {
  minLat: number
  maxLat: number
  minLon: number
  maxLon: number
  /** Uniform scale (degrees). Use this for BOTH axes. */
  range: number
}
