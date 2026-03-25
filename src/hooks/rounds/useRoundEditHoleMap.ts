import { getFirestore } from "@react-native-firebase/firestore"
import { useMemo } from "react"

import { useCourseData } from "@/hooks/courses/useCourseData"
import { useCourseMap } from "@/hooks/courses/useCourseMap"
import type { LatLng } from "@/models/geo"

export function useRoundEditHoleMap(holeNumber: number, seedLocation: LatLng | null) {
  const db = getFirestore()
  const courseDataState = useCourseData(seedLocation, db)
  const courseData = courseDataState.status === "success" ? courseDataState.data : null

  const { mapRef, activeHoleData, recenterOnHole, isPannedAway, onPanDrag } = useCourseMap(
    courseData,
    holeNumber,
  )

  const defaultCenter = useMemo(() => {
    if (!seedLocation) return null
    return {
      latitude: seedLocation.latitude,
      longitude: seedLocation.longitude,
      latitudeDelta: 0.002,
      longitudeDelta: 0.002,
    }
  }, [seedLocation])

  return {
    courseDataState,
    courseData,
    mapRef,
    activeHoleData,
    recenterOnHole,
    isPannedAway,
    onPanDrag,
    defaultCenter,
  }
}
