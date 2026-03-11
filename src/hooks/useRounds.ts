/**
 * useRounds.ts
 *
 * Public hook that exposes the full RoundsContextValue to any component
 * inside the RoundsProvider tree.
 *
 * Usage:
 *   const { rounds, isLoading, saveRound, deleteRound, refreshRounds, getRound } = useRounds()
 */

import { useRoundsContext, type RoundsContextValue } from "../context/RoundsProvider"

export function useRounds(): RoundsContextValue {
  return useRoundsContext()
}
