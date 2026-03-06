/**
 * ShotHistoryOverlay
 *
 * Renders completed shots for the current hole inside a <MapView>.
 * For each shot it draws:
 *   • A yellow polyline from start → end
 *   • A start-of-shot dot marker (grey)
 *   • A mid-line pill label showing the club label (same style as the
 *     distance callout in PlayerTrackingOverlay)
 */

import React, { useMemo } from "react";
import { TextStyle, View, ViewStyle } from "react-native";
import { Marker, Polyline } from "react-native-maps";

import { Text } from "@/components/ui/Text";
import type { LatLng } from "@/models/geo";
import type { LiveShotAttempt } from "@/models/round.live.types";
import type { ShotShape } from "@/models/round.session.types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Returns a control point that bows the line left or right relative to the
 * direction of travel (CCW = left / draw, CW = right / fade).
 *
 * Coordinate math uses raw (lat, lng) degrees.  For typical shot distances
 * (<500 m) the error introduced by ignoring the lat-scaling of longitude is
 * negligible for a visual arc.
 */
function curveControlPoint(
  start: LatLng,
  end: LatLng,
  shape: ShotShape,
): LatLng | null {
  const dlat = end.latitude  - start.latitude;
  const dlng = end.longitude - start.longitude;

  // Perpendicular-left unit vector in (lat, lng) space:
  //   rotate direction (dlng, dlat) by 90° CCW → (-dlat, dlng)
  // sign = +1 → left (draw/hook), sign = -1 → right (fade/slice)
  let sign = 0;
  let fraction = 0;

  switch (shape) {
    case "draw":  sign =  1; fraction = 0.10; break;
    case "hook":  sign =  1; fraction = 0.25; break;
    case "fade":  sign = -1; fraction = 0.10; break;
    case "slice": sign = -1; fraction = 0.25; break;
    default: return null; // straight / other → no curve
  }

  return {
    latitude:  (start.latitude  + end.latitude)  / 2 + sign *  dlng * fraction,
    longitude: (start.longitude + end.longitude) / 2 + sign * (-dlat) * fraction,
  };
}

/**
 * Samples `steps + 1` points along a quadratic Bézier from `start` through
 * `ctrl` to `end`.  Falls back to a two-point straight line when `ctrl` is
 * null.
 */
function bezierPoints(
  start: LatLng,
  end: LatLng,
  ctrl: LatLng | null,
  steps = 24,
): LatLng[] {
  if (!ctrl) return [start, end];

  const pts: LatLng[] = [];
  for (let i = 0; i <= steps; i++) {
    const t  = i / steps;
    const mt = 1 - t;
    pts.push({
      latitude:  mt * mt * start.latitude  + 2 * mt * t * ctrl.latitude  + t * t * end.latitude,
      longitude: mt * mt * start.longitude + 2 * mt * t * ctrl.longitude + t * t * end.longitude,
    });
  }
  return pts;
}

/** Point on the Bézier at t = 0.5 (visual midpoint of the arc). */
function bezierMidpoint(start: LatLng, end: LatLng, ctrl: LatLng | null): LatLng {
  if (!ctrl) {
    return {
      latitude:  (start.latitude  + end.latitude)  / 2,
      longitude: (start.longitude + end.longitude) / 2,
    };
  }
  const t = 0.5, mt = 0.5;
  return {
    latitude:  mt * mt * start.latitude  + 2 * mt * t * ctrl.latitude  + t * t * end.latitude,
    longitude: mt * mt * start.longitude + 2 * mt * t * ctrl.longitude + t * t * end.longitude,
  };
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ClubLabel({ label }: { label: string }) {
  return (
    <View style={$labelWrapper}>
      <Text style={$labelText}>{label}</Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface ShotHistoryOverlayProps {
  shots: LiveShotAttempt[];
  onShotPress?: (shot: LiveShotAttempt) => void;
}

export const ShotHistoryOverlay: React.FC<ShotHistoryOverlayProps> = ({ shots, onShotPress }) => {
  const completedShots = useMemo(
    () => shots.filter((s): s is LiveShotAttempt & { end: NonNullable<LiveShotAttempt["end"]> } => !!s.end),
    [shots],
  );

  return (
    <>
      {completedShots.map((shot) => {
        const start = shot.start.point;
        const end = shot.end.point;
        const clubLabel = shot.club.label ?? shot.club.type;
        const shape = shot.result?.shape;
        const ctrl = shape ? curveControlPoint(start, end, shape) : null;
        const lineCoords = bezierPoints(start, end, ctrl);
        const labelCoord = bezierMidpoint(start, end, ctrl);

        return (
          <React.Fragment key={shot.id}>
            {/* Shot line — curved when shot shape is known */}
            <Polyline
              coordinates={lineCoords}
              strokeColor="rgba(255, 215, 0, 0.85)"
              strokeWidth={3}
              onPress={() => onShotPress?.(shot)}
            />

            {/* End dot */}
            <Marker coordinate={end} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={false}>
              <View style={$startDot} />
            </Marker>

            {/* Mid-arc club label — tappable to edit the shot */}
            { !shot.intent?.greensideChip && 
              <Marker
                coordinate={labelCoord}
                anchor={{ x: 0.5, y: 0.5 }}
                tracksViewChanges={false}
                onPress={() => onShotPress?.(shot)}
              >
                <ClubLabel label={clubLabel} />
              </Marker>
            }
          </React.Fragment>
        );
      })}
    </>
  );
};

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const $startDot: ViewStyle = {
  width: 10,
  height: 10,
  borderRadius: 5,
  backgroundColor: "rgba(180, 180, 180, 0.9)",
  borderWidth: 1.5,
  borderColor: "#ffffff",
};

const $labelWrapper: ViewStyle = {
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "rgba(255, 215, 0, 0.85)",
  borderRadius: 12,
  paddingHorizontal: 10,
  paddingVertical: 3,
};

const $labelText: TextStyle = {
  fontSize: 13,
  fontWeight: "700",
  color: "#000000",
  letterSpacing: 0.2,
};
