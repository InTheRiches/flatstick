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
import { useCourseData } from "@/hooks/courses/useCourseData";
import { useCourseMap } from "@/hooks/courses/useCourseMap";
import { useLocationTracking } from "@/hooks/courses/useLocationTracking";
import { useRoundTracking, type Shot } from "@/hooks/courses/useRoundTracking";
import type { LatLng } from "@/models/geo";
import type { CourseLoadError } from "@/services/courses/courseLoader";

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

    // Debug: log when the course location or selected id changes
    useEffect(() => {
        console.debug("[RoundTrackingScreen] courseLocation changed", { courseLocation, selectedCourseId: course?.selectedCourse?.id });
    }, [courseLocation, course?.selectedCourse?.id]);

    // Pass cacheMaxAgeMs to force reload when retry is pressed (0 forces a re-fetch)
    const cacheMaxAgeMs = reloadCounter > 0 ? 0 : undefined;
    const courseDataState = useCourseData(courseLocation, db, cacheMaxAgeMs);
    const courseData = courseDataState.status === "success" ? courseDataState.data : null;

    // Debug: log state changes from the hook so we can see errors in console
    useEffect(() => {
        console.debug("[RoundTrackingScreen] courseDataState change", courseDataState);
        if (courseDataState.status === "success") {
            console.debug("[RoundTrackingScreen] course loaded", { osmId: courseDataState.data.osmId, greens: courseDataState.data.greens.length });
        } else if (courseDataState.status === "error") {
            console.debug("[RoundTrackingScreen] course load error", courseDataState.error);
        }
    }, [courseDataState]);

    const { userLocation } = useLocationTracking();
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
    } = useRoundTracking(1); // todo make sure it cant exceed 9 holes if 9 hole course (gleneagles golf course for example)

    const { mapRef, activeHoleData, recenterOnHole, isPannedAway, onPanDrag } = useCourseMap(courseData, activeHole);

    const modalRef = useRef<ShotDetailsModalReference>(null);

    useEffect(() => {
        if (courseDataState.status === "success") {
            recenterOnHole();
        }
    }, [courseDataState.status, activeHole, recenterOnHole]);

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

    function formatCourseLoadError(error: CourseLoadError | undefined): { title: string; message: string; details?: string } {
        if (!error) {
            return { title: "Unknown error", message: "An unknown error occurred while loading the course." };
        }

        switch (error.type) {
            case "no_osm_result":
                return {
                    title: "Course not found",
                    message: "No OpenStreetMap course could be located near your position.",
                    details: "No OSM candidates were returned for the given coordinates.",
                };
            case "osm_ambiguous":
                return {
                    title: "Multiple courses found",
                    message: `Multiple possible courses were found (${error.candidates.length}). The first candidate was used but it may be incorrect.`,
                    details: `Candidates: ${JSON.stringify(error.candidates, null, 2)}`,
                };
            case "osm_fetch_failed":
                return {
                    title: "OSM fetch failed",
                    message: "Failed to fetch course geometry from OpenStreetMap.",
                    details: `Cause: ${String((error as any).cause)}`,
                };
            case "no_greens_identified":
                return {
                    title: "Course parsing failed",
                    message: `No greens were identified in the OSM data (unmatched: ${error.unmatchedCount}).`,
                    details: `Unmatched greens: ${error.unmatchedCount}`,
                };
            case "network_error":
                return {
                    title: "Network error",
                    message: "A network error occurred while loading course data.",
                    details: `Cause: ${String((error as any).cause)}`,
                };
            default:
                return { title: "Load error", message: `Error type: ${(error as any).type}`, details: JSON.stringify(error) };
        }
    }

    if (courseDataState.status === "idle" || courseDataState.status === "loading") {
        return (
            <Screen>
                <View style={$centeredFill}>
                    <ActivityIndicator size="large" color={theme.colors.tint} />
                    <Text style={{ marginTop: 12, color: theme.colors.textDim }} text="Loading course data…" />
                </View>
            </Screen>
        );
    }

    if (courseDataState.status === "error") {
        const info = formatCourseLoadError(courseDataState.error);
        return (
            <Screen>
                <View style={$centeredFill}>
                    <Ionicons name="alert-circle-outline" size={48} color={theme.colors.error} />
                    <Text
                        style={{ marginTop: 12, color: theme.colors.textDim, textAlign: "center" }}
                        text={info.title}
                    />
                    <Text
                        style={{ marginTop: 8, color: theme.colors.textDim, textAlign: "center" }}
                        text={info.message}
                    />

                    {info.details ? (
                        <View style={{ marginTop: 12, paddingHorizontal: 12 }}>
                            <Text
                                style={{ color: theme.colors.textDim, fontSize: 12, textAlign: "center" }}
                                text={String(info.details)}
                            />
                        </View>
                    ) : null}

                    <View style={{ marginTop: 20, width: 220 }}>
                        <Button text="Retry" preset="filled" onPress={forceReload} />
                    </View>
                </View>
            </Screen>
        );
    }

    return (
        <Screen useSafeAreaInsets={false} preset="fixed" style={$screen}>
            <MapView
                ref={mapRef}
                style={$map}
                mapType="satellite"
                showsUserLocation={false} // We render our own marker
                onPanDrag={onPanDrag}
            >
                {/* Render Fairways, stroke used to be rgba(144, 238, 144, 0.8) */}
                {courseData?.fairways.map((fairway, index) => (
                    <Polygon
                        key={`fairway-${index}`}
                        coordinates={fairway.coordinates}
                        fillColor="rgba(144, 238, 144, 0.4)"
                        strokeColor="none"
                    />
                ))}

                {/* Render Bunkers */}
                {courseData?.bunkers.map((bunker, index) => (
                    <Polygon
                        key={`bunker-${index}`}
                        coordinates={bunker.coordinates}
                        fillColor="rgba(245, 222, 179, 0.8)"
                        strokeColor="rgb(175, 143, 100)"
                        strokeWidth={2}
                    />
                ))}

                {/* Render Greens */}
                {courseData?.greens.map((green, index) => (
                    <Polygon
                        key={`green-${index}`}
                        coordinates={green.polygon.map(p => ({ latitude: p.y, longitude: p.x }))}
                        fillColor={green.hole === activeHole.toString() ? "rgba(0, 255, 0, 0.4)" : "rgba(0, 128, 0, 0.4)"}
                        strokeColor="rgba(0, 100, 0, 1)"
                        strokeWidth={2}
                    />
                ))}

                {/* Render Tee Boxes */}
                {courseData?.teeBoxes?.map((tee, index) => (
                    <Polygon
                        key={`tee-${index}`}
                        coordinates={tee.coordinates}
                        fillColor="rgba(0, 110, 0, 0.4)"
                        strokeColor="rgba(0, 80, 0, 1)"
                        strokeWidth={2}
                    />
                ))}

                {/* Render Active Hole Path */}
                {activeHoleData?.holePath && (
                    <Polyline
                        coordinates={activeHoleData.holePath.coordinates}
                        strokeColor="rgba(255, 255, 255, 0.5)"
                        strokeWidth={2}
                        lineDashPattern={[5, 5]}
                    />
                )}

                {/* Render Shots */}
                {shots.filter(s => s.holeNumber === activeHole).map((shot) => (
                    <Polyline
                        key={shot.id}
                        coordinates={[shot.startLocation, shot.endLocation]}
                        strokeColor="rgba(255, 215, 0, 0.8)"
                        strokeWidth={3}
                    />
                ))}

                {/* Render Current Shot Tracking */}
                {trackingState === "tracking" && currentShotStart && userLocation && (
                    <Polyline
                        coordinates={[currentShotStart, userLocation]}
                        strokeColor="rgba(255, 0, 0, 0.8)"
                        strokeWidth={3}
                        lineDashPattern={[10, 10]}
                    />
                )}

                {/* Render User Location */}
                {userLocation && (
                    <Marker coordinate={userLocation}>
                        <View style={themed($userMarker)} />
                    </Marker>
                )}
            </MapView>

            {/* Top Overlay: Hole Navigation */}
            <RoundHeader prevHole={prevHole} activeHole={activeHole} nextHole={nextHole} />

            <RoundActions />

            {/* Floating Recenter Button */}
            {isPannedAway && (
                <Pressable style={themed($recenterButton)} onPress={recenterOnHole}>
                    <Ionicons name="locate" size={24} color={theme.colors.text} />
                </Pressable>
            )}

            {/* Bottom Overlay: Tracking Controls */}
            <View style={themed($bottomOverlay)}>
                {trackingState === "idle" ? (
                    <Button
                        text="Start Shot Tracking"
                        preset="filled"
                        onPress={handleStartTracking}
                        disabled={!userLocation}
                        style={$actionButton}
                    />
                ) : (
                    <Button
                        text="End Shot Tracking"
                        preset="filled"
                        onPress={handleEndTracking}
                        style={[$actionButton, { backgroundColor: theme.colors.error }]}
                    />
                )}

                <Button
                    text="Enter Putting Mode"
                    preset="default"
                    onPress={() => console.log("Navigate to putting mode")}
                    style={$actionButton}
                />
            </View>

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

const $bottomOverlay: ThemedStyle<ViewStyle> = (theme) => ({
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
    gap: 12,
});

const $actionButton: ViewStyle = {
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
};

const $recenterButton: ThemedStyle<ViewStyle> = (theme) => ({
    position: "absolute",
    bottom: 180,
    right: 20,
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
