import type { CourseData } from "@/models/course";
import type { LatLng } from "@/models/geo";
import { getRegionForCoordinates } from "@/utils/courses/geometry/bounds.utils";
import { useCallback, useMemo, useRef, useState } from "react";
import MapView from "react-native-maps";

export function useCourseMap(courseData: CourseData | null, activeHole: number) {
  const mapRef = useRef<MapView>(null);
  const [isPannedAway, setIsPannedAway] = useState(false);

  const activeHoleData = useMemo(() => {
    if (!courseData) return null;
    const holeStr = activeHole.toString();
    
    const green = courseData.greens.find((g) => g.hole === holeStr);
    const holePath = courseData.holes?.find((h) => h.hole === holeStr);
    
    return { green, holePath };
  }, [courseData, activeHole]);

  const recenterOnHole = useCallback(() => {
    if (!mapRef.current || !activeHoleData) return;

    const points: LatLng[] = [];
    
    if (activeHoleData.green) {
      points.push(...activeHoleData.green.polygon.map(p => ({ latitude: p.y, longitude: p.x })));
    }
    
    if (activeHoleData.holePath) {
      points.push(...activeHoleData.holePath.coordinates);
    }

    if (points.length > 0) {
      // If we have a hole path, compute bearing so the path can be aligned vertically
      const holeCoords = activeHoleData.holePath?.coordinates || [];

      const computeBearing = (a: LatLng, b: LatLng) => {
        const toRad = (d: number) => (d * Math.PI) / 180;
        const toDeg = (r: number) => (r * 180) / Math.PI;

        const lat1 = toRad(a.latitude);
        const lat2 = toRad(b.latitude);
        const dLon = toRad(b.longitude - a.longitude);

        const y = Math.sin(dLon) * Math.cos(lat2);
        const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
        let brng = toDeg(Math.atan2(y, x));
        brng = (brng + 360) % 360;
        return brng;
      };

      if (holeCoords.length >= 2) {
        const start = holeCoords[0];
        const end = holeCoords[holeCoords.length - 1];

        const bearing = computeBearing(start, end);

        const mid = {
          latitude: (start.latitude + end.latitude) / 2,
          longitude: (start.longitude + end.longitude) / 2,
        };

        // Use asymmetric vertical padding so tee/green sit toward bottom/top respectively
        const region = getRegionForCoordinates(points, {
          top: 80,
          right: 50,
          bottom: 120,
          left: 50,
        });

        console.log("Region: ", region, "Bearing: ", bearing);

        // I need to calculate altitude but it needs to use either longitude or latitude 
        // or a mix using tan of the angle to get the right zoom level.
        const latMeters = region.latitudeDelta * 111_111;
        const lngMeters = region.longitudeDelta * 111_111 * Math.cos(region.latitude * Math.PI / 180);

        const radians = bearing * Math.PI / 180;

        const rotatedHeight =
          Math.abs(latMeters * Math.cos(radians)) +
          Math.abs(lngMeters * Math.sin(radians)) + 500;

        mapRef.current.animateCamera({
          center: {
            latitude: region.latitude,
            longitude: region.longitude,
          },
          heading: bearing,
          pitch: 0, // or your desired pitch
          altitude: rotatedHeight, // crude conversion to meters
        }, { duration: 500 });
        // mapRef.current.getCamera().then((camera) => {
        //     console.log("Current camera zoom: ", camera.zoom);
        //   })
        //   .catch((error) => {
        //     console.warn("Failed to get camera for bearing adjustment:", error);
        //   });
      } else {
        // No explicit path, just fit existing points
        mapRef.current.fitToCoordinates(points, {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true,
        });
      }

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

