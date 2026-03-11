/**
 * roundStats.ts
 *
 * Stat computation entry points for round sessions.
 */

import { LieType, RoundSession, ShotAttempt } from "@/models/round.session.types"
import type { GeoPoint } from "@/models/session.types"
import { RoundStats } from "@/models/stats.types"
import { getExpectedPutts } from "@/utils/courses/putting/break.engine"

// ─── Strokes Gained model ─────────────────────────────────────────────────────
//
// "Expected strokes to finish the hole" by distance from pin in metres.
// Based on PGA Tour Shotlink / Broadie model. Applies to fairway/tee lie.
// Lie penalties are added on top. On-green distances use the putting baseline.
//
// distM: 0 → ball is in the hole (0 strokes needed — Broadie convention).

const STROKES_TO_HOLE_M: ReadonlyArray<{ distM: number; strokes: number }> = [
  { distM: 0, strokes: 0 },        // in the hole
  { distM: 0.9, strokes: 1.0 },    // ~3 ft tap-in
  { distM: 1.5, strokes: 1.03 },   // ~5 ft
  { distM: 2.4, strokes: 1.25 },   // ~8 ft
  { distM: 4.6, strokes: 1.5 },    // ~15 ft
  { distM: 7.6, strokes: 1.8 },    // ~25 ft
  { distM: 12.2, strokes: 1.99 },  // ~40 ft
  { distM: 18.3, strokes: 2.1 },   // ~60 ft / fringe range
  { distM: 27.4, strokes: 2.3 },   // 30 yds
  { distM: 54.9, strokes: 2.6 },   // 60 yds
  { distM: 91.4, strokes: 2.75 },  // 100 yds
  { distM: 137, strokes: 2.9 },    // 150 yds
  { distM: 183, strokes: 3.1 },    // 200 yds
  { distM: 228, strokes: 3.3 },    // 250 yds
  { distM: 274, strokes: 3.5 },    // 300 yds
  { distM: 366, strokes: 3.8 },    // 400 yds
]

// Additional strokes added to the baseline for lies that are harder than fairway.
const LIE_PENALTY: Partial<Record<LieType, number>> = {
  rough: 0.15,
  fringe: 0.05,
  sand: 0.25,
  recovery: 0.4,
}

/**
 * Expected strokes to finish the hole from a given distance and lie type.
 * Returns 0 when distanceM ≤ 0 (Broadie convention: ball is in the hole).
 * On-green distances delegate to the purpose-built PGA putting baseline.
 */
function getExpectedStrokes(distanceM: number, lie: LieType): number {
  if (distanceM <= 0) return 0

  if (lie === "green") {
    return getExpectedPutts(distanceM * 3.28084)
  }

  const table = STROKES_TO_HOLE_M
  let baseline: number
  if (distanceM <= table[0].distM) {
    baseline = table[0].strokes
  } else if (distanceM >= table[table.length - 1].distM) {
    baseline = table[table.length - 1].strokes
  } else {
    baseline = table[table.length - 1].strokes
    for (let i = 0; i < table.length - 1; i++) {
      const lo = table[i]
      const hi = table[i + 1]
      if (distanceM >= lo.distM && distanceM <= hi.distM) {
        const t = (distanceM - lo.distM) / (hi.distM - lo.distM)
        baseline = lo.strokes + t * (hi.strokes - lo.strokes)
        break
      }
    }
  }

  return baseline + (LIE_PENALTY[lie] ?? 0)
}

/**
 * Planar distance in metres between two GeoPoints.
 * Accurate to < 0.1% for golf-course distances (≤ 500 m).
 */
function geoDistM(a: GeoPoint, b: GeoPoint): number {
  const midLat = (a.lat + b.lat) / 2
  const cosLat = Math.cos(midLat * (Math.PI / 180))
  const dx = (b.lon - a.lon) * 111_320 * cosLat
  const dy = (b.lat - a.lat) * 111_320
  return Math.sqrt(dx * dx + dy * dy)
}

/**
 * Infer the pin location from the hole's shot sequence.
 * Uses the end point of the last shot that has one recorded.
 * Returns null if unavailable — SG is skipped for that hole.
 */
function findPinLocation(shots: ShotAttempt[]): GeoPoint | null {
  for (let i = shots.length - 1; i >= 0; i--) {
    const pt = shots[i].end?.point
    if (pt) return pt
  }
  return null
}

/**
 * Compute per-round stats from a LiveRoundState.
 *
 * Derived purely from the explicit fields on each LiveHoleState — no shot
 * array traversal. Only completed holes with a defined score are included.
 */
