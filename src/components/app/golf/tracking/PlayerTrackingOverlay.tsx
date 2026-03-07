/**
 * PlayerTrackingOverlay
 *
 * Map-level overlays rendered inside <MapView> while player-tracking mode is
 * active.  Receives only the props it needs; the parent (RoundTrackingScreen)
 * owns all state.
 *
 * Renders:
 *   • User location circle marker (replaces the default dot during tracking)
 *   • Green-center hole marker  (flag icon)
 *   • Straight black distance line from player → green center
 *   • Distance callout at the midpoint
 *   • Draggable intermediate target pin (optional)
 *   • Player→Target and Target→Green lines (when target is present)
 *   • Distance callouts on those segments
 */

import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TextStyle, View, ViewStyle } from "react-native";
import { Marker, Polyline } from "react-native-maps";

import { Text } from "@/components/ui/Text";
import {
  computeTargetDistances,
  type IntermediateTarget,
} from "@/hooks/courses/usePlayerTracking";
import type { LatLng, XYPoint } from "@/models/geo";
import {
  haversineMeters,
  lerpLatLng,
  polygonCentroid,
  toYards
} from "@/utils/courses/geometry/distance.utils";

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** White text with a black border — readable over any map tile colour. */
function OutlinedLabel({ text }: { text: string }) {
  return (
    <View style={$labelWrapper}>
      <Text style={$labelText} text={text} />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface PlayerTrackingOverlayProps {
  /** Null when GPS is enabled but no fix has arrived yet (limp state). */
  userLocation: LatLng | null;
  greenPolygon: XYPoint[];
  target: IntermediateTarget | null;
  /** Called when the user finishes dragging the target pin. */
  onTargetDragEnd: (coord: LatLng) => void;
  /** Called when the user taps the target pin (removes it). */
  onTargetPress: () => void;
  /** Controlled hole-pin coordinate for this hole (null = use centroid). */
  holePinCoord?: LatLng | null;
  /** Notifies parent when the hole pin is moved (drag). */
  onHolePinChange?: (coord: LatLng | null) => void;
  /**
   * Whether GPS is enabled in the round settings.
   */
  gpsEnabled?: boolean;
}

export const PlayerTrackingOverlay: React.FC<PlayerTrackingOverlayProps> = ({
  userLocation,
  greenPolygon,
  target,
  onTargetDragEnd,
  onTargetPress,
  holePinCoord,
  onHolePinChange,
  gpsEnabled = false,
}) => {
  // ── Target drag ─────────────────────────────────────────────────────────
  // RAF-throttled so we emit at most one re-render per display frame.
  const [dragCoord, setDragCoord] = useState<LatLng | null>(null);
  const rafRef = useRef<number | null>(null);
  const pendingCoordRef = useRef<LatLng | null>(null);

  const handleTargetDrag = useCallback((coord: LatLng) => {
    pendingCoordRef.current = coord;
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      if (pendingCoordRef.current) setDragCoord(pendingCoordRef.current);
      rafRef.current = null;
    });
  }, []);

  // The effective target position: live drag position takes priority.
  const effectiveTargetCoord = dragCoord ?? target?.coordinate ?? null;

  // ── Hole-pin drag ────────────────────────────────────────────────────────
  // The flag marker can be dragged freely. null = use the centroid. The parent
  // can control the pin via `holePinCoord` and receive updates via
  // `onHolePinChange`.
  const centroid = useMemo(() => polygonCentroid(greenPolygon), [greenPolygon]);
  const holeRafRef = useRef<number | null>(null);
  const pendingHoleRef = useRef<LatLng | null>(null);

  const handleHoleDrag = useCallback((coord: LatLng) => {
    pendingHoleRef.current = coord;
    if (holeRafRef.current !== null) return;
    holeRafRef.current = requestAnimationFrame(() => {
      if (pendingHoleRef.current && typeof onHolePinChange === "function") {
        onHolePinChange(pendingHoleRef.current);
      }
      holeRafRef.current = null;
    });
  }, [onHolePinChange]);

  // Effective aim point — parent-controlled pin if provided, otherwise centroid.
  const greenCenter = holePinCoord ?? centroid;

  // Limp state: GPS enabled but no location fix yet. Show pin only.
  const isLimp = !userLocation || !gpsEnabled;

  // Player → green midpoint and distance (null in limp state)
  const playerToGreenMidpoint = useMemo(
    () => userLocation ? lerpLatLng(userLocation, greenCenter, 0.5) : null,
    [userLocation, greenCenter],
  );

  const playerToGreenYards = useMemo(
    () => userLocation ? toYards(haversineMeters(userLocation, greenCenter)) : null,
    [userLocation, greenCenter],
  );

  // ── Proximity line/label visibility ─────────────────────────────────────
  // <30 yd: hide line + label by default; tap to reveal line (no label).
  // <60 yd: hide label only.
  const [forceShowLines, setForceShowLines] = useState(false);

  useEffect(() => {
    // Auto-clear the forced override once the player steps back outside 30 yd.
    if (playerToGreenYards !== null && playerToGreenYards >= 30) setForceShowLines(false);
  }, [playerToGreenYards]);

  const showDirectLine = !isLimp && (playerToGreenYards! >= 30 || forceShowLines);
  const showDistanceLabel = !isLimp && playerToGreenYards! >= 60;

  // Intermediate-target distances — recompute on every drag event
  const { playerToTarget, targetToGreen } = useMemo(() => {
    if (userLocation) {
      return computeTargetDistances(userLocation, effectiveTargetCoord, greenCenter);
    }
    // Limp state: only target→green matters
    return {
      playerToTarget: null,
      targetToGreen: effectiveTargetCoord
        ? Math.round(toYards(haversineMeters(effectiveTargetCoord, greenCenter)))
        : null,
    };
  }, [userLocation, effectiveTargetCoord, greenCenter]);

  const playerToTargetMidpoint = useMemo(() => {
    if (!effectiveTargetCoord || !userLocation) return null;
    return lerpLatLng(userLocation, effectiveTargetCoord, 0.5);
  }, [userLocation, effectiveTargetCoord]);

  const targetToGreenMidpoint = useMemo(() => {
    if (!effectiveTargetCoord) return null;
    return lerpLatLng(effectiveTargetCoord, greenCenter, 0.5);
  }, [effectiveTargetCoord, greenCenter]);

  return (
    <>
      {/* ── User location marker — hidden in limp state (no GPS fix) ── */}
      {!isLimp && (
        <Marker
          coordinate={userLocation!}
          anchor={{ x: 0.5, y: 0.5 }}
          tracksViewChanges={false}
          onPress={() => { if (playerToGreenYards !== null && playerToGreenYards < 30) setForceShowLines(true); }}
        >
          <View style={$playerMarker} />
        </Marker>
      )}

      {/* ── Green center / hole marker (draggable within the green polygon) ── */}
      <Marker
        coordinate={greenCenter}
        anchor={{ x: 0.5, y: 1 }}
        draggable
        onDrag={(e) => handleHoleDrag(e.nativeEvent.coordinate)}
        onDragEnd={(e) => {
          if (holeRafRef.current !== null) {
            cancelAnimationFrame(holeRafRef.current);
            holeRafRef.current = null;
          }
          handleHoleDrag(e.nativeEvent.coordinate);
        }}
        tracksViewChanges
      >
        <View style={[$holeMarker, isLimp && { opacity: 0.85 }]}>
          <Ionicons name="flag" size={18} color="#ffffff" />
        </View>
      </Marker>

      {/* ── Player → Green distance line ── */}
      {!target && showDirectLine && (
        <Polyline
          coordinates={[userLocation!, greenCenter]}
          strokeColor="rgba(0,0,0,0.85)"
          strokeWidth={4}
        />
      )}

      {/* ── Midpoint distance callout (no target) ── */}
      {!target && showDirectLine && showDistanceLabel && playerToGreenMidpoint && (
        <Marker
          coordinate={playerToGreenMidpoint}
          anchor={{ x: 0.5, y: 0.5 }}
          tracksViewChanges={false}
        >
          <OutlinedLabel text={`${playerToGreenYards} yd`} />
        </Marker>
      )}

      {/* ── Intermediate target ── */}
      {target && effectiveTargetCoord && (
        <>
          {/* Player → Target line (full mode only) */}
          {!isLimp && (
            <Polyline
              coordinates={[userLocation!, effectiveTargetCoord]}
              strokeColor="rgba(0,0,0,0.85)"
              strokeWidth={4}
            />
          )}

          {/* Target → Green line */}
          <Polyline
            coordinates={[effectiveTargetCoord, greenCenter]}
            strokeColor="rgba(0,0,0,0.85)"
            strokeWidth={isLimp ? 3 : 2}
            lineDashPattern={[6, 4]}
          />

          {/* Player → Target callout (full mode only) */}
          {!isLimp && playerToTargetMidpoint && playerToTarget !== null && (
            <Marker
              coordinate={playerToTargetMidpoint}
              anchor={{ x: 0.5, y: 0.5 }}
              tracksViewChanges
            >
              <OutlinedLabel text={`${playerToTarget} yd`} />
            </Marker>
          )}

          {/* Target → Green callout */}
          {targetToGreenMidpoint && targetToGreen !== null && (
            <Marker
              coordinate={targetToGreen < 20 ? effectiveTargetCoord! : targetToGreenMidpoint}
              anchor={{ x: 0.5, y: targetToGreen < 20 ? 1 : 0.5 }}
              tracksViewChanges
            >
              {targetToGreen < 20 ? (
                <View style={{ alignItems: "center", paddingBottom: 36 }}>
                  <OutlinedLabel text={`${targetToGreen} yd`} />
                </View>
              ) : (
                <OutlinedLabel text={`${targetToGreen} yd`} />
              )}
            </Marker>
          )}

          {/* Draggable target pin — tracksViewChanges must be true during drag
              so the native layer re-reads the view on each animation frame */}
          <Marker
            coordinate={target.coordinate}
            anchor={{ x: 0.5, y: 1 }}
            draggable
            onPress={onTargetPress}
            onDrag={(e) => handleTargetDrag(e.nativeEvent.coordinate)}
            onDragEnd={(e) => {
              if (rafRef.current !== null) {
                cancelAnimationFrame(rafRef.current);
                rafRef.current = null;
              }
              onTargetDragEnd(e.nativeEvent.coordinate);
              setDragCoord(null);
            }}
            tracksViewChanges
          >
            <View style={$targetPin}>
              <View style={$targetPinInner} />
            </View>
          </Marker>
        </>
      )}
    </>
  );
};

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

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

const $targetPin: ViewStyle = {
  width: 32,
  height: 32,
  borderRadius: 16,
  backgroundColor: "rgba(0, 0, 0, 0.4)",
  alignItems: "center",
  justifyContent: "center",
  borderWidth: 2.5,
  borderColor: "#ffffff",
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.4,
  shadowRadius: 2,
  elevation: 4,
};

const $targetPinInner: ViewStyle = {
  width: 8,
  height: 8,
  borderRadius: 4,
  backgroundColor: "#ffffff",
};

const $labelWrapper: ViewStyle = {
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#000000",
  borderRadius: 12,
  zIndex: 0,
  paddingHorizontal: 12,
  paddingVertical: 3
};

const $labelText: TextStyle = {
  fontSize: 15,
  fontWeight: "700",
  color: "#FFFFFF",
  letterSpacing: 0.2,
  zIndex: 1
};
