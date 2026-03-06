/**
 * round.live.types.ts
 *
 * Client-side types for an in-progress golf round. These types are:
 *   - Mutation-friendly (no derived stats)
 *   - Normalized (shots live at top level, holes reference by ID)
 *   - Structurally aligned with round.session.types to make transformation trivial
 *
 * RULE: Nothing in this file inherits from or extends the persisted session
 * types. The persisted types are produced by the transformation layer
 * (round.transform.ts), not carried through editing screens.
 */

import type { ISODateString, UUID } from "@/models/common"
import type {
  ClubType,
  LieType,
  ShotCategory,
  ShotFinish,
  ShotShape,
  TeeboxInfo,
} from "@/models/round.session.types"
import { LatLng } from "./geo"

// ─── Primitive aliases ────────────────────────────────────────────────────────

export type HolePar = 3 | 4 | 5

// ─── A. LiveShotAttempt ───────────────────────────────────────────────────────
//
// The in-progress version of the persisted ShotAttempt. Structurally mirrors
// ShotAttempt but deliberately omits server-side fields (roundId, userId,
// createdAt, updatedAt) that are stamped on at persist time.
//
// All enums/union types are imported from round.session.types so that the
// transformation layer can copy fields without conversion.

export interface LiveShotAttempt {
  /** Client-generated uuid. Becomes ShotAttempt.id on persist. */
  id: UUID

  /** 1-based hole number. Denormalised here for easy filtering. */
  hole: number

  /** 1-based stroke index within the hole. */
  stroke: number

  par: HolePar

  category: ShotCategory

  club: {
    type: ClubType
    /** Human-readable label e.g. "7i", "54°", "D" */
    label?: string
  }

  lie: LieType

  distance: {
    /** Distance from current position to intended target, in metres. */
    intendedToTargetM?: number
    /** GPS-measured total distance, in metres. */
    measuredM?: number
  }

  start: {
    point: LatLng
    /** ISO timestamp when the shot was started. */
    timestamp: ISODateString
  }

  /** Populated once the shot ends (user walks to ball or taps End). */
  end?: {
    point: LatLng
    timestamp?: ISODateString
  }

  /** What the player intended to do. Set before / at shot time. */
  intent?: {
    shape?: ShotShape
    goalIsGreen?: boolean
    greensideChip?: boolean
  }

  /**
   * Outcome. Populated after the shot ends via ShotDetailsModal.
   * Optional — the shot is still valid without it (e.g. mid-round data loss).
   */
  result?: {
    finish?: ShotFinish
    shape?: ShotShape
    contact?: "pure" | "thin" | "fat" | "toe" | "heel" | "unknown"
    finishLie?: LieType
    isPenalty?: boolean
    isOutOfBounds?: boolean
  }

  notes?: string
}

// ─── B. LiveHoleState ─────────────────────────────────────────────────────────
//
// Per-hole tracking model. Normalised: shots are NOT nested here — they live
// in LiveRoundState.shots[] and are associated via shotIds.
//
// DERIVED fields (do not store):
//   strokes = shotIds.length + penaltyStrokes   ← compute at read time
//   score   = strokes - par                     ← compute at read time
//   gir     = greenInRegulation                 ← user-provided or inferrable
//
// EXPLICITLY stored (cannot be reliably derived from GPS shots alone):
//   putts, penaltyStrokes, fairwayHit, greenInRegulation
//
// This is intentionally NOT RoundHoleSummary. RoundHoleSummary is the finalised
// persisted shape; this is the mutable UI model.

export interface LiveHoleState {
  /** 1-based hole number. */
  holeNumber: number

  par: HolePar

  /** Course data: tee-to-pin distance in metres (optional, from teebox). */
  yardageM?: number

  status: "notStarted" | "inProgress" | "completed"

  /**
   * IDs of LiveShotAttempt entries associated with this hole.
   * Ordered by stroke number. The shots themselves live in LiveRoundState.shots.
   */
  shotIds: string[]

  /**
   * Penalty strokes that have no GPS representation (e.g. drop after water).
   * Counted separately so strokes = shotIds.length + penaltyStrokes.
   */
  penaltyStrokes: number

  /**
   * Score on the hole, explicitly stored so the HoleSummaryModal can load it for editing. This is
   * the total strokes (shots + penalties) relative to par. The UI can't reliably derive this from GPS shots alone, 
   * since the player may edit the score after the fact, so we store it explicitly here.
   */
  score?: number

  /**
   * Number of putts taken on this hole.
   * Can be user-entered or inferred from shots with category === "putt".
   * Explicitly stored because the user may correct the count.
   */
  putts: number

