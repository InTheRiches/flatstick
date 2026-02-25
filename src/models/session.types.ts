// src/models/session.types.ts
import type { ISODateString, UUID } from "./common"

export type SessionId = string

export type UnitSystemLegacy = 0 | 1 // keep if your old data uses 0/1
export type UnitSystem = "imperial" | "metric"

// If you're mid-migration, support both:
export type Units = UnitSystem | UnitSystemLegacy

export type Difficulty = "easy" | "medium" | "hard"
export type SessionMode = "random" | "manual" | "challenge" | string // keep open-ended
export type SessionType =
  | "green" // putting green simulation
  | "round" // full on-course round (all shots)
  | "putting" // putting-only practice (real life)

export type MissBucket = "center" | "left" | "right" | "farLeft" | "farRight" | "short" | "long"

export type MissDistribution = Record<MissBucket, number>

export type HoleState = {
  holeNumber: number // 1..18
  status: "notStarted" | "inProgress" | "completed"
  // keep per-hole scoring/putting fields here
  strokes?: number
  putts?: number
}

export interface GeoPoint {
  lat: number
  lon: number
  accuracyM?: number
  altitudeM?: number
}

export interface SessionMetaBase {
  schemaVersion: number
  type: SessionType

  date: ISODateString
  durationMs: number

  units: Units

  // Your old data uses isSynced or synced — unify to one, but allow both for reading.
  isSynced?: boolean

  difficulty?: Difficulty
  mode?: SessionMode

  scorecard: {
    par?: number
    score: number
  }[] // your computed array
}

export interface SessionStatsBase {
  // Define any common stats fields here, if needed.
  holes: number
  holesPlayed: number

  totalPutts: number
  puttCounts: number[] // e.g. [7,4,0] — 1-putts, 2-putts, 3-putts etc
  madePercent: number

  avgMiss: number // feet
  totalDistance?: number // feet (you have totalDistanceFeet)

  biases: PuttBiases
  missDistribution: MissDistribution
}

export interface PuttBiases {
  leftRight: number // inches (based on your naming)
  shortPast: number // inches
  percentShort: number // 0..1
  percentHigh: number // 0..1
}

export interface SessionBase {
  id: SessionId
  userId: UUID // add this in new system
  createdAt: ISODateString // can equal meta.date
  updatedAt: ISODateString
  deletedAt?: ISODateString | null

  meta: SessionMetaBase
}

export interface PuttAttempt {
  id: string // uuid
  roundId: string
  userId: string

  hole: number // 1..18

  distance: number // feet
  distanceMissed: {
    total: number
    xDistance: number
    yDistance: number
  } // feet

  misread?: Record<"speed" | "break", boolean>
  start: {
    point: GeoPoint
    timestamp: string // ISO
  }

  end?: {
    point: GeoPoint
    timestamp?: string
  }

  createdAt: string
  updatedAt: string
}
