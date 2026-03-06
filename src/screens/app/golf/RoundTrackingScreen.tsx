import { Ionicons } from "@expo/vector-icons";
import { getFirestore } from "@react-native-firebase/firestore";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View, ViewStyle } from "react-native";
import MapView, { Marker, Polygon, Polyline } from "react-native-maps";

import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";
import { useAppTheme } from "@/theme/context";
import type { ThemedStyle } from "@/theme/types";

import ConfirmExitModal from "@/components/app/golf/modals/ConfirmExitModal";
import HoleSummaryModal, { type HoleSummaryModalHandle } from "@/components/app/golf/modals/HoleSummaryModal";
import PostShotDetailsModal, { PostShotDetailsModalReference, type PostShotModalResult } from "@/components/app/golf/modals/PostShotDetailsModal";
import ScorecardModal from "@/components/app/golf/modals/ScorecardModal";
import type { CourseSelectionDetails } from "@/components/app/golf/modals/SelectCourseDetailsModal";
import SettingsModal from "@/components/app/golf/modals/SettingsModal";
import ShotDetailsModal, { type ShotDefaults, type ShotDetailsModalReference, type ShotModalResult } from "@/components/app/golf/modals/ShotDetailsModal";
import type { HeatmapMode } from "@/components/app/golf/putting/GreenHeatmapOverlay";
import { PuttingActionBar } from "@/components/app/golf/putting/PuttingActionBar";
import { PuttingOverlay } from "@/components/app/golf/putting/PuttingOverlay";
import { ContextFooter } from "@/components/app/golf/round/ContextFooter";
import { RoundActions } from "@/components/app/golf/round/RoundActions";
import { RoundHeader } from "@/components/app/golf/round/RoundHeader";
import { GreenDistanceStack } from "@/components/app/golf/tracking/GreenDistanceStack";
import { HazardDistanceOverlay } from "@/components/app/golf/tracking/HazardDistanceOverlay";
import { HazardMapLabels } from "@/components/app/golf/tracking/HazardMapLabels";
import { PlayerTrackingOverlay } from "@/components/app/golf/tracking/PlayerTrackingOverlay";
import { ShotHistoryOverlay } from "@/components/app/golf/tracking/ShotHistoryOverlay";
import { SideSheetModalHandle } from "@/components/app/modals/SideSheetModalFactory";
import { isPointInPolygon } from "@/components/putting-green";
import { useCourseData } from "@/hooks/courses/useCourseData";
import { useCourseMap } from "@/hooks/courses/useCourseMap";
import { useGreenCameraLock } from "@/hooks/courses/useGreenCameraLock";
import { useHazardInspection } from "@/hooks/courses/useHazardInspection";
import { useLocationTracking } from "@/hooks/courses/useLocationTracking";
import { usePlayerTracking } from "@/hooks/courses/usePlayerTracking";
import { usePuttingMode } from "@/hooks/courses/usePuttingMode";
import { useRoundTracking } from "@/hooks/courses/useRoundTracking";
import type { CourseData } from "@/models/course";
import type { LatLng } from "@/models/geo";
import { LiveShotAttempt } from "@/models/round.live.types";
import type { LieType } from "@/models/round.session.types";
import type { CourseLoadError } from "@/services/courses/courseLoader";
import { generateUUID } from "@/utils/common";
import {
    greenDistances,
    haversineMeters,
    polygonCentroid,
    toYards,
    type GreenDistances,
} from "@/utils/courses/geometry/distance.utils";
import { isPointInPolygonLatLng, isPointInPolygonXY, padPolygonCoordinates } from "@/utils/courses/geometry/polygon.utils";
import { formatCourseLoadError } from "@/utils/courses/round/error.formatter";
import EditScorecardIcon from "@assets/icons/svg/editScorecard";
import { BottomSheetModal } from "@gorhom/bottom-sheet";

// ── Pure helpers ──────────────────────────────────────────────────────────────

function hazardFillColor(isBunker: boolean, isFocused: boolean, featureAlpha: number): string {
    if (isBunker) {
        return isFocused
            ? `rgba(245, 222, 100, ${featureAlpha})`
            : `rgba(245, 222, 179, ${0.8 * featureAlpha})`;
    }
    return isFocused
        ? `rgba(30, 144, 255, ${featureAlpha})`
        : `rgba(30, 100, 220, ${0.7 * featureAlpha})`;
}

