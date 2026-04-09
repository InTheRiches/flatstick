import React from "react";
import { View, type ViewStyle } from "react-native";
import { Marker, Polygon, Polyline } from "react-native-maps";

import type { HeatmapMode } from "@/components/app/golf/putting/PuttingOverlay";
import { PuttingOverlay } from "@/components/app/golf/putting/PuttingOverlay";
import type { HazardInspectionState } from "@/hooks/courses/useHazardInspection";
import type { IntermediateTarget } from "@/hooks/courses/usePlayerTracking";
import type { CourseData, Hazard } from "@/models/course";
import type { LatLng, XYPoint } from "@/models/geo";
import type { LiveShotAttempt } from "@/models/round.live.types";
import type { RoundTrackingSettings, ShotEditState } from "@/types/roundTracking";
import { polygonCentroid } from "@/utils/courses/geometry/distance.utils";
import { padPolygonCoordinates } from "@/utils/courses/geometry/polygon.utils";
import {
    hazardFillColor,
    hazardStrokeColor,
} from "@/utils/courses/round/roundTracking.utils";

import { GreenPlusGrid } from "./GreenPlusGrid";
import { HazardMapLabels } from "./HazardMapLabels";
import { usePlayerTrackingOverlay } from "./PlayerTrackingOverlay";
import { ShotEditMapOverlay } from "./ShotEditMapOverlay";
import { ShotHistoryOverlay } from "./ShotHistoryOverlay";

type CompletedShot = LiveShotAttempt & { end: NonNullable<LiveShotAttempt["end"]> };
const EMPTY_GREEN_POLYGON: XYPoint[] = [];

interface RoundTrackingMapLayersProps {
    activeHole: number;
    activeHoleData: {
        green?: CourseData["greens"][number];
        holePath?: CourseData["holes"][number];
    } | null;
    activeGreenPolygon: XYPoint[] | null;
    courseData: CourseData | null;
    courseHazards: Hazard[];
    currentHeading: number;
    currentShotStart: LatLng | null;
    displayTarget: IntermediateTarget | null;
    editingShot: CompletedShot | null;
    hazardActive: boolean;
    hazardInspection: HazardInspectionState;
    heatmapMode: HeatmapMode;
    holePinCoord: LatLng | null;
    isShotEditing: boolean;
    isTargetEditing: boolean;
    playerTrackingIsTracking: boolean;
    puttingMode: {
        isPuttingMode: boolean;
        pendingPuttStart: LatLng | null;
        putts: LiveShotAttempt[];
    };
    roundSettings: RoundTrackingSettings;
    shotEditState: ShotEditState | null;
    shotsForHole: LiveShotAttempt[];
    trackingState: "idle" | "tracking";
    userLocation: LatLng | null;
    onClearTarget: () => void;
    onFocusHazard: (hazard: Hazard) => void;
    onHolePinChange: (coord: LatLng | null) => void;
    onSaveTargetMove: () => void;
    onShotPress: (shot: LiveShotAttempt) => void;
    onStartTargetMove: () => void;
}

