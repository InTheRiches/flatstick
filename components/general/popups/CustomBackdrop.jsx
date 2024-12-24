import React, { useEffect, useMemo } from "react";
import { BottomSheetBackdropProps } from "@gorhom/bottom-sheet";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import useColors from "@/hooks/useColors";
import { Pressable } from "react-native";

export default function CustomBackdrop({ open, reference, animatedIndex, style }) {
  const colors = useColors();
  const animatedOpacity = useSharedValue(0);

  const opacityStyle = useAnimatedStyle(() => {
    return {
        backgroundColor: colors.background.tinted,
        width: "100%",
        height: "100%",
        position: "absolute",
        opacity: withTiming(animatedOpacity.value, { duration: 250 }),
    };
  }, []);

  useEffect(() => {
    if (open) animatedOpacity.value = 1;
    else animatedOpacity.value = 0;
  }, [open]);

  return <Pressable style={style} onPress={() => reference.current.dismiss()}>
    <Animated.View style={opacityStyle}>
    </Animated.View>
  </Pressable>;
};