function hazardStrokeColor(isBunker: boolean, isFocused: boolean, featureAlpha: number): string {
    if (isBunker) {
        return isFocused ? "rgba(200, 130, 30, 1)" : `rgba(175, 143, 100, ${featureAlpha})`;
    }
    return isFocused ? "rgba(0, 80, 200, 1)" : `rgba(0, 60, 180, ${featureAlpha})`;
}

/**
 * Detect the lie type based on which OSM polygon the user is currently inside.
 * Priority: tee > green > bunker > fairway > rough.
 */
function detectLie(
    userLoc: LatLng,
    courseData: CourseData,
): LieType {
    for (const tee of courseData.teeBoxes ?? []) {
        if (isPointInPolygonLatLng(userLoc, tee.coordinates)) return "tee";
    }
    for (const green of courseData.greens) {
        // Green polygons are XYPoint[] (x = lon, y = lat) — convert user pos accordingly
        if (isPointInPolygonXY({ x: userLoc.longitude, y: userLoc.latitude }, green.polygon)) return "green";
    }
    for (const hazard of courseData.hazards ?? []) {
        if (hazard.type === "bunker" && isPointInPolygonLatLng(userLoc, hazard.coordinates)) return "sand";
    }
    for (const fairway of courseData.fairways) {
        if (isPointInPolygonLatLng(userLoc, fairway.coordinates)) return "fairway";
    }
    return "rough";
}

/**
 * Suggest a club based on distance (yards) and lie.
 * - Tee → Driver
 * - On green → Putter
 * - >250 yd → 3 Wood (longest non-driver)
 * - Linear tier mapping below that
 */
function guessClub(yards: number, lie: LieType): string {
    if (lie === "green") return "Putter";
    if (lie === "tee") return "Driver";
    if (yards > 220) return "3 Wood";
    if (yards > 210) return "5 Wood";
    if (yards > 195) return "4 Iron";
    if (yards > 180) return "5 Iron";
    if (yards > 165) return "6 Iron";
    if (yards > 150) return "7 Iron";
    if (yards > 135) return "8 Iron";
    if (yards > 120)  return "9 Iron";
    if (yards > 100)  return "Pitching Wedge";
    if (yards > 80)  return "Gap Wedge";
    if (yards > 50)  return "Sand Wedge";
    return "Lob Wedge";
}

// ── Sub-components ────────────────────────────────────────────────────────────

const CourseLoadingView: React.FC = () => {
    const { theme } = useAppTheme();
    return (
        <Screen>
            <View style={$centeredFill}>
                <ActivityIndicator size="large" color={theme.colors.tint} />
                <Text style={{ marginTop: 12, color: theme.colors.textDim }} text="Loading course data…" />
            </View>
        </Screen>
    );
};

interface CourseErrorViewProps {
    error: CourseLoadError | undefined;
    onRetry: () => void;
}

const CourseErrorView: React.FC<CourseErrorViewProps> = ({ error, onRetry }) => {
    const { theme } = useAppTheme();
    const info = formatCourseLoadError(error);
    return (
        <Screen>
            <View style={$centeredFill}>
                <Ionicons name="alert-circle-outline" size={48} color={theme.colors.error} />
                <Text style={{ marginTop: 12, color: theme.colors.textDim, textAlign: "center" }} text={info.title} />
                <Text style={{ marginTop: 8, color: theme.colors.textDim, textAlign: "center" }} text={info.message} />
                {info.details ? (
                    <View style={{ marginTop: 12, paddingHorizontal: 12 }}>
                        <Text
                            style={{ color: theme.colors.textDim, fontSize: 12, textAlign: "center" }}
                            text={String(info.details)}
                        />
                    </View>
                ) : null}
                <View style={{ marginTop: 20, width: 220 }}>
                    <Button text="Retry" preset="filled" onPress={onRetry} />
                </View>
            </View>
        </Screen>
    );
};

