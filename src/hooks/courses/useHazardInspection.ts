/**
 * useHazardInspection
 *
 * Manages two hazard-inspection modes:
 *
 *   1. **Tap-to-focus** — the user taps a bunker or water-hazard polygon on
 *      the map.  The camera zooms smoothly to the hazard bounds and a
 *      min/max distance overlay is shown.  Tapping outside or pressing
 *      "exit" restores the previous UI.
 *
 *   2. **Hazard cycle** — activated by a sidebar button.  Steps through all
 *      course hazards one by one (← / →), zooming and highlighting each in
 *      turn.  Exit restores the full round UI.
 *
 * State is fully self-contained here; the screen only needs to respond to the
 * returned values.  Round/tracking state is never modified — we just suppress
 * certain UI elements while a hazard is focused.
 */

import type { Hazard } from "@/models/course"
import type { LatLng } from "@/models/geo"
import { hazardDistances, type HazardDistances } from "@/utils/courses/geometry/distance.utils"
import { useCallback, useMemo, useRef, useState } from "react"
import type MapView from "react-native-maps"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type HazardMode =
  | { kind: "none" }
  | { kind: "tap"; hazard: Hazard }
  | { kind: "cycle"; hazard: Hazard; index: number }

/** Everything the screen / overlays need from this hook. */
export type HazardInspectionState = {
  /** Current active mode.  "none" means no hazard is focused. */
  mode: HazardMode

  /**
   * Min / max yard distances from the player to the active hazard.
   * null when no hazard is focused or player location is unknown.
   */
  distances: HazardDistances | null

  /** OSM id of the currently highlighted hazard (for polygon styling). */
  focusedHazardId: string | null

  /** Whether any hazard inspection mode is active (tap or cycle). */
  isActive: boolean

  // ── Actions ──────────────────────────────────────────────────────────────

  /** Called when the user taps a hazard polygon on the map. */
  focusHazard: (hazard: Hazard) => void

  /** Activate hazard-cycle mode (sidebar button). */
  enterCycleMode: () => void

  /** Step to the previous hazard in cycle mode. */
  cyclePrev: () => void

  /** Step to the next hazard in cycle mode. */
  cycleNext: () => void

  /** Exit whatever hazard mode is active. */
  exitHazardMode: () => void
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * @param mapRef       - Ref to the MapView — used for camera animations.
 * @param hazards      - All course hazards (from CourseData).
 * @param userLocation - Player's live GPS position (may be null).
 * @param headingRef   - Ref to the current map heading from useCourseMap so the
 *                       hazard zoom keeps the same orientation as the hole view.
 */
export function useHazardInspection(
  mapRef: React.RefObject<MapView | null>,
  hazards: Hazard[],
  userLocation: LatLng | null,
  headingRef: React.RefObject<number>,
): HazardInspectionState {
  const [mode, setMode] = useState<HazardMode>({ kind: "none" })

  /**
   * Set to true synchronously when a hazard polygon is pressed so that the
   * MapView's onPress handler (which fires on the same tap) can bail out
   * before placing an intermediate target.
   */
  const justFocusedRef = useRef(false)

  // Keep a stable ref so the camera animation callback never captures a stale closure.
  const hazardsRef = useRef(hazards)
  hazardsRef.current = hazards

  // ── Camera helpers ────────────────────────────────────────────────────────

  const zoomToHazard = useCallback(
    (hazard: Hazard) => {
      if (!mapRef.current || hazard.coordinates.length === 0) return

      const lats = hazard.coordinates.map((c) => c.latitude)
      const lons = hazard.coordinates.map((c) => c.longitude)
      const minLat = Math.min(...lats)
      const maxLat = Math.max(...lats)
      const minLon = Math.min(...lons)
      const maxLon = Math.max(...lons)

      const centerLat = (minLat + maxLat) / 2
      const centerLon = (minLon + maxLon) / 2

      // Compute span in metres, then rotate by the current heading so the
      // altitude provides correct coverage regardless of map orientation.
      const heading = headingRef.current
      const latMeters = (maxLat - minLat) * 111_111
      const lonMeters =
        (maxLon - minLon) *
        111_111 *
        Math.cos((centerLat * Math.PI) / 180)
      const radians = (heading * Math.PI) / 180
      const rotatedSpan =
        Math.abs(latMeters * Math.cos(radians)) +
        Math.abs(lonMeters * Math.sin(radians))
      // Add generous padding so the hazard is not clipped at the edges.
      const altitude = rotatedSpan * 4 + 80

      mapRef.current.animateCamera(
        {
          center: { latitude: centerLat, longitude: centerLon },
          heading,
          pitch: 0,
          altitude,
        },
        { duration: 500 },
      )
    },
    [mapRef, headingRef],
  )

  // ── Tap-to-focus ──────────────────────────────────────────────────────────

  const focusHazard = useCallback(
    (hazard: Hazard) => {
      setMode({ kind: "tap", hazard })
      zoomToHazard(hazard)
    },
    [zoomToHazard],
  )

  // ── Cycle mode ────────────────────────────────────────────────────────────

  const enterCycleMode = useCallback(() => {
    const all = hazardsRef.current
    if (all.length === 0) return
    setMode({ kind: "cycle", hazard: all[0], index: 0 })
    zoomToHazard(all[0])
  }, [zoomToHazard])

  const cyclePrev = useCallback(() => {
    setMode((prev) => {
      if (prev.kind !== "cycle") return prev
      const all = hazardsRef.current
      const nextIndex = (prev.index - 1 + all.length) % all.length
      const hazard = all[nextIndex]
      zoomToHazard(hazard)
      return { kind: "cycle", hazard, index: nextIndex }
    })
  }, [zoomToHazard])

  const cycleNext = useCallback(() => {
    setMode((prev) => {
      if (prev.kind !== "cycle") return prev
      const all = hazardsRef.current
      const nextIndex = (prev.index + 1) % all.length
      const hazard = all[nextIndex]
      zoomToHazard(hazard)
      return { kind: "cycle", hazard, index: nextIndex }
    })
  }, [zoomToHazard])

  const exitHazardMode = useCallback(() => {
    setMode({ kind: "none" })
  }, [])

  // ── Derived values ────────────────────────────────────────────────────────

  const activeHazard =
    mode.kind === "tap" || mode.kind === "cycle" ? mode.hazard : null

  const distances = useMemo((): HazardDistances | null => {
    if (!activeHazard || !userLocation) return null
    return hazardDistances(userLocation, activeHazard.coordinates)
  }, [activeHazard, userLocation])

  const focusedHazardId = activeHazard?.osmId ?? null
  const isActive = mode.kind !== "none"

  return {
    mode,
    distances,
    focusedHazardId,
    isActive,
    focusHazard,
    enterCycleMode,
    cyclePrev,
    cycleNext,
    exitHazardMode,
  }
}
