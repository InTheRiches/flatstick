/**
 * usePuttingGreenData — React hook for the putting-green practice simulation.
 *
 * Responsibilities:
 *   - Invokes `loadPuttingGreenData` when `location` changes.
 *   - Cancels the in-flight request on unmount or location change.
 *   - Returns a typed state discriminated union — screens never catch errors.
 *
 * Usage:
 * ```tsx
 * const state = usePuttingGreenData(playerLocation, db)
 * if (state.status === "success") renderPracticeGreen(state.data)
 * ```
 */

import type { PuttingGreenData } from "@/models/course"
import type { LatLng } from "@/models/geo"
import {
    loadPuttingGreenData,
    type GreenLoadError,
} from "@/services/courses/courseLoader"
import type { Firestore } from "firebase/firestore"
import { useEffect, useState } from "react"

// ---------------------------------------------------------------------------
// State type
// ---------------------------------------------------------------------------

export type PuttingGreenDataState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: PuttingGreenData }
  | { status: "error"; error: GreenLoadError }

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Load putting-green data for the player's current location.
 *
 * @param location       - Player's GPS position.  Pass `null` to keep the hook
 *                         in the "idle" state.
 * @param db             - Injected Firestore instance.
 * @param cacheMaxAgeMs  - Cache TTL in milliseconds (default 30 days).
 */
export function usePuttingGreenData(
  location: LatLng | null,
  db: Firestore,
  cacheMaxAgeMs?: number,
): PuttingGreenDataState {
  const [state, setState] = useState<PuttingGreenDataState>({ status: "idle" })

  useEffect(() => {
    if (!location) {
      setState({ status: "idle" })
      return
    }

    const controller = new AbortController()
    setState({ status: "loading" })

    loadPuttingGreenData({
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
