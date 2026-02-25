import {useCallback, useEffect, useRef, useState} from "react"
import type {RoundTimerSnapshot, TimerState, UseRoundTimerEngine} from "@/models/timer"

/**
 * Converts a TimerState to elapsed milliseconds
 */
function getElapsedMs(state: TimerState, now: number): number {
    const baseMs = state.accumulatedMs
    if (state.runningSince === null) return baseMs
    return baseMs + (now - state.runningSince)
}

/**
 * Creates a new, paused TimerState
 */
function createTimerState(): TimerState {
    return {accumulatedMs: 0, runningSince: null}
}

/**
 * Starts a paused TimerState (returns new state)
 */
function startTimer(state: TimerState, now: number): TimerState {
    if (state.runningSince !== null) return state // already running
    return {...state, runningSince: now}
}

/**
 * Pauses a running TimerState (returns new state)
 */
function pauseTimer(state: TimerState, now: number): TimerState {
    if (state.runningSince === null) return state // already paused
    const elapsedSinceStart = now - state.runningSince
    return {
        accumulatedMs: state.accumulatedMs + elapsedSinceStart,
        runningSince: null,
    }
}

/**
 * Stops a TimerState and resets it
 */
function stopTimer(): TimerState {
    return createTimerState()
}

export function useRoundTimerEngine(initialHoleCount: number = 18): UseRoundTimerEngine {
    // State
    const [snapshot, setSnapshot] = useState<RoundTimerSnapshot>(() => ({
        round: createTimerState(),
        holes: Array(initialHoleCount).fill(null).map(() => createTimerState()),
        activeHoleIndex: 0,
    }))

    // Current time reference for animations/re-renders
    const [now, setNow] = useState(Date.now())
    const rafRef = useRef<number | null>(null)
    const isRunningRef = useRef(false)

    // Animation loop to update "now" for real-time elapsed display
    const updateAnimationLoop = useCallback(() => {
        const isRoundRunning = snapshot.round.runningSince !== null ||
            snapshot.holes.some((h: TimerState) => h.runningSince !== null)

        if (isRoundRunning) {
            setNow(Date.now())
            rafRef.current = requestAnimationFrame(updateAnimationLoop)
            isRunningRef.current = true
        } else {
            isRunningRef.current = false
        }
    }, [snapshot])

    // Start/stop animation loop when timers change
    useEffect(() => {
        if (isRunningRef.current) {
            rafRef.current = requestAnimationFrame(updateAnimationLoop)
        }
        return () => {
            if (rafRef.current !== null) {
                cancelAnimationFrame(rafRef.current)
            }
        }
    }, [snapshot, updateAnimationLoop])

    // Derived values
    const roundElapsedMs = getElapsedMs(snapshot.round, now)
    const holeElapsedMs = useCallback(
        (i: number) => {
            if (i < 0 || i >= snapshot.holes.length) return 0
            return getElapsedMs(snapshot.holes[i], now)
        },
        [snapshot.holes, now]
    )
    const isRoundRunning = snapshot.round.runningSince !== null
    const isHoleRunning = useCallback(
        (i: number) => {
            if (i < 0 || i >= snapshot.holes.length) return false
            return snapshot.holes[i].runningSince !== null
        },
        [snapshot.holes]
    )

    // Actions: Round control
    const startRound = useCallback(() => {
        setSnapshot((prev: RoundTimerSnapshot) => {
            const currentTime = Date.now()
            return {
                ...prev,
                round: startTimer(prev.round, currentTime),
                holes: prev.holes.map((h: TimerState, idx: number) =>
                    idx === prev.activeHoleIndex ? startTimer(h, currentTime) : h
                ),
            }
        })
    }, [])

    const pauseRound = useCallback(() => {
        setSnapshot((prev: RoundTimerSnapshot) => {
            const currentTime = Date.now()
            return {
                ...prev,
                round: pauseTimer(prev.round, currentTime),
                holes: prev.holes.map((h: TimerState) => pauseTimer(h, currentTime)),
            }
        })
    }, [])

    const resumeRound = useCallback(() => {
        setSnapshot((prev: RoundTimerSnapshot) => {
            const currentTime = Date.now()
            return {
                ...prev,
                round: startTimer(prev.round, currentTime),
                holes: prev.holes.map((h: TimerState, idx: number) =>
                    idx === prev.activeHoleIndex ? startTimer(h, currentTime) : h
                ),
            }
        })
    }, [])

    const stopRound = useCallback(() => {
        setSnapshot((prev: RoundTimerSnapshot) => ({
            ...prev,
            round: stopTimer(),
            holes: prev.holes.map(() => stopTimer()),
        }))
    }, [])

    // Actions: Hole navigation and control
    const goToHole = useCallback((i: number, opts?: {autoResume?: boolean}) => {
        if (i < 0 || i >= snapshot.holes.length) return

        setSnapshot((prev: RoundTimerSnapshot) => {
            const currentTime = Date.now()
            const newHoles = prev.holes.map((h: TimerState, idx: number) =>
                idx === i ? h : pauseTimer(h, currentTime)
            )

            // If autoResume and round is running, resume the new hole
            const shouldResumeHole = opts?.autoResume && isRoundRunning
            if (shouldResumeHole) {
                newHoles[i] = startTimer(newHoles[i], currentTime)
            }

            return {
                ...prev,
                holes: newHoles,
                activeHoleIndex: i,
            }
        })
    }, [snapshot.holes.length, isRoundRunning])

    const startHole = useCallback((i: number) => {
        if (i < 0 || i >= snapshot.holes.length) return

        setSnapshot((prev: RoundTimerSnapshot) => {
            const currentTime = Date.now()
            return {
                ...prev,
                holes: prev.holes.map((h: TimerState, idx: number) =>
                    idx === i ? startTimer(h, currentTime) : h
                ),
            }
        })
    }, [snapshot.holes.length])

    const pauseHole = useCallback((i: number) => {
        if (i < 0 || i >= snapshot.holes.length) return

        setSnapshot((prev: RoundTimerSnapshot) => {
            const currentTime = Date.now()
            return {
                ...prev,
                holes: prev.holes.map((h: TimerState, idx: number) =>
                    idx === i ? pauseTimer(h, currentTime) : h
                ),
            }
        })
    }, [snapshot.holes.length])

    const resumeHole = useCallback((i: number) => {
        if (i < 0 || i >= snapshot.holes.length) return

        setSnapshot((prev: RoundTimerSnapshot) => {
            const currentTime = Date.now()
            return {
                ...prev,
                holes: prev.holes.map((h: TimerState, idx: number) =>
                    idx === i ? startTimer(h, currentTime) : h
                ),
            }
        })
    }, [snapshot.holes.length])

    const stopHole = useCallback((i: number) => {
        if (i < 0 || i >= snapshot.holes.length) return

        setSnapshot((prev: RoundTimerSnapshot) => ({
            ...prev,
            holes: prev.holes.map((h: TimerState, idx: number) =>
                idx === i ? stopTimer() : h
            ),
        }))
    }, [snapshot.holes.length])

    // Persistence hooks
    const hydrate = useCallback((newSnapshot: RoundTimerSnapshot) => {
        setSnapshot(newSnapshot)
        setNow(Date.now())
    }, [])

    const exportSnapshot = useCallback(() => snapshot, [snapshot])

    return {
        snapshot,
        now,
        roundElapsedMs,
        holeElapsedMs,
        isRoundRunning,
        isHoleRunning,
        activeHoleIndex: snapshot.activeHoleIndex,
        startRound,
        pauseRound,
        resumeRound,
        stopRound,
        goToHole,
        startHole,
        pauseHole,
        resumeHole,
        stopHole,
        hydrate,
        exportSnapshot,
    }
}
