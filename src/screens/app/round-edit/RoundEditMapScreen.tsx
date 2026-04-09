import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { getFirestore } from "@react-native-firebase/firestore";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, ViewStyle, type LayoutChangeEvent } from "react-native";
import MapView from "react-native-maps";

import HoleSummaryModal, { type HoleSummaryModalHandle } from "@/components/app/golf/modals/HoleSummaryModal";
import PostShotDetailsModal, { type PostShotDetailsModalReference, type PostShotModalResult } from "@/components/app/golf/modals/PostShotDetailsModal";
import ScorecardModal from "@/components/app/golf/modals/ScorecardModal";
import SettingsModal from "@/components/app/golf/modals/SettingsModal";
import ShotDetailsModal, { type ShotDetailsModalReference, type ShotModalResult } from "@/components/app/golf/modals/ShotDetailsModal";
import WarningModal from "@/components/app/golf/modals/WarningModal";
import { PuttingActionBar } from "@/components/app/golf/putting/PuttingActionBar";
import type { HeatmapMode } from "@/components/app/golf/putting/PuttingOverlay";
import { ContextFooter } from "@/components/app/golf/round/ContextFooter";
import { RoundHeader } from "@/components/app/golf/round/RoundHeader";
import { CourseErrorView } from "@/components/app/golf/tracking/CourseErrorView";
import { CourseLoadingView } from "@/components/app/golf/tracking/CourseLoadingView";
import { RoundTrackingMapLayers } from "@/components/app/golf/tracking/RoundTrackingMapLayers";
import { ShotEditModeOverlay } from "@/components/app/golf/tracking/ShotEditModeOverlay";
import { SideSheetModalHandle } from "@/components/app/modals/SideSheetModalFactory";
import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";
import { useRoundEdit } from "@/context/RoundEditProvider";
import { useCourseData } from "@/hooks/courses/useCourseData";
import { useCourseMap } from "@/hooks/courses/useCourseMap";
import { useGreenCameraLock } from "@/hooks/courses/useGreenCameraLock";
import { usePuttingMode } from "@/hooks/courses/usePuttingMode";
import { useShotEditController } from "@/hooks/courses/useShotEditController";
import type { LatLng } from "@/models/geo";
import { LiveHoleState, LiveShotAttempt } from "@/models/round.live.types";
import { ShotAttempt } from "@/models/round.session.types";
import { useAppTheme } from "@/theme/context";
import type { ThemedStyle } from "@/theme/types";
import type { MapLayoutSize, RoundTrackingSettings } from "@/types/roundTracking";

import { polygonCentroid } from "@/utils/courses/geometry/distance.utils";

import EditScorecardIcon from "@assets/icons/svg/editScorecard";

const toLiveShot = (shot: ShotAttempt): LiveShotAttempt => ({
  id: shot.id,
  hole: shot.hole,
  stroke: shot.stroke,
  par: shot.par,
  category: shot.category,
  club: { ...shot.club },
  lie: shot.lie,
  distance: { ...shot.distance },
  start: {
    point: {
      latitude: shot.start.point.lat,
      longitude: shot.start.point.lon,
    },
    timestamp: shot.start.timestamp,
  },
  end: shot.end
    ? {
        point: {
          latitude: shot.end.point.lat,
          longitude: shot.end.point.lon,
        },
        timestamp: shot.end.timestamp,
      }
    : undefined,
  intent: shot.intent ? { ...shot.intent } : undefined,
  result: shot.result ? { ...shot.result } : undefined,
  notes: shot.notes,
})

