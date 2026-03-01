import type { LatLng, XYPoint } from '@/models/geo';
import { getRegionForCoordinates } from '@/utils/courses/geometry/bounds.utils';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type MapView from 'react-native-maps';

export function useGreenCameraLock(
  mapRef: React.RefObject<MapView | null>,
  isPuttingMode: boolean,
  greenPolygon: XYPoint[] | null,
  activeHoleData: any, // We can type this based on the existing useCourseMap return
) {
    const [recenterOnGreenFlag, setRecenterOnGreenFlag] = useState(false);

    const recenterOnGreen = useCallback(() => {
        setRecenterOnGreenFlag((prev) => !prev);
    }, []);

    // Center on green when entering putting mode
    useEffect(() => {
        if (isPuttingMode && mapRef.current && greenPolygon && greenPolygon.length > 0) {
            const coords: LatLng[] = greenPolygon.map(p => ({ latitude: p.y, longitude: p.x }));

            // Use asymmetric vertical padding so tee/green sit toward bottom/top respectively
            const region = getRegionForCoordinates(coords, {
                top: 80,
                right: 50,
                bottom: 120,
                left: 50,
            });

            const minLongitude = Math.min(...coords.map(c => c.longitude));
            const maxLongitude = Math.max(...coords.map(c => c.longitude));
            const longitudeDelta = maxLongitude - minLongitude;

            // Crude conversion to altitude in meters based on longitude delta (this is not exact and can be adjusted)
            const altitude = (longitudeDelta * 111320 + 200); // 111,320 meters per degree of longitude at the equator, multiplied by 2 for padding

            mapRef.current.animateCamera({
                center: {
                    latitude: region.latitude,
                    longitude: region.longitude,
                },
                heading: 0,
                altitude: altitude, // crude conversion to meters
            }, { duration: 125 });
        }
    }, [isPuttingMode, greenPolygon, mapRef, activeHoleData, recenterOnGreenFlag]);

    // Derived constraints applied ONLY during putting mode
    const cameraConstraints = useMemo(() => {
        if (!isPuttingMode) return {};

        // Ideally, we restrict the user from panning far away from the green and zooming out
        // React Native Maps supports `minZoomLevel` and `maxZoomLevel`.
        // And `mapBoundaries` (topRight, bottomLeft) which we can derive from the green coordinates with some padding.
        // However, mapBoundaries is sometimes buggy across iOS/Android, restricting zoom might be enough.

        return {
            minZoomLevel: 18, 
            maxZoomLevel: 21,
        };
    }, [isPuttingMode]);

    return { cameraConstraints, recenterOnGreen };
}