// Render a subtle grid of small '+' markers over a green polygon.
const GreenPlusGrid: React.FC<{ polygon: { x: number; y: number }[] }> = ({ polygon }) => {
    const { theme } = useAppTheme();

    const points = useMemo(() => {
        if (!polygon || polygon.length === 0) return [] as { latitude: number; longitude: number; key: string }[];
        let minX = Infinity;
        let maxX = -Infinity;
        let minY = Infinity;
        let maxY = -Infinity;
        for (const p of polygon) {
            if (p.x < minX) minX = p.x;
            if (p.x > maxX) maxX = p.x;
            if (p.y < minY) minY = p.y;
            if (p.y > maxY) maxY = p.y;
        }

        const rows = 6;
        const cols = 6;
        const pts: { latitude: number; longitude: number; key: string }[] = [];
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                const y = minY + (i + 0.5) * (maxY - minY) / rows;
                const x = minX + (j + 0.5) * (maxX - minX) / cols;
                if (isPointInPolygonXY({ x, y }, polygon)) {
                    pts.push({ latitude: y, longitude: x, key: `plus-${i}-${j}-${x}-${y}` });
                }
            }
        }
        return pts;
    }, [polygon]);

    if (points.length === 0) return null;

    return (
        <>
            {points.map((p) => (
                <Marker
                    key={p.key}
                    coordinate={{ latitude: p.latitude, longitude: p.longitude }}
                    tracksViewChanges={false}
                    tappable={false}
                    anchor={{ x: 0.5, y: 0.5 }}
                    zIndex={3}
                >
                    <View style={{ width: 18, height: 18, alignItems: "center", justifyContent: "center", opacity: 0.7 }}>
                        <Ionicons name="add" size={12} color={theme.colors.textDim} />
                    </View>
                </Marker>
            ))}
        </>
    );
};

// ── Main screen ───────────────────────────────────────────────────────────────

interface RoundTrackingScreenProps {
    course: CourseSelectionDetails | null;
}

