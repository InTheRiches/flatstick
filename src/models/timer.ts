export type TimerState = {
    accumulatedMs: number
    runningSince: number | null // epoch ms
}

export type RoundTimerSnapshot = {
    round: TimerState
    holes: TimerState[]
    activeHoleIndex: number
}

export type UseRoundTimerEngine = {
    snapshot: RoundTimerSnapshot

    // derived values
    now: number
    roundElapsedMs: number
    holeElapsedMs: (i: number) => number
    isRoundRunning: boolean
    isHoleRunning: (i: number) => boolean
    activeHoleIndex: number

    // actions
    startRound: () => void
    pauseRound: () => void
    resumeRound: () => void
    stopRound: () => void

    goToHole: (i: number, opts?: { autoResume?: boolean }) => void
    startHole: (i: number) => void
    pauseHole: (i: number) => void
    resumeHole: (i: number) => void
    stopHole: (i: number) => void

    // persistence hooks
    hydrate: (snapshot: RoundTimerSnapshot) => void
    exportSnapshot: () => RoundTimerSnapshot
}