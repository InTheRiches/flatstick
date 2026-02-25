/**
 * useCourseData — React hook for the full-course simulation.
 *
 * Responsibilities:
 *   - Invokes `loadCourseData` when `location` changes.
 *   - Cancels the in-flight request when the component unmounts or location
 *     changes before the previous load finishes (via AbortController).
 *   - Returns a typed state discriminated union — screens never catch errors.
 *
 * Usage:
 * ```tsx
 * const state = useCourseData(playerLocation, db)
 * if (state.status === "success") renderSimulation(state.data)
 * ```
 */

import type { CourseData } from "@/models/course"
import type { LatLng } from "@/models/geo"
import { loadCourseData, type CourseLoadError } from "@/services/courses/courseLoader"
import type { Firestore } from "firebase/firestore"
import { useEffect, useState } from "react"

// ---------------------------------------------------------------------------
// State type
// ---------------------------------------------------------------------------

export type CourseDataState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: CourseData }
  | { status: "error"; error: CourseLoadError }

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Load course data for the player's current location.
 *
 * @param location       - Player's GPS position.  Pass `null` to keep the hook
 *                         in the "idle" state (e.g. before location permission
 *                         is granted).
 * @param db             - Injected Firestore instance.
 * @param cacheMaxAgeMs  - How old the Firestore cache may be before a re-fetch
 *                         is triggered.  Defaults to 30 days.
 */
export function useCourseData(
  location: LatLng | null,
  db: Firestore,
  cacheMaxAgeMs?: number,
): CourseDataState {
  const [state, setState] = useState<CourseDataState>({ status: "idle" })

  useEffect(() => {
    if (!location) {
      setState({ status: "idle" })
      return
    }

    const controller = new AbortController()
    setState({ status: "loading" })

    loadCourseData({
      location,
      db,
      signal: controller.signal,
      cacheMaxAgeMs,
    }).then((result) => {
      if (controller.signal.aborted) return

      if (result.ok) {
        setState({ status: "success", data: result.value })
      } else {
        setState({ status: "error", error: result.error })
      }
    })

    return () => {
      controller.abort()
    }
  }, [location?.latitude, location?.longitude, db, cacheMaxAgeMs])

  return state
}