export function computeRoundStats(session: RoundSession): RoundStats {
  const holes = session.holes

  const holesPlayed = holes.length

  // ── Scoring ──────────────────────────────────────────────────────────────
  const scoreToPar = holes.reduce((sum, h) => sum + (h.score ?? 0), 0)
  const score = holes.reduce((sum, h) => sum + h.par + (h.score ?? 0), 0)

  // "birdies" captures birdie or better (eagle, albatross, etc.)
  const birdies = holes.filter((h) => (h.score ?? 0) <= -1).length
  const pars = holes.filter((h) => (h.score ?? 0) === 0).length
  const bogeys = holes.filter((h) => (h.score ?? 0) === 1).length
  const doubleBogeys = holes.filter((h) => (h.score ?? 0) === 2).length
  const triplePlus = holes.filter((h) => (h.score ?? 0) >= 3).length

  // ── Putting ───────────────────────────────────────────────────────────────
  const putts = holes.reduce((sum, h) => sum + h.putts, 0)
  const puttsPerHole = holesPlayed > 0 ? putts / holesPlayed : 0
  const onePutts = holes.filter((h) => h.putts === 1).length
  const threePutts = holes.filter((h) => h.putts >= 3).length

  // ── Fairways ──────────────────────────────────────────────────────────────
  // Only holes where fairwayHit is defined (i.e. par-4s and par-5s)
  const fairwayHoles = holes.filter((h) => h.fairwayHit !== undefined)
  const fairwaysHit = fairwayHoles.filter((h) => h.fairwayHit === true).length
  const fairwayPercentage =
    fairwayHoles.length > 0 ? fairwaysHit / fairwayHoles.length : 0

  // ── GIR ───────────────────────────────────────────────────────────────────
  const gir = holes.filter((h) => h.gir === true).length
  const girPercentage = holesPlayed > 0 ? gir / holesPlayed : 0

  // ── Up & downs ────────────────────────────────────────────────────────────
  // Missed GIR but still made par or better
  const upAndDowns = holes.filter(
    (h) => h.gir === false && (h.score ?? 1) <= 0
  ).length

  // ── Penalties ─────────────────────────────────────────────────────────────
  const penalties = holes.reduce((sum, h) => sum + h.penalties, 0)

  // ── Strokes gained ────────────────────────────────────────────────────────
  // Shot-level computation using the Broadie model. For each hole, shots are
  // looked up by id, ordered by stroke, and the pin location is inferred from
  // the last shot's end point. Holes without shots or without a determinable
  // pin location are excluded — they contribute nothing to the totals rather
  // than zeroing them out.
  const shotMap = new Map(session.shots.map((s) => [s.id, s]))
  let sgTotal = 0
  let sgPutting = 0

  for (const hole of holes) {
    if (!hole.shotIds.length) continue

    const holeShots = hole.shotIds
      .map((id) => shotMap.get(id))
      .filter((s): s is ShotAttempt => s !== undefined)
      .sort((a, b) => a.stroke - b.stroke)

    if (!holeShots.length) continue

    const pinPoint = hole.pinLocation ?? findPinLocation(holeShots)
    if (!pinPoint) continue

    for (let i = 0; i < holeShots.length; i++) {
      const shot = holeShots[i]
      const nextShot = holeShots[i + 1]

      const startDistM = geoDistM(shot.start.point, pinPoint)
      const expectedStart = getExpectedStrokes(startDistM, shot.lie)

      // Last shot: ball is in the hole → expected strokes remaining = 0.
      const expectedEnd = nextShot
        ? getExpectedStrokes(geoDistM(nextShot.start.point, pinPoint), nextShot.lie)
        : 0

      const sg = expectedStart - expectedEnd - 1
      sgTotal += sg
      if (shot.category === "putt") sgPutting += sg
    }
  }

  // ── Distances ─────────────────────────────────────────────────────────────
  const longestPutt = holes.reduce(
    (max, h) => Math.max(max, h.firstPuttDistanceYds ?? 0),
    0
  )

  const longestDrive = session.shots.reduce(
    (max, s) =>
      s.category === "tee"
        ? Math.max(max, s.distance.measuredM ?? 0)
        : max,
    0
  )

  return {
    score,
    scoreToPar,
    birdies,
    pars,
    bogeys,
    doubleBogeys,
    triplePlus,
    putts,
    puttsPerHole,
    onePutts,
    threePutts,
    fairwaysHit,
    fairwayPercentage,
    gir,
    girPercentage,
    upAndDowns,
    penalties,
    longestDrive,
    longestPutt,
    strokesGained: {
      total: sgTotal,
      putting: sgPutting,
    },
  }
}

// /**
//  * Compute aggregate stats across a collection of saved rounds.
//  *
//  * @returns An empty AggregateStats object. Implement computation here when ready.
//  */
// // eslint-disable-next-line @typescript-eslint/no-unused-vars
// export function computeAggregateStats(_rounds: LiveRoundState[]): AggregateStats {
//   // TODO: implement cross-round aggregate stat computation
//   return {}
// }
