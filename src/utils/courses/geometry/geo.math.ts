/**
 * Low-level geographic/geodetic math.
 *
 * All functions are pure and stateless.  They operate on numbers, not on
 * domain model types, so that they can be reused freely across layers.
 */

import type { LatLng } from "@/models/geo"

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/**
 * Metres per degree of latitude.  Constant across the globe (to 4 s.f.).
 * Used as a fixed approximation for the short distances on a golf course.
 */
export const METERS_PER_LAT_DEGREE = 111_320

/** Feet per metre. */
export const FEET_PER_METER = 3.280_84

/** Metres per foot. */
export const METERS_PER_FOOT = 1 / FEET_PER_METER

// ---------------------------------------------------------------------------
// Conversion helpers
// ---------------------------------------------------------------------------

/** Convert degrees to radians. */
export function toRadians(deg: number): number {
  return deg * (Math.PI / 180)
}

/** Convert radians to degrees. */
export function toDegrees(rad: number): number {
  return rad * (180 / Math.PI)
}

/** Convert metres to feet. */
export function metersToFeet(m: number): number {
  return m * FEET_PER_METER
}

/** Convert feet to metres. */
export function feetToMeters(ft: number): number {
  return ft * METERS_PER_FOOT
}

/** Convert metres to inches. */
export function metersToInches(m: number): number {
  return m * FEET_PER_METER * 12
}

// ---------------------------------------------------------------------------
// Longitude-degree → metre scale factor
// ---------------------------------------------------------------------------

/**
 * Metres per degree of longitude at a given latitude.
 *
 * Longitude degrees shrink as you approach the poles because meridians
 * converge.  The conversion requires the cosine of the latitude.
 *
 * @param latitudeDeg - Latitude in degrees.
 */
export function metersPerLonDegree(latitudeDeg: number): number {
  return METERS_PER_LAT_DEGREE * Math.cos(toRadians(latitudeDeg))
}

// ---------------------------------------------------------------------------
// Distance
// ---------------------------------------------------------------------------

/**
 * Planar (Cartesian) distance in metres between two GPS coordinates.
 *
 * This approximation is accurate to within ~0.1% for distances up to a few
 * hundred metres — more than sufficient for golf-course geometry.
 *
 * @param a - Start coordinate.
 * @param b - End coordinate.
 */
export function distanceMeters(a: LatLng, b: LatLng): number {
  const midLat = (a.latitude + b.latitude) / 2
  const dx = (b.longitude - a.longitude) * metersPerLonDegree(midLat)
  const dy = (b.latitude - a.latitude) * METERS_PER_LAT_DEGREE
  return Math.sqrt(dx * dx + dy * dy)
}

/**
 * Planar distance in feet between two GPS coordinates.
 *
 * @param a - Start coordinate.
 * @param b - End coordinate.
 */
export function distanceFeet(a: LatLng, b: LatLng): number {
  return metersToFeet(distanceMeters(a, b))
}

/**
 * Returns both metres and feet in a single call to avoid redundant computation.
 *
 * @param a - Start coordinate.
 * @param b - End coordinate.
 */
export function distanceBoth(
  a: LatLng,
  b: LatLng,
): { meters: number; feet: number } {
  const m = distanceMeters(a, b)
  return { meters: m, feet: metersToFeet(m) }
}
