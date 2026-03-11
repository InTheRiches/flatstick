/**
 * RoundsProvider.tsx
 *
 * React context that owns all saved-round state for the authenticated user.
 *
 * Responsibilities:
 *   - Opens a real-time Firestore listener on mount (and when userId changes).
 *   - Exposes the current round list, loading flag, and CRUD actions to the tree.
 *   - Performs optimistic local updates so the UI feels instant.
 *   - Delegates all Firestore I/O to roundsRepository (no direct SDK calls here).
 *
 * Mount this provider once, below the auth provider, so it is available
 * throughout the authenticated portion of the app.
 */

import type { Unsubscribe } from "@react-native-firebase/firestore"
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react"

import type { LiveRoundState } from "@/models/round.live.types"
import type { RoundSession } from "@/models/round.session.types"
import { transformLiveRoundToSession } from "@/services/round/round.transform"

import { LatLng } from "@/models/geo"
import { removeUndefinedDeep } from "@/services/firebase/common"
import { computeRoundStats } from "@/services/stats/roundStats"
import * as roundsRepository from "../services/firebase/roundsRepository"

// ─── Context shape ─────────────────────────────────────────────────────────────

export interface RoundsContextValue {
  /** All saved rounds, sorted by createdAt descending. */
  rounds: RoundSession[]

  /** True while the initial Firestore snapshot has not yet arrived. */
  isLoading: boolean

  /** Transform, persist, and cache a completed live round. */
  saveRound(liveRound: LiveRoundState, holePins: Record<number, LatLng>): Promise<void>

  /** Remove a round from Firestore and local cache. */
  deleteRound(roundId: string): Promise<void>

  /**
   * Re-attaches the Firestore listener, triggering a fresh snapshot fetch.
   * Useful for pull-to-refresh scenarios.
   */
  refreshRounds(): Promise<void>

  /** Returns a cached round by id, or undefined if not yet loaded. */
  getRound(roundId: string): RoundSession | undefined
}

// ─── Context ───────────────────────────────────────────────────────────────────

export const RoundsContext = createContext<RoundsContextValue | undefined>(undefined)

// ─── Provider ──────────────────────────────────────────────────────────────────

export interface RoundsProviderProps {
  children: React.ReactNode
  userId: string
}

export function RoundsProvider({ children, userId }: RoundsProviderProps) {
  const [rounds, setRounds] = useState<RoundSession[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const unsubscribeRef = useRef<Unsubscribe | null>(null)

  // ── Listener management ─────────────────────────────────────────────────────

  const startListener = useCallback(() => {
    // Tear down any existing listener before opening a new one.
    unsubscribeRef.current?.()

    setIsLoading(true)

    unsubscribeRef.current = roundsRepository.subscribeToRounds(userId, (freshRounds) => {
      setRounds(freshRounds.map((r) => ({ ...r, stats: computeRoundStats(r) })))
      setIsLoading(false)
    })
  }, [userId])

  useEffect(() => {
    startListener()
    return () => {
      unsubscribeRef.current?.()
    }
  }, [startListener])

  // ── Actions ─────────────────────────────────────────────────────────────────

  const saveRound = useCallback(
    async (liveRound: LiveRoundState, holePins: Record<number, LatLng>): Promise<void> => {
      const session = removeUndefinedDeep(transformLiveRoundToSession(liveRound, userId, holePins))

      await roundsRepository.saveRound(userId, session)

      // Optimistic update — the snapshot listener will also fire shortly after,
      // but this keeps the UI responsive even with a slow connection.
      const sessionWithStats = { ...session, stats: computeRoundStats(session) }
      setRounds((prev) => {
        const without = prev.filter((r) => r.id !== session.id)
        return [sessionWithStats, ...without]
      })
    },
    [userId],
  )

  const deleteRound = useCallback(
    async (roundId: string): Promise<void> => {
      await roundsRepository.deleteRound(userId, roundId)

      // Optimistic update.
      setRounds((prev) => prev.filter((r) => r.id !== roundId))
    },
    [userId],
  )

  const refreshRounds = useCallback(async (): Promise<void> => {
    // Re-attaching the listener forces Firestore to re-evaluate the query,
    // which re-emits from cache immediately and then from the server.
    startListener()
  }, [startListener])

  const getRound = useCallback(
    (roundId: string): RoundSession | undefined => rounds.find((r) => r.id === roundId),
    [rounds],
  )

  // ── Context value ────────────────────────────────────────────────────────────

  const value: RoundsContextValue = {
    rounds,
    isLoading,
    saveRound,
    deleteRound,
    refreshRounds,
    getRound,
  }

  return <RoundsContext.Provider value={value}>{children}</RoundsContext.Provider>
}

// ─── Internal hook (used by useRounds / useRound) ──────────────────────────────

/**
 * Low-level hook that returns the raw context value.
 * Prefer the public `useRounds()` hook in application code.
 */
export function useRoundsContext(): RoundsContextValue {
  const ctx = useContext(RoundsContext)
  if (!ctx) {
    throw new Error("useRoundsContext must be used within a RoundsProvider")
  }
  return ctx
}
