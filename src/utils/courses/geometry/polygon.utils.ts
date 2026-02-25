/**
 * Polygon geometry utilities.
 *
 * Two explicit variants exist for each operation:
 *   - `*LatLng` — works with `{ latitude, longitude }` coordinates.
 *   - `*XY`     — works with `{ x, y }` coordinates (x = longitude, y = latitude).
 *
 * The separation is intentional: the old codebase had silent bugs caused by
 * calling the wrong variant on the wrong data shape.  Explicit names at the
 * call-site make such mistakes a compile-time error rather than a runtime
 * silent-wrong-result.
 *
 * All functions are pure and stateless.
 */

import type { LatLng, XYPoint } from "@/models/geo"

// ---------------------------------------------------------------------------
// Point-in-polygon (ray-casting / even-odd rule)
// ---------------------------------------------------------------------------

/**
 * Returns true when `point` lies inside `polygon` (LatLng convention).
 *
 * Uses the ray-casting algorithm (even-odd rule).  Points that fall exactly
 * on an edge are treated as inside.
 *
 * @param point   - The point to test.
 * @param polygon - Closed or open polygon; the algorithm wraps automatically.
 */
export function isPointInPolygonLatLng(
  point: LatLng,
  polygon: LatLng[],
): boolean {
  const px = point.longitude
  const py = point.latitude
  let inside = false

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].longitude
    const yi = polygon[i].latitude
    const xj = polygon[j].longitude
    const yj = polygon[j].latitude

    const intersects =
      yi > py !== yj > py &&
      px < ((xj - xi) * (py - yi)) / (yj - yi) + xi

    if (intersects) inside = !inside
  }

  return inside
}

/**
 * Returns true when `point` lies inside `polygon` (XY convention).
 *
 * @param point   - The point to test (x = longitude, y = latitude).
 * @param polygon - Closed or open polygon in XY convention.
 */
export function isPointInPolygonXY(
  point: XYPoint,
  polygon: XYPoint[],
): boolean {
  const px = point.x
  const py = point.y
  let inside = false

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x
    const yi = polygon[i].y
    const xj = polygon[j].x
    const yj = polygon[j].y

    const intersects =
      yi > py !== yj > py &&
      px < ((xj - xi) * (py - yi)) / (yj - yi) + xi

    if (intersects) inside = !inside
  }

  return inside
}

// ---------------------------------------------------------------------------
// Centroid
// ---------------------------------------------------------------------------

/**
 * Returns the arithmetic centroid of a polygon (LatLng convention).
 *
 * Note: This is the mean of all vertices, not the true area centroid.  For
 * the irregular shapes of golf greens the difference is negligible.
 *
 * Returns `{ latitude: 0, longitude: 0 }` on an empty polygon.
 */
export function getPolygonCentroidLatLng(polygon: LatLng[]): LatLng {
  if (polygon.length === 0) return { latitude: 0, longitude: 0 }

  let sumLat = 0
  let sumLon = 0

  for (const p of polygon) {
    sumLat += p.latitude
    sumLon += p.longitude
  }

  return {
    latitude: sumLat / polygon.length,
    longitude: sumLon / polygon.length,
  }
}

/**
 * Returns the arithmetic centroid of a polygon (XY convention).
 *
 * Returns `{ x: 0, y: 0 }` on an empty polygon.
 */
export function getPolygonCentroidXY(polygon: XYPoint[]): XYPoint {
  if (polygon.length === 0) return { x: 0, y: 0 }

  let sumX = 0
  let sumY = 0

  for (const p of polygon) {
    sumX += p.x
    sumY += p.y
  }

  return { x: sumX / polygon.length, y: sumY / polygon.length }
}

// ---------------------------------------------------------------------------
// Random point inside polygon
// ---------------------------------------------------------------------------

/**
 * Returns a uniformly random point inside `polygon` (LatLng convention).
 *
 * Uses rejection sampling within the bounding box.  Caps attempts to prevent
 * infinite loops on degenerate polygons, returning the centroid as a fallback.
 *
 * @param polygon - The polygon to sample from.
 * @param maxAttempts - Maximum rejection iterations (default 200).
 */
export function randomPointInPolygonLatLng(
  polygon: LatLng[],
  maxAttempts = 200,
): LatLng {
  const lats = polygon.map((p) => p.latitude)
  const lons = polygon.map((p) => p.longitude)
  const minLat = Math.min(...lats)
  const maxLat = Math.max(...lats)
  const minLon = Math.min(...lons)
  const maxLon = Math.max(...lons)

  for (let i = 0; i < maxAttempts; i++) {
    const candidate: LatLng = {
      latitude: minLat + Math.random() * (maxLat - minLat),
      longitude: minLon + Math.random() * (maxLon - minLon),
    }
    if (isPointInPolygonLatLng(candidate, polygon)) return candidate
  }

  // Fallback: return the centroid
  return getPolygonCentroidLatLng(polygon)
}
