import type { IntermediateTarget } from "@/hooks/courses/usePlayerTracking";
import type { LatLng } from "@/models/geo";
import type { MapLayoutSize, TargetEditState } from "@/types/roundTracking";
import { alignCoordinateToScreenPoint } from "@/utils/courses/round/roundTracking.utils";
import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import type MapView from "react-native-maps";

import { useReticleSync } from "./useReticleSync";

interface UseTargetEditControllerOptions {
    mapLayout: MapLayoutSize;
    mapRef: RefObject<MapView | null>;
    onTargetCoordinateChange: (coord: LatLng | null) => void;
    resetPannedState: () => void;
    target: IntermediateTarget | null;
}

export function useTargetEditController({
    mapLayout,
    mapRef,
    onTargetCoordinateChange,
    resetPannedState,
    target,
}: UseTargetEditControllerOptions) {
    const [targetEditState, setTargetEditState] = useState<TargetEditState | null>(null);
    const targetEditStateRef = useRef<TargetEditState | null>(null);
    const targetEditStartedAtRef = useRef(0);

    const targetEditReticlePoint = useMemo(() => {
        if (mapLayout.width === 0 || mapLayout.height === 0) return null;

        return {
            x: mapLayout.width / 2,
            y: mapLayout.height / 2,
        };
    }, [mapLayout.height, mapLayout.width]);

    useEffect(() => {
        targetEditStateRef.current = targetEditState;
    }, [targetEditState]);

    useEffect(() => {
        if (target) return;

        setTargetEditState(null);
    }, [target]);

    const syncTargetEditPointFromReticle = useCallback(async () => {
        if (!mapRef.current || !targetEditReticlePoint) return;

        try {
            const nextPoint = await mapRef.current.coordinateForPoint(targetEditReticlePoint);
            setTargetEditState((prev) => (prev ? { ...prev, draftCoordinate: nextPoint } : prev));
        } catch (error) {
            console.debug("[RoundTracking] Unable to sync target edit point:", error);
        }
    }, [mapRef, targetEditReticlePoint]);

    const reticleSync = useReticleSync({
        value: targetEditState,
        syncFromReticle: syncTargetEditPointFromReticle,
    });

    const startTargetMove = useCallback(() => {
        if (!target) return;

        targetEditStartedAtRef.current = Date.now();
        setTargetEditState({ draftCoordinate: target.coordinate });
        resetPannedState();

        if (!targetEditReticlePoint) return;

        setTimeout(() => {
            void alignCoordinateToScreenPoint({
                mapRef,
                mapLayout,
                coord: target.coordinate,
                pointOnScreen: targetEditReticlePoint,
            });
        }, 40);
    }, [mapLayout, mapRef, resetPannedState, target, targetEditReticlePoint]);

    const saveTargetMove = useCallback(() => {
        const nextTarget = targetEditStateRef.current;
        if (!nextTarget) return;

        targetEditStartedAtRef.current = 0;
        onTargetCoordinateChange(nextTarget.draftCoordinate);
        setTargetEditState(null);
    }, [onTargetCoordinateChange]);

    const clearTarget = useCallback(() => {
        targetEditStartedAtRef.current = 0;
        onTargetCoordinateChange(null);
        setTargetEditState(null);
    }, [onTargetCoordinateChange]);

    const cancelTargetEdit = useCallback(() => {
        targetEditStartedAtRef.current = 0;
        setTargetEditState(null);
    }, []);

    const shouldIgnoreInitialMapTap = useCallback(() => {
        return Date.now() - targetEditStartedAtRef.current < 180;
    }, []);

    const displayTarget = useMemo(() => {
        if (targetEditState) {
            return { coordinate: targetEditState.draftCoordinate };
        }

        return target;
    }, [target, targetEditState]);

    return {
        cancelTargetEdit,
        clearTarget,
        displayTarget,
        handleMapPanDrag: reticleSync.handlePanDrag,
        handleMapRegionChange: reticleSync.handleRegionChange,
        handleMapRegionChangeComplete: reticleSync.handleRegionChangeComplete,
        isTargetEditing: !!targetEditState,
        saveTargetMove,
        shouldIgnoreInitialMapTap,
        startTargetMove,
        targetEditReticlePoint,
        targetEditState,
    };
}
