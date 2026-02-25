/**
 * Putting statistics engine.
 *
 * Pure functions that analyse recorded round data and produce summary
 * statistics.  No network I/O.  No state.  All inputs are explicit parameters.
 *
 * Two entry points:
 *   - `calculateRealRoundStats`    → full-round or putts-only round on a real course
 *   - `calculatePuttingGreenStats` → practice-green session
 */

import type { ProcessedGreen, PuttingGreenHole, RealRoundHole } from "@/models/course"
import type { LatLng } from "@/models/geo"
import type { LidarGrid } from "@/models/lidar"
import {
    distanceFeet,
    distanceMeters,
    METERS_PER_LAT_DEGREE,
    metersPerLonDegree,
} from "@/utils/courses/geometry/geo.math"
import { getExpectedPutts } from "./break.engine"
import { getPuttGradient } from "./elevation.engine"

// ---------------------------------------------------------------------------
// Output types
// ---------------------------------------------------------------------------

export type MissDistribution = {
  farLeft: number  // more than 18 in left
  left: number     // 3–18 in left
  center: number   // within 3 in of centre
  right: number    // 3–18 in right
  farRight: number // more than 18 in right
  long: number
  short: number
}

export type PuttCounts = {
  onePutts: number
  twoPutts: number
  threePlusPutts: number
}

/** Summary statistics shared between both round types. */
export type PuttingSummaryStats = {
  holesPlayed: number
  totalPutts: number
  totalMisses: number
  strokesGained: number
  puttCounts: PuttCounts
  /** Average distance of all putts (in the requested unit). */
  avgPuttDistance: number
  /** Average miss distance remaining to the hole. */
  avgMissDistance: number
  /**
   * High-side miss percentage [0, 1].
   * A high-side miss is when the ball misses on the side the green tilts
   * toward — the less forgiving side.
   */
  percentHighSide: number
  /**
   * Short-miss percentage [0, 1].
   */
  percentShort: number
  /**
   * Left/right bias in the requested unit (negative = left, positive = right).
   */
  leftRightBias: number
  /**
   * Short/long bias in the requested unit (negative = short, positive = long).
   */
  shortPastBias: number
  missDistribution: MissDistribution
}

// ---------------------------------------------------------------------------
// Unit system
// ---------------------------------------------------------------------------

/** 0 = imperial (feet/inches), 1 = metric (metres/centimetres). */
export type UnitSystem = 0 | 1

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Compute the miss-bias components in either unit system. */
function computeMissBias(
  startLoc: LatLng,
  pinLocation: LatLng,
  endLoc: LatLng,
  units: UnitSystem,
): { longMiss: number; latMiss: number } {
  const lineVec = {
    x: pinLocation.longitude - startLoc.longitude,
    y: pinLocation.latitude - startLoc.latitude,
  }
  const missVec = {
    x: endLoc.longitude - pinLocation.longitude,
    y: endLoc.latitude - pinLocation.latitude,
  }

  const angle = Math.atan2(lineVec.y, lineVec.x)
  const cosA = Math.cos(-angle)
  const sinA = Math.sin(-angle)

  const rotX = missVec.x * cosA - missVec.y * sinA
  const rotY = missVec.x * sinA + missVec.y * cosA

  const mPerLon = metersPerLonDegree(startLoc.latitude)
  const longMissM = rotX * mPerLon
  const latMissM = rotY * METERS_PER_LAT_DEGREE

  if (units === 0) {
    return {
      longMiss: longMissM * 39.3701, // metres → inches
      latMiss: latMissM * 39.3701,
    }
  } else {
    return { longMiss: longMissM * 100, latMiss: latMissM * 100 } // metres → centimetres
  }
}

function categorizeMiss(
  longMiss: number,
  latMiss: number,
  units: UnitSystem,
  dist: MissDistribution,
) {
  const farThreshold = units === 0 ? 18 : 45.72  // 18 in ≈ 45.72 cm
  const nearThreshold = units === 0 ? 3 : 7.62   // 3 in ≈ 7.62 cm

  if (Math.abs(longMiss) > Math.abs(latMiss)) {
    if (longMiss < 0) dist.short++
    else dist.long++
  } else {
    if (latMiss > farThreshold) dist.farLeft++
    else if (latMiss > nearThreshold) dist.left++
    else if (latMiss < -farThreshold) dist.farRight++
    else if (latMiss < -nearThreshold) dist.right++
    else dist.center++
  }
}

