/**
 * Practice round generator.
 *
 * Pure function that generates a sequence of putts for a putting-green
 * practice session.  No network I/O.  No state.
 *
 * Given a green boundary and a lidar grid, the generator places the ball
 * at random positions inside the polygon and selects a pin, targeting
 * a distribution of break/slope categories so the session covers a
 * variety of read types.
 */

import type { LatLng } from "@/models/geo"
import type { LidarGrid } from "@/models/lidar"
import { distanceMeters } from "@/utils/courses/geometry/geo.math"
import {
    getPolygonCentroidLatLng,
    randomPointInPolygonLatLng
} from "@/utils/courses/geometry/polygon.utils"
import { getPuttGradient } from "./elevation.engine"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PuttBreakCategory =
  | "left"
  | "right"
  | "uphill"
  | "downhill"
  | "straight"
  | "double"

export type GeneratedPutt = {
  holeNumber: number
  /** Generated ball position inside the green. */
  start: LatLng
  /** Pin location used as the target. */
  pin: LatLng
  /** Sampled points along the ball→pin line for break visualization. */
  puttLine: LatLng[]
  /** Dominant break/slope category. */
  category: PuttBreakCategory
}

export type GenerateOptions = {
  /** Minimum putt distance in metres (default 2). */
  minDistMeters?: number
  /** Maximum putt distance in metres (default 12). */
  maxDistMeters?: number
  /** Number of putts to generate (default 18). */
  count?: number
  /** Rejection-sampling budget per putt (default 30). */
  maxAttemptsPerPutt?: number
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Sample `n` evenly-spaced points along the straight line from `start` to `end`.
 */
function sampleLine(start: LatLng, end: LatLng, n = 10): LatLng[] {
  const points: LatLng[] = []
  for (let i = 0; i <= n; i++) {
    const t = i / n
    points.push({
      latitude: start.latitude + (end.latitude - start.latitude) * t,
      longitude: start.longitude + (end.longitude - start.longitude) * t,
    })
  }
  return points
}

const BREAK_THRESHOLD = 0.01 // m/m slope below which a putt is considered "straight"

/**
 * Categorise the dominant break/slope of a putt line using the lidar grid.
 * Returns null when gradient data is unavailable (degenerate grid).
 */
function categorizePuttLine(
  line: LatLng[],
  lidar: LidarGrid,
): PuttBreakCategory | null {
  let totalDx = 0
  let totalDy = 0
  let leftCount = 0
  let rightCount = 0
  let validSegments = 0

  for (const pt of line) {
    const grad = getPuttGradient(pt.longitude, pt.latitude, lidar)
    if (!grad) continue
    totalDx += grad.dx
    totalDy += grad.dy
    if (grad.dx > BREAK_THRESHOLD) rightCount++
    if (grad.dx < -BREAK_THRESHOLD) leftCount++
    validSegments++
  }

  if (validSegments === 0) return null

  // Double break: the putt breaks in both directions.
  if (leftCount > 0 && rightCount > 0) return "double"

  const avgDx = totalDx / validSegments
  const avgDy = totalDy / validSegments

  const breakDir: PuttBreakCategory =
    avgDx > BREAK_THRESHOLD ? "right" :
    avgDx < -BREAK_THRESHOLD ? "left" : "straight"

  const slopeDir: PuttBreakCategory =
    avgDy < -BREAK_THRESHOLD ? "downhill" :
    avgDy > BREAK_THRESHOLD ? "uphill" : "straight"

  // When a clear slope exists, prefer slope descriptor (more informative).
  if (slopeDir !== "straight") return slopeDir
  return breakDir
}

/**
 * Fisher-Yates in-place shuffle.
 */
function shuffle<T>(arr: T[]): T[] {
  for (let m = arr.length, i = m; m > 0; ) {
    i = Math.floor(Math.random() * m--)
    ;[arr[m], arr[i]] = [arr[i], arr[m]]
  }
  return arr
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generate a practice round for a putting green.
 *
 * The `pins` array represents available hole positions.  The generator picks
 * one at random per putt.  If `pins` is empty the centroid of the green is
 * used as a fallback pin for every putt.
 *
 * @param greenBoundary - Polygon vertices defining the green (LatLng).
 * @param lidar         - Elevation grid covering the green.
 * @param pins          - Available pin positions (at least one required).
 * @param options       - Tuning parameters.
 */
export function generatePracticeRound(
  greenBoundary: LatLng[],
  lidar: LidarGrid,
  pins: LatLng[],
  options: GenerateOptions = {},
): GeneratedPutt[] {
  const {
    minDistMeters = 2,
    maxDistMeters = 12,
    count = 18,
    maxAttemptsPerPutt = 30,
  } = options

  const fallbackPin = getPolygonCentroidLatLng(greenBoundary)
  const availablePins = pins.length > 0 ? pins : [fallbackPin]

  // Build a shuffled target list so the session hits every category.
  const targetPool: PuttBreakCategory[] = shuffle([
    "left", "left", "left", "left",
    "right", "right", "right", "right",
    "uphill", "uphill", "uphill", "uphill",
    "downhill", "downhill", "downhill", "downhill",
    "straight", "double",
  ])

  const results: GeneratedPutt[] = []

  for (let i = 0; i < count; i++) {
    const target = targetPool[i % targetPool.length]
    let found: GeneratedPutt | null = null

    for (let attempt = 0; attempt < maxAttemptsPerPutt; attempt++) {
      const start = randomPointInPolygonLatLng(greenBoundary)
      const pin = availablePins[Math.floor(Math.random() * availablePins.length)]
      const dist = distanceMeters(start, pin)

      if (dist < minDistMeters || dist > maxDistMeters) continue

      const line = sampleLine(start, pin)
      const category = categorizePuttLine(line, lidar)

      if (category === null) continue
      if (category !== target) continue

      found = { holeNumber: i + 1, start, pin, puttLine: line, category }
      break
    }

    if (!found) {
      // Fallback: accept any valid putt for this slot.
      const start = randomPointInPolygonLatLng(greenBoundary)
      const pin = availablePins[Math.floor(Math.random() * availablePins.length)]
      const line = sampleLine(start, pin)
      const category = categorizePuttLine(line, lidar) ?? "straight"
      found = { holeNumber: i + 1, start, pin, puttLine: line, category }
    }

    results.push(found)
  }

  return results
}
