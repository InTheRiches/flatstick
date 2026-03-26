import React from "react";
import { TextStyle, View, ViewStyle } from "react-native";
import { Marker, Polyline } from "react-native-maps";

import { Text } from "@/components/ui/Text";
import type { LatLng } from "@/models/geo";
import type { LiveShotAttempt } from "@/models/round.live.types";

import { bezierPoints, curveControlPoint } from "./shotPath";

interface ShotEditMapOverlayProps {
  shot: LiveShotAttempt;
  start: LatLng;
  end: LatLng;
  activePoint: "start" | "end";
}

function PointLabel({ label, active }: { label: string; active: boolean }) {
  return (
    <View style={$pointLabelWrap}>
      <View style={[$pointBadge, active && $pointBadgeActive]}>
        <Text style={[$pointBadgeText, active && $pointBadgeTextActive]} text={label} />
      </View>
    </View>
  );
}

function PointDot({ active }: { active: boolean }) {
  return (
    <View style={$pointDotWrap}>
      <View style={[$pointDot, active ? $pointDotActive : $pointDotInactive]} />
    </View>
  );
}

function ShotPoint({
  coordinate,
  label,
  active,
}: {
  coordinate: LatLng;
  label: string;
  active: boolean;
}) {
  return (
    <>
      <Marker coordinate={coordinate} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={false} zIndex={21}>
        <PointDot active={active} />
        {active ? <View style={$pointHalo} /> : null}
      </Marker>
      <Marker coordinate={coordinate} centerOffset={{ x: -64, y: 0 }} anchor={{ x: 0.5, y: 1 }} tracksViewChanges={false} zIndex={22}>
        <PointLabel label={label} active={active} />
      </Marker>
    </>
  );
}

export const ShotEditMapOverlay: React.FC<ShotEditMapOverlayProps> = ({
  shot,
  start,
  end,
  activePoint,
}) => {
  const ctrl = shot.result?.shape ? curveControlPoint(start, end, shot.result.shape) : null;
  const lineCoords = bezierPoints(start, end, ctrl);

  return (
    <>
      <Polyline
        coordinates={lineCoords}
        strokeColor="rgba(255, 215, 0, 0.92)"
        strokeWidth={4}
        zIndex={20}
      />

      <ShotPoint coordinate={start} label="Start" active={activePoint === "start"} />
      <ShotPoint coordinate={end} label="Finish" active={activePoint === "end"} />
    </>
  );
}

const $pointLabelWrap: ViewStyle = {
  alignItems: "center",
  paddingBottom: 18,
};

const $pointDotWrap: ViewStyle = {
  alignItems: "center",
  justifyContent: "center",
};

const $pointBadge: ViewStyle = {
  borderRadius: 999,
  paddingHorizontal: 12,
  paddingVertical: 5,
  backgroundColor: "rgba(16, 16, 16, 0.82)",
  borderWidth: 1,
  borderColor: "rgba(255, 255, 255, 0.22)",
};

const $pointBadgeActive: ViewStyle = {
  backgroundColor: "rgba(255, 215, 0, 0.96)",
  borderColor: "rgba(255, 255, 255, 0.45)",
};

const $pointBadgeText: TextStyle = {
  fontSize: 12,
  fontWeight: "700",
  color: "#FFFFFF",
  letterSpacing: 0.2,
};

const $pointBadgeTextActive: TextStyle = {
  color: "#151515",
};

const $pointDot: ViewStyle = {
  width: 14,
  height: 14,
  borderRadius: 999,
  borderWidth: 2,
};

const $pointDotActive: ViewStyle = {
  backgroundColor: "rgba(255, 215, 0, 0.96)",
  borderColor: "#FFFFFF",
};

const $pointDotInactive: ViewStyle = {
  backgroundColor: "rgba(24, 24, 24, 0.82)",
  borderColor: "rgba(255, 255, 255, 0.82)",
};

const $pointHalo: ViewStyle = {
  position: "absolute",
  width: 32,
  height: 32,
  left: -9,
  top: -9,
  borderRadius: 38,
  borderWidth: 2,
  borderColor: "rgba(255,255,255,0.48)",
  backgroundColor: "rgba(255,255,255,0.12)",
};
