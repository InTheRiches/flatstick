/**
 * GreenDistanceStack
 *
 * Bottom-left overlay that shows the live distance to front / center / back
 * of the active hole's green while Player Tracking is enabled.
 *
 * Layout (top → bottom):
 *   ┌──────────────────────┐
 *   │ 142 yd  (back)  sm   │
 *   │ 127 yd  (center) XL  │
 *   │ 115 yd  (front) md   │
 *   └──────────────────────┘
 */

import React from "react";
import { TextStyle, View, ViewStyle } from "react-native";

import { Text } from "@/components/ui/Text";
import { useAppTheme } from "@/theme/context";
import type { GreenDistances } from "@/utils/courses/geometry/distance.utils";
import { Ionicons } from "@expo/vector-icons";

interface GreenDistanceStackProps {
  distances: GreenDistances | null;
}

function DistanceRow({
  label,
  value,
  large,
  color = "#ffffff",
}: {
    label?: string;
    value: number | null;
    large?: boolean;
    color?: string;
}) {
  const yardText = value !== null ? `${value}` : "--";

  return (
    <View style={$row}>
        {label && <Ionicons name={label as any} size={22} color={color} />}
        <View style={{ flexDirection: "row", alignItems: "baseline" }}>
            <Text
                style={[
                $yardage,
                large ? $yardageLarge : undefined,
                { color },
                ]}
                text={yardText}
                weight="bold"
            />
            <Text
                style={[$unit, { color }]}
                text=" yd"
                weight="normal"
            />
        </View>
    </View>
  );
}

export const GreenDistanceStack: React.FC<GreenDistanceStackProps> = ({
  distances,
}) => {
    const { theme } = useAppTheme();
  return (
    <View style={$container}>
      <DistanceRow label="caret-up" value={distances?.back   ?? null} color={theme.colors.palette.emerald300} />
      <DistanceRow value={distances?.center ?? null} large />
      <DistanceRow label="caret-down" value={distances?.front  ?? null} color={theme.colors.palette.emerald300} />
    </View>
  );
};

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const $container: ViewStyle = {
  position: "absolute",
  bottom: 120,
  left: 16,
  backgroundColor: "rgba(0,0,0,1)",
  borderRadius: 10,
  paddingVertical: 8,
  paddingRight: 14,
  paddingLeft: 8,
  gap: 2,
};

const $row: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
};

const $yardage: TextStyle = {
  fontSize: 16,
  lineHeight: 22,
  color: "#ffffff",
  textShadowColor: "#000",
  textShadowOffset: { width: 1, height: 1 },
  textShadowRadius: 2,
  fontWeight: "600",
};

const $yardageLarge: TextStyle = {
  fontSize: 26,
  lineHeight: 34,
  fontWeight: "700",
};

const $unit: TextStyle = {
  fontSize: 13,
  opacity: 0.8
};
