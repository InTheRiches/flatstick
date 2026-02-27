import { Ionicons } from "@expo/vector-icons";
import { getFirestore } from "@react-native-firebase/firestore";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View, ViewStyle } from "react-native";
import MapView, { Marker, Polygon, Polyline } from "react-native-maps";

import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";
import { useAppTheme } from "@/theme/context";
import type { ThemedStyle } from "@/theme/types";

import type { CourseSelectionDetails } from "@/components/app/golf/modals/SelectCourseDetailsModal";
import ShotDetailsModal, { type ShotDetailsModalReference } from "@/components/app/golf/modals/ShotDetailsModal";
import { RoundActions } from "@/components/app/golf/round/RoundActions";
import { RoundHeader } from "@/components/app/golf/round/RoundHeader";
import { GreenDistanceStack } from "@/components/app/golf/tracking/GreenDistanceStack";
import { HazardDistanceOverlay } from "@/components/app/golf/tracking/HazardDistanceOverlay";
import { HazardMapLabels } from "@/components/app/golf/tracking/HazardMapLabels";
import { PlayerTrackingOverlay } from "@/components/app/golf/tracking/PlayerTrackingOverlay";
import { isPointInPolygon } from "@/components/putting-green";
import { useCourseData } from "@/hooks/courses/useCourseData";
import { useCourseMap } from "@/hooks/courses/useCourseMap";
import { useHazardInspection } from "@/hooks/courses/useHazardInspection";
import { useLocationTracking } from "@/hooks/courses/useLocationTracking";
import { usePlayerTracking } from "@/hooks/courses/usePlayerTracking";
import { useRoundTracking, type Shot } from "@/hooks/courses/useRoundTracking";
import type { LatLng } from "@/models/geo";
import type { CourseLoadError } from "@/services/courses/courseLoader";
import {
    greenDistances,
    type GreenDistances,
} from "@/utils/courses/geometry/distance.utils";
import { padPolygonCoordinates } from "@/utils/courses/geometry/polygon.utils";
import { formatCourseLoadError } from "@/utils/courses/round/error.formatter";

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

// ── Main screen ───────────────────────────────────────────────────────────────

interface RoundTrackingScreenProps {
    course: CourseSelectionDetails | null;
}

