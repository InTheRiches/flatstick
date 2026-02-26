import React, { useMemo } from 'react';
import type { SharedValue } from 'react-native-reanimated';
import Animated, { useAnimatedProps } from 'react-native-reanimated';
import { Circle, G, Line } from 'react-native-svg';
import type { LatLon, PuttTap } from '../types';
import type { SvgPoint } from '../utils/curveUtils';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const PUTT_MARKER_RADIUS = 6;
const GHOST_BASE_RADIUS = 10;
const LINE_STROKE_WIDTH = 1.5;
const LINE_COLOR = '#c1bbbb';

interface PuttPathLayerProps {
  taps: PuttTap[];
  toSvgPoint: (coord: LatLon) => SvgPoint;
  // ── Drag interaction shared values ──
  grabbedIndex: SharedValue<number>;
  dragSvgX: SharedValue<number>;
  dragSvgY: SharedValue<number>;
  grabScale: SharedValue<number>;
  scale: SharedValue<number>;
}

/**
 * Renders all putt tap markers and the connecting putt-path lines for the
 * current hole.
 *
 * Drag interaction:
 * - Static `Circle` elements are rendered for each putt at its current position.
 * - A single `AnimatedCircle` ghost tracks the drag position for the grabbed
 *   putt, appearing on top with a larger radius and highlight colour.
 * - The ghost is invisible (r=0) when no putt is being dragged.
 */
export const PuttPathLayer = React.memo(function PuttPathLayer({
  taps,
  toSvgPoint,
  grabbedIndex,
  dragSvgX,
  dragSvgY,
  grabScale,
  scale,
}: PuttPathLayerProps) {
  const tapPoints = useMemo(
    () => taps.map((tap) => toSvgPoint(tap)),
    [taps, toSvgPoint]
  );

  // ── Ghost animated props (one AnimatedCircle for the dragged putt) ──────────
  const ghostProps = useAnimatedProps(() => {
    const isGrabbing = grabbedIndex.value >= 0;
    return {
      cx: dragSvgX.value,
      cy: dragSvgY.value,
      r: isGrabbing ? (GHOST_BASE_RADIUS / scale.value) * grabScale.value : 0,
      opacity: isGrabbing ? 1 : 0,
    };
  });

  return (
    <G>
      {/* ── Putt path lines ──────────────────────────────────────────────── */}
      {tapPoints.map((pt, index) => {
        const next = tapPoints[index + 1];
        if (!next) return null;
        return (
          <Line
            key={`putt-line-${index}`}
            x1={pt.x}
            y1={pt.y}
            x2={next.x}
            y2={next.y}
            stroke={LINE_COLOR}
            strokeWidth={LINE_STROKE_WIDTH}
          />
        );
      })}

      {/* ── Static putt markers ──────────────────────────────────────────── */}
      {tapPoints.map((pt, index) => {
        const tap = taps[index];
        const isMisread = tap.misreadLine ?? tap.misreadSlope ?? false;
        return (
          <Circle
            key={`tap-${index}`}
            cx={pt.x}
            cy={pt.y}
            r={PUTT_MARKER_RADIUS}
            fill={isMisread ? '#ef4444' : 'white'}
            stroke="black"
            strokeWidth={1}
          />
        );
      })}

      {/* ── Drag ghost marker (single animated circle) ───────────────────── */}
      <AnimatedCircle
        fill="#60a5fa"
        stroke="white"
        strokeWidth={2}
        animatedProps={ghostProps}
      />
    </G>
  );
});