  /**
   * Tee shot details, explicitly stored so the HoleSummaryModal can load them for editing. These are not reliably inferable 
   * from GPS shots alone, since the player may edit them after the fact, so we store them explicitly here.
   */
  teeClubLabel?: string
  teeDirection?: TeeDirection
  teeMishit?: boolean

  /**
   * Whether the fairway was hit from the tee. Undefined for par-3 holes
   * (there is no fairway approach). False = missed, true = hit.
   */
  fairwayHit?: boolean

  /** Green in regulation (on the green in par - 2 strokes or fewer). */
  greenInRegulation?: boolean

  /** Distance of the first putt in yards. User-entered; linked to first putt ShotAttempt at transform time. */
  firstPuttDistanceYds?: number

  notes?: string
}

// ─── D. HoleSummaryCommit ─────────────────────────────────────────────────────
//
// Produced by HoleSummaryModal.onCommit. Applied by useRoundTracking.
// Not a persisted type — purely a delta payload for the hook.

export type TeeDirection =
  | "center"
  | "slight-left"
  | "far-left"
  | "slight-right"
  | "far-right"
  | "long"
  | "short"

export interface HoleSummaryCommit {
  holeNumber: number

  score: number          // total strokes (shots + penalties)
  putts: number
  penaltyStrokes: number

  fairwayHit?: boolean
  greenInRegulation?: boolean
  firstPuttDistanceYds?: number

  teeClubLabel?: string  // applied to existing or synthetic tee shot
  teeDirection?: TeeDirection
  teeMishit?: boolean

  /**
   * Only present when no shots existed at commit time (summary-only mode).
   * Generated by the modal; the hook splices these in.
   */
  syntheticShots?: LiveShotAttempt[]
}

// ─── C. LiveRoundState ────────────────────────────────────────────────────────
//
// Top-level in-progress round. One instance lives in memory (or persisted to
// AsyncStorage for crash recovery) for the duration of the round.
//
// Key design decisions:
//   - shots[] is the single source of truth for all shot data.
//   - holes is a Record<number, LiveHoleState> keyed by 1-based hole number
//     for O(1) access and simple mutation (no array index hunting).
//   - No stats or aggregates — all computed in the transformation layer.

export type LiveRoundStatus = "notStarted" | "inProgress" | "paused" | "completed"

export interface LiveRoundState {
  /**
   * Client-generated uuid. Becomes RoundSession.id on persist.
   * Generate once at round creation; never regenerate.
   */
  id: UUID

  userId: UUID

  status: LiveRoundStatus

  /** ISO timestamp of the first shot or when the round was explicitly started. */
  startedAt: ISODateString

  /** Updated on every mutation — used for crash recovery ordering. */
  lastUpdatedAt: ISODateString

  // ── Course context ────────────────────────────────────────────────────────
  // Sourced from course selection UI. Stored here so the transformation layer
  // can stamp them onto the session without re-fetching course data.

  courseId?: string
  osmCourseId?: string
  courseName?: string
  clubName?: string

  /** Teebox the player selected at round start (rating, slope, par, etc.). */
  teebox: TeeboxInfo

  // ── Navigation ────────────────────────────────────────────────────────────

  /** The hole the player is currently on. 1-based. */
  currentHoleNumber: number

  // ── Core data ─────────────────────────────────────────────────────────────

  /**
   * All holes for the round. Keyed by 1-based hole number.
   * Populate all holes upfront (status = "notStarted") so that the scorecard
   * can render the full card without guards.
   */
  holes: Record<number, LiveHoleState>

  /**
   * Flat, ordered array of all shots across all holes.
   * This is the authoritative source of truth.
   * Query by hole: shots.filter(s => s.hole === holeNumber)
   */
  shots: LiveShotAttempt[]
}

// ─── Convenience selectors (pure functions, no side effects) ─────────────────

/** Returns all shots for a specific hole, ordered by stroke. */
export function shotsForHole(state: LiveRoundState, holeNumber: number): LiveShotAttempt[] {
  return state.shots.filter((s) => s.hole === holeNumber)
}

/**
 * Derives the stroke count for a hole.
 * = shotIds.length + penaltyStrokes
 */
export function strokesForHole(state: LiveRoundState, holeNumber: number): number {
  const hole = state.holes[holeNumber]
  if (!hole) return 0
  return hole.shotIds.length + hole.penaltyStrokes
}

/**
 * Derives the score relative to par for a hole.
 * Returns undefined if the hole hasn't been completed.
 */
export function scoreForHole(
  state: LiveRoundState,
  holeNumber: number,
): number | undefined {
  const hole = state.holes[holeNumber]
  if (!hole || hole.status !== "completed") return undefined
  return strokesForHole(state, holeNumber) - hole.par
}
