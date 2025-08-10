import React, {useState} from "react";
import {View} from "react-native";
import Animated, {Easing, useAnimatedStyle, useSharedValue, withTiming,} from "react-native-reanimated";

export const CollapsableContainer = ({children, expanded}) => {
  const [height, setHeight] = useState(0);
  const animatedHeight = useSharedValue(0);

  const onLayout = (event) => {
    const onLayoutHeight = event.nativeEvent.layout.height;

    if (onLayoutHeight > 0 && height !== onLayoutHeight) {
      setHeight(onLayoutHeight);
    }
  };

  const config = {
    duration: 200,
    easing: Easing.bezier(0.5, 0.01, 0, 1),
  };

  const collapsableStyle = useAnimatedStyle(() => {
    animatedHeight.value = expanded ? withTiming(height, config) : withTiming(0, config);

    return {
      height: animatedHeight.value,
    };
  }, [expanded, height]);

  return (
    <Animated.View style={[collapsableStyle, {overflow: "hidden"}]}>
      <View style={{position: "absolute", width: "100%"}} onLayout={onLayout}>
        {children}
      </View>
    </Animated.View>
  );
};