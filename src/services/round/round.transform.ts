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

function buildHoleSummary(hole: LiveHoleState, pinLocation: LatLng, live: LiveRoundState): RoundHoleSummary {
  const strokes = strokesForHole(live, hole.holeNumber)

  return {
    hole: hole.holeNumber,
    par: hole.par,
    score: strokes,
    penalties: hole.penaltyStrokes,

    pinLocation: latLngToGeoPoint(pinLocation),

    putts: hole.putts > 0 ? hole.putts : 0,
    fairwayHit: hole.fairwayHit ?? true, // fairwayHit is only defined for par 4s and 5s; treat undefined as "not applicable" → true
    gir: hole.greenInRegulation ?? false, // gir is only defined for approach shots; treat undefined as "not green" → false

    shotIds: hole.shotIds,
    yardageM: hole.yardageM,
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
 * @param holePins - A mapping of hole number to pin location, used to populate each RoundHoleSummary.pinLocation. Pin locations are not tracked live, so must be passed in separately at save time.
 * @param userId   - The authenticated user's ID (stamped onto each shot).
 * @param endedAt  - ISO timestamp of when the round was saved. Defaults to now.
 */
export function transformLiveRoundToSession(
  live: LiveRoundState,
  userId: string,
  holePins: Record<number, LatLng>,
  endedAt: string = new Date().toISOString(),
): RoundSession {
  const now = endedAt

  // 1. Stamp server-side fields onto every shot.
  const shots: ShotAttempt[] = live.shots.map((s) => stampShot(s, live.id, userId, now))

  // 2. Build per-hole summaries (only for holes that were started).
  const holes: RoundHoleSummary[] = Object.values(live.holes)
    .filter((h) => h.status !== "notStarted")
    .sort((a, b) => a.holeNumber - b.holeNumber)
    .map((h) => buildHoleSummary(h, holePins[h.holeNumber], live))

  // 4. Build metadata.
  const meta = buildMeta(live, now)

  return {
    id: live.id,
    userId,
    createdAt: live.startedAt,
    updatedAt: now,
    deletedAt: null,
    meta,
    holes,
    shots,
  }
}