export const RoundTrackingMapLayers: React.FC<RoundTrackingMapLayersProps> = ({
    activeHole,
    activeHoleData,
    activeGreenPolygon,
    courseData,
    courseHazards,
    currentHeading,
    currentShotStart,
    displayTarget,
    editingShot,
    hazardActive,
    hazardInspection,
    heatmapMode,
    holePinCoord,
    isShotEditing,
    isTargetEditing,
    playerTrackingIsTracking,
    puttingMode,
    roundSettings,
    shotEditState,
    shotsForHole,
    trackingState,
    userLocation,
    onClearTarget,
    onFocusHazard,
    onHolePinChange,
    onSaveTargetMove,
    onShotPress,
    onStartTargetMove,
}) => {
    const dimAlpha = hazardActive ? 0.15 : 1;
    const playerTrackingOverlay = usePlayerTrackingOverlay({
        userLocation,
        gpsEnabled: roundSettings.gpsEnabled,
        greenPolygon: activeGreenPolygon ?? EMPTY_GREEN_POLYGON,
        target: displayTarget,
        onTargetPress: onSaveTargetMove,
        onTargetMovePress: onStartTargetMove,
        onTargetClearPress: onClearTarget,
        isTargetEditing,
        holePinCoord,
        onHolePinChange,
    });

    return (
        <>
            {roundSettings.highContrast && courseData?.fairways.map((fairway, index) => (
                <Polygon
                    key={`fairway-${index}`}
                    coordinates={fairway.coordinates}
                    fillColor={`rgba(144, 238, 144, ${0.4 * dimAlpha})`}
                    strokeColor="none"
                />
            ))}

            {roundSettings.highContrast && courseData?.greens.map((green, index) => (
                <Polygon
                    key={`green-${index}`}
                    coordinates={green.polygon.map((point) => ({ latitude: point.y, longitude: point.x }))}
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

            {activeGreenPolygon && puttingMode.isPuttingMode && !hazardActive && !isShotEditing && (
                <GreenPlusGrid polygon={activeGreenPolygon} />
            )}

            {roundSettings.highContrast && courseData?.teeBoxes?.map((tee, index) => (
                <Polygon
                    key={`tee-${index}`}
                    coordinates={tee.coordinates}
                    fillColor={`rgba(0, 110, 0, ${0.4 * dimAlpha})`}
                    strokeColor={`rgba(0, 80, 0, ${dimAlpha})`}
                    strokeWidth={2}
                />
            ))}

            {courseHazards.map((hazard) => {
                const isFocused = hazard.osmId === hazardInspection.focusedHazardId;
                const isBunker = hazard.type === "bunker";
                const featureAlpha = hazardActive && !isFocused ? 0.25 : 1;
                const paddedCoords = padPolygonCoordinates(hazard.coordinates, 6);

                return (
                    <React.Fragment key={hazard.osmId}>
                        <Polygon
                            coordinates={paddedCoords}
                            fillColor="rgba(0,0,0,0.001)"
                            strokeColor="rgba(0,0,0,0)"
                            zIndex={1}
                            tappable
                            onPress={() => !puttingMode.isPuttingMode && !isShotEditing && onFocusHazard(hazard)}
                        />
                        <Polygon
                            coordinates={hazard.coordinates}
                            fillColor={hazardFillColor(isBunker, isFocused, featureAlpha)}
                            strokeColor={hazardStrokeColor(isBunker, isFocused, featureAlpha)}
                            strokeWidth={isFocused ? 3 : 2}
                            zIndex={2}
                            tappable
                            onPress={() => !puttingMode.isPuttingMode && !isShotEditing && onFocusHazard(hazard)}
                        />
                    </React.Fragment>
                );
            })}

            {activeHoleData?.holePath && roundSettings.showHolePath && !hazardActive && !puttingMode.isPuttingMode && !isShotEditing && (
                <Polyline
                    coordinates={activeHoleData.holePath.coordinates}
                    strokeColor="rgba(255, 255, 255, 0.5)"
                    strokeWidth={2}
                    lineDashPattern={[5, 5]}
                />
            )}

            {!hazardActive && isShotEditing && shotEditState && editingShot && (
                <ShotEditMapOverlay
                    shot={editingShot}
                    start={shotEditState.draftStart}
                    end={shotEditState.draftEnd}
                    activePoint={shotEditState.activePoint}
                />
            )}

            {!hazardActive && !puttingMode.isPuttingMode && !isShotEditing && roundSettings.showPreviousShots && (
                <ShotHistoryOverlay shots={shotsForHole} onShotPress={onShotPress} />
            )}

            {puttingMode.isPuttingMode && !isShotEditing && (
                <PuttingOverlay
                    putts={puttingMode.putts}
                    pendingPuttStart={puttingMode.pendingPuttStart}
                    holePinCoord={holePinCoord ?? (activeGreenPolygon ? polygonCentroid(activeGreenPolygon) : null)}
                    onPinDragEnd={onHolePinChange}
                    lidar={activeHoleData?.green?.lidar}
                    heatmapMode={heatmapMode}
                />
            )}

            {!hazardActive && trackingState === "tracking" && currentShotStart && userLocation && !puttingMode.isPuttingMode && !isShotEditing && (
                <>
                    <Polyline
                        coordinates={[currentShotStart, userLocation]}
                        strokeColor="rgba(255, 0, 0, 0.8)"
                        strokeWidth={3}
                    />
                    <Marker coordinate={currentShotStart}>
                        <View style={$shotStartMarker} />
                    </Marker>
                </>
            )}

            {userLocation && !playerTrackingIsTracking && roundSettings.gpsEnabled && !puttingMode.isPuttingMode && !isShotEditing && (
                <Marker
                    coordinate={userLocation}
                    anchor={{ x: 0.5, y: 0.5 }}
                    tracksViewChanges={false}
                >
                    <View style={$playerMarker} />
                </Marker>
            )}

            {!hazardActive && !puttingMode.isPuttingMode && !isShotEditing && activeGreenPolygon && (
                playerTrackingOverlay
            )}

            {hazardActive && (hazardInspection.mode.kind === "tap" || hazardInspection.mode.kind === "cycle") && hazardInspection.distances && (
                <HazardMapLabels
                    hazard={hazardInspection.mode.hazard}
                    userLocation={userLocation}
                    heading={currentHeading}
                    min={hazardInspection.distances.min}
                    max={hazardInspection.distances.max}
                />
            )}
        </>
    );
};

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

const $shotStartMarker: ViewStyle = {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "gray",
    borderWidth: 2,
    borderColor: "white",
};
