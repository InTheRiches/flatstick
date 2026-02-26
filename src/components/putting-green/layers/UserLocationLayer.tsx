import React from 'react';
import type { SharedValue } from 'react-native-reanimated';
import Animated, { useAnimatedProps } from 'react-native-reanimated';
import { Circle, G, Path } from 'react-native-svg';
import type { LatLon } from '../types';
import type { SvgPoint } from '../utils/curveUtils';

const AnimatedG = Animated.createAnimatedComponent(G);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// Upward-pointing arrow (north = up in SVG space).
const ARROW_PATH = 'M 0 -8 L 5 4 L 0 1 L -5 4 Z';
const DOT_RADIUS = 7;

interface UserLocationLayerProps {
  userLocation: LatLon;
  toSvgPoint: (coord: LatLon) => SvgPoint;
  /** Compass heading as a Reanimated SharedValue (degrees, 0 = north). */
  heading: SharedValue<number>;
  /** Scale shared value from the gesture layer — used to keep the dot size consistent. */
  scale: SharedValue<number>;
}

/**
 * Renders the player's current location as a cyan dot with a compass
 * heading arrow that rotates in real-time from the device compass.
 *
 * Both the dot size and the arrow scale are inversely proportional to the
 * current zoom level so they remain visually consistent regardless of zoom.
 */
export const UserLocationLayer = React.memo(function UserLocationLayer({
  userLocation,
  toSvgPoint,
  heading,
  scale,
}: UserLocationLayerProps) {
  const { x, y } = toSvgPoint(userLocation);

  const groupProps = useAnimatedProps(() => ({
    transform: [{ rotate: `${heading.value}deg` }],
    /**
     * Counteract the parent group's zoom so the dot stays the same visual
     * size.  x/y are static SVG coordinates (pivot point for rotation).
     */
    scale: 1 / scale.value,
    x,
    y,
  }));

  const dotProps = useAnimatedProps(() => ({
    r: DOT_RADIUS,
    strokeWidth: 1.5,
  }));

  return (
    <AnimatedG animatedProps={groupProps}>
      <AnimatedCircle
        fill="#76eeff"
        stroke="black"
        animatedProps={dotProps}
      />
      <Path d={ARROW_PATH} fill="black" scale={0.9} />
    </AnimatedG>
  );
});
