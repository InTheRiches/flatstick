import { Ionicons } from "@expo/vector-icons";
import { getFirestore } from "@react-native-firebase/firestore";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, View, ViewStyle, type LayoutChangeEvent } from "react-native";
import MapView from "react-native-maps";

import ConfirmExitModal from "@/components/app/golf/modals/ConfirmExitModal";
import HoleSummaryModal from "@/components/app/golf/modals/HoleSummaryModal";
import PostShotDetailsModal from "@/components/app/golf/modals/PostShotDetailsModal";
import ScorecardModal from "@/components/app/golf/modals/ScorecardModal";
import type { CourseSelectionDetails } from "@/components/app/golf/modals/SelectCourseDetailsModal";
import SettingsModal from "@/components/app/golf/modals/SettingsModal";
import ShotDetailsModal from "@/components/app/golf/modals/ShotDetailsModal";
import SubmitRoundModal from "@/components/app/golf/modals/SubmitRoundModal";
import { PuttingActionBar } from "@/components/app/golf/putting/PuttingActionBar";
import type { HeatmapMode } from "@/components/app/golf/putting/PuttingOverlay";
import { ContextFooter } from "@/components/app/golf/round/ContextFooter";
import { RoundActions } from "@/components/app/golf/round/RoundActions";
import { RoundHeader } from "@/components/app/golf/round/RoundHeader";
import { CourseErrorView } from "@/components/app/golf/tracking/CourseErrorView";
import { CourseLoadingView } from "@/components/app/golf/tracking/CourseLoadingView";
import { GreenDistanceStack } from "@/components/app/golf/tracking/GreenDistanceStack";
import { HazardDistanceOverlay } from "@/components/app/golf/tracking/HazardDistanceOverlay";
import { RoundTrackingMapLayers } from "@/components/app/golf/tracking/RoundTrackingMapLayers";
import { ShotEditModeOverlay } from "@/components/app/golf/tracking/ShotEditModeOverlay";
import { isPointInPolygon } from "@/components/putting-green";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";
import { useCourseData } from "@/hooks/courses/useCourseData";
import { useCourseMap } from "@/hooks/courses/useCourseMap";
import { useGreenCameraLock } from "@/hooks/courses/useGreenCameraLock";
import { useHazardInspection } from "@/hooks/courses/useHazardInspection";
import { useLocationTracking } from "@/hooks/courses/useLocationTracking";
import { usePlayerTracking } from "@/hooks/courses/usePlayerTracking";
import { usePuttingMode } from "@/hooks/courses/usePuttingMode";
import { useRoundTracking } from "@/hooks/courses/useRoundTracking";
import { useRoundTrackingActions } from "@/hooks/courses/useRoundTrackingActions";
import { useShotEditController } from "@/hooks/courses/useShotEditController";
import { useTargetEditController } from "@/hooks/courses/useTargetEditController";
import type { LatLng } from "@/models/geo";
import { LiveShotAttempt } from "@/models/round.live.types";
import { useAppTheme } from "@/theme/context";
import type { ThemedStyle } from "@/theme/types";
import type { MapLayoutSize, RoundTrackingSettings } from "@/types/roundTracking";
import { generateUUID } from "@/utils/common";
import {
    greenDistances,
    haversineMeters,
    polygonCentroid,
    type GreenDistances,
} from "@/utils/courses/geometry/distance.utils";
import { padPolygonCoordinates } from "@/utils/courses/geometry/polygon.utils";
import EditScorecardIcon from "@assets/icons/svg/editScorecard";

interface RoundTrackingScreenProps {
    course: CourseSelectionDetails | null;
}

