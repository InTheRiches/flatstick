/**
 * Viewport bounds and polyline clipping utilities.
 *
 * These are pure, stateless functions.  They operate on raw coordinate arrays
 * so they can be composed freely in render paths or preprocessing steps.
 */

import type { BunkerPolygon } from "@/models/course"
import type { LatLng, ViewBounds } from "@/models/geo"
import { isPointInPolygonLatLng } from "./polygon.utils"

// ---------------------------------------------------------------------------
// Internal types
// ---------------------------------------------------------------------------

/** An axis-aligned rectangular viewport in geographic space. */
type Rect = {
  minLat: number
  maxLat: number
  minLon: number
  maxLon: number
}

// ---------------------------------------------------------------------------
// ViewBounds computation
// ---------------------------------------------------------------------------

/**
 * Compute square viewport bounds that tightly enclose a green and its associated
 * bunkers, with a small padding margin.
 *
 * The resulting bounds are square (same range for lat and lon) so that SVG
 * projection preserves aspect ratio without distortion.
 *
 * Returns `null` when no coordinates are present.
 *
 * @param greenCoords - Polygon vertices for the putting green (LatLng).
 * @param holeBunkers - Bunker polygons associated with this hole (may be empty).
 * @param paddingDeg  - Padding added outside the tight bounds (default 0.00005°).
 */
export function computeViewBounds(
  greenCoords: LatLng[],
  holeBunkers: BunkerPolygon[],
  paddingDeg = 0.000_05,
): ViewBounds | null {
  const allPoints: LatLng[] = [
    ...greenCoords,
    ...holeBunkers.flatMap((b) => b.coordinates),
  ]

  if (allPoints.length === 0) return null

  const lats = allPoints.map((p) => p.latitude)
  const lons = allPoints.map((p) => p.longitude)

  const rawMinLat = Math.min(...lats) - paddingDeg
  const rawMaxLat = Math.max(...lats) + paddingDeg
  const rawMinLon = Math.min(...lons) - paddingDeg
  const rawMaxLon = Math.max(...lons) + paddingDeg

  const latRange = rawMaxLat - rawMinLat
  const lonRange = rawMaxLon - rawMinLon

  if (Math.max(latRange, lonRange) === 0) return null

  // Use the larger span as the uniform scale for both axes.
  const range = Math.max(latRange, lonRange)
  const midLat = (rawMinLat + rawMaxLat) / 2
  const midLon = (rawMinLon + rawMaxLon) / 2

  return {
    minLat: midLat - range / 2,
    maxLat: midLat + range / 2,
    minLon: midLon - range / 2,
    maxLon: midLon + range / 2,
    range,
  }
}

// ---------------------------------------------------------------------------
// Polyline clipping
// ---------------------------------------------------------------------------

const EPS = 1e-9

/** Returns true when `p` is strictly inside the rectangular viewport `r`. */
function isInsideRect(p: LatLng, r: Rect): boolean {
  return (
    p.latitude >= r.minLat &&
    p.latitude <= r.maxLat &&
    p.longitude >= r.minLon &&
    p.longitude <= r.maxLon
  )
}

/** Returns true when `v` is in the closed interval [min(a,b), max(a,b)]. */
function within(v: number, a: number, b: number): boolean {
  return v >= Math.min(a, b) - EPS && v <= Math.max(a, b) + EPS
}

/**
 * Find the first intersection of the segment p1→p2 with the rectangle `r`.
 * Returns the intersection point and the parametric `t` (0 = p1, 1 = p2).
 * Returns null when no intersection exists within the segment.
 */
function firstIntersection(
  p1: LatLng,
  p2: LatLng,
  r: Rect,
): { pt: LatLng; t: number } | null {
  const dx = p2.longitude - p1.longitude
  const dy = p2.latitude - p1.latitude
  const hits: { t: number; x: number; y: number }[] = []

  if (Math.abs(dx) > EPS) {
    let t = (r.minLon - p1.longitude) / dx
    let y = p1.latitude + t * dy
    if (t >= 0 && t <= 1 && within(y, r.minLat, r.maxLat))
      hits.push({ t, x: r.minLon, y })

    t = (r.maxLon - p1.longitude) / dx
    y = p1.latitude + t * dy
    if (t >= 0 && t <= 1 && within(y, r.minLat, r.maxLat))
      hits.push({ t, x: r.maxLon, y })
  }

  if (Math.abs(dy) > EPS) {
    let t = (r.minLat - p1.latitude) / dy
    let x = p1.longitude + t * dx
    if (t >= 0 && t <= 1 && within(x, r.minLon, r.maxLon))
      hits.push({ t, x, y: r.minLat })

    t = (r.maxLat - p1.latitude) / dy
    x = p1.longitude + t * dx
    if (t >= 0 && t <= 1 && within(x, r.minLon, r.maxLon))
      hits.push({ t, x, y: r.maxLat })
  }

  if (hits.length === 0) return null
  hits.sort((a, b) => a.t - b.t)
  const h = hits[0]
  return { pt: { latitude: h.y, longitude: h.x }, t: h.t }
}

