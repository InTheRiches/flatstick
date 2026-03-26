import type { CourseData } from "@/models/course";
import type { LiveShotAttempt } from "@/models/round.live.types";
import { detectLieFromCourseData } from "@/services/round/roundMapEditing";
import type { MapLayoutSize, ShotEditState, ShotEditTarget } from "@/types/roundTracking";
import {
    alignCoordinateToScreenPoint,
    focusShotEditCamera,
} from "@/utils/courses/round/roundTracking.utils";
import { haversineMeters, toYards } from "@/utils/courses/geometry/distance.utils";
import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import type MapView from "react-native-maps";

import { useReticleSync } from "./useReticleSync";

type CompletedShot = LiveShotAttempt & { end: NonNullable<LiveShotAttempt["end"]> };

interface UseShotEditControllerOptions {
    courseData: CourseData | null;
    currentHeadingRef: RefObject<number>;
    mapLayout: MapLayoutSize;
    mapRef: RefObject<MapView | null>;
    onEnterEdit: () => void;
    shots: LiveShotAttempt[];
    updateShot: (shotId: string, updates: Partial<LiveShotAttempt>) => void;
}

export function useShotEditController({
    courseData,
    currentHeadingRef,
    mapLayout,
    mapRef,
    onEnterEdit,
    shots,
    updateShot,
}: UseShotEditControllerOptions) {
    const [shotEditState, setShotEditState] = useState<ShotEditState | null>(null);
    const shotEditStateRef = useRef<ShotEditState | null>(null);

    const shotEditReticlePoint = useMemo(() => {
        if (mapLayout.width === 0 || mapLayout.height === 0) return null;

        return {
            x: mapLayout.width / 2,
            y: Math.max(180, mapLayout.height * 0.35),
        };
    }, [mapLayout.height, mapLayout.width]);

    const editingShot = useMemo<CompletedShot | null>(() => {
        if (!shotEditState) return null;

        const shot = shots.find((entry) => entry.id === shotEditState.shotId);
        if (!shot?.end) return null;

        return shot as CompletedShot;
    }, [shotEditState, shots]);

    const shotEditDistanceYards = useMemo(() => {
        if (!shotEditState) return null;

        return Math.round(toYards(haversineMeters(shotEditState.draftStart, shotEditState.draftEnd)));
    }, [shotEditState]);

    useEffect(() => {
        shotEditStateRef.current = shotEditState;
    }, [shotEditState]);

    useEffect(() => {
        if (!shotEditState) return;
        if (editingShot) return;

        setShotEditState(null);
    }, [editingShot, shotEditState]);

    const syncShotEditPointFromReticle = useCallback(async () => {
        if (!mapRef.current || !shotEditReticlePoint) return;

        try {
            const nextPoint = await mapRef.current.coordinateForPoint(shotEditReticlePoint);

            setShotEditState((prev) => {
                if (!prev) return prev;

                if (prev.activePoint === "start") {
                    return { ...prev, draftStart: nextPoint };
                }

                return { ...prev, draftEnd: nextPoint };
            });
        } catch (error) {
            console.debug("[RoundTracking] Unable to sync shot edit point:", error);
        }
    }, [mapRef, shotEditReticlePoint]);

    const reticleSync = useReticleSync({
        value: shotEditState,
        syncFromReticle: syncShotEditPointFromReticle,
    });

    useEffect(() => {
        const currentShotEdit = shotEditStateRef.current;
        if (!currentShotEdit || !shotEditReticlePoint || !mapRef.current) return;

        focusShotEditCamera({
            mapRef,
            start: currentShotEdit.draftStart,
            end: currentShotEdit.draftEnd,
            heading: currentHeadingRef.current,
            animated: true,
        });

        const pointToAlign =
            currentShotEdit.activePoint === "start"
                ? currentShotEdit.draftStart
                : currentShotEdit.draftEnd;

        const timeout = setTimeout(() => {
            void alignCoordinateToScreenPoint({
                mapRef,
                mapLayout,
                coord: pointToAlign,
                pointOnScreen: shotEditReticlePoint,
                yAdjustment: 12,
            });
        }, 280);

        return () => clearTimeout(timeout);
    }, [currentHeadingRef, mapLayout, mapRef, shotEditReticlePoint, shotEditState?.shotId]);

    useEffect(() => {
        const currentShotEdit = shotEditStateRef.current;
        if (!currentShotEdit || !shotEditReticlePoint) return;

        const pointToAlign =
            currentShotEdit.activePoint === "start"
                ? currentShotEdit.draftStart
                : currentShotEdit.draftEnd;

        const timeout = setTimeout(() => {
            void alignCoordinateToScreenPoint({
                mapRef,
                mapLayout,
                coord: pointToAlign,
                pointOnScreen: shotEditReticlePoint,
                yAdjustment: 12,
            });
        }, 30);

        return () => clearTimeout(timeout);
    }, [mapLayout, mapRef, shotEditReticlePoint, shotEditState?.activePoint]);

    const enterShotEditMode = useCallback((shot: LiveShotAttempt, activePoint: ShotEditTarget) => {
        if (!shot.end) return;

        onEnterEdit();
        setShotEditState({
            shotId: shot.id,
            activePoint,
            draftStart: shot.start.point,
            draftEnd: shot.end.point,
        });
    }, [onEnterEdit]);

    const cancelShotEdit = useCallback(() => {
        setShotEditState(null);
    }, []);

    const saveShotEdit = useCallback(() => {
        const nextEdit = shotEditStateRef.current;
        if (!nextEdit) return;

        const shot = shots.find((entry) => entry.id === nextEdit.shotId);
        if (!shot || !shot.end) {
            setShotEditState(null);
            return;
        }

        const lie = courseData ? detectLieFromCourseData(nextEdit.draftStart, courseData) : shot.lie;
        const finishLie = courseData ? detectLieFromCourseData(nextEdit.draftEnd, courseData) : shot.result?.finishLie;
        const nextResult = shot.result || finishLie ? { ...shot.result, finishLie } : undefined;

        updateShot(shot.id, {
            lie,
            start: {
                ...shot.start,
                point: nextEdit.draftStart,
            },
            end: {
                ...shot.end,
                point: nextEdit.draftEnd,
            },
            distance: {
                ...shot.distance,
                measuredM: haversineMeters(nextEdit.draftStart, nextEdit.draftEnd),
            },
            ...(nextResult ? { result: nextResult } : {}),
        });

        setShotEditState(null);
    }, [courseData, shots, updateShot]);

    const selectShotEditPoint = useCallback((point: ShotEditTarget) => {
        setShotEditState((prev) => (prev ? { ...prev, activePoint: point } : prev));
    }, []);

    const recenterShotEdit = useCallback(() => {
        const nextEdit = shotEditStateRef.current;
        if (!nextEdit || !shotEditReticlePoint) return;

        focusShotEditCamera({
            mapRef,
            start: nextEdit.draftStart,
            end: nextEdit.draftEnd,
            heading: currentHeadingRef.current,
            animated: true,
        });

        const pointToAlign =
            nextEdit.activePoint === "start"
                ? nextEdit.draftStart
                : nextEdit.draftEnd;

        setTimeout(() => {
            void alignCoordinateToScreenPoint({
                mapRef,
                mapLayout,
                coord: pointToAlign,
                pointOnScreen: shotEditReticlePoint,
                yAdjustment: 12,
            });
        }, 280);
    }, [currentHeadingRef, mapLayout, mapRef, shotEditReticlePoint]);

    return {
        editingShot,
        enterShotEditMode,
        isShotEditing: !!shotEditState,
        cancelShotEdit,
        recenterShotEdit,
        saveShotEdit,
        selectShotEditPoint,
        shotEditDistanceYards,
        shotEditReticlePoint,
        shotEditState,
        ...reticleSync,
    };
}
