/**
 * round.transform.ts
 *
 * Transforms a completed LiveRoundState into the persisted RoundSession shape.
 *
 * This is the ONLY place where:
 *   - Stats are computed
 *   - Server-side fields (roundId, userId, timestamps) are stamped onto shots
 *   - LiveHoleState → RoundHoleSummary conversion happens
 *
 * Callers should invoke this once when the player taps "Save Round".
 * The result is ready to write directly to Firestore.
 *
 * Design contract:
 *   - Input:  LiveRoundState  (client-side, mutable, no derived stats)
 *   - Output: RoundSession    (persisted, immutable, fully denormalised)
 */

import { LatLng } from "@/models/geo"
import type { LiveHoleState, LiveRoundState, LiveShotAttempt } from "@/models/round.live.types"
import { strokesForHole } from "@/models/round.live.types"
import type {
  RoundHoleSummary,
  RoundSession,
  RoundSessionMeta,
  RoundSessionStats,
  ShotAttempt
} from "@/models/round.session.types"

// ─── Shot stamping ────────────────────────────────────────────────────────────

const latLngToGeoPoint = (loc: LatLng) => ({ lat: loc.latitude, lon: loc.longitude })

/**
 * Inflates a LiveShotAttempt into the fully persisted ShotAttempt by
 * stamping server-side fields. No data is mutated; a new object is returned.
 */
function stampShot(
  live: LiveShotAttempt,
  roundId: string,
  userId: string,
  now: string,
): ShotAttempt {
  return {
    id: live.id,
    roundId,
    userId,

    hole: live.hole,
    stroke: live.stroke,
    par: live.par,
    category: live.category,

    club: live.club,
    lie: live.lie,
    distance: live.distance,

    start: { point: latLngToGeoPoint(live.start.point), timestamp: live.start.timestamp },
    end: { point: latLngToGeoPoint(live.end?.point ?? live.start.point), timestamp: live.end?.timestamp ?? now },

    intent: live.intent,
    result: live.result,

    notes: live.notes,

    createdAt: now,
    updatedAt: now,
  }
}

// ─── Hole summary ─────────────────────────────────────────────────────────────

function buildHoleSummary(hole: LiveHoleState, live: LiveRoundState): RoundHoleSummary {
  const strokes = strokesForHole(live, hole.holeNumber)

  return {
    hole: hole.holeNumber,
    par: hole.par,
    score: strokes,

    putts: hole.putts > 0 ? hole.putts : undefined,
    fairwayHit: hole.fairwayHit,
    gir: hole.greenInRegulation,

    shotIds: hole.shotIds,
    yardageM: hole.yardageM,

    // strokesGained is not computed client-side — a Cloud Function should
    // populate this field after the round is written to Firestore.
    strokesGained: undefined,
  }
}

// ─── Stats computation ────────────────────────────────────────────────────────

const EMPTY_MISS_DIRECTION = { left: 0, right: 0, center: 0 } as const

