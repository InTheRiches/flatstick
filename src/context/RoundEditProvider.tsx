import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"

import { useRounds } from "@/hooks/useRounds"
import type { CourseData } from "@/models/course"
import type { LatLng } from "@/models/geo"
import type { HoleSummaryCommit, LiveShotAttempt } from "@/models/round.live.types"
import type { RoundHoleSummary, RoundSession, ShotAttempt } from "@/models/round.session.types"
import { removeUndefinedDeep } from "@/services/firebase/common"
import { detectLieFromCourseData } from "@/services/round/roundMapEditing"
import { computeRoundStats } from "@/services/stats/roundStats"
import { generateUUID } from "@/utils/common"
import { haversineMeters } from "@/utils/courses/geometry/distance.utils"

interface RoundEditContextValue {
  originalRound: RoundSession | null
  editableRound: RoundSession | null
  isDirty: boolean
  isSaving: boolean
  updateHole: (holeNumber: number, updates: Partial<RoundHoleSummary>) => void
  commitHoleSummary: (commit: HoleSummaryCommit) => void
  updateShot: (shotId: string, updates: Partial<ShotAttempt>) => void
  moveShotEnd: (shotId: string, endPoint: LatLng, courseData?: CourseData | null) => void
  addShotToHole: (holeNumber: number, endPoint: LatLng, courseData?: CourseData | null) => void
  deleteShot: (shotId: string) => void
  saveChanges: () => Promise<void>
  discardChanges: () => void
}

const RoundEditContext = createContext<RoundEditContextValue | undefined>(undefined)

function latLngToGeoPoint(loc: LatLng): ShotAttempt["start"]["point"] {
  return { lat: loc.latitude, lon: loc.longitude }
}

function geoPointToLatLng(point: ShotAttempt["start"]["point"]): LatLng {
  return { latitude: point.lat, longitude: point.lon }
}

function cloneShot(shot: ShotAttempt): ShotAttempt {
  return {
    ...shot,
    club: { ...shot.club },
    distance: { ...shot.distance },
    start: {
      ...shot.start,
      point: { ...shot.start.point },
    },
    end: shot.end
      ? {
          ...shot.end,
          point: { ...shot.end.point },
        }
      : undefined,
    intent: shot.intent ? { ...shot.intent } : undefined,
    result: shot.result ? { ...shot.result } : undefined,
  }
}

function cloneRound(round: RoundSession): RoundSession {
  return {
    ...round,
    meta: {
      ...round.meta,
      teebox: { ...round.meta.teebox },
      scorecard: round.meta.scorecard.map((s) => ({ ...s })),
    },
    holes: round.holes.map((hole) => ({
      ...hole,
      shotIds: [...hole.shotIds],
      pinLocation: { ...hole.pinLocation },
    })),
    shots: round.shots.map(cloneShot),
  }
}

function sortHoles(holes: RoundHoleSummary[]): RoundHoleSummary[] {
  return [...holes].sort((a, b) => a.hole - b.hole)
}

function createHoleSummary(round: RoundSession, holeNumber: number, par?: RoundHoleSummary["par"]): RoundHoleSummary {
  const scorecardEntry = round.meta.scorecard[holeNumber - 1]

  return {
    hole: holeNumber,
    par: par ?? (scorecardEntry?.par as RoundHoleSummary["par"] | undefined) ?? 4,
    score: scorecardEntry?.score ?? 4,
    penalties: 0,
    putts: 2,
    fairwayHit: false,
    gir: false,
    shotIds: [],
    pinLocation: { lat: 0, lon: 0 },
  }
}