/** Determine whether a missed putt was on the high (penalising) side. */
function isHighSideMiss(
  startLoc: LatLng,
  pinLocation: LatLng,
  lidar: LidarGrid,
  latMiss: number,
): boolean {
  const mid = {
    lon: (startLoc.longitude + pinLocation.longitude) / 2,
    lat: (startLoc.latitude + pinLocation.latitude) / 2,
  }
  const grad = getPuttGradient(mid.lon, mid.lat, lidar)
  if (!grad) return false

  const lineVec = {
    x: pinLocation.longitude - startLoc.longitude,
    y: pinLocation.latitude - startLoc.latitude,
  }
  const latDiffM = lineVec.y * METERS_PER_LAT_DEGREE
  const lonDiffM = lineVec.x * metersPerLonDegree(startLoc.latitude)
  const sideSlope = grad.dx * -latDiffM + grad.dy * lonDiffM

  const breaksLeft = sideSlope > 0
  const missedRight = latMiss < 0
  return (breaksLeft && missedRight) || (!breaksLeft && !missedRight)
}

// ---------------------------------------------------------------------------
// Shared stats accumulation core
// ---------------------------------------------------------------------------

type MissAccumulator = {
  totalMissDistanceSum: number
  highSideMisses: number
  shortMisses: number
  leftRightSum: number
  shortPastSum: number
}

function processPuttSequence(
  putts: LatLng[],
  pinLocation: LatLng,
  lidarGrid: LidarGrid | null,
  units: UnitSystem,
  stats: {
    totalPutts: number
    totalMisses: number
    puttCounts: PuttCounts
    strokesGained: number
    totalDistanceSum: number
    missDistribution: MissDistribution
  },
  acc: MissAccumulator,
) {
  stats.totalPutts += putts.length

  const firstDist = units === 0
    ? distanceFeet(putts[0], pinLocation)
    : distanceMeters(putts[0], pinLocation)
  stats.strokesGained += getExpectedPutts(distanceFeet(putts[0], pinLocation)) - putts.length

  if (putts.length === 1) stats.puttCounts.onePutts++
  else if (putts.length === 2) stats.puttCounts.twoPutts++
  else stats.puttCounts.threePlusPutts++

  for (let i = 0; i < putts.length; i++) {
    const isMade = i === putts.length - 1
    const start = putts[i]
    const end = isMade ? pinLocation : putts[i + 1]
    const puttDist = units === 0 ? distanceFeet(start, end) : distanceMeters(start, end)
    stats.totalDistanceSum += puttDist

    if (!isMade) {
      stats.totalMisses++
      const missDist = units === 0
        ? distanceFeet(end, pinLocation)
        : distanceMeters(end, pinLocation)
      acc.totalMissDistanceSum += missDist

      const { longMiss, latMiss } = computeMissBias(start, pinLocation, end, units)
      acc.leftRightSum += latMiss
      acc.shortPastSum += longMiss

      if (longMiss < 0) acc.shortMisses++

      categorizeMiss(longMiss, latMiss, units, stats.missDistribution)

      if (lidarGrid && isHighSideMiss(start, pinLocation, lidarGrid, latMiss)) {
        acc.highSideMisses++
      }
    }
  }
}

function finaliseStats(
  stats: {
    totalPutts: number
    totalMisses: number
    totalDistanceSum: number
    holesPlayed: number
  },
  acc: MissAccumulator,
): Pick<
  PuttingSummaryStats,
  | "avgPuttDistance"
  | "avgMissDistance"
  | "percentHighSide"
  | "percentShort"
  | "leftRightBias"
  | "shortPastBias"
> {
  const avgPuttDistance =
    stats.totalPutts > 0 ? stats.totalDistanceSum / stats.totalPutts : 0
  const avgMissDistance =
    stats.totalMisses > 0 ? acc.totalMissDistanceSum / stats.totalMisses : 0
  const percentHighSide =
    stats.totalMisses > 0 ? acc.highSideMisses / stats.totalMisses : 0
  const percentShort =
    stats.totalMisses > 0 ? acc.shortMisses / stats.totalMisses : 0
  const leftRightBias =
    stats.totalMisses > 0 ? acc.leftRightSum / stats.totalMisses : 0
  const shortPastBias =
    stats.totalMisses > 0 ? acc.shortPastSum / stats.totalMisses : 0

  return {
    avgPuttDistance,
    avgMissDistance,
    percentHighSide,
    percentShort,
    leftRightBias,
    shortPastBias,
  }
}