export const RoundTrackingScreen: React.FC<RoundTrackingScreenProps> = ({ course }) => {
    const { theme, themed } = useAppTheme();
    const db = getFirestore();

    const [reloadCounter, setReloadCounter] = useState(0);
    const [showRestoredBanner, setShowRestoredBanner] = useState(false);
    const [mapLayout, setMapLayout] = useState<MapLayoutSize>({ width: 0, height: 0 });
    const [heatmapMode, setHeatmapMode] = useState<HeatmapMode>("none");
    const [roundSettings, setRoundSettings] = useState<RoundTrackingSettings>({
        gpsEnabled: true,
        showPreviousShots: true,
        showHolePath: true,
        highContrast: false,
        useMetric: false,
    });

    const courseLocation: LatLng | null = useMemo(() => {
        const loc = course?.selectedCourse.location;
        if (!loc) return null;

        return { latitude: loc.latitude, longitude: loc.longitude };
    }, [course?.selectedCourse.location]);

    const cacheMaxAgeMs = reloadCounter > 0 ? 0 : undefined;
    const courseDataState = useCourseData(courseLocation, db, cacheMaxAgeMs);
    const courseData = courseDataState.status === "success" ? courseDataState.data : null;

    const { userLocation, setLocation } = useLocationTracking(!roundSettings.gpsEnabled); // TODO REMOVE THIS AND USE REAL LOCATION
    const {
        activeHole,
        nextHole,
        prevHole,
        shots,
        deleteShot,
        holes,
        addShot,
        updateShot,
        setCurrentShot,
        setActiveHole,
        currentShot,
        commitHoleSummary,
        runningScore,
        trackingState,
        startTracking,
        endTracking,
        currentShotStart,
        isRestored,
        clearPersistedRound,
        roundId,
        startedAt,
    } = useRoundTracking(
        1,
        course?.numberOfHoles ?? 0,
        course?.selectedTee,
        course?.selectedCourse?.id
            ? { courseId: course.selectedCourse.id, courseName: course.selectedCourse.courseName }
            : undefined,
    );

    const {
        mapRef,
        activeHoleData,
        recenterOnHole,
        isPannedAway,
        onPanDrag,
        currentHeadingRef,
        resetPannedState,
    } = useCourseMap(courseData, activeHole);

    const activeGreenPolygon = useMemo(
        () => activeHoleData?.green?.polygon ?? null,
        [activeHoleData?.green?.polygon],
    );

    const playerTracking = usePlayerTracking({
        mapRef,
        userLocation,
        greenPolygon: activeGreenPolygon,
    });
    const setPlayerTracking = playerTracking.setTracking;

    const [holePins, setHolePins] = useState<Record<number, LatLng | null>>({});

    const setHolePinForActiveHole = useCallback((coord: LatLng | null) => {
        setHolePins((prev) => ({ ...prev, [activeHole]: coord }));
    }, [activeHole]);

    const activeHoleShots = useMemo(
        () => shots.filter((shot) => shot.hole === activeHole),
        [activeHole, shots],
    );

    const liveGreenDistances = useMemo((): GreenDistances | null => {
        if (!userLocation || !activeGreenPolygon) return null;

        return greenDistances(userLocation, activeGreenPolygon, holePins[activeHole]);
    }, [userLocation, activeGreenPolygon, holePins, activeHole]);

    const courseHazards = useMemo(() => courseData?.hazards ?? [], [courseData?.hazards]);
    const hazardInspection = useHazardInspection(mapRef, courseHazards, userLocation, currentHeadingRef);
    const exitHazardMode = hazardInspection.exitHazardMode;
    const hazardInspectionActive = hazardInspection.isActive;

    const puttingMode = usePuttingMode();
    const exitPuttingMode = puttingMode.exitPuttingMode;
    const puttingModeActive = puttingMode.isPuttingMode;
    const cycleHeatmapMode = useCallback(() => {
        setHeatmapMode((mode) => (mode === "none" ? "elevation" : mode === "elevation" ? "slope" : "none"));
    }, []);

    const { recenterOnGreen } = useGreenCameraLock(
        mapRef,
        puttingMode.isPuttingMode,
        activeGreenPolygon,
        activeHoleData,
    );

    const {
        cancelTargetEdit,
        clearTarget,
        displayTarget,
        handleMapPanDrag: handleTargetEditPanDrag,
        handleMapRegionChange: handleTargetEditRegionChange,
        handleMapRegionChangeComplete: handleTargetEditRegionChangeComplete,
        isTargetEditing,
        saveTargetMove,
        shouldIgnoreInitialMapTap,
        startTargetMove,
    } = useTargetEditController({
        mapLayout,
        mapRef,
        onTargetCoordinateChange: playerTracking.setTargetCoordinate,
        resetPannedState,
        target: playerTracking.target,
    });

    const {
        editingShot,
        enterShotEditMode,
        isShotEditing,
        cancelShotEdit,
        recenterShotEdit,
        saveShotEdit,
        selectShotEditPoint,
        shotEditDistanceYards,
        shotEditReticlePoint,
        shotEditState,
        handlePanDrag: handleShotEditPanDrag,
        handleRegionChange: handleShotEditRegionChange,
        handleRegionChangeComplete: handleShotEditRegionChangeComplete,
    } = useShotEditController({
        courseData,
        currentHeadingRef,
        mapLayout,
        mapRef,
        onEnterEdit: () => {
            exitHazardMode();
            exitPuttingMode();
            cancelTargetEdit();
            setHeatmapMode("none");
            endTracking();
            resetPannedState();
        },
        shots,
        updateShot,
    });

    const {
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
    } = useRoundTrackingActions({
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
    });

    const handleMapLayout = useCallback((event: LayoutChangeEvent) => {
        const { width, height } = event.nativeEvent.layout;
        setMapLayout((prev) => (
            prev.width === width && prev.height === height ? prev : { width, height }
        ));
    }, []);

    const handleMapPanDrag = useCallback(() => {
        if (handleShotEditPanDrag()) return;
        if (handleTargetEditPanDrag()) return;

        onPanDrag();
    }, [handleShotEditPanDrag, handleTargetEditPanDrag, onPanDrag]);

    const handleMapRegionChange = useCallback(() => {
        if (handleShotEditRegionChange()) return;
        handleTargetEditRegionChange();
    }, [handleShotEditRegionChange, handleTargetEditRegionChange]);

    const handleMapRegionChangeComplete = useCallback(() => {
        if (handleShotEditRegionChangeComplete()) return;
        handleTargetEditRegionChangeComplete();
    }, [handleShotEditRegionChangeComplete, handleTargetEditRegionChangeComplete]);

    useEffect(() => {
        setPlayerTracking(roundSettings.gpsEnabled && !puttingModeActive && !isShotEditing);
    }, [isShotEditing, puttingModeActive, roundSettings.gpsEnabled, setPlayerTracking]);

    const handleGreenViewPress = useCallback(() => {
        if (puttingMode.isPuttingMode) return;

        cancelTargetEdit();
        puttingMode.startPuttingMode();
    }, [cancelTargetEdit, puttingMode]);

    const handleExitPuttingMode = useCallback(() => {
        puttingMode.exitPuttingMode();
        setHeatmapMode("none");
        recenterOnHole();
    }, [puttingMode, recenterOnHole]);

    const handleSavePutt = useCallback(() => {
        if (!puttingMode.pendingPuttStart || (!holePins[activeHole] && !activeGreenPolygon)) return;

        const targetCoord = holePins[activeHole] ?? polygonCentroid(activeGreenPolygon!);
        const newPutt: LiveShotAttempt = {
            id: generateUUID(),
            hole: activeHole,
            stroke: activeHoleShots.length + puttingMode.putts.length + 1,
            par: course?.selectedTee.holes[activeHole - 1]?.par ?? 4,
            category: "putt",
            club: { type: "putter", label: "Putter" },
            lie: "green",
            distance: {
                measuredM: haversineMeters(puttingMode.pendingPuttStart, targetCoord),
            },
            start: {
                point: puttingMode.pendingPuttStart,
                timestamp: new Date().toISOString(),
            },
        };

        addShot(puttingMode.pendingPuttStart);
        setCurrentShot(newPutt);
        puttingMode.addPutt(newPutt);
        puttingMode.clearPendingPutt();
        endTracking();
    }, [activeGreenPolygon, activeHole, activeHoleShots.length, addShot, course?.selectedTee.holes, endTracking, holePins, puttingMode, setCurrentShot]);

    const recenterScreen = useCallback(() => {
        if (isShotEditing) {
            recenterShotEdit();
            return;
        }

        if (playerTracking.isTracking) {
            playerTracking.recenterOnUser();
            resetPannedState();
        } else if (puttingMode.isPuttingMode) {
            recenterOnGreen();
            resetPannedState();
        } else {
            recenterOnHole();
        }
    }, [isShotEditing, playerTracking, puttingMode, recenterOnGreen, recenterOnHole, recenterShotEdit, resetPannedState]);

    const handleMapPress = useCallback((event: { nativeEvent: { coordinate: LatLng } }) => {
        const coord = event.nativeEvent.coordinate;

        if (!coord || !Number.isFinite(coord.latitude) || !Number.isFinite(coord.longitude)) {
            console.debug("[RoundTrackingScreen] Ignoring map press without a valid coordinate:", coord);
            return;
        }

        if (puttingMode.isPuttingMode) {
            puttingMode.setPendingPuttStart(coord);
            return;
        }

        if (isTargetEditing) {
            if (shouldIgnoreInitialMapTap()) return;

            saveTargetMove();
            return;
        }

        const tappedHazard = courseHazards.some((hazard) =>
            isPointInPolygon(coord, padPolygonCoordinates(hazard.coordinates, 6)),
        );
        if (tappedHazard) return;

        if (hazardInspection.mode.kind === "tap") {
            hazardInspection.exitHazardMode();
            recenterScreen();
            return;
        }

        if (!activeGreenPolygon) return;

        if (
            lastShotPressRef.current &&
            Date.now() - lastShotPressRef.current.ts < 700 &&
            haversineMeters(coord, lastShotPressRef.current.coord) < 10
        ) {
            lastShotPressRef.current = null;
            return;
        }

        if (
            displayTarget &&
            isPointInPolygon(coord, padPolygonCoordinates([displayTarget.coordinate], 10))
        ) {
            playerTracking.setTargetCoordinate(null);
            return;
        }

        console.log("Map pressed at", coord);

        playerTracking.setTargetCoordinate(coord);
    }, [
        activeGreenPolygon,
        courseHazards,
        hazardInspection,
        isTargetEditing,
        lastShotPressRef,
        displayTarget,
        playerTracking,
        puttingMode,
        recenterScreen,
        saveTargetMove,
        shouldIgnoreInitialMapTap,
    ]);

    const loadedGreens = courseDataState.status === "success" ? courseDataState.data.greens : undefined;

    useEffect(() => {
        if (courseDataState.status !== "success" || !loadedGreens) return;

        recenterOnHole();

        const initialHolePins: Record<number, LatLng | null> = {};
        loadedGreens.forEach((green) => {
            const holeNumber = parseInt(green.hole, 10);
            initialHolePins[holeNumber] = polygonCentroid(green.polygon);
        });
        setHolePins(initialHolePins);
    }, [courseDataState.status, loadedGreens, recenterOnHole]);

    useEffect(() => {
        if (hazardInspectionActive) {
            exitHazardMode();
        }

        endTracking();
        cancelShotEdit();
        cancelTargetEdit();

        if (puttingModeActive) {
            exitPuttingMode();
        }

        if (!roundSettings.gpsEnabled) {
            recenterOnHole();
        }
    }, [
        activeHole,
        cancelShotEdit,
        cancelTargetEdit,
        endTracking,
        exitHazardMode,
        exitPuttingMode,
        hazardInspectionActive,
        puttingModeActive,
        recenterOnHole,
        roundSettings.gpsEnabled,
    ]);

    const handlePuttUndo = useCallback(() => {
        puttingMode.undoLastPutt();
    }, [puttingMode]);

    useEffect(() => {
        if (!isRestored) return;

        setShowRestoredBanner(true);
        const timeout = setTimeout(() => setShowRestoredBanner(false), 3000);
        return () => clearTimeout(timeout);
    }, [isRestored]);

    const forceReload = useCallback(() => {
        console.debug("[RoundTrackingScreen] user requested course reload");
        setReloadCounter((count) => count + 1);
    }, []);

    if (courseDataState.status === "idle" || courseDataState.status === "loading") {
        return <CourseLoadingView />;
    }

    if (courseDataState.status === "error") {
        return <CourseErrorView error={courseDataState.error} onRetry={forceReload} />;
    }

    const hazardActive = !isShotEditing && !isTargetEditing && hazardInspection.isActive;

    return (
        <Screen useSafeAreaInsets={false} preset="fixed" style={$screen}>
            <MapView
                ref={mapRef}
                style={$map}
                mapType="satellite"
                showsUserLocation={false}
                onPanDrag={handleMapPanDrag}
                rotateEnabled={false}
                onPress={isShotEditing ? undefined : handleMapPress}
                onLayout={handleMapLayout}
                onRegionChange={handleMapRegionChange}
                onRegionChangeComplete={handleMapRegionChangeComplete}
                cameraZoomRange={{
                    minCenterCoordinateDistance: 50,
                    maxCenterCoordinateDistance: 2000,
                }}
            >
                <RoundTrackingMapLayers
                    activeHole={activeHole}
                    activeHoleData={activeHoleData}
                    activeGreenPolygon={activeGreenPolygon}
                    courseData={courseData}
                    courseHazards={courseHazards}
                    currentHeading={currentHeadingRef.current}
                    currentShotStart={currentShotStart}
                    displayTarget={displayTarget}
                    editingShot={editingShot}
                    hazardActive={hazardActive}
                    hazardInspection={hazardInspection}
                    heatmapMode={heatmapMode}
                    holePinCoord={holePins[activeHole] ?? null}
                    isShotEditing={isShotEditing}
                    isTargetEditing={isTargetEditing}
                    playerTrackingIsTracking={playerTracking.isTracking}
                    puttingMode={{
                        isPuttingMode: puttingMode.isPuttingMode,
                        pendingPuttStart: puttingMode.pendingPuttStart,
                        putts: puttingMode.putts,
                    }}
                    roundSettings={roundSettings}
                    shotEditState={shotEditState}
                    shotsForHole={activeHoleShots}
                    trackingState={trackingState}
                    userLocation={userLocation}
                    onClearTarget={clearTarget}
                    onFocusHazard={hazardInspection.focusHazard}
                    onHolePinChange={setHolePinForActiveHole}
                    onSaveTargetMove={saveTargetMove}
                    onShotPress={handleShotPress}
                    onStartTargetMove={startTargetMove}
                />
            </MapView>

            {!isShotEditing && (
                <RoundHeader
                    setHoleNumber={setActiveHole}
                    onPuttingExit={handleExitPuttingMode}
                    isPutting={puttingMode.isPuttingMode}
                    prevHole={prevHole}
                    activeHole={activeHole}
                    nextHole={nextHole}
                    onExit={() => confirmExitModalRef.current?.present()}
                />
            )}

            {!isShotEditing && (
                <RoundActions
                    trackingState={trackingState}
                    startTracking={openShotDetails}
                    endTracking={handleEndTracking}
                    roundSettings={roundSettings}
                    onSettingsPress={() => sideSheetRef.current?.present()}
                    onGreenViewPress={handleGreenViewPress}
                    isActive={!puttingMode.isPuttingMode}
                    onScorecardPress={() => scorecardModalRef.current?.present()}
                />
            )}

            {!isShotEditing && (
                <PuttingActionBar
                    isActive={puttingMode.isPuttingMode}
                    hasPendingPutt={!!puttingMode.pendingPuttStart}
                    onSavePutt={handleSavePutt}
                    onUndoPress={handlePuttUndo}
                    roundSettings={roundSettings}
                    onGPSPress={() => {
                        puttingMode.setPendingPuttStart(userLocation);
                    }}
                    heatmapMode={heatmapMode}
                    onHeatmapToggle={cycleHeatmapMode}
                    hasLidar={!!activeHoleData?.green?.lidar}
                />
            )}

            <GreenDistanceStack
                distances={liveGreenDistances}
                isActive={!hazardActive && !puttingMode.isPuttingMode && !isShotEditing}
            />

            {hazardActive && (hazardInspection.mode.kind === "tap" || hazardInspection.mode.kind === "cycle") && (
                <HazardDistanceOverlay
                    hazard={hazardInspection.mode.hazard}
                    mode={hazardInspection.mode.kind}
                    onExit={() => {
                        hazardInspection.exitHazardMode();
                        recenterScreen();
                    }}
                    onPrev={hazardInspection.cyclePrev}
                    onNext={hazardInspection.cycleNext}
                />
            )}

            {!isShotEditing && (isPannedAway || hazardActive) && (
                <Pressable style={themed($recenterButton)} onPress={recenterScreen}>
                    <Ionicons name="locate" size={30} color={theme.colors.text} />
                </Pressable>
            )}

            {!hazardActive && !puttingMode.isPuttingMode && !isShotEditing && (
                <Pressable
                    style={themed($scoreButton)}
                    onPress={handleScoreButtonPress}
                >
                    <EditScorecardIcon size={36} color={theme.colors.text} />
                </Pressable>
            )}

            {!isShotEditing && showRestoredBanner && (
                <View style={themed($restoredBanner)}>
                    <Ionicons name="checkmark-circle" size={16} color={theme.colors.text} />
                    <Text style={{ color: theme.colors.text, fontSize: 13, marginLeft: 6 }} text="Round restored" />
                </View>
            )}

            {!isShotEditing && roundSettings.gpsEnabled && !userLocation && (
                <View style={themed($gpsAcquiringBanner)}>
                    <Ionicons name="sync" size={16} color={theme.colors.text} />
                    <Text style={{ color: theme.colors.text, fontSize: 13, marginLeft: 8 }} text="Acquiring GPS…" />
                </View>
            )}

            {!isShotEditing && (
                <ContextFooter
                    currentShot={currentShot}
                    userLocation={userLocation}
                    isPutting={puttingMode.isPuttingMode}
                    holePinCoord={holePins[activeHole]}
                    pendingPuttStart={puttingMode.pendingPuttStart}
                    putts={puttingMode.putts.length}
                />
            )}

            {isShotEditing && shotEditState && editingShot ? (
                <ShotEditModeOverlay
                    clubLabel={editingShot.club.label ?? editingShot.club.type}
                    stroke={editingShot.stroke}
                    activePoint={shotEditState.activePoint}
                    measuredYards={shotEditDistanceYards}
                    reticleTop={shotEditReticlePoint?.y ?? 220}
                    onBack={cancelShotEdit}
                    onCancel={cancelShotEdit}
                    onSave={saveShotEdit}
                    onSelectPoint={selectShotEditPoint}
                />
            ) : null}

            <ShotDetailsModal
                reference={modalRef}
                onConfirm={handleConfirmShot}
                onCancel={handleCancelShot}
                onEditConfirm={handleEditIntentConfirm}
                onEditResult={handleEditResultFromIntent}
                onEditGPS={handleEditGPSFromIntent}
            />

            <PostShotDetailsModal
                reference={postShotModalRef}
                onConfirm={handlePostShotConfirm}
                onCancel={() => {}}
                onEditConfirm={handleEditResultConfirm}
                onEditIntent={handleEditIntentFromResult}
                onEditGPS={handleEditGPSFromResult}
                onDelete={deleteShot}
            />

            <HoleSummaryModal reference={holeSummaryRef} onCommit={commitHoleSummary} />
            <SubmitRoundModal
                reference={submitRoundModalRef}
                course={course}
                onSubmit={() => { handleSubmitRound(); }}
                holes={Object.values(holes)}
            />
            <ScorecardModal reference={scorecardModalRef} holes={Object.values(holes)} />
            <SettingsModal sideSheetRef={sideSheetRef} settings={roundSettings} onChange={setRoundSettings} />
            <ConfirmExitModal
                reference={confirmExitModalRef}
                onSave={() => { handleSubmitRound(); }}
                onDelete={handleDeleteRound}
            />
        </Screen>
    );
};

const $screen: ViewStyle = {
    flex: 1,
    padding: 0,
};

const $map: ViewStyle = {
    ...StyleSheet.absoluteFillObject,
};

const $recenterButton: ThemedStyle<ViewStyle> = (theme) => ({
    position: "absolute",
    bottom: 260,
    left: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.backgrounds.elevated,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
});

const $scoreButton: ThemedStyle<ViewStyle> = (theme) => ({
    position: "absolute",
    bottom: 120,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 50,
    backgroundColor: theme.colors.backgrounds.elevated,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
});

const $gpsAcquiringBanner: ThemedStyle<ViewStyle> = (theme) => ({
    position: "absolute",
    top: 160,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.backgrounds.elevated,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 4,
});

const $restoredBanner: ThemedStyle<ViewStyle> = (theme) => ({
    position: "absolute",
    top: 160,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.backgrounds.elevated,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 4,
});