export const RoundTrackingScreen: React.FC<RoundTrackingScreenProps> = ({ course }) => {
    const { theme, themed } = useAppTheme();
    const db = getFirestore();

    const [reloadCounter, setReloadCounter] = useState(0);

    const courseLocation: LatLng | null = useMemo(() => {
        const loc = course?.selectedCourse.location;
        if (!loc) return null;
        return { latitude: loc.latitude, longitude: loc.longitude };
    }, [course?.selectedCourse.location]);

    // Pass cacheMaxAgeMs to force reload when retry is pressed (0 forces a re-fetch)
    const cacheMaxAgeMs = reloadCounter > 0 ? 0 : undefined;
    const courseDataState = useCourseData(courseLocation, db, cacheMaxAgeMs);
    const courseData = courseDataState.status === "success" ? courseDataState.data : null;

    const { userLocation, setLocation } = useLocationTracking(); // TODO REMOVE THIS AND USE REAL LOCATION
    const {
        activeHole,
        nextHole,
        prevHole,
        shots,
        addShot,
        trackingState,
        startTracking,
        endTracking,
        currentShotStart,
    } = useRoundTracking(1, courseData?.holes.length ?? 0); // TODO if it cant load the hole length trigger an error state

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
        return greenDistances(userLocation, activeGreenPolygon);
    }, [userLocation, activeGreenPolygon]);

    // ── Hazard inspection ─────────────────────────────────────────────────────
    const courseHazards = courseData?.hazards ?? [];
    const hazardInspection = useHazardInspection(mapRef, courseHazards, userLocation, currentHeadingRef);

    const recenterScreen = () => {
        if (playerTracking.isTracking) {
            playerTracking.recenterOnUser();
            resetPannedState();
        } else {
            recenterOnHole();
        }
    };

    // ── Tap handler for placing / updating intermediate target ─────────────────
    const handleMapPress = (e: { nativeEvent: { coordinate: LatLng } }) => {
        // If the tap lands inside any hazard polygon (with padding), let the hazard handle it.
        const tappedHazard = courseHazards.some((hazard) =>
            isPointInPolygon(e.nativeEvent.coordinate, padPolygonCoordinates(hazard.coordinates, 6))
        );
        if (tappedHazard) return;

        if (hazardInspection.mode.kind === "tap") {
            hazardInspection.exitHazardMode();
            recenterScreen();

            return;
        }
        if (!playerTracking.isTracking) return;

        // check if the user tapped the target pin, if so clear the target instead of setting a new one
        if (playerTracking.target && isPointInPolygon(e.nativeEvent.coordinate, padPolygonCoordinates([playerTracking.target.coordinate], 10))) {
            playerTracking.setTargetCoordinate(null);
            return;
        }
        playerTracking.setTargetCoordinate(e.nativeEvent.coordinate);
    };

    const modalRef = useRef<ShotDetailsModalReference>(null);

    useEffect(() => {
        if (courseDataState.status === "success") {
            recenterOnHole();
        }
    }, [courseDataState.status]);

    useEffect(() => {
        // clear any hazard view when changing holes
        hazardInspection.exitHazardMode();

        if (playerTracking.isTracking) {
            return;
        }
        
        recenterOnHole();
    }, [activeHole]);

    const handleStartTracking = () => {
        if (userLocation) {
            startTracking(userLocation);
        }
    };

    const handleEndTracking = () => {
        modalRef.current?.open();
    };

    const handleConfirmShot = (details: Pick<Shot, "lie" | "club" | "goal" | "shotShape">) => {
        if (currentShotStart && userLocation) {
            // Calculate distance (simplified for now, should use proper haversine formula)
            const distance = 0; // Placeholder

            addShot({
                holeNumber: activeHole,
                shotNumber: shots.filter(s => s.holeNumber === activeHole).length + 1,
                startLocation: currentShotStart,
                endLocation: userLocation,
                distance,
                ...details,
            });
        }
        endTracking();
    };

    const handleCancelShot = () => {
        endTracking();
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
                onPress={handleMapPress}
            >
                {/* Fairways — dimmed while a hazard is focused */}
                {courseData?.fairways.map((fairway, index) => (
                    <Polygon
                        key={`fairway-${index}`}
                        coordinates={fairway.coordinates}
                        fillColor={`rgba(144, 238, 144, ${0.4 * dimAlpha})`}
                        strokeColor="none"
                    />
                ))}

                {/* Greens — dimmed while a hazard is focused */}
                {courseData?.greens.map((green, index) => (
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

                {/* Tee boxes — dimmed while a hazard is focused */}
                {courseData?.teeBoxes?.map((tee, index) => (
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
                                onPress={() => hazardInspection.focusHazard(hazard)}
                            />
                            <Polygon
                                key={`hazard-${hazard.osmId}`}
                                coordinates={hazard.coordinates}
                                fillColor={hazardFillColor(isBunker, isFocused, featureAlpha)}
                                strokeColor={hazardStrokeColor(isBunker, isFocused, featureAlpha)}
                                strokeWidth={isFocused ? 3 : 2}
                                zIndex={2}
                                tappable
                                onPress={() => hazardInspection.focusHazard(hazard)}
                            />
                        </React.Fragment>
                    );
                })}

                {/* Active hole path — hidden during hazard mode */}
                {activeHoleData?.holePath && !hazardActive && (
                    <Polyline
                        coordinates={activeHoleData.holePath.coordinates}
                        strokeColor="rgba(255, 255, 255, 0.5)"
                        strokeWidth={2}
                        lineDashPattern={[5, 5]}
                    />
                )}

                {/* Completed shots for this hole — hidden during hazard mode */}
                {!hazardActive && shots.filter(s => s.holeNumber === activeHole).map((shot) => (
                    <Polyline
                        key={shot.id}
                        coordinates={[shot.startLocation, shot.endLocation]}
                        strokeColor="rgba(255, 215, 0, 0.8)"
                        strokeWidth={3}
                    />
                ))}

                {/* In-progress shot line — hidden during hazard mode */}
                {!hazardActive && trackingState === "tracking" && currentShotStart && userLocation && (
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

                {/* User location dot — tracking mode uses PlayerTrackingOverlay instead */}
                {userLocation && !playerTracking.isTracking && (
                    <Marker coordinate={userLocation}>
                        <View style={themed($userMarker)} />
                    </Marker>
                )}

                {/* Player tracking overlays (target pin, hole pin) — hidden during hazard mode */}
                {!hazardActive && playerTracking.isTracking && userLocation && activeGreenPolygon && (
                    <PlayerTrackingOverlay
                        userLocation={userLocation}
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
            <RoundHeader prevHole={prevHole} activeHole={activeHole} nextHole={nextHole} />

            <RoundActions
                trackingState={trackingState}
                startTracking={() => {
                    handleStartTracking();
                    setLocation({
                        latitude: 42.20341546049192, 
                        longitude: -85.62860167651073
                    })
                }}
                endTracking={handleEndTracking}
                isPlayerTracking={playerTracking.isTracking}
                onPlayerTrackingToggle={playerTracking.toggleTracking}
            />

            {/* Green distances — visible only when tracking and no hazard is focused */}
            {playerTracking.isTracking && !hazardActive && (
                <GreenDistanceStack distances={liveGreenDistances} />
            )}

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
                    <Ionicons name="locate" size={24} color={theme.colors.text} />
                </Pressable>
            )}

            <ShotDetailsModal
                reference={modalRef}
                onConfirm={handleConfirmShot}
                onCancel={handleCancelShot}
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

const $centeredFill: ViewStyle = {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
};

const $recenterButton: ThemedStyle<ViewStyle> = (theme) => ({
    position: "absolute",
    bottom: 180,
    left: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.backgrounds.elevated,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
});

const $userMarker: ThemedStyle<ViewStyle> = (theme) => ({
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.tint,
    borderWidth: 2,
    borderColor: "white",
});

const $shotStartMarker: ThemedStyle<ViewStyle> = (theme) => ({
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "gray",
    borderWidth: 2,
    borderColor: "white",
});
