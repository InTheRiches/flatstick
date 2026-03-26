import type { LatLng } from "@/models/geo";
import type { LieType } from "@/models/round.session.types";
import type { MapLayoutSize } from "@/types/roundTracking";
import { getRegionForCoordinates } from "@/utils/courses/geometry/bounds.utils";
import type { RefObject } from "react";
import type MapView from "react-native-maps";

export function hazardFillColor(isBunker: boolean, isFocused: boolean, featureAlpha: number): string {
    if (isBunker) {
        return isFocused
            ? `rgba(245, 222, 100, ${featureAlpha})`
            : `rgba(245, 222, 179, ${0.8 * featureAlpha})`;
    }

    return isFocused
        ? `rgba(30, 144, 255, ${featureAlpha})`
        : `rgba(30, 100, 220, ${0.7 * featureAlpha})`;
}

export function hazardStrokeColor(isBunker: boolean, isFocused: boolean, featureAlpha: number): string {
    if (isBunker) {
        return isFocused ? "rgba(200, 130, 30, 1)" : `rgba(175, 143, 100, ${featureAlpha})`;
    }

    return isFocused ? "rgba(0, 80, 200, 1)" : `rgba(0, 60, 180, ${featureAlpha})`;
}

export function guessClub(yards: number, lie: LieType): string {
    if (lie === "green") return "Putter";
    if (lie === "tee") return "Driver";
    if (yards > 220) return "3 Wood";
    if (yards > 210) return "5 Wood";
    if (yards > 195) return "4 Iron";
    if (yards > 180) return "5 Iron";
    if (yards > 165) return "6 Iron";
    if (yards > 150) return "7 Iron";
    if (yards > 135) return "8 Iron";
    if (yards > 120) return "9 Iron";
    if (yards > 100) return "Pitching Wedge";
    if (yards > 80) return "Gap Wedge";
    if (yards > 50) return "Sand Wedge";
    return "Lob Wedge";
}

export function buildShotEditFocusCoordinates(start: LatLng, end: LatLng): LatLng[] {
    const latDiff = Math.abs(start.latitude - end.latitude);
    const lngDiff = Math.abs(start.longitude - end.longitude);

    if (latDiff > 0.00015 || lngDiff > 0.00015) {
        return [start, end];
    }

    return [
        { latitude: start.latitude - 0.00018, longitude: start.longitude - 0.00018 },
        { latitude: end.latitude + 0.00018, longitude: end.longitude + 0.00018 },
    ];
}

export const SHOT_EDIT_CAMERA_PADDING = {
    top: 180,
    right: 80,
    bottom: 220,
    left: 80,
};

export function altitudeForRegion(
    region: { latitude: number; latitudeDelta: number; longitudeDelta: number },
    heading: number,
): number {
    const latMeters = region.latitudeDelta * 111_111;
    const lngMeters = region.longitudeDelta * 111_111 * Math.cos(region.latitude * Math.PI / 180);
    const radians = heading * Math.PI / 180;

    return (
        Math.abs(latMeters * Math.cos(radians)) +
        Math.abs(lngMeters * Math.sin(radians)) +
        220
    );
}

interface FocusShotEditCameraOptions {
    mapRef: RefObject<MapView | null>;
    start: LatLng;
    end: LatLng;
    heading: number;
    animated: boolean;
}

export function focusShotEditCamera({
    mapRef,
    start,
    end,
    heading,
    animated,
}: FocusShotEditCameraOptions) {
    if (!mapRef.current) return;

    const points = buildShotEditFocusCoordinates(start, end);
    const region = getRegionForCoordinates(points, SHOT_EDIT_CAMERA_PADDING);

    mapRef.current.animateCamera(
        {
            center: {
                latitude: region.latitude,
                longitude: region.longitude,
            },
            heading,
            pitch: 0,
            altitude: altitudeForRegion(region, heading),
        },
        { duration: animated ? 260 : 0 },
    );
}

interface AlignCoordinateToScreenPointOptions {
    mapRef: RefObject<MapView | null>;
    mapLayout: MapLayoutSize;
    coord: LatLng;
    pointOnScreen: { x: number; y: number };
    yAdjustment?: number;
}

export async function alignCoordinateToScreenPoint({
    mapRef,
    mapLayout,
    coord,
    pointOnScreen,
    yAdjustment = 0,
}: AlignCoordinateToScreenPointOptions) {
    if (!mapRef.current || mapLayout.width === 0 || mapLayout.height === 0) return;

    try {
        const point = await mapRef.current.pointForCoordinate(coord);
        const camera = await mapRef.current.getCamera();
        const screenCenter = { x: mapLayout.width / 2, y: mapLayout.height / 2 };
        const desiredCenterPoint = {
            x: screenCenter.x + (point.x - pointOnScreen.x),
            y: screenCenter.y + (point.y - pointOnScreen.y) + yAdjustment,
        };
        const centerCoord = await mapRef.current.coordinateForPoint(desiredCenterPoint);

        mapRef.current.animateCamera(
            {
                center: centerCoord,
                heading: camera.heading,
                pitch: camera.pitch,
                altitude: camera.altitude,
                zoom: camera.zoom,
            },
            { duration: 180 },
        );
    } catch (error) {
        console.debug("[RoundTracking] Unable to align map point:", error);
    }
}
