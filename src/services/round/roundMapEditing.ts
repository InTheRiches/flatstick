import type { CourseData } from "@/models/course"
import type { LatLng } from "@/models/geo"
import type { LieType } from "@/models/round.session.types"
import { isPointInPolygonLatLng, isPointInPolygonXY } from "@/utils/courses/geometry/polygon.utils"

/**
 * Detect lie based on course polygons.
 * Priority: tee > green > bunker > fairway > rough.
 */
export function detectLieFromCourseData(userLoc: LatLng, courseData: CourseData): LieType {
  for (const tee of courseData.teeBoxes ?? []) {
    if (isPointInPolygonLatLng(userLoc, tee.coordinates)) return "tee"
  }

  for (const green of courseData.greens) {
    if (isPointInPolygonXY({ x: userLoc.longitude, y: userLoc.latitude }, green.polygon)) return "green"
  }

  for (const hazard of courseData.hazards ?? []) {
    if (hazard.type === "bunker" && isPointInPolygonLatLng(userLoc, hazard.coordinates)) return "sand"
  }

  for (const fairway of courseData.fairways) {
    if (isPointInPolygonLatLng(userLoc, fairway.coordinates)) return "fairway"
  }

  return "rough"
}
