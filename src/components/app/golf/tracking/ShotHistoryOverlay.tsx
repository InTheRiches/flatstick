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
import { lerpLatLng } from "@/utils/courses/geometry/distance.utils";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function midpoint(a: LatLng, b: LatLng): LatLng {
  return lerpLatLng(a, b, 0.5);
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
}

export const ShotHistoryOverlay: React.FC<ShotHistoryOverlayProps> = ({ shots }) => {
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

        return (
          <React.Fragment key={shot.id}>
            {/* Shot line */}
            <Polyline
              coordinates={[start, end]}
              strokeColor="rgba(255, 215, 0, 0.85)"
              strokeWidth={3}
            />

            {/* Start dot */}
            <Marker coordinate={end} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={false}>
              <View style={$startDot} />
            </Marker>

            {/* Mid-line club label */}
            <Marker coordinate={start} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={false}>
              <ClubLabel label={clubLabel} />
            </Marker>
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
