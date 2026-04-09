import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import { useCallback, useRef } from "react";

import { type HoleSummaryModalHandle } from "@/components/app/golf/modals/HoleSummaryModal";
import {
    type PostShotDetailsModalReference,
    type PostShotModalResult,
} from "@/components/app/golf/modals/PostShotDetailsModal";
import type { CourseSelectionDetails } from "@/components/app/golf/modals/SelectCourseDetailsModal";
import {
    type ShotDefaults,
    type ShotDetailsModalReference,
    type ShotModalResult,
} from "@/components/app/golf/modals/ShotDetailsModal";
import { SideSheetModalHandle } from "@/components/app/modals/SideSheetModalFactory";
import { useUser } from "@/context/UserContext";
import { useRounds } from "@/hooks/useRounds";
import type { CourseData } from "@/models/course";
import type { LatLng, XYPoint } from "@/models/geo";
import type { LiveHoleState, LiveRoundState, LiveShotAttempt } from "@/models/round.live.types";
import { detectLieFromCourseData } from "@/services/round/roundMapEditing";
import { generateUUID } from "@/utils/common";
import {
    haversineMeters,
    polygonCentroid,
    toYards,
} from "@/utils/courses/geometry/distance.utils";
import { guessClub } from "@/utils/courses/round/roundTracking.utils";

interface UseRoundTrackingActionsOptions {
    activeGreenPolygon: XYPoint[] | null;
    activeHole: number;
    activeHoleShots: LiveShotAttempt[];
    addShot: (userLocation: LatLng, result?: PostShotModalResult) => void;
    clearPersistedRound: () => void;
    course: CourseSelectionDetails | null;
    courseData: CourseData | null;
    endTracking: () => void;
    enterShotEditMode: (shot: LiveShotAttempt, activePoint: "start" | "end") => void;
    holePins: Record<number, LatLng | null>;
    holes: Record<number, LiveHoleState>;
    roundId: string;
    runningScore: number;
    setCurrentShot: (shot: LiveShotAttempt | null) => void;
    setLocation: (location: LatLng) => void;
    shots: LiveShotAttempt[];
    startedAt: string;
    startTracking: (location: LatLng) => void;
    updateShot: (shotId: string, updates: Partial<LiveShotAttempt>) => void;
    userLocation: LatLng | null;
}

