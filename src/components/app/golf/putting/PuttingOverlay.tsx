import { Text } from '@/components/ui/Text';
import type { LatLng } from '@/models/geo';
import type { LidarGrid } from '@/models/lidar';
import type { LiveShotAttempt } from '@/models/round.live.types';
import { haversineMeters } from '@/utils/courses/geometry/distance.utils';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { TextStyle, View, ViewStyle } from 'react-native';
import { Marker, Polyline } from 'react-native-maps';

export type HeatmapMode = 'none' | 'elevation' | 'slope';

interface PuttingOverlayProps {
    putts: LiveShotAttempt[];
    pendingPuttStart: LatLng | null;
    holePinCoord: LatLng | null;
    onPinDragEnd: (coord: LatLng) => void;
    lidar?: LidarGrid | null;
    heatmapMode?: HeatmapMode;
}

export const PuttingOverlay: React.FC<PuttingOverlayProps> = ({
    putts,
    pendingPuttStart,
    holePinCoord,
    onPinDragEnd,
    lidar,
    heatmapMode = 'none',
}) => {
    const pendingDistance = useMemo(() => {
        if (!pendingPuttStart || !holePinCoord) return null;
        const distM = haversineMeters(pendingPuttStart, holePinCoord);
        return Math.round(toFeet(distM));
    }, [pendingPuttStart, holePinCoord]);

    function midpoint(coord1: LatLng, coord2: LatLng): LatLng {
        return {
            latitude: (coord1.latitude + coord2.latitude) / 2,
            longitude: (coord1.longitude + coord2.longitude) / 2,
        };
    }

    function toFeet(meters: number): number {
        return meters * 3.28084;
    }   

    return (
        <>
            {/* draw a dot on every lidar point */}
            {lidar && (
                lidar.samples.map((point, index) => (
                    <Marker
                        key={index}
                        coordinate={{ latitude: point.location.y, longitude: point.location.x }}
                        anchor={{ x: 0.5, y: 0.5 }}
                    >
                        <View style={{
                            width: 4,
                            height: 4,
                            borderRadius: 2,
                            backgroundColor: `rgb(255, 0, 0)`,
                        }} />
                    </Marker>
                ))
            )}

            {/* Hole Pin / Flag */}
            {holePinCoord && (
                <Marker
                    coordinate={holePinCoord}
                    anchor={{ x: 0.5, y: 1 }}
                    draggable
                    onDragEnd={(e) => onPinDragEnd(e.nativeEvent.coordinate)}
                    tracksViewChanges={true}
                >
                    <View style={$holeMarker}>
                        <Ionicons name="flag" size={18} color="#ffffff" />
                    </View>
                </Marker>
            )}

            {/* Existing Putts */}
            {holePinCoord && putts.map((putt, index) => {
                const puttEndCoord = index === putts.length - 1 ? pendingPuttStart ? pendingPuttStart : holePinCoord : putts[index + 1].start.point;
                const dist = putt.distance.intendedToTargetM
                    ? Math.round(toFeet(putt.distance.intendedToTargetM))
                    : Math.round(toFeet(haversineMeters(putt.start.point, puttEndCoord)));

                return (
                    <React.Fragment key={putt.id}>
                        <Polyline
                            coordinates={[putt.start.point, puttEndCoord]}
                            strokeColor="rgba(255, 255, 255, 0.7)"
                            strokeWidth={2}
                        />
                        <Marker coordinate={putt.start.point} anchor={{ x: 0.5, y: 0.5 }}>
                            <View style={$puttMarker}>
                                <Text style={{ fontSize: 10, color: 'white' }}>{index + 1}</Text>
                            </View>
                        </Marker>
                    </React.Fragment>
                );
            })}

            {/* Pending Putt (from currently tapped location or GPS) */}
            {pendingPuttStart && holePinCoord && (
                <>
                    <Polyline
                        coordinates={[pendingPuttStart, holePinCoord]}
                        strokeColor="rgba(255, 235, 59, 1)"
                        strokeWidth={3}
                        lineDashPattern={[5, 5]}
                    />
                    <Marker coordinate={pendingPuttStart} anchor={{ x: 0.5, y: 0.5 }}>
                        <View style={$pendingPuttMarker} />
                    </Marker>
                    {pendingDistance !== null && (
                        <Marker coordinate={pendingDistance > 35 ? midpoint(pendingPuttStart, holePinCoord) : pendingPuttStart} anchor={{ x: 0.5, y: -0.5 }} centerOffset={{x: 0, y: pendingDistance <= 35 ? -25 : 0}}>
                            <View style={$labelWrapper}>
                                <Text style={$labelText}>{pendingDistance} ft</Text>
                            </View>
                        </Marker>
                    )}
                </>
            )}
        </>
    );
};

export const $puttMarker: ViewStyle = {
  width: 18,
  height: 18,
  borderRadius: 9,
  backgroundColor: 'rgba(255, 255, 255, 0.3)',
  borderWidth: 2,
  borderColor: '#fff',
  justifyContent: 'center',
  alignItems: 'center',
};

export const $pendingPuttMarker: ViewStyle = {
  width: 16,
  height: 16,
  borderRadius: 8,
  backgroundColor: '#FFEB3B',
  borderWidth: 2,
  borderColor: '#fff',
};

const $holeMarker: ViewStyle = {
  width: 32,
  height: 32,
  borderRadius: 16,
  backgroundColor: "#1A7F37",
  alignItems: "center",
  justifyContent: "center",
  borderWidth: 2,
  borderColor: "#ffffff",
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.4,
  shadowRadius: 2,
  elevation: 4,
};

export const $labelWrapper: ViewStyle = {
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  paddingHorizontal: 4,
  borderRadius: 8,
};

export const $labelText: TextStyle = {
  color: '#fff',
  fontSize: 12,
  fontWeight: 'bold',
};
    