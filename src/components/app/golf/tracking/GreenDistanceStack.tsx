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

import React, { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, TextStyle, View, ViewStyle } from "react-native";

import { Text } from "@/components/ui/Text";
import { useAppTheme } from "@/theme/context";
import { ThemedFnT, ThemedStyle } from "@/theme/types";
import type { GreenDistances } from "@/utils/courses/geometry/distance.utils";
import { Ionicons } from "@expo/vector-icons";

interface GreenDistanceStackProps {
  distances: GreenDistances | null;
  /** Controls whether the stack is visible/active (will animate in/out) */
  isActive?: boolean;
}

function DistanceRow({
  label,
  value,
  large,
  color = "#ffffff",
  themed,
}: {
    label?: string;
    value: number | null;
    large?: boolean;
    color?: string;
    themed: ThemedFnT;
}) {
  const yardText = value !== null ? `${value}` : "--";

  return (
    <View style={$row}>
        {label && <Ionicons name={label as any} size={22} color={color} />}
        <View style={{ flexDirection: "row", alignItems: "baseline" }}>
            <Text
                style={[
                themed($yardage),
                large ? themed($yardageLarge) : undefined,
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
  isActive = true,
}) => {
  const { theme, themed } = useAppTheme();

  // Animated values for slide (from left) + fade
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(isActive ? 1 : 0)).current;
  const [mounted, setMounted] = useState(isActive);

  useEffect(() => {
    const screenW = Dimensions.get("window").width;
    if (isActive) {
      setMounted(true);
      // slide in from left
      translateX.setValue(-screenW * 0.5);
      opacity.setValue(0);
      Animated.parallel([
        Animated.timing(translateX, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
    } else {
      // slide out to left then unmount
      Animated.parallel([
        Animated.timing(translateX, { toValue: -Dimensions.get("window").width * 0.6, duration: 300, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start(() => setMounted(false));
    }
  }, [isActive, translateX, opacity]);

  return (
    <View>
      {mounted && (
        <Animated.View style={[themed($container), { opacity, transform: [{ translateX }] }] }>
          <DistanceRow themed={themed} label="caret-up" value={distances?.back ?? null} color={theme.colors.tint} />
          <DistanceRow themed={themed} value={distances?.center ?? null} large color={theme.colors.text} />
          <DistanceRow themed={themed} label="caret-down" value={distances?.front ?? null} color={theme.colors.tint} />
        </Animated.View>
      )}
    </View>
  );
};

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const $container: ThemedStyle<ViewStyle> = (theme) => ({
  position: "absolute",
  bottom: 120,
  backgroundColor: theme.colors.backgrounds.elevated,
  borderRadius: 14,
  paddingVertical: 8,
  paddingRight: 16,
  paddingLeft: 14,
  gap: 2,
});

const $row: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
};

const $yardage: ThemedStyle<TextStyle> = (theme) => ({
  fontSize: 16,
  lineHeight: 22,
  color: theme.colors.text,
  fontWeight: "600",
});

const $yardageLarge: ThemedStyle<TextStyle> = (theme) => ({
  fontSize: 26,
  lineHeight: 34,
  fontWeight: "800",
  color: theme.colors.text,
});

const $unit: TextStyle = {
  fontSize: 13,
  opacity: 0.8,
  fontWeight: "500",
};