export const RoundTrackingScreen: React.FC<RoundTrackingScreenProps> = ({ course }) => {
    const { theme, themed } = useAppTheme();
    const db = getFirestore();
    const router = useRouter();

    const [reloadCounter, setReloadCounter] = useState(0);

    const courseLocation: LatLng | null = useMemo(() => {
        const loc = course?.selectedCourse.location;
        if (!loc) return null;
        return { latitude: loc.latitude, longitude: loc.longitude };
    }, [course?.selectedCourse.location]);

    // UI / round settings that can be toggled from the Settings modal
    const [roundSettings, setRoundSettings] = useState<{
        gpsEnabled: boolean;
        showPreviousShots: boolean;
        showHolePath: boolean;
        highContrast: boolean;
        useMetric: boolean;
    }>({
        gpsEnabled: true,
        showPreviousShots: true,
        showHolePath: true,
        highContrast: false,
        useMetric: false,
    });

    // Pass cacheMaxAgeMs to force reload when retry is pressed (0 forces a re-fetch)
    const cacheMaxAgeMs = reloadCounter > 0 ? 0 : undefined;
    const courseDataState = useCourseData(courseLocation, db, cacheMaxAgeMs);
    const courseData = courseDataState.status === "success" ? courseDataState.data : null;

    const { userLocation, setLocation } = useLocationTracking(!roundSettings.gpsEnabled); // TODO REMOVE THIS AND USE REAL LOCATION
    const {
        activeHole,
        nextHole,
        prevHole,
        shots,
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
    } = useRoundTracking(1, course?.numberOfHoles ?? 0, course?.selectedTee); // TODO if it cant load the hole length trigger an error state

    const { mapRef, activeHoleData, recenterOnHole, isPannedAway, onPanDrag, currentHeadingRef, resetPannedState } = useCourseMap(courseData, activeHole);

    // ── Player tracking ────────────────────────────────────────────────────────
    // Active green polygon (XYPoint[]), null while data is loading.
    const activeGreenPolygon = useMemo(
        () => activeHoleData?.green?.polygon ?? null,
        [activeHoleData?.green?.polygon],
    );

    const playerTracking = usePlayerTracking({
        mapRef,
        userLocation,
        greenPolygon: activeGreenPolygon,
    });

    // Per-hole hole-pin positions (in-memory). Keys are hole numbers.
    const [holePins, setHolePins] = useState<Record<number, LatLng | null>>({});

    const setHolePinForActiveHole = (coord: LatLng | null) => {
        setHolePins(prev => ({ ...prev, [activeHole]: coord }));
    };

    // Live green distances (front / center / back) — recomputed on every location tick.
    const liveGreenDistances = useMemo((): GreenDistances | null => {
        if (!userLocation || !activeGreenPolygon) return null;
        return greenDistances(userLocation, activeGreenPolygon, holePins[activeHole]);
    }, [userLocation, activeGreenPolygon, holePins, activeHole]);

    // ── Hazard inspection ─────────────────────────────────────────────────────
    const courseHazards = courseData?.hazards ?? [];
    const hazardInspection = useHazardInspection(mapRef, courseHazards, userLocation, currentHeadingRef);

    // ── Putting Mode ──────────────────────────────────────────────────────────
    const puttingMode = usePuttingMode();
    const [heatmapMode, setHeatmapMode] = useState<HeatmapMode>('none');
    const cycleHeatmapMode = () =>
        setHeatmapMode(m => m === 'none' ? 'elevation' : m === 'elevation' ? 'slope' : 'none');

    const { cameraConstraints, recenterOnGreen } = useGreenCameraLock(
        mapRef,
        puttingMode.isPuttingMode,
        activeGreenPolygon,
        activeHoleData
    );

    // Sync player tracking with GPS setting and putting mode.
    // GPS on + not putting → tracking on; everything else → tracking off.
    useEffect(() => {
        playerTracking.setTracking(roundSettings.gpsEnabled && !puttingMode.isPuttingMode);
    }, [roundSettings.gpsEnabled, puttingMode.isPuttingMode]);

    const handleGreenViewPress = () => {
        if (!puttingMode.isPuttingMode) {
             puttingMode.startPuttingMode(); // effect above will turn off tracking automatically
        }
    };

    const handleExitPuttingMode = () => {
        puttingMode.exitPuttingMode();
        setHeatmapMode('none');
        recenterOnHole(); // animate back to full hole view
    };

    const handleSavePutt = () => {
        if (!puttingMode.pendingPuttStart || !holePins[activeHole] && !activeGreenPolygon) return;
        
        const targetCoord = holePins[activeHole] ?? polygonCentroid(activeGreenPolygon!);
        const newPutt: LiveShotAttempt = {
            id: generateUUID(),
            hole: activeHole,
            stroke: shots.filter(s => s.hole === activeHole).length + puttingMode.putts.length + 1,
            par: course?.selectedTee.holes[activeHole - 1]?.par ?? 4,
            category: "putt",
            club: { type: "putter", label: "Putter" },
            lie: "green",
            distance: {
                measuredM: haversineMeters(puttingMode.pendingPuttStart, targetCoord)
            },
            start: {
                point: puttingMode.pendingPuttStart,
                timestamp: new Date().toISOString()
            }
        };
        
        // Add to local putting state or global shots array
        // We'll add it to global shots array so it persists in the round
        addShot(puttingMode.pendingPuttStart); // Use the current userlocation or tapped location?
        setCurrentShot(newPutt);
        puttingMode.addPutt(newPutt);
        puttingMode.clearPendingPutt();
        
        // Optionally, immediately commit the current shot for putts
        // Since putts are simple (no full tracking required)
        endTracking(); 
    };

    const recenterScreen = () => {
        if (playerTracking.isTracking) {
            playerTracking.recenterOnUser();
            resetPannedState();
        } else if (puttingMode.isPuttingMode) {
            recenterOnGreen();
            resetPannedState();
        } else {
            recenterOnHole();
        }
    };

    // ── Tap handler for placing / updating intermediate target ─────────────────
    const handleMapPress = (e: { nativeEvent: { coordinate: LatLng } }) => {
        const coord = e.nativeEvent.coordinate;
        if (puttingMode.isPuttingMode) {
            puttingMode.setPendingPuttStart(coord);
            return;
        }

        // If the tap lands inside any hazard polygon (with padding), let the hazard handle it.
        const tappedHazard = courseHazards.some((hazard) =>
            isPointInPolygon(coord, padPolygonCoordinates(hazard.coordinates, 6))
        );
        if (tappedHazard) return;

        if (hazardInspection.mode.kind === "tap") {
            hazardInspection.exitHazardMode();
            recenterScreen();

            return;
        }

        // Allow target placement whenever the tracking overlay is visible — covers both
        // active-tracking and limp mode (GPS enabled but no fix yet, or GPS disabled).
        if (!activeGreenPolygon) return;

        // check if the user tapped the target pin, if so clear the target instead of setting a new one
        if (playerTracking.target && isPointInPolygon(e.nativeEvent.coordinate, padPolygonCoordinates([playerTracking.target.coordinate], 10))) {
            playerTracking.setTargetCoordinate(null);
            return;
        }
        playerTracking.setTargetCoordinate(e.nativeEvent.coordinate);
    };

    const modalRef = useRef<ShotDetailsModalReference>(null);
    const postShotModalRef = useRef<PostShotDetailsModalReference>(null);
    const holeSummaryRef = useRef<HoleSummaryModalHandle>(null);
    const sideSheetRef = useRef<SideSheetModalHandle>(null);
    const confirmExitModalRef = useRef<BottomSheetModal | null>(null);
    const scorecardModalRef = useRef<BottomSheetModal | null>(null);

    useEffect(() => {
        if (courseDataState.status === "success") {
            recenterOnHole();
            // preload the holePins state with the center of each green as the default pin position
            const initialHolePins: Record<number, LatLng | null> = {};
            courseDataState.data.greens.forEach(green => {
                const holeNumber = parseInt(green.hole, 10);
                initialHolePins[holeNumber] = polygonCentroid(green.polygon);
            });
            setHolePins(initialHolePins);
        }
    }, [courseDataState.status]);

    useEffect(() => {
        // clear any hazard view when changing holes
        hazardInspection.exitHazardMode();
        handleCancelShot();

        if (puttingMode.isPuttingMode) {
            puttingMode.exitPuttingMode();
        }

        if (!roundSettings.gpsEnabled) {
            recenterOnHole();
        }
        // When GPS/tracking is on, the camera follows the player automatically.
    }, [activeHole]);

    const handleStartTracking = () => {
        if (userLocation) {
            startTracking(userLocation);
        }
    };

    const openShotDetails = () => {
        // ── Compute smart defaults from OSM data + player location ──
        let defaults: ShotDefaults | undefined;
        if (userLocation && courseData) {
            const lie = detectLie(userLocation, courseData);
            // Pin = user-placed pin if dragged, otherwise green polygon centroid
            const pinCoord =
                holePins[activeHole] ??
                (activeGreenPolygon ? polygonCentroid(activeGreenPolygon) : null);
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
    }

    const handleEndTracking = () => {
        postShotModalRef.current?.open();
    };

    const handleConfirmShot = (details: ShotModalResult) => {
        handleStartTracking();
        // set a different location each shot
        if (shots.length === 0) {
            setLocation({
                latitude: 42.203468841451304, 
                longitude: -85.62896922453452
            });
        } else if (shots.length === 1) {
            setLocation({
                latitude: 42.203268028876955, 
                longitude: -85.62803493889179
            });
        }
        setCurrentShot({
            ...details,
            id: generateUUID(),
            distance: {
                measuredM: 0,
                intendedToTargetM: 0
            },
            par: course?.selectedTee.holes[activeHole - 1].par ?? 4,
            hole: activeHole,
            stroke: shots.filter(s => s.hole === activeHole).length + 1,
            start: {
                point: {
                    latitude: userLocation?.latitude ?? 0,
                    longitude: userLocation?.longitude ?? 0
                },
                timestamp: new Date().toISOString()
            }
        });
    };

    const handlePuttUndo = () => {
        puttingMode.undoLastPutt();
    }

    const handleCancelShot = () => {
        endTracking();
    };

    // ── Shot edit flow ────────────────────────────────────────────────────────

    /** Opens PostShotDetailsModal pre-filled with an existing shot's result data. */
    const handleShotPress = (shot: LiveShotAttempt) => {
        postShotModalRef.current?.openForEdit(shot);
    };

    /** Save edited result fields back onto the existing shot. */
    const handleEditResultConfirm = (shotId: string, result: PostShotModalResult) => {
        updateShot(shotId, { result });
    };

    /**
     * PostShotDetailsModal "Edit Intent" pressed.
     * Persist the current result edits immediately, then open ShotDetailsModal
     * pre-filled with existing intent / club / lie data.
     */
    const handleEditIntentFromResult = (shotId: string, currentResult: PostShotModalResult) => {
        updateShot(shotId, { result: currentResult });
        const shot = shots.find(s => s.id === shotId);
        if (shot) {
            modalRef.current?.openForEdit({ ...shot, result: currentResult });
        }
    };

    /** Save edited intent/club/lie fields back onto the existing shot. */
    const handleEditIntentConfirm = (shotId: string, details: ShotModalResult) => {
        updateShot(shotId, {
            lie: details.lie,
            club: details.club,
            category: details.category,
            intent: details.intent,
            notes: details.notes,
        });
    };

    /**
     * ShotDetailsModal "Edit Result" pressed.
     * Persist the current intent edits immediately, then open PostShotDetailsModal
     * pre-filled with existing result data.
     */
    const handleEditResultFromIntent = (shotId: string, currentDetails: ShotModalResult) => {
        const updates = {
            lie: currentDetails.lie,
            club: currentDetails.club,
            category: currentDetails.category,
            intent: currentDetails.intent,
            notes: currentDetails.notes,
        };
        updateShot(shotId, updates);
        const shot = shots.find(s => s.id === shotId);
        if (shot) {
            postShotModalRef.current?.openForEdit({ ...shot, ...updates });
        }
    };

    const forceReload = () => {
        console.debug("[RoundTrackingScreen] user requested course reload");
        setReloadCounter(c => c + 1);
    };

    // ── Early returns ─────────────────────────────────────────────────────────

    if (courseDataState.status === "idle" || courseDataState.status === "loading") {
        return <CourseLoadingView />;
    }

    if (courseDataState.status === "error") {
        return <CourseErrorView error={courseDataState.error} onRetry={forceReload} />;
    }

    // hazardActive: hides shot lines / hole path / distance stack while a hazard is inspected.
    const hazardActive = hazardInspection.isActive;
    const dimAlpha = hazardActive ? 0.15 : 1;

    return (
        <Screen useSafeAreaInsets={false} preset="fixed" style={$screen}>
            <MapView
                ref={mapRef}
                style={$map}
                mapType="satellite"
                showsUserLocation={false} // We render our own marker
                onPanDrag={onPanDrag}
                rotateEnabled={false}
                onPress={handleMapPress}
                cameraZoomRange={{
                    minCenterCoordinateDistance: 50, // ~20 yards
                    maxCenterCoordinateDistance: 2000, // ~800 yards
                }}
            >
                {/* Fairways — dimmed while a hazard is focused */}
                {roundSettings.highContrast && courseData?.fairways.map((fairway, index) => (
                    <Polygon
                        key={`fairway-${index}`}
                        coordinates={fairway.coordinates}
                        fillColor={`rgba(144, 238, 144, ${0.4 * dimAlpha})`}
                        strokeColor="none"
                    />
                ))}

                {/* Greens — dimmed while a hazard is focused */}
                {roundSettings.highContrast && courseData?.greens.map((green, index) => (
                    <Polygon
                        key={`green-${index}`}
                        coordinates={green.polygon.map(p => ({ latitude: p.y, longitude: p.x }))}
                        fillColor={
                            hazardActive
                                ? `rgba(0, 128, 0, ${0.4 * dimAlpha})`
                                : green.hole === activeHole.toString()
                                    ? "rgba(0, 255, 0, 0.4)"
                                    : "rgba(0, 128, 0, 0.4)"
                        }
                        strokeColor={`rgba(0, 100, 0, ${dimAlpha})`}
                        strokeWidth={2}
                    />
                ))}

                {/* Small plus-icon grid over the active hole green */}
                {activeGreenPolygon && puttingMode.isPuttingMode && !hazardActive && (
                    <GreenPlusGrid polygon={activeGreenPolygon} />
                )}

                {/* Tee boxes — dimmed while a hazard is focused */}
                {roundSettings.highContrast && courseData?.teeBoxes?.map((tee, index) => (
                    <Polygon
                        key={`tee-${index}`}
                        coordinates={tee.coordinates}
                        fillColor={`rgba(0, 110, 0, ${0.4 * dimAlpha})`}
                        strokeColor={`rgba(0, 80, 0, ${dimAlpha})`}
                        strokeWidth={2}
                    />
                ))}

                {/* Hazards (bunkers + water) — pressable, highlighted when focused */}
                {courseHazards.map((hazard) => {
                    const isFocused = hazard.osmId === hazardInspection.focusedHazardId;
                    const isBunker = hazard.type === "bunker";
                    const featureAlpha = hazardActive && !isFocused ? 0.25 : 1;
                    const paddedCoords = padPolygonCoordinates(hazard.coordinates, 6);

                    return (
                        <React.Fragment key={hazard.osmId}>
                            {/* Expanded hit target so taps near the edge still register */}
                            <Polygon
                                key={`hazard-pad-${hazard.osmId}`}
                                coordinates={paddedCoords}
                                fillColor={'rgba(0,0,0,0.001)'}
                                strokeColor={'rgba(0,0,0,0)'}
                                zIndex={1}
                                tappable
                                onPress={() => !puttingMode.isPuttingMode && hazardInspection.focusHazard(hazard)}
                            />
                            <Polygon
                                key={`hazard-${hazard.osmId}`}
                                coordinates={hazard.coordinates}
                                fillColor={hazardFillColor(isBunker, isFocused, featureAlpha)}
                                strokeColor={hazardStrokeColor(isBunker, isFocused, featureAlpha)}
                                strokeWidth={isFocused ? 3 : 2}
                                zIndex={2}
                                tappable
                                onPress={() => !puttingMode.isPuttingMode && hazardInspection.focusHazard(hazard)}
                            />
                        </React.Fragment>
                    );
                })}

                {/* Active hole path — hidden during hazard mode */}
                {activeHoleData?.holePath && roundSettings.showHolePath && !hazardActive && !puttingMode.isPuttingMode && (
                    <Polyline
                        coordinates={activeHoleData.holePath.coordinates}
                        strokeColor="rgba(255, 255, 255, 0.5)"
                        strokeWidth={2}
                        lineDashPattern={[5, 5]}
                    />
                )}

                {/* Completed shots for this hole — hidden during hazard mode */}
                {!hazardActive && !puttingMode.isPuttingMode && roundSettings.showPreviousShots && (
                    <ShotHistoryOverlay shots={shots.filter(s => s.hole === activeHole)} onShotPress={handleShotPress} />
                )}

                {puttingMode.isPuttingMode && (
                    <PuttingOverlay
                         putts={puttingMode.putts} 
                         pendingPuttStart={puttingMode.pendingPuttStart} 
                         holePinCoord={holePins[activeHole] ?? (activeGreenPolygon ? polygonCentroid(activeGreenPolygon) : null)} 
                         onPinDragEnd={setHolePinForActiveHole}
                         lidar={activeHoleData?.green?.lidar}
                         heatmapMode={heatmapMode}
                    />
                )}

                {/* In-progress shot line — hidden during hazard mode */}
                {!hazardActive && trackingState === "tracking" && currentShotStart && userLocation && !puttingMode.isPuttingMode && (
                    <>
                        <Polyline
                            coordinates={[currentShotStart, userLocation]}
                            strokeColor="rgba(255, 0, 0, 0.8)"
                            strokeWidth={3}
                        />
                        <Marker coordinate={currentShotStart}>
                            <View style={themed($shotStartMarker)} />
                        </Marker>
                    </>
                )}

                {/* User location dot — tracking mode uses PlayerTrackingOverlay instead.
                 Only rendered when we have a fix, GPS is off, and not in putting mode. */}
                {userLocation && !playerTracking.isTracking && roundSettings.gpsEnabled && !puttingMode.isPuttingMode && (
                    <Marker
                        coordinate={userLocation}
                        anchor={{ x: 0.5, y: 0.5 }}
                        tracksViewChanges={false}
                    >
                        <View style={$playerMarker} />
                    </Marker>
                )}

                {/* Player tracking overlays (target pin, hole pin) — hidden during hazard mode.
                     Renders in limp state (no GPS fix yet) to still show the pin. */}
                {!hazardActive && !puttingMode.isPuttingMode && activeGreenPolygon && (
                    <PlayerTrackingOverlay
                        userLocation={userLocation}
                        gpsEnabled={roundSettings.gpsEnabled}
                        greenPolygon={activeGreenPolygon}
                        target={playerTracking.target}
                        onTargetDragEnd={playerTracking.setTargetCoordinate}
                        onTargetPress={() => playerTracking.setTargetCoordinate(null)}
                        holePinCoord={holePins[activeHole] ?? null}
                        onHolePinChange={setHolePinForActiveHole}
                    />
                )}

                {/* Hazard distance labels (front / back) rendered at the hazard edges */}
                {hazardActive && (hazardInspection.mode.kind === "tap" || hazardInspection.mode.kind === "cycle") && hazardInspection.distances && (
                    <HazardMapLabels
                        hazard={hazardInspection.mode.hazard}
                        userLocation={userLocation}
                        heading={currentHeadingRef.current}
                        min={hazardInspection.distances.min}
                        max={hazardInspection.distances.max}
                    />
                )}
            </MapView>

            {/* ── Overlays ─────────────────────────────────────────────── */}
            <RoundHeader setHoleNumber={setActiveHole} onPuttingExit={handleExitPuttingMode} isPutting={puttingMode.isPuttingMode} prevHole={prevHole} activeHole={activeHole} nextHole={nextHole} onExit={() => confirmExitModalRef.current?.present()} />
            
            <RoundActions
                trackingState={trackingState}
                startTracking={openShotDetails}
                endTracking={handleEndTracking}
                onSettingsPress={() => sideSheetRef.current?.present()}
                onGreenViewPress={handleGreenViewPress}
                isActive={!puttingMode.isPuttingMode}
                onScorecardPress={() => scorecardModalRef.current?.present()}
            />

            <PuttingActionBar
                isActive={puttingMode.isPuttingMode}
                hasPendingPutt={!!puttingMode.pendingPuttStart}
                onSavePutt={handleSavePutt}
                onUndoPress={handlePuttUndo}
                onGPSPress={() => {
                    puttingMode.setPendingPuttStart(userLocation);
                }}
                heatmapMode={heatmapMode}
                onHeatmapToggle={cycleHeatmapMode}
                hasLidar={!!activeHoleData?.green?.lidar}
            />

            {/* Green distances — visible only when no hazard is focused */}
            <GreenDistanceStack distances={liveGreenDistances} isActive={!hazardActive && !puttingMode.isPuttingMode} />

            {/* Hazard overlay — type label + nav controls (distances are drawn on the map) */}
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

            {/* Recenter button — shown when panned away or during hazard mode */}
            {(isPannedAway || hazardActive) && (
                <Pressable style={themed($recenterButton)} onPress={recenterScreen}>
                    <Ionicons name="locate" size={30} color={theme.colors.text} />
                </Pressable>
            )}

            {!hazardActive && !puttingMode.isPuttingMode && (
                <Pressable style={themed($scoreButton)} onPress={() => holeSummaryRef.current?.present()}>
                    <EditScorecardIcon size={36} color={theme.colors.text} />
                </Pressable>
            )}

            {/* GPS acquiring banner — shown when GPS is enabled but no fix yet */}
            {roundSettings.gpsEnabled && !userLocation && (
                <View style={themed($gpsAcquiringBanner)}>
                    <ActivityIndicator size="small" color={theme.colors.text} />
                    <Text style={{ color: theme.colors.text, fontSize: 13, marginLeft: 8 }} text="Acquiring GPS…" />
                </View>
            )}

            <ContextFooter 
                currentShot={currentShot} 
                userLocation={userLocation} 
                isPutting={puttingMode.isPuttingMode} 
                holePinCoord={holePins[activeHole]} 
                pendingPuttStart={puttingMode.pendingPuttStart}
                putts={puttingMode.putts.length} />

            <ShotDetailsModal
                reference={modalRef}
                onConfirm={handleConfirmShot}
                onCancel={handleCancelShot}
                onEditConfirm={handleEditIntentConfirm}
                onEditResult={handleEditResultFromIntent}
            />
            <PostShotDetailsModal
                reference={postShotModalRef}
                onConfirm={(result) => {
                    endTracking();
                    addShot(userLocation!, result);
                }}
                onCancel={() => {}}
                onEditConfirm={handleEditResultConfirm}
                onEditIntent={handleEditIntentFromResult}
                />
            <HoleSummaryModal
                reference={holeSummaryRef}
                hole={holes[activeHole]}
                holeShots={shots.filter((s) => s.hole === activeHole)}
                runningScore={runningScore}
                playerName="Hayden Williams"
                onCommit={commitHoleSummary}
            />
            <ScorecardModal reference={scorecardModalRef} holes={holes}/>
            <SettingsModal sideSheetRef={sideSheetRef} settings={roundSettings} onChange={setRoundSettings} />
            <ConfirmExitModal 
                reference={confirmExitModalRef} 
                onSave={() => {}} 
                onDelete={() => router.back()} />
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

const $centeredFill: ViewStyle = {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
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

const $playerMarker: ViewStyle = {
  width: 24,
  height: 24,
  borderRadius: 999,
  backgroundColor: "#4A90D9",
  borderWidth: 3,
  borderColor: "#ffffff",
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.4,
  shadowRadius: 2,
  elevation: 4,
};

const $shotStartMarker: ThemedStyle<ViewStyle> = (theme) => ({
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "gray",
    borderWidth: 2,
    borderColor: "white",
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