function liveShotToPersistedShot(liveShot: LiveShotAttempt, roundId: string, userId: string): ShotAttempt {
  const now = new Date().toISOString()

  return {
    id: liveShot.id,
    roundId,
    userId,
    hole: liveShot.hole,
    stroke: liveShot.stroke,
    par: liveShot.par,
    category: liveShot.category,
    club: { ...liveShot.club },
    lie: liveShot.lie,
    distance: { ...liveShot.distance },
    start: {
      point: latLngToGeoPoint(liveShot.start.point),
      timestamp: liveShot.start.timestamp,
    },
    end: liveShot.end
      ? {
          point: latLngToGeoPoint(liveShot.end.point),
          timestamp: liveShot.end.timestamp,
        }
      : undefined,
    intent: liveShot.intent ? { ...liveShot.intent } : undefined,
    result: liveShot.result ? { ...liveShot.result } : undefined,
    notes: liveShot.notes,
    createdAt: now,
    updatedAt: now,
  }
}

function syncRoundMetadata(round: RoundSession): RoundSession {
  const holes = sortHoles(round.holes)
  const totalHoles = Math.max(
    round.meta.scorecard.length,
    round.meta.teebox.number_of_holes ?? 0,
    holes[holes.length - 1]?.hole ?? 0,
  )
  const holesByNumber = new Map(holes.map((hole) => [hole.hole, hole]))

  return {
    ...round,
    holes,
    meta: {
      ...round.meta,
      scorecard: Array.from({ length: totalHoles }, (_, index) => {
        const holeNumber = index + 1
        const existingEntry = round.meta.scorecard[index]
        const hole = holesByNumber.get(holeNumber)

        if (hole) {
          return {
            par: hole.par,
            score: hole.score,
          }
        }

        return {
          par: existingEntry?.par,
          score: existingEntry?.score ?? 0,
        }
      }),
    },
  }
}

function roundSignature(round: RoundSession): string {
  const { stats: _stats, ...persistable } = round
  return JSON.stringify(persistable)
}

function reindexHoleShots(shots: ShotAttempt[], holeNumber: number): ShotAttempt[] {
  const byHole = shots
    .filter((shot) => shot.hole === holeNumber)
    .sort((a, b) => a.stroke - b.stroke)

  const strokeById = new Map<string, number>()
  byHole.forEach((shot, index) => {
    strokeById.set(shot.id, index + 1)
  })

  return shots.map((shot) => {
    const nextStroke = strokeById.get(shot.id)
    if (nextStroke === undefined) return shot
    if (shot.stroke === nextStroke) return shot
    return { ...shot, stroke: nextStroke }
  })
}

function updateHoleShotIds(round: RoundSession, holeNumber: number): RoundSession {
  const holeShotIds = round.shots
    .filter((shot) => shot.hole === holeNumber)
    .sort((a, b) => a.stroke - b.stroke)
    .map((shot) => shot.id)

  const nextHoles = round.holes.map((hole) => {
    if (hole.hole !== holeNumber) return hole

    const nextScore = holeShotIds.length + hole.penalties
    return {
      ...hole,
      shotIds: holeShotIds,
      score: nextScore,
    }
  })

  return {
    ...round,
    holes: nextHoles,
  }
}

interface RoundEditProviderProps {
  roundId: string
  children: React.ReactNode
}