export function useRoundTrackingActions({
    activeGreenPolygon,
    activeHole,
    activeHoleShots,
    addShot,
    clearPersistedRound,
    course,
    courseData,
    endTracking,
    enterShotEditMode,
    holePins,
    holes,
    roundId,
    runningScore,
    setCurrentShot,
    setLocation,
    shots,
    startedAt,
    startTracking,
    updateShot,
    userLocation,
}: UseRoundTrackingActionsOptions) {
    const router = useRouter();
    const { authUser } = useUser();
    const { saveRound: saveRoundToFirestore } = useRounds();

    const modalRef = useRef<ShotDetailsModalReference>(null);
    const postShotModalRef = useRef<PostShotDetailsModalReference>(null);
    const holeSummaryRef = useRef<HoleSummaryModalHandle>(null);
    const sideSheetRef = useRef<SideSheetModalHandle>(null);
    const confirmExitModalRef = useRef<BottomSheetModal | null>(null);
    const submitRoundModalRef = useRef<BottomSheetModal | null>(null);
    const scorecardModalRef = useRef<BottomSheetModal | null>(null);
    const lastShotPressRef = useRef<{ ts: number; coord: LatLng } | null>(null);

    const handleStartTracking = useCallback(() => {
        if (userLocation) {
            startTracking(userLocation);
        }
    }, [startTracking, userLocation]);

    const openShotDetails = useCallback(() => {
        let defaults: ShotDefaults | undefined;

        if (userLocation && courseData) {
            const lie = detectLieFromCourseData(userLocation, courseData);
            const pinCoord = holePins[activeHole] ?? (activeGreenPolygon ? polygonCentroid(activeGreenPolygon) : null);
            const yards = pinCoord
                ? Math.round(toYards(haversineMeters(userLocation, pinCoord)))
                : null;

            defaults = {
                lie,
                clubLabel: yards !== null ? guessClub(yards, lie) : undefined,
                isGoalGreen: yards !== null ? yards <= 200 : true,
                isGreensideChip: yards !== null ? yards < 30 : false,
            };
        }

        modalRef.current?.open(defaults);
    }, [activeGreenPolygon, activeHole, courseData, holePins, userLocation]);

    const handleEndTracking = useCallback(() => {
        postShotModalRef.current?.open();
    }, []);

    const handleConfirmShot = useCallback((details: ShotModalResult) => {
        handleStartTracking();

        if (shots.length === 0) {
            setLocation({
                latitude: 42.203468841451304,
                longitude: -85.62896922453452,
            });
        } else if (shots.length === 1) {
            setLocation({
                latitude: 42.203268028876955,
                longitude: -85.62803493889179,
            });
        }

        setCurrentShot({
            ...details,
            id: generateUUID(),
            distance: {
                measuredM: 0,
                intendedToTargetM: 0,
            },
            par: course?.selectedTee.holes[activeHole - 1].par ?? 4,
            hole: activeHole,
            stroke: activeHoleShots.length + 1,
            start: {
                point: {
                    latitude: userLocation?.latitude ?? 0,
                    longitude: userLocation?.longitude ?? 0,
                },
                timestamp: new Date().toISOString(),
            },
        });
    }, [activeHole, activeHoleShots.length, course?.selectedTee.holes, handleStartTracking, setCurrentShot, setLocation, shots.length, userLocation]);

    const openHoleSummaryModal = useCallback(() => {
        const hole = holes[activeHole];
        if (!hole) return;

        holeSummaryRef.current?.present({
            hole,
            holeShots: activeHoleShots,
            runningScore,
            playerName: "Hayden Williams",
        });
    }, [activeHole, activeHoleShots, holes, runningScore]);

    const handleCancelShot = useCallback(() => {
        endTracking();
    }, [endTracking]);

    const handleShotPress = useCallback((shot: LiveShotAttempt) => {
        lastShotPressRef.current = { ts: Date.now(), coord: shot.end?.point ?? shot.start.point };
        setTimeout(() => {
            lastShotPressRef.current = null;
        }, 700);

        postShotModalRef.current?.openForEdit(shot);
    }, []);

    const handleEditResultConfirm = useCallback((shotId: string, result: PostShotModalResult) => {
        updateShot(shotId, { result });
    }, [updateShot]);

    const handleEditIntentFromResult = useCallback((shotId: string, currentResult: PostShotModalResult) => {
        updateShot(shotId, { result: currentResult });
        const shot = shots.find((entry) => entry.id === shotId);
        if (shot) {
            modalRef.current?.openForEdit({ ...shot, result: currentResult });
        }
    }, [shots, updateShot]);

    const handleEditIntentConfirm = useCallback((shotId: string, details: ShotModalResult) => {
        updateShot(shotId, {
            lie: details.lie,
            club: details.club,
            category: details.category,
            intent: details.intent,
            notes: details.notes,
        });
    }, [updateShot]);

    const handleEditResultFromIntent = useCallback((shotId: string, currentDetails: ShotModalResult) => {
        const updates = {
            lie: currentDetails.lie,
            club: currentDetails.club,
            category: currentDetails.category,
            intent: currentDetails.intent,
            notes: currentDetails.notes,
        };

        updateShot(shotId, updates);
        const shot = shots.find((entry) => entry.id === shotId);
        if (shot) {
            postShotModalRef.current?.openForEdit({ ...shot, ...updates });
        }
    }, [shots, updateShot]);

    const handleEditGPSFromResult = useCallback((shotId: string) => {
        const shot = shots.find((entry) => entry.id === shotId);
        if (shot) {
            enterShotEditMode(shot, "end");
        }
    }, [enterShotEditMode, shots]);

    const handleEditGPSFromIntent = useCallback((shotId: string) => {
        const shot = shots.find((entry) => entry.id === shotId);
        if (shot) {
            enterShotEditMode(shot, "start");
        }
    }, [enterShotEditMode, shots]);

    const handlePostShotConfirm = useCallback((result: PostShotModalResult) => {
        endTracking();
        if (!userLocation) return;

        addShot(userLocation, result);
    }, [addShot, endTracking, userLocation]);

    const handleSubmitRound = useCallback(async () => {
        if (!authUser) return;

        const now = new Date().toISOString();
        const liveRound: LiveRoundState = {
            id: roundId,
            userId: authUser.uid,
            status: "completed",
            startedAt,
            lastUpdatedAt: now,
            courseId: course?.selectedCourse.id,
            courseName: course?.selectedCourse.courseName,
            clubName: course?.club.clubName,
            teebox: course?.selectedTee
                ? {
                    name: course.selectedTee.name,
                    number_of_holes: course.selectedTee.number_of_holes,
                    par: course.selectedTee.par,
                    length: course.selectedTee.yards,
                    rating: course.selectedTee.rating,
                    slope: course.selectedTee.slope,
                }
                : {
                    name: "Unknown",
                    number_of_holes: course?.numberOfHoles ?? 18,
                    par: 72,
                    length: 0,
                    rating: 0,
                    slope: 113,
                },
            currentHoleNumber: activeHole,
            holes,
            shots,
        };

        try {
            const persistedHolePins = Object.entries(holePins).reduce<Record<number, LatLng>>((acc, [hole, coord]) => {
                if (coord) {
                    acc[Number(hole)] = coord;
                }

                return acc;
            }, {});

            await saveRoundToFirestore(liveRound, persistedHolePins);
            clearPersistedRound();
            router.replace("/");
        } catch (error) {
            console.error("[RoundTrackingScreen] Failed to save round:", error);
        }
    }, [activeHole, authUser, clearPersistedRound, course, holePins, holes, roundId, router, saveRoundToFirestore, shots, startedAt]);

    const handleDeleteRound = useCallback(() => {
        clearPersistedRound();
        router.replace("/");
    }, [clearPersistedRound, router]);

    const handleScoreButtonPress = useCallback(() => {
        if (activeHole === course?.numberOfHoles) {
            submitRoundModalRef.current?.present();
            return;
        }

        openHoleSummaryModal();
    }, [activeHole, course?.numberOfHoles, openHoleSummaryModal]);

    return {
        confirmExitModalRef,
        handleCancelShot,
        handleConfirmShot,
        handleDeleteRound,
        handleEditGPSFromIntent,
        handleEditGPSFromResult,
        handleEditIntentConfirm,
        handleEditIntentFromResult,
        handleEditResultConfirm,
        handleEditResultFromIntent,
        handleEndTracking,
        handlePostShotConfirm,
        handleScoreButtonPress,
        handleShotPress,
        handleSubmitRound,
        holeSummaryRef,
        lastShotPressRef,
        modalRef,
        openShotDetails,
        postShotModalRef,
        scorecardModalRef,
        sideSheetRef,
        submitRoundModalRef,
    };
}
