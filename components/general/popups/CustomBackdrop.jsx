import React, { useEffect, useMemo } from "react";
import { BottomSheetBackdropProps } from "@gorhom/bottom-sheet";
import Animated, {
    Extrapolate,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";
import useColors from "@/hooks/useColors";
import { Pressable } from "react-native";

export default function CustomBackdrop({ reference, animatedIndex, style }) {
  const colors = useColors();

    // animated variables
    const containerAnimatedStyle = useAnimatedStyle(() => ({
        opacity: interpolate(
            animatedIndex.value,
            [-1, 0],
            [0, 1],
            Extrapolate.CLAMP
        ),
    }));

    // styles
    const containerStyle = useMemo(
        () => [
            style,
            {
                backgroundColor: colors.background.tinted,
            },
            containerAnimatedStyle,
        ],
        [style, containerAnimatedStyle]
    );

  return <Pressable style={style} onPress={() => reference.current.dismiss()}>
    <Animated.View style={containerStyle}>
    </Animated.View>
  </Pressable>;
};