export function RoundEditProvider({ roundId, children }: RoundEditProviderProps) {
  const { getRound, updateRoundSession } = useRounds()

  const sourceRound = useMemo(() => getRound(roundId) ?? null, [getRound, roundId])
  const [editableRound, setEditableRound] = useState<RoundSession | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const baseSignatureRef = useRef<string>("")

  useEffect(() => {
    if (!sourceRound) return

    const cloned = cloneRound(sourceRound)
    setEditableRound(cloned)
    baseSignatureRef.current = roundSignature(cloned)
  }, [sourceRound?.id, sourceRound?.updatedAt])

  const isDirty = useMemo(() => {
    if (!editableRound) return false
    return roundSignature(editableRound) !== baseSignatureRef.current
  }, [editableRound])

  const updateRound = useCallback((updater: (prev: RoundSession) => RoundSession) => {
    setEditableRound((prev) => {
      if (!prev) return prev
      const updated = syncRoundMetadata(updater(prev))
      return {
        ...updated,
        stats: computeRoundStats(updated),
      }
    })
  }, [])

  const updateHole = useCallback(
    (holeNumber: number, updates: Partial<RoundHoleSummary>) => {
      updateRound((prev) => {
        const existingHole = prev.holes.find((hole) => hole.hole === holeNumber)
        const nextHole = {
          ...(existingHole ?? createHoleSummary(prev, holeNumber)),
          ...updates,
          hole: holeNumber,
        }

        return {
          ...prev,
          holes: existingHole
            ? prev.holes.map((hole) => (hole.hole === holeNumber ? nextHole : hole))
            : [...prev.holes, nextHole],
        }
      })
    },
    [updateRound],
  )

  const commitHoleSummary = useCallback(
    (commit: HoleSummaryCommit) => {
      updateRound((prev) => {
        const existingHole = prev.holes.find((hole) => hole.hole === commit.hole)
        const par = existingHole?.par ?? prev.meta.scorecard[commit.hole - 1]?.par ?? commit.syntheticShots?.[0]?.par ?? 4
        const nextShots = commit.syntheticShots
          ? [
              ...prev.shots.filter((shot) => shot.hole !== commit.hole),
              ...commit.syntheticShots.map((shot) => liveShotToPersistedShot(shot, prev.id, prev.userId)),
            ]
          : prev.shots
        const shotIds = commit.syntheticShots
          ? commit.syntheticShots.map((shot) => shot.id)
          : existingHole?.shotIds ?? nextShots
              .filter((shot) => shot.hole === commit.hole)
              .sort((a, b) => a.stroke - b.stroke)
              .map((shot) => shot.id)

        const nextHole: RoundHoleSummary = {
          ...(existingHole ?? createHoleSummary(prev, commit.hole, par as RoundHoleSummary["par"])),
          hole: commit.hole,
          par: par as RoundHoleSummary["par"],
          score: commit.score,
          penalties: commit.penalties,
          putts: commit.putts,
          fairwayHit: commit.fairwayHit ?? existingHole?.fairwayHit ?? false,
          gir: commit.greenInRegulation ?? existingHole?.gir ?? false,
          shotIds,
          teeClubLabel: commit.teeClubLabel,
          teeDirection: commit.teeDirection,
          teeMishit: commit.teeMishit,
          firstPuttDistanceYds: commit.firstPuttDistanceYds,
        }

        return {
          ...prev,
          shots: nextShots,
          holes: existingHole
            ? prev.holes.map((hole) => (hole.hole === commit.hole ? nextHole : hole))
            : [...prev.holes, nextHole],
        }
      })
    },
    [updateRound],
  )

  const updateShot = useCallback(
    (shotId: string, updates: Partial<ShotAttempt>) => {
      updateRound((prev) => {
        const now = new Date().toISOString()
        return {
          ...prev,
          shots: prev.shots.map((shot) =>
            shot.id === shotId
              ? {
                  ...shot,
                  ...updates,
                  updatedAt: now,
                }
              : shot,
          ),
        }
      })
    },
    [updateRound],
  )

  const moveShotEnd = useCallback(
    (shotId: string, endPoint: LatLng, courseData?: CourseData | null) => {
      updateRound((prev) => {
        const now = new Date().toISOString()
        return {
          ...prev,
          shots: prev.shots.map((shot) => {
            if (shot.id !== shotId) return shot

            const start = geoPointToLatLng(shot.start.point)
            const finishLie = courseData ? detectLieFromCourseData(endPoint, courseData) : shot.result?.finishLie

            return {
              ...shot,
              end: {
                point: latLngToGeoPoint(endPoint),
                timestamp: now,
              },
              distance: {
                ...shot.distance,
                measuredM: haversineMeters(start, endPoint),
              },
              result: {
                ...shot.result,
                finishLie,
              },
              updatedAt: now,
            }
          }),
        }
      })
    },
    [updateRound],
  )

  const addShotToHole = useCallback(
    (holeNumber: number, endPoint: LatLng, courseData?: CourseData | null) => {
      updateRound((prev) => {
        const now = new Date().toISOString()
        const hole = prev.holes.find((h) => h.hole === holeNumber)
        if (!hole) return prev

        const shotsForHole = prev.shots
          .filter((shot) => shot.hole === holeNumber)
          .sort((a, b) => a.stroke - b.stroke)

        const lastShot = shotsForHole[shotsForHole.length - 1]
        const startPoint = lastShot?.end?.point ?? lastShot?.start.point ?? hole.pinLocation
        const start = geoPointToLatLng(startPoint)

        const nextShot: ShotAttempt = {
          id: generateUUID(),
          roundId: prev.id,
          userId: prev.userId,
          hole: holeNumber,
          stroke: shotsForHole.length + 1,
          par: hole.par,
          category: "approach",
          club: {
            type: "other",
            label: "Other",
          },
          lie: courseData ? detectLieFromCourseData(start, courseData) : "rough",
          distance: {
            measuredM: haversineMeters(start, endPoint),
          },
          start: {
            point: startPoint,
            timestamp: now,
          },
          end: {
            point: latLngToGeoPoint(endPoint),
            timestamp: now,
          },
          createdAt: now,
          updatedAt: now,
        }

        const shots = reindexHoleShots([...prev.shots, nextShot], holeNumber)
        const nextRound = {
          ...prev,
          shots,
        }

        return updateHoleShotIds(nextRound, holeNumber)
      })
    },
    [updateRound],
  )

  const deleteShot = useCallback(
    (shotId: string) => {
      updateRound((prev) => {
        const shotToDelete = prev.shots.find((shot) => shot.id === shotId)
        if (!shotToDelete) return prev

        const shots = reindexHoleShots(
          prev.shots.filter((shot) => shot.id !== shotId),
          shotToDelete.hole,
        )

        const nextRound = {
          ...prev,
          shots,
        }

        return updateHoleShotIds(nextRound, shotToDelete.hole)
      })
    },
    [updateRound],
  )

  const discardChanges = useCallback(() => {
    if (!sourceRound) return
    const cloned = cloneRound(sourceRound)
    setEditableRound(cloned)
    baseSignatureRef.current = roundSignature(cloned)
  }, [sourceRound])

  const saveChanges = useCallback(async () => {
    if (!editableRound) return

    setIsSaving(true)
    try {
      const now = new Date().toISOString()
      const { stats: _stats, ...persistable } = editableRound
      const payload: RoundSession = removeUndefinedDeep({
        ...persistable,
        updatedAt: now,
      })
      await updateRoundSession(payload)
      baseSignatureRef.current = roundSignature(payload)
      setEditableRound({
        ...payload,
        stats: computeRoundStats(payload),
      })
    } finally {
      setIsSaving(false)
    }
  }, [editableRound, updateRoundSession])

  const value = useMemo<RoundEditContextValue>(
    () => ({
      originalRound: sourceRound,
      editableRound,
      isDirty,
      isSaving,
      updateHole,
      commitHoleSummary,
      updateShot,
      moveShotEnd,
      addShotToHole,
      deleteShot,
      saveChanges,
      discardChanges,
    }),
    [
      sourceRound,
      editableRound,
      isDirty,
      isSaving,
      updateHole,
      commitHoleSummary,
      updateShot,
      moveShotEnd,
      addShotToHole,
      deleteShot,
      saveChanges,
      discardChanges,
    ],
  )

  return <RoundEditContext.Provider value={value}>{children}</RoundEditContext.Provider>
}

export function useRoundEdit(): RoundEditContextValue {
  const ctx = useContext(RoundEditContext)
  if (!ctx) {
    throw new Error("useRoundEdit must be used inside RoundEditProvider")
  }
  return ctx
}
