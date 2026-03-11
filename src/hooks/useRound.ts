/**
 * useRound.ts
 *
 * Hook for the round summary screen — returns a single round plus its
 * disaggregated holes and shots for convenient rendering.
 *
 * Data is sourced from the in-memory cache in RoundsProvider, so there is
 * no additional Firestore read. The hook re-renders whenever the round list
 * changes (e.g. after a background sync).
 *
 * Usage:
 *   const { round, holes, shots } = useRound(roundId)
 */

import { useMemo } from "react"

import type { RoundHoleSummary, RoundSession, ShotAttempt } from "@/models/round.session.types"

import { useRoundsContext } from "../context/RoundsProvider"

export interface UseRoundResult {
  /** The full persisted session, or undefined while loading / if not found. */
  round: RoundSession | undefined

  /**
   * Per-hole summaries sorted by hole number ascending.
   * Empty array while the round is loading.
   */
  holes: RoundHoleSummary[]

  /**
   * All shot attempts for this round in their original order.
   * Empty array while the round is loading.
   */
  shots: ShotAttempt[]
}

export function useRound(roundId: string): UseRoundResult {
  const { getRound } = useRoundsContext()

  const round = useMemo(() => getRound(roundId), [getRound, roundId])

  const holes = useMemo(
    () =>
      round?.holes
        ? [...round.holes].sort((a, b) => a.hole - b.hole)
        : [],
    [round],
  )

  const shots = useMemo(() => round?.shots ?? [], [round])

  return { round, holes, shots }
}
