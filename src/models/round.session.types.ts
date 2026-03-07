import { GeoPoint, SessionBase, SessionMetaBase, SessionStatsBase } from "@/models/session.types"
import { TeeDirection } from "./round.live.types"

export type ShotCategory = "tee" | "approach" | "short_game" | "putt" | "recovery"
export type LieType =
  | "tee"
  | "fairway"
  | "rough"
  | "sand"
  | "green"
  | "fringe"
  | "recovery"

export type ClubType = "driver" | "wood" | "hybrid" | "iron" | "wedge" | "putter" | "other"

export type ShotShape = "straight" | "draw" | "fade" | "hook" | "slice" | "push" | "pull" | "other"

export type ShotFinish =
  | "in_hole" // putt holed
  | "in_play" // normal result (fairway/rough/green/etc)
  | "penalty" // water/OB etc
  | "out_of_bounds"
  | "lost"
  | "unknown"

export interface ShotAttempt {
  id: string // uuid
  roundId: string
  userId: string

  hole: number // 1..18
  stroke: number // 1..n on that hole
  par: 3 | 4 | 5

  category: ShotCategory

  // Measured input + context
  club: {
    type: ClubType
    label?: string // "7i", "54°", "3W", "D"
  }

  lie: LieType

  // Distances (store raw; compute derived in stats)
  distance: {
    intendedToTargetM?: number // optional if you know pin/target
    measuredM?: number
  }

  // GPS start/end
  start: {
    point: GeoPoint
    timestamp: string // ISO
  }

  end?: {
    point: GeoPoint
    timestamp?: string
  }

  // Intention (good for “shot shape” and later coaching insights)
  intent?: {
    shape?: ShotShape // what you tried to hit
    goalIsGreen?: boolean // was the intention to reach the green?
    greensideChip?: boolean // was this a chip from around the green?
  }

  // Outcome flags
  result?: {
    finish: ShotFinish
    shape?: ShotShape // what actually happened
    startLine?: "left" | "center" | "right"
    contact?: "pure" | "thin" | "fat" | "toe" | "heel" | "unknown"
    finishLie?: LieType
    isPenalty?: boolean
    isOutOfBounds?: boolean
  }

  notes?: string

  createdAt: string
  updatedAt: string
}

export interface RoundHoleSummary {
  hole: number // 1..18
  par: 3 | 4 | 5
  score: number // strokes taken
  penalties: number

  putts?: number
  fairwayHit?: boolean // if applicable
  gir?: boolean

  shotIds: string[]

  teeClubLabel?: string
  teeDirection?: TeeDirection
  teeMishit?: boolean

  /** Distance of the first putt in yards. User-entered; linked to first putt ShotAttempt at transform time. */
  firstPuttDistanceYds?: number

  // Optional: hole yardage, tee->pin
  yardageM?: number

  strokesGained?: {
    tee?: number
    approach?: number
    shortGame?: number
    putting?: number
    total?: number
  }
}

export interface TeeboxInfo {
  name: string
  number_of_holes: number
  par: number
  length: number // feet
  rating: number
  slope: number
}

export interface RoundSessionMeta extends SessionMetaBase {
  type: "round"
  courseName?: string
  courseId?: string
  osmCourseId?: string
  clubName?: string
  teebox: TeeboxInfo
}

export interface RoundSessionStats extends SessionStatsBase {
  totalScore: number
  par: number
  scoring: Record<
    "albatross" | "eagle" | "birdie" | "par" | "bogey" | "doubleBogey" | "tripleBogeyPlus",
    number
  >
  strokesGained?: {
    tee: number
    approach: number
    shortGame: number
    putting: number
    total: number
  }
  tee: {
    attempts: number
    fairwaysHit: number
    fairwayPct: number

    // dispersion summaries (great for “you miss right 62%”)
    missDirection: Record<"left" | "right" | "center", number>

    avgDistanceM?: number
    avgOfflineM?: number // if you compute from aim line
  }

  approach: {
    attempts: number
    gir: number
    girPct: number

    // Distance buckets are gold for analysis
    byDistanceBucket: Record<
      "0-50" | "50-100" | "100-150" | "150-200" | "200+",
      { attempts: number; gir: number; avgProximityM?: number }
    >

    avgProximityM?: number
    missDirection: Record<"left" | "right" | "short" | "long" | "on", number>
  }

  putting?: {
    attempts: number
    onePutts: number
    threePutts: number
    makesPct?: number

    // You already do this in your putting modes
    avgMissFt?: number
    leftRightBiasIn?: number
    shortPastBiasIn?: number
  }
}

export interface RoundSession extends SessionBase {
  meta: RoundSessionMeta
  stats: RoundSessionStats
  holes: RoundHoleSummary[] // scorecard + per-hole aggregates
  shots: ShotAttempt[] // the truth
}
