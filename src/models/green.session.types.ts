import { PuttAttempt, SessionBase, SessionMetaBase, SessionStatsBase } from "@/models/session.types"

export interface GreenSessionMeta extends SessionMetaBase {
  type: "green"
  osmGreenId?: string
}

export interface GreenSessionStats extends SessionStatsBase {
  strokesGained: number
}

export interface GreenSession extends SessionBase {
  meta: GreenSessionMeta
  stats: GreenSessionStats

  // You called it holeHistory in code, screenshot shows puttHistory/holeHistory variants.
  holeHistory: PuttAttempt[]
}