/**
 * A polygon/polyline with its coordinate array.
 * Used as the input element for `clampPolylinesToBounds`.
 */
export type ClippablePolyline = {
  coordinates: LatLng[]
}

/**
 * Clip an array of polylines/polygons to a rectangular viewport.
 *
 * For each segment in each polyline:
 *   - Both endpoints inside  → keep the start vertex.
 *   - Inside → outside       → keep start, add boundary intersection.
 *   - Outside → inside       → add boundary intersection (start is discarded).
 *   - Both outside           → segment is dropped entirely.
 *
 * Additionally accounts for missing corners: when a rectangle corner lies
 * inside the original polygon, it is appended to preserve correct shape.
 *
 * @param polylines - Source polylines/polygons.
 * @param bounds    - The viewport to clip to.
 * @param closed    - When true, wraps the last vertex back to the first.
 * @returns Array of clipped coordinate arrays (one per input polyline).
 */
export function clampPolylinesToBounds(
  polylines: ClippablePolyline[],
  bounds: ViewBounds,
  closed = true,
): LatLng[][] {
  const rect: Rect = {
    minLat: bounds.minLat,
    maxLat: bounds.maxLat,
    minLon: bounds.minLon,
    maxLon: bounds.maxLon,
  }

  return polylines.map((poly) => {
    const pts = poly.coordinates
    const n = pts.length
    if (n === 0) return []

    const out: LatLng[] = []
    const segCount = closed ? n : n - 1

    for (let i = 0; i < segCount; i++) {
      const a = pts[i]
      const b = pts[(i + 1) % n]
      const aIn = isInsideRect(a, rect)
      const bIn = isInsideRect(b, rect)

      if (aIn && bIn) {
        out.push(a)
      } else if (aIn && !bIn) {
        out.push(a)
        const hit = firstIntersection(a, b, rect)
        if (hit && hit.t > EPS && hit.t < 1 + EPS) out.push(hit.pt)
      } else if (!aIn && bIn) {
        const hit = firstIntersection(a, b, rect)
        if (hit && hit.t > -EPS && hit.t < 1 - EPS) out.push(hit.pt)
        // `b` is inside — it will be pushed as `a` in the next iteration
      }
      // both outside → drop segment
    }

    if (!closed) {
      const last = pts[n - 1]
      if (isInsideRect(last, rect)) out.push(last)
    }

    // Append any rectangle corners that lie inside the original polygon.
    const corners: LatLng[] = [
      { latitude: rect.minLat, longitude: rect.minLon },
      { latitude: rect.minLat, longitude: rect.maxLon },
      { latitude: rect.maxLat, longitude: rect.minLon },
      { latitude: rect.maxLat, longitude: rect.maxLon },
    ]
    for (const corner of corners) {
      if (isPointInPolygonLatLng(corner, pts)) {
        out.push(corner)
      }
    }

    return out
  })
}

export const getRegionForCoordinates = (
  points: LatLng[], 
  edgePadding?: { top: number; right: number; bottom: number; left: number }
) => {
  if (points.length === 0) {
    throw new Error('Points array cannot be empty');
  }

  // Initialize with first point
  let minLat = points[0].latitude;
  let maxLat = points[0].latitude;
  let minLng = points[0].longitude;
  let maxLng = points[0].longitude;

  // Find bounding box
  points.forEach(point => {
    minLat = Math.min(minLat, point.latitude);
    maxLat = Math.max(maxLat, point.latitude);
    minLng = Math.min(minLng, point.longitude);
    maxLng = Math.max(maxLng, point.longitude);
  });

  const latitudeDelta = maxLat - minLat;
  const longitudeDelta = maxLng - minLng;

  // Calculate center
  const latitude = (minLat + maxLat) / 2;
  const longitude = (minLng + maxLng) / 2;

  // Apply padding if provided
  // Note: This is a simplified padding calculation
  // Real edge padding conversion requires map dimensions
  let paddingMultiplier = 1.4; // Default padding
  
  if (edgePadding) {
    // Rough approximation: use average padding as a ratio
    const avgPadding = (edgePadding.top + edgePadding.bottom + 
                        edgePadding.left + edgePadding.right) / 4;
    // Adjust multiplier based on padding (assuming ~300px map size as baseline)
    paddingMultiplier = 1 + (avgPadding / 150);
  }

  return {
    latitude,
    longitude,
    latitudeDelta: latitudeDelta * paddingMultiplier,
    longitudeDelta: longitudeDelta * paddingMultiplier,
  };
};