// ---------------------------------------------------------------------------
// Real-round stats
// ---------------------------------------------------------------------------

/**
 * Calculate summary putting statistics for a real-course round.
 *
 * Handles both full rounds (with approach/fairway data) and putts-only rounds.
 * Requires the `greens` array so that each hole's lidar grid can be resolved
 * for high-side calculation.
 *
 * @param roundData  - Per-hole data recorded during the round.
 * @param greens     - Processed greens with lidar grids from `CourseData`.
 * @param units      - 0 = imperial (feet/inches), 1 = metric.
 */
export function calculateRealRoundStats(
  roundData: RealRoundHole[],
  greens: ProcessedGreen[],
  units: UnitSystem,
): PuttingSummaryStats {
  const stats = {
    holesPlayed: 0,
    totalPutts: 0,
    totalMisses: 0,
    strokesGained: 0,
    puttCounts: { onePutts: 0, twoPutts: 0, threePlusPutts: 0 } as PuttCounts,
    totalDistanceSum: 0,
    missDistribution: {
      farLeft: 0, left: 0, center: 0, right: 0, farRight: 0,
      long: 0, short: 0,
    } as MissDistribution,
  }
  const acc: MissAccumulator = {
    totalMissDistanceSum: 0,
    highSideMisses: 0,
    shortMisses: 0,
    leftRightSum: 0,
    shortPastSum: 0,
  }

  for (const hole of roundData) {
    if (!hole?.pinLocation || !hole.taps || hole.taps.length === 0) continue

    const lidarGrid =
      greens.find((g) => g.hole === hole.hole.toString())?.lidar ?? null

    stats.holesPlayed++
    processPuttSequence(hole.taps, hole.pinLocation, lidarGrid, units, stats, acc)
  }

  const derived = finaliseStats(stats, acc)

  return {
    holesPlayed: stats.holesPlayed,
    totalPutts: stats.totalPutts,
    totalMisses: stats.totalMisses,
    strokesGained: parseFloat(stats.strokesGained.toFixed(2)),
    puttCounts: stats.puttCounts,
    missDistribution: stats.missDistribution,
    ...derived,
  }
}

// ---------------------------------------------------------------------------
// Putting-green practice stats
// ---------------------------------------------------------------------------

/**
 * Calculate summary putting statistics for a putting-green practice session.
 *
 * Differs from `calculateRealRoundStats` in that:
 *   - A single `LidarGrid` covers all holes (one green).
 *   - Each hole has a `startLocation` that is prepended to the tap sequence.
 *
 * @param roundData - Per-hole data recorded during the putting-green session.
 * @param lidar     - Elevation grid for the single practice green.
 * @param units     - 0 = imperial (feet/inches), 1 = metric.
 */
export function calculatePuttingGreenStats(
  roundData: PuttingGreenHole[],
  lidar: LidarGrid,
  units: UnitSystem,
): PuttingSummaryStats {
  const stats = {
    holesPlayed: 0,
    totalPutts: 0,
    totalMisses: 0,
    strokesGained: 0,
    puttCounts: { onePutts: 0, twoPutts: 0, threePlusPutts: 0 } as PuttCounts,
    totalDistanceSum: 0,
    missDistribution: {
      farLeft: 0, left: 0, center: 0, right: 0, farRight: 0,
      long: 0, short: 0,
    } as MissDistribution,
  }
  const acc: MissAccumulator = {
    totalMissDistanceSum: 0,
    highSideMisses: 0,
    shortMisses: 0,
    leftRightSum: 0,
    shortPastSum: 0,
  }

  for (const hole of roundData) {
    if (!hole) continue
    // Prepend the generated start location as the first putt position.
    const putts: LatLng[] = [hole.startLocation, ...hole.taps]
    if (putts.length === 0) continue

    stats.holesPlayed++
    processPuttSequence(putts, hole.pinLocation, lidar, units, stats, acc)
  }

  const derived = finaliseStats(stats, acc)

  return {
    holesPlayed: stats.holesPlayed,
    totalPutts: stats.totalPutts,
    totalMisses: stats.totalMisses,
    strokesGained: parseFloat(stats.strokesGained.toFixed(2)),
    puttCounts: stats.puttCounts,
    missDistribution: stats.missDistribution,
    ...derived,
  }
}