export const RoundEditMapScreen: React.FC<{ roundId: string }> = ({ roundId }) => {
    const { theme, themed } = useAppTheme();
    const db = getFirestore();
    const router = useRouter();

    const { editableRound, commitHoleSummary, updateShot, isDirty, saveChanges, discardChanges } = useRoundEdit();
    const [activeHole, setActiveHole] = useState(1);

    const [reloadCounter, setReloadCounter] = useState(0);
    const [mapLayout, setMapLayout] = useState<MapLayoutSize>({ width: 0, height: 0 });
    const [heatmapMode, setHeatmapMode] = useState<HeatmapMode>("none");
    const [roundSettings, setRoundSettings] = useState<RoundTrackingSettings>({
        gpsEnabled: false,
        showPreviousShots: true,
        showHolePath: true,
        highContrast: false,
        useMetric: false,
    });

    const courseLocation: LatLng | null = useMemo(() => {
        if (editableRound?.shots.length) {
            return {
                latitude: editableRound.shots[0].start.point.lat,
                longitude: editableRound.shots[0].start.point.lon
            };
        }
        return null;
    }, [editableRound?.shots]);

    const cacheMaxAgeMs = reloadCounter > 0 ? 0 : undefined;
    const courseDataState = useCourseData(courseLocation, db, cacheMaxAgeMs);
    const courseData = courseDataState.status === "success" ? courseDataState.data : null;

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

    const [holePins, setHolePins] = useState<Record<number, LatLng | null>>({});

    const setHolePinForActiveHole = useCallback((coord: LatLng | null) => {
        setHolePins((prev) => ({ ...prev, [activeHole]: coord }));
    }, [activeHole]);

    const holes: Record<number, LiveHoleState> = useMemo(() => {
        if (!editableRound) return {};
        const state: Record<number, LiveHoleState> = {};
        for (const hole of editableRound.holes) {
            state[hole.hole] = hole as any as LiveHoleState;
        }
        return state;
    }, [editableRound]);

    const liveShots = useMemo(() => {
        return editableRound?.shots.map(toLiveShot) ?? [];
    }, [editableRound?.shots]);

    const activeHoleShots = useMemo(
        () => liveShots.filter((shot) => shot.hole === activeHole),
        [activeHole, liveShots],
    );

    const puttingMode = usePuttingMode();
    const cycleHeatmapMode = useCallback(() => {
        setHeatmapMode((mode) => (mode === "none" ? "elevation" : mode === "elevation" ? "slope" : "none"));
    }, []);

    const { recenterOnGreen } = useGreenCameraLock(
        mapRef,
        puttingMode.isPuttingMode,
        activeGreenPolygon,
        activeHoleData,
    );

    const handleUpdateLiveShot = useCallback((shotId: string, updates: Partial<LiveShotAttempt>) => {
        const updateParams: Partial<ShotAttempt> = {};
        
        if (updates.result) updateParams.result = updates.result;
        if (updates.intent) updateParams.intent = updates.intent;
        if (updates.club) updateParams.club = updates.club;
        if (updates.lie) updateParams.lie = updates.lie;
        if (updates.category) updateParams.category = updates.category;
        if (updates.notes !== undefined) updateParams.notes = updates.notes;

        updateShot(shotId, updateParams);
    }, [updateShot]);

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
            puttingMode.exitPuttingMode();
            setHeatmapMode("none");
            resetPannedState();
        },
        shots: liveShots,
        updateShot: handleUpdateLiveShot,
    });

    const modalRef = useRef<ShotDetailsModalReference>(null);
    const postShotModalRef = useRef<PostShotDetailsModalReference>(null);
    const holeSummaryRef = useRef<HoleSummaryModalHandle>(null);
    const sideSheetRef = useRef<SideSheetModalHandle>(null);
    const scorecardModalRef = useRef<BottomSheetModal | null>(null);
    const warningModalRef = useRef<BottomSheetModal | null>(null);

    const handleShotPress = useCallback((shot: LiveShotAttempt) => {
        postShotModalRef.current?.openForEdit(shot);
    }, []);

    const handleEditResultConfirm = useCallback((shotId: string, result: PostShotModalResult) => {
        handleUpdateLiveShot(shotId, { result });
    }, [handleUpdateLiveShot]);

    const handleEditIntentFromResult = useCallback((shotId: string, currentResult: PostShotModalResult) => {
        handleUpdateLiveShot(shotId, { result: currentResult });
        const shot = liveShots.find((entry) => entry.id === shotId);
        if (shot) {
            modalRef.current?.openForEdit({ ...shot, result: currentResult });
        }
    }, [liveShots, handleUpdateLiveShot]);

    const handleEditGPSFromResult = useCallback((shotId: string) => {
        const shot = liveShots.find((entry) => entry.id === shotId);
        if (shot) {
            enterShotEditMode(shot, "end");
        }
    }, [enterShotEditMode, liveShots]);

    const handleEditIntentConfirm = useCallback((shotId: string, details: ShotModalResult) => {
        handleUpdateLiveShot(shotId, {
            lie: details.lie,
            club: details.club,
            category: details.category,
            intent: details.intent,
            notes: details.notes,
        });
    }, [handleUpdateLiveShot]);

    const handleEditResultFromIntent = useCallback((shotId: string, currentDetails: ShotModalResult) => {
        const updates = {
            lie: currentDetails.lie,
            club: currentDetails.club,
            category: currentDetails.category,
            intent: currentDetails.intent,
            notes: currentDetails.notes,
        };

        handleUpdateLiveShot(shotId, updates);
        const shot = liveShots.find((entry) => entry.id === shotId);
        if (shot) {
            postShotModalRef.current?.openForEdit({ ...shot, ...updates });
        }
    }, [liveShots, handleUpdateLiveShot]);

    const handleEditGPSFromIntent = useCallback((shotId: string) => {
        const shot = liveShots.find((entry) => entry.id === shotId);
        if (shot) {
            enterShotEditMode(shot, "start");
        }
    }, [enterShotEditMode, liveShots]);

    const currentRunningScore = useMemo(() => {
        if (!editableRound) return 0;
        let diff = 0;
        editableRound.holes.forEach(h => {
             if (h.score && h.score > 0) {
                 diff += (h.score - h.par);
             }
        });
        return diff;
    }, [editableRound]);

    const handleScoreButtonPress = useCallback(() => {
        const hole = holes[activeHole];
        if (!hole) return;

        holeSummaryRef.current?.present({
            hole,
            holeShots: activeHoleShots,
            runningScore: currentRunningScore,
            playerName: "You",
        });
    }, [activeHole, activeHoleShots, holes, currentRunningScore]);


    const handleMapLayout = useCallback((event: LayoutChangeEvent) => {
        const { width, height } = event.nativeEvent.layout;
        setMapLayout((prev) => (
            prev.width === width && prev.height === height ? prev : { width, height }
        ));
    }, []);

    const handleMapPanDrag = useCallback(() => {
        if (handleShotEditPanDrag()) return;
        onPanDrag();
    }, [handleShotEditPanDrag, onPanDrag]);

    const handleMapRegionChange = useCallback(() => {
        handleShotEditRegionChange();
    }, [handleShotEditRegionChange]);

    const handleMapRegionChangeComplete = useCallback(() => {
        handleShotEditRegionChangeComplete();
    }, [handleShotEditRegionChangeComplete]);


    const handleMapPress = useCallback((event: { nativeEvent: { coordinate: LatLng } }) => {
        const coord = event.nativeEvent.coordinate;
        if (puttingMode.isPuttingMode) {
            puttingMode.setPendingPuttStart(coord);
            return;
        }
    }, [puttingMode]);

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
        cancelShotEdit();
        if (puttingMode.isPuttingMode) {
            puttingMode.exitPuttingMode();
        }
        recenterOnHole();
    }, [activeHole, cancelShotEdit, recenterOnHole]);

    const recenterScreen = useCallback(() => {
        if (isShotEditing) {
            recenterShotEdit();
            return;
        }
        if (puttingMode.isPuttingMode) {
            recenterOnGreen();
            resetPannedState();
        } else {
            recenterOnHole();
        }
    }, [isShotEditing, puttingMode.isPuttingMode, recenterOnGreen, recenterOnHole, recenterShotEdit, resetPannedState]);

    const forceReload = useCallback(() => {
        setReloadCounter((count) => count + 1);
    }, []);

    if (courseDataState.status === "idle" || courseDataState.status === "loading") {
        return <CourseLoadingView />;
    }

    if (courseDataState.status === "error") {
        return <CourseErrorView error={courseDataState.error} onRetry={forceReload} />;
    }

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
                    courseHazards={[]}
                    currentHeading={currentHeadingRef.current}
                    currentShotStart={null}
                    displayTarget={null}
                    editingShot={editingShot}
                    hazardActive={false}
                    hazardInspection={{ isActive: false } as any}
                    heatmapMode={heatmapMode}
                    holePinCoord={holePins[activeHole] ?? null}
                    isShotEditing={isShotEditing}
                    isTargetEditing={false}
                    playerTrackingIsTracking={false}
                    puttingMode={{
                        isPuttingMode: puttingMode.isPuttingMode,
                        pendingPuttStart: puttingMode.pendingPuttStart,
                        putts: puttingMode.putts,
                    }}
                    roundSettings={roundSettings}
                    shotEditState={shotEditState}
                    shotsForHole={activeHoleShots}
                    trackingState={"idle"}
                    userLocation={null} // GPS disabled
                    onClearTarget={() => {}}
                    onFocusHazard={() => {}}
                    onHolePinChange={setHolePinForActiveHole}
                    onSaveTargetMove={() => {}}
                    onShotPress={handleShotPress}
                    onStartTargetMove={() => {}}
                />
            </MapView>

            {!isShotEditing && (
                <RoundHeader
                    setHoleNumber={setActiveHole}
                    onPuttingExit={() => {
                        puttingMode.exitPuttingMode();
                        setHeatmapMode("none");
                        recenterOnHole();
                    }}
                    isPutting={puttingMode.isPuttingMode}
                    prevHole={() => setActiveHole((h) => Math.max(1, h - 1))}
                    activeHole={activeHole}
                    nextHole={() => setActiveHole((h) => Math.min(editableRound?.holes.length ?? 18, h + 1))}
                    onExit={() => {
                        if (isDirty) {
                            warningModalRef.current?.present();
                        } else {
                            router.back();
                        }
                    }}
                />
            )}

            {!isShotEditing && (
                <PuttingActionBar
                    isActive={puttingMode.isPuttingMode}
                    hasPendingPutt={!!puttingMode.pendingPuttStart}
                    onSavePutt={() => {}}
                    onUndoPress={() => { puttingMode.undoLastPutt() }}
                    roundSettings={roundSettings}
                    onGPSPress={() => {}}
                    heatmapMode={heatmapMode}
                    onHeatmapToggle={cycleHeatmapMode}
                    hasLidar={!!activeHoleData?.green?.lidar}
                />
            )}

            {!isShotEditing && isPannedAway && (
                <Pressable style={themed($recenterButton)} onPress={recenterScreen}>
                    <Ionicons name="locate" size={30} color={theme.colors.text} />
                </Pressable>
            )}

            {!puttingMode.isPuttingMode && !isShotEditing && (
                <Pressable
                    style={themed($scoreButton)}
                    onPress={handleScoreButtonPress}
                >
                    <EditScorecardIcon size={36} color={theme.colors.text} />
                </Pressable>
            )}

            {!isShotEditing && (
                <ContextFooter
                    currentShot={null}
                    userLocation={null}
                    isPutting={puttingMode.isPuttingMode}
                    holePinCoord={holePins[activeHole]}
                    pendingPuttStart={puttingMode.pendingPuttStart}
                    putts={puttingMode.putts.length}
                    forceActive={!puttingMode.isPuttingMode && isDirty}
                >
                    {!puttingMode.isPuttingMode && isDirty ? (
                        <>
                            <Text style={{color: theme.colors.text, fontSize: 16, fontWeight: "600"}}>Unsaved Changes</Text>
                            <Button 
                                preset="default" 
                                text="Save Changes" 
                                onPress={async () => {
                                    await saveChanges();
                                }} 
                                style={{minHeight: 36, paddingVertical: 0}}
                                textStyle={{fontSize: 14}}
                            />
                        </>
                    ) : undefined}
                </ContextFooter>
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
                onConfirm={() => {}}
                onCancel={() => {}}
                onEditConfirm={handleEditIntentConfirm}
                onEditResult={handleEditResultFromIntent}
                onEditGPS={handleEditGPSFromIntent}
            />

            <PostShotDetailsModal
                reference={postShotModalRef}
                onConfirm={() => {}}
                onCancel={() => {}}
                onEditConfirm={handleEditResultConfirm}
                onEditIntent={handleEditIntentFromResult}
                onEditGPS={handleEditGPSFromResult}
            />

            <HoleSummaryModal reference={holeSummaryRef} onCommit={(commit) => {
                commitHoleSummary(commit);
                if (activeHole < (editableRound?.holes?.length || 18)) {
                    setActiveHole(activeHole + 1);
                }
            }} />
            <ScorecardModal reference={scorecardModalRef} holes={Object.values(holes)} />
            <SettingsModal sideSheetRef={sideSheetRef} settings={roundSettings} onChange={setRoundSettings} />

            <WarningModal
                reference={warningModalRef}
                header="Unsaved Changes"
                subtext="You have unsaved changes to this round. Would you like to discard them?"
                actionText="Discard"
                onAction={() => {
                    warningModalRef.current?.dismiss();
                    discardChanges();
                    router.back();
                }}
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

export default RoundEditMapScreen;
