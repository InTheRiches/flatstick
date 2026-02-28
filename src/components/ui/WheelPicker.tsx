import React, { useCallback, useEffect, useRef } from "react";
import {
    Animated,
    NativeScrollEvent,
    NativeSyntheticEvent,
    TextStyle,
    View,
    ViewStyle,
} from "react-native";

import { useAppTheme } from "@/theme/context";
import type { ThemedStyle } from "@/theme/types";

import { Text } from "./Text";

// ── Constants ────────────────────────────────────────────────────────────────

const ITEM_HEIGHT = 44;
const CONTAINER_HEIGHT = ITEM_HEIGHT * 3; // shows 3 items (above, selected, below)

// ── Types ────────────────────────────────────────────────────────────────────

export interface WheelPickerOption {
  label: string;
  value: string;
}

interface WheelPickerProps {
  options: WheelPickerOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

// ── Component ────────────────────────────────────────────────────────────────

export function WheelPicker({ options, value, onChange, label }: WheelPickerProps) {
  const { themed } = useAppTheme();

  // Animated scroll position drives per-item opacity & scale
  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<any>(null);

  const selectedIndex = Math.max(0, options.findIndex((o) => o.value === value));

  // Jump to the initially selected item without animation
  useEffect(() => {
    const timeout = setTimeout(() => {
      scrollRef.current?.scrollTo({ y: selectedIndex * ITEM_HEIGHT, animated: false });
    }, 50);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = e.nativeEvent.contentOffset.y;
      const index = Math.round(y / ITEM_HEIGHT);
      const clampedIndex = Math.max(0, Math.min(index, options.length - 1));
      const picked = options[clampedIndex];
      if (picked && picked.value !== value) {
        onChange(picked.value);
      }
    },
    [options, value, onChange],
  );

  return (
    <View>
      {label ? <Text style={themed($label)}>{label}</Text> : null}
      <View style={themed($wrapper)}>
        {/* Horizontal rule indicators for the center selection slot */}
        <View style={[themed($selectionIndicator), { top: ITEM_HEIGHT }]} pointerEvents="none" />

        <Animated.ScrollView
          ref={scrollRef}
          style={$scrollView}
          contentContainerStyle={$contentContainer}
          snapToInterval={ITEM_HEIGHT}
          decelerationRate="fast"
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true },
          )}
          onMomentumScrollEnd={handleScrollEnd}
          onScrollEndDrag={handleScrollEnd}
        >
          {options.map((option, index) => {
            const itemCenter = index * ITEM_HEIGHT;

            // Fade and scale items based on their distance from the center slot
            const opacity = scrollY.interpolate({
              inputRange: [
                itemCenter - ITEM_HEIGHT * 1.5,
                itemCenter - ITEM_HEIGHT,
                itemCenter,
                itemCenter + ITEM_HEIGHT,
                itemCenter + ITEM_HEIGHT * 1.5,
              ],
              outputRange: [0, 0.3, 1, 0.3, 0],
              extrapolate: "clamp",
            });

            const scale = scrollY.interpolate({
              inputRange: [
                itemCenter - ITEM_HEIGHT,
                itemCenter,
                itemCenter + ITEM_HEIGHT,
              ],
              outputRange: [0.82, 1, 0.82],
              extrapolate: "clamp",
            });

            return (
              <Animated.View
                key={option.value}
                style={[$item, { opacity, transform: [{ scale }] }]}
              >
                <Text style={themed($itemText)}>{option.label}</Text>
              </Animated.View>
            );
          })}
        </Animated.ScrollView>
      </View>
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────

const $label: ThemedStyle<TextStyle> = (theme) => ({
  fontSize: 13,
  color: theme.colors.textDim,
  fontWeight: "500",
  textTransform: "uppercase",
  letterSpacing: 0.5,
});

const $wrapper: ThemedStyle<ViewStyle> = (theme) => ({
  borderRadius: 12,
  backgroundColor: theme.colors.backgrounds.elevated,
  overflow: "hidden",
  position: "relative",
});

const $selectionIndicator: ThemedStyle<ViewStyle> = (theme) => ({
  position: "absolute",
  left: 16,
  right: 16,
  height: ITEM_HEIGHT,
  borderTopWidth: 1,
  borderBottomWidth: 1,
  borderColor: theme.colors.border,
  zIndex: 1,
  pointerEvents: "none",
});

const $scrollView: ViewStyle = {
  height: CONTAINER_HEIGHT,
};

const $contentContainer: ViewStyle = {
  paddingVertical: ITEM_HEIGHT, // top + bottom pad so first/last items can be centered
};

const $item: ViewStyle = {
  height: ITEM_HEIGHT,
  justifyContent: "center",
  alignItems: "center",
};

const $itemText: ThemedStyle<TextStyle> = (theme) => ({
  fontSize: 16,
  fontWeight: "500",
  color: theme.colors.text,
  textAlign: "center",
});
