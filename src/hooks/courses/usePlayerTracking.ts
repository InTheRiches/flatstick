/**
 * usePlayerTracking
 *
 * Manages "Track Player" mode: continuously animates the camera to keep the
 * player near the bottom of the screen with the active-hole green at the top,
 * aligned so the player→green bearing faces upward.
 *
 * Also owns the optional intermediate-target state (tap-to-place) that exists
 * while tracking is active.
 */

import type { LatLng, XYPoint } from "@/models/geo";
import {
  bearingDegrees,
  haversineMeters,
  lerpLatLng,
  polygonCentroid,
  toYards,
} from "@/utils/courses/geometry/distance.utils";
import { useCallback, useEffect, useState } from "react";
import type MapView from "react-native-maps";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type IntermediateTarget = {
  /** Geographic coordinate of the draggable pin. */
  coordinate: LatLng;
};

export type PlayerTrackingState = {
    /** Whether player-tracking mode is currently enabled. */
    isTracking: boolean;
    /** Toggle tracking on/off. */
    toggleTracking: () => void;
    /** Draggable intermediate target (null when not placed). */
    target: IntermediateTarget | null;
    /** Place or move the intermediate target. Pass null to remove it. */
    setTargetCoordinate: (coord: LatLng | null) => void;
    /** Imperative helper to recenter on the user location (e.g. after exiting hazard mode). */
    recenterOnUser: () => void;
};

// ---------------------------------------------------------------------------
// Camera helper
// ---------------------------------------------------------------------------

/**
 * Given the player and the green centroid, compute the camera parameters that
 * position:
 *   • the player ~15 % up from the bottom of the viewport
 *   • the green  ~10 % down from the top of the viewport (clear of the header)
 *   • the bearing so that the player→green direction is "up"
 */
function buildPlayerCamera(
  player: LatLng,
  greenCenter: LatLng,
): {
  center: LatLng;
  heading: number;
  altitude: number;
  pitch: number;
} {
  let distanceM = haversineMeters(player, greenCenter, 200);
  if (distanceM > 250) {
    distanceM += 50; // Add padding for long holes to avoid excessive zoom-out
  }

  // Target layout (fraction from top of screen):
  //   green  → 10 %   (just below any header)
  //   player → 85 %   (near the bottom)
  //   visible span occupied by the player-green distance: 75 % of height
  //
  // Camera center is the screen midpoint (50 % from top).
  // Distance from player (85 %) to center (50 %) = 35 % of screen.
  // So center sits 35/75 ≈ 0.467 of the way from player toward green.
  const center = lerpLatLng(player, greenCenter, 0.55);

  const heading = bearingDegrees(player, greenCenter);

  // The player→green span should fill ~75 % of the visible height, so
  // altitude ≈ distanceM / 0.75.  A minimum prevents excessive zoom on
  // very short holes.
  const minAltitudeM = 80;
  const altitude = Math.max(minAltitudeM, distanceM / 0.75);

  return { center, heading, altitude, pitch: 0 };
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

interface UsePlayerTrackingOptions {
  mapRef: React.RefObject<MapView | null>;
  userLocation: LatLng | null;
  /** XYPoint[] polygon for the active hole's green. Null while data is loading. */
  greenPolygon: XYPoint[] | null;
}

export function usePlayerTracking({
  mapRef,
  userLocation,
  greenPolygon,
}: UsePlayerTrackingOptions): PlayerTrackingState {
  const [isTracking, setIsTracking] = useState(false);
  const [target, setTarget] = useState<IntermediateTarget | null>(null);
  const [recenterOnUserFlag, setRecenterOnUserFlag] = useState(false);

  const recenterOnUser = useCallback(() => {
    setRecenterOnUserFlag((prev) => !prev);
  }, []);

  // Animate the camera whenever tracking is on and either location or polygon
  // changes.
  useEffect(() => {
    if (!isTracking) return;
    if (!userLocation || !greenPolygon) return;
    if (!mapRef.current) return;
    
    const greenCenter = polygonCentroid(greenPolygon);
    const cam = buildPlayerCamera(userLocation, greenCenter);

    mapRef.current.animateCamera(
      {
        center: cam.center,
        heading: cam.heading,
        pitch: cam.pitch,
        altitude: cam.altitude,
      },
      { duration: 600 },
    );
  }, [isTracking, userLocation, greenPolygon, mapRef, recenterOnUserFlag]);



  const toggleTracking = useCallback(() => {
    setIsTracking((prev) => {
      if (prev) {
        // Disabling: clear the intermediate target too
        setTarget(null);
      }
      return !prev;
    });
  }, []);

  const setTargetCoordinate = useCallback((coord: LatLng | null) => {
    if (coord === null) {
      setTarget(null);
    } else {
      setTarget({ coordinate: coord });
    }
  }, []);

  return {
    isTracking,
    toggleTracking,
    target,
    setTargetCoordinate,
    recenterOnUser,
  };
}

// ---------------------------------------------------------------------------
// Derived selector helpers (pure, suitable for useMemo in the screen)
// ---------------------------------------------------------------------------

/**
 * Distances from player to green centroid via the intermediate target (if
 * present), returned in yards.  Returns null values when data is unavailable.
 */
export function computeTargetDistances(
  player: LatLng | null,
  target: LatLng | null,
  greenCenter: LatLng | null,
): { playerToTarget: number | null; targetToGreen: number | null } {
  if (!player || !target || !greenCenter) {
    return { playerToTarget: null, targetToGreen: null };
  }
  return {
    playerToTarget: toYards(haversineMeters(player, target)),
    targetToGreen: toYards(haversineMeters(target, greenCenter)),
  };
}