function computeStats(
  live: LiveRoundState,
  holeSummaries: RoundHoleSummary[],
): RoundSessionStats {
  const completedHoles = holeSummaries.filter((h) => {
    const liveHole = live.holes[h.hole]
    return liveHole?.status === "completed"
  })

  // ── Totals ────────────────────────────────────────────────────────────────
  const totalPar = completedHoles.reduce((acc, h) => acc + h.par, 0)
  const totalScore = completedHoles.reduce((acc, h) => acc + h.score, 0)
  const totalPutts = completedHoles.reduce((acc, h) => acc + (h.putts ?? 0), 0)

  // ── Scoring distribution ──────────────────────────────────────────────────
  const scoring: RoundSessionStats["scoring"] = {
    albatross: 0,
    eagle: 0,
    birdie: 0,
    par: 0,
    bogey: 0,
    doubleBogey: 0,
    tripleBogeyPlus: 0,
  }

  for (const h of completedHoles) {
    const rel = h.score - h.par
    if (rel <= -3) scoring.albatross++
    else if (rel === -2) scoring.eagle++
    else if (rel === -1) scoring.birdie++
    else if (rel === 0) scoring.par++
    else if (rel === 1) scoring.bogey++
    else if (rel === 2) scoring.doubleBogey++
    else scoring.tripleBogeyPlus++
  }

  // ── Shot category buckets ─────────────────────────────────────────────────
  const teeShots = live.shots.filter((s) => s.category === "tee")
  const approachShots = live.shots.filter(
    (s) => s.category === "approach" || s.category === "short_game",
  )
  const puttShots = live.shots.filter((s) => s.category === "putt")

  // ── Tee stats ─────────────────────────────────────────────────────────────
  const fairwaysHit = completedHoles.filter((h) => h.fairwayHit === true).length
  // Eligible holes: par-4 and par-5 only (par-3s have no fairway)
  const fairwayEligible = completedHoles.filter((h) => h.par >= 4).length

  const teeTotalDistanceM = teeShots.reduce((acc, s) => acc + (s.distance.totalM ?? 0), 0)
  const teeAttempts = teeShots.length

  // ── Approach stats ────────────────────────────────────────────────────────
  const girCount = completedHoles.filter((h) => h.gir === true).length

  type DistanceBucket = keyof RoundSessionStats["approach"]["byDistanceBucket"]

  function distanceBucket(meters: number | undefined): DistanceBucket {
    if (!meters) return "0-50"
    const yards = meters * 1.09361
    if (yards < 50) return "0-50"
    if (yards < 100) return "50-100"
    if (yards < 150) return "100-150"
    if (yards < 200) return "150-200"
    return "200+"
  }

  const bucketInit = (): { attempts: number; gir: number; avgProximityM?: number } => ({
    attempts: 0,
    gir: 0,
  })

  const approachBuckets: RoundSessionStats["approach"]["byDistanceBucket"] = {
    "0-50": bucketInit(),
    "50-100": bucketInit(),
    "100-150": bucketInit(),
    "150-200": bucketInit(),
    "200+": bucketInit(),
  }

  for (const shot of approachShots) {
    const bucket = distanceBucket(shot.distance.intendedToTargetM)
    approachBuckets[bucket].attempts++
    // GIR credit: if the hole's greenInRegulation flag is set and this is
    // the last approach shot on that hole, credit it. Simplified heuristic.
    const holeGir = live.holes[shot.hole]?.greenInRegulation
    if (holeGir) approachBuckets[bucket].gir++
  }

  // ── Putting stats ─────────────────────────────────────────────────────────
  const onePutts = completedHoles.filter((h) => (h.putts ?? 0) === 1).length
  const threePutts = completedHoles.filter((h) => (h.putts ?? 0) >= 3).length

  // ── SessionStatsBase fields ───────────────────────────────────────────────
  // puttCounts, madePercent, avgMiss, biases, missDistribution are primarily
  // used by the putting session type. For a round session, supply safe defaults
  // and let a Cloud Function backfill detailed putting analytics.
  const holesPlayed = completedHoles.length

  return {
    // SessionStatsBase
    holes: live.teebox.number_of_holes,
    holesPlayed,
    totalPutts,
    puttCounts: [onePutts, totalPutts - onePutts - threePutts, threePutts],
    madePercent: teeAttempts > 0 ? onePutts / holesPlayed : 0,
    avgMiss: 0, // backfilled by Cloud Function from individual putt data
    biases: { leftRight: 0, shortPast: 0, percentShort: 0, percentHigh: 0 },
    missDistribution: {
      center: 0,
      left: 0,
      right: 0,
      farLeft: 0,
      farRight: 0,
      short: 0,
      long: 0,
    },

    // RoundSessionStats
    totalScore,
    par: totalPar,
    scoring,

    tee: {
      attempts: teeAttempts,
      fairwaysHit,
      fairwayPct: fairwayEligible > 0 ? fairwaysHit / fairwayEligible : 0,
      missDirection: { ...EMPTY_MISS_DIRECTION },
      avgDistanceM: teeAttempts > 0 ? teeTotalDistanceM / teeAttempts : undefined,
    },

    approach: {
      attempts: approachShots.length,
      gir: girCount,
      girPct: holesPlayed > 0 ? girCount / holesPlayed : 0,
      byDistanceBucket: approachBuckets,
      missDirection: { left: 0, right: 0, short: 0, long: 0, on: 0 },
    },

    putting:
      puttShots.length > 0
        ? {
            attempts: puttShots.length,
            onePutts,
            threePutts,
          }
        : undefined,
  }
}

// ─── Meta ─────────────────────────────────────────────────────────────────────

function buildMeta(live: LiveRoundState, endedAt: string): RoundSessionMeta {
  const startMs = new Date(live.startedAt).getTime()
  const endMs = new Date(endedAt).getTime()

  return {
    schemaVersion: 1,
    type: "round",

    date: live.startedAt,
    durationMs: endMs - startMs,
    units: "imperial",

    isSynced: false,

    courseId: live.courseId,
    osmCourseId: live.osmCourseId,
    courseName: live.courseName,
    clubName: live.clubName,
    teebox: live.teebox,

    // scorecard: one entry per hole, score relative to par
    scorecard: Object.values(live.holes).map((h) => ({
      par: h.par,
      score: strokesForHole(live, h.holeNumber),
    })),
  }
}

// ─── Main transformation ──────────────────────────────────────────────────────

/**
 * Transforms a finalized LiveRoundState into a persisted RoundSession.
 *
 * Call this once when the player saves the round. All stats are computed here;
 * nothing is computed during live tracking.
 *
 * @param live     - The completed LiveRoundState (status should be "completed").
 * @param userId   - The authenticated user's ID (stamped onto each shot).
 * @param endedAt  - ISO timestamp of when the round was saved. Defaults to now.
 */
export function transformLiveRoundToSession(
  live: LiveRoundState,
  userId: string,
  endedAt: string = new Date().toISOString(),
): RoundSession {
  const now = endedAt

  // 1. Stamp server-side fields onto every shot.
  const shots: ShotAttempt[] = live.shots.map((s) => stampShot(s, live.id, userId, now))

  // 2. Build per-hole summaries (only for holes that were started).
  const holes: RoundHoleSummary[] = Object.values(live.holes)
    .filter((h) => h.status !== "notStarted")
    .sort((a, b) => a.holeNumber - b.holeNumber)
    .map((h) => buildHoleSummary(h, live))

  // 3. Compute aggregate stats.
  const stats = computeStats(live, holes)

  // 4. Build metadata.
  const meta = buildMeta(live, now)

  return {
    id: live.id,
    userId,
    createdAt: live.startedAt,
    updatedAt: now,
    deletedAt: null,
    meta,
    stats,
    holes,
    shots,
  }
}
