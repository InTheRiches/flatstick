import type { CourseData } from "@/models/course";
import type { LatLng } from "@/models/geo";
import { useCallback, useMemo, useRef, useState } from "react";
import MapView from "react-native-maps";

export function useCourseMap(courseData: CourseData | null, activeHole: number) {
  const mapRef = useRef<MapView>(null);
  const [isPannedAway, setIsPannedAway] = useState(false);

  const activeHoleData = useMemo(() => {
    if (!courseData) return null;
    const holeStr = activeHole.toString();
    
    const green = courseData.greens.find((g) => g.hole === holeStr);
    const teeBoxes = courseData.teeBoxes?.filter((t) => t.hole === holeStr) || [];
    const holePath = courseData.holes?.find((h) => h.hole === holeStr);
    
    return { green, teeBoxes, holePath };
  }, [courseData, activeHole]);

  const recenterOnHole = useCallback(() => {
    if (!mapRef.current || !activeHoleData) return;

    const points: LatLng[] = [];
    
    if (activeHoleData.green) {
      points.push(...activeHoleData.green.polygon.map(p => ({ latitude: p.y, longitude: p.x })));
    }
    
    if (activeHoleData.teeBoxes.length > 0) {
      activeHoleData.teeBoxes.forEach(t => points.push(...t.coordinates));
    }
    
    if (activeHoleData.holePath) {
      points.push(...activeHoleData.holePath.coordinates);
    }

    if (points.length > 0) {
      mapRef.current.fitToCoordinates(points, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
      setIsPannedAway(false);
    }
  }, [activeHoleData]);

  const onPanDrag = useCallback(() => {
    setIsPannedAway(true);
  }, []);

  return {
    mapRef,
    activeHoleData,
    recenterOnHole,
    isPannedAway,
    onPanDrag,
  };
}
