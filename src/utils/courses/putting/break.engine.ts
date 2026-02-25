/**
 * Putt break prediction engine.
 *
 * Pure functions that predict the break (lateral deviation) of a putt given
 * topographic data from a `LidarGrid`.  No network I/O.  No state.
 */

import type { LatLng } from "@/models/geo"
import type { LidarGrid } from "@/models/lidar"
import {
    METERS_PER_LAT_DEGREE,
    metersPerLonDegree,
    metersToFeet,
    metersToInches,
} from "@/utils/courses/geometry/geo.math"
import { getElevationBilinear, getPuttGradient } from "./elevation.engine"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** The predicted characteristics of a putt. */
export type PuttPrediction = {
  /** Straight-line distance from ball to pin in feet. */
  distanceFeet: number
  /**
   * Elevation change from ball position to pin in inches.
   * Negative = downhill, positive = uphill.
   */
  elevationChangeInches: number
  /**
   * Slope along the putt line as a percentage (rise/run × 100).
   * Negative = downhill.
   */
  slopePercent: number
  /**
   * Absolute side-slope at the midpoint as a percentage.
   * Independent of break direction.
   */
  sideSlopePercent: number
  /**
   * Estimated aiming offset in inches.
   * Play this amount on the high side of the hole.
   */
  aimingBreakInches: number
  /** Direction the ball will curve. */
  breakDirection: "left" | "right" | "straight"
}

/** Typed errors for predictPutt. */
export type PuttPredictionError =
  | { type: "zero_distance" }
  | { type: "insufficient_lidar" }

// ---------------------------------------------------------------------------
// PGA expected-putts baseline (for strokes-gained calculation)
// ---------------------------------------------------------------------------

/**
 * PGA Tour baseline: expected number of putts from a given distance in feet.
 * Used by the stats engine for strokes-gained calculation.
 * Interpolated linearly between the data points.
 */
const PGA_BASELINE: ReadonlyArray<{ dist: number; putts: number }> = [
  { dist: 0, putts: 1.0 },
  { dist: 3, putts: 1.001 },
  { dist: 5, putts: 1.25 },
  { dist: 8, putts: 1.5 },
  { dist: 15, putts: 1.8 },
  { dist: 25, putts: 1.99 },
  { dist: 40, putts: 2.15 },
  { dist: 60, putts: 2.3 },
  { dist: 100, putts: 2.5 },
]

/**
 * Interpolate the expected number of putts for a given distance in feet.
 *
 * @param distanceFeet - Putt distance in feet.
 */
export function getExpectedPutts(distanceFeet: number): number {
  if (distanceFeet <= PGA_BASELINE[0].dist) return PGA_BASELINE[0].putts
  if (distanceFeet >= PGA_BASELINE[PGA_BASELINE.length - 1].dist) {
    return PGA_BASELINE[PGA_BASELINE.length - 1].putts
  }

  for (let i = 0; i < PGA_BASELINE.length - 1; i++) {
    const lo = PGA_BASELINE[i]
    const hi = PGA_BASELINE[i + 1]
    if (distanceFeet >= lo.dist && distanceFeet <= hi.dist) {
      const t = (distanceFeet - lo.dist) / (hi.dist - lo.dist)
      return lo.putts + t * (hi.putts - lo.putts)
    }
  }

  return 2.5 // unreachable, but satisfies the type checker
}

// ---------------------------------------------------------------------------
// Break prediction
// ---------------------------------------------------------------------------

/**
 * Predict the break and slope characteristics of a putt.
 *
 * Algorithm:
 *   1. Compute the flat-ground (planar) distance and the elevation delta.
 *   2. Sample the gradient at the putt midpoint.
 *   3. Project the gradient perpendicular to the putt direction to get side slope.
 *   4. Estimate break using the USGA-inspired formula:
 *        breakInches = sideSlopePercent × distanceFeet × (stimp / 10) × constant
 *
 * The `stimp` parameter must be supplied explicitly — there is no implicit
 * "standard" stimp embedded in this function as a hidden constant.
 *
 * @param lidar - Validated elevation grid covering the green.
 * @param ball  - Ball position (LatLng).
 * @param pin   - Pin position (LatLng).
 * @param stimp - Green speed in Stimpmeter units (e.g. 10 for medium speed).
 */
export function predictPutt(
  lidar: LidarGrid,
  ball: LatLng,
  pin: LatLng,
  stimp: number,
): PuttPrediction | PuttPredictionError {
  // ── 1. Distance and elevation delta ──────────────────────────────────────

  const latMid = (ball.latitude + pin.latitude) / 2
  const dx_m = (pin.longitude - ball.longitude) * metersPerLonDegree(latMid)
  const dy_m = (pin.latitude - ball.latitude) * METERS_PER_LAT_DEGREE
  const flatDistMeters = Math.sqrt(dx_m * dx_m + dy_m * dy_m)

  if (flatDistMeters < 1e-6) return { type: "zero_distance" }

  const zBall = getElevationBilinear(ball.longitude, ball.latitude, lidar)
  const zPin = getElevationBilinear(pin.longitude, pin.latitude, lidar)

  if (zBall === null || zPin === null) return { type: "insufficient_lidar" }

  const dz_m = zPin - zBall

  // ── 2. Side slope at midpoint ─────────────────────────────────────────────

  const mid = {
    lon: (ball.longitude + pin.longitude) / 2,
    lat: (ball.latitude + pin.latitude) / 2,
  }
  const grad = getPuttGradient(mid.lon, mid.lat, lidar)
  if (grad === null) return { type: "insufficient_lidar" }

  // ── 3. Project gradient perpendicular to the putt direction ──────────────

  // Unit vector along the putt direction (in metric space)
  const puttDirX = dx_m / flatDistMeters
  const puttDirY = dy_m / flatDistMeters

  // Perpendicular side slope: gradient dotted with the 90°-rotated putt vector
  const sideSlope = grad.dx * -puttDirY + grad.dy * puttDirX
  const sideSlopePercent = sideSlope * 100

  // ── 4. Break estimation ────────────────────────────────────────────────────

  const flatDistFeet = metersToFeet(flatDistMeters)
  // Industry constant calibrated for Stimp 10 greens; scales linearly with stimp.
  const GREEN_SPEED_CONSTANT = 0.15
  const breakInches = sideSlopePercent * flatDistFeet * (stimp / 10) * GREEN_SPEED_CONSTANT

  const STRAIGHT_THRESHOLD = 0.05 // inches — below this is effectively straight
  let breakDirection: "left" | "right" | "straight"
  if (Math.abs(breakInches) < STRAIGHT_THRESHOLD) breakDirection = "straight"
  else if (breakInches > 0) breakDirection = "left"  // positive side slope → tilts right → ball curves left
  else breakDirection = "right"

  return {
    distanceFeet: flatDistFeet,
    elevationChangeInches: metersToInches(dz_m),
    slopePercent: (dz_m / flatDistMeters) * 100,
    sideSlopePercent: Math.abs(sideSlopePercent),
    aimingBreakInches: Math.abs(breakInches),
    breakDirection,
  }
}
