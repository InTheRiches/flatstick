import * as Haptics from 'expo-haptics';
import { useCallback, useEffect } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import {
    runOnJS,
    useAnimatedProps,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import type { LatLon, PuttTap } from '../types';
import type { SvgPoint } from '../utils/curveUtils';

const GRAB_THRESHOLD_PX = 22; // SVG-space pixels — distance to grab a putt
const LONG_PRESS_MS = 380; // ms before drag activates
const SPRING = { damping: 26, stiffness: 180 };

interface GestureControlOptions {
  taps: PuttTap[];
  setTaps: React.Dispatch<React.SetStateAction<PuttTap[]>>;
  toSvgPoint: (coord: LatLon) => SvgPoint;
  fromSvgPoint: (x: number, y: number) => LatLon;
  /** Canvas display size in pixels — needed to compute centering translation. */
  svgSize: number;
  zoomEnabled?: boolean;
  minScale?: number;
  maxScale?: number;
  initialScale?: number;
  centerScale?: number;
}

/**
 * Manages all pan, pinch and putt-drag gestures for GreenMap.
 *
 * Interaction model:
 * - **Pan** (no long press): pans the view.
 * - **Pinch**: zooms the view.
 * - **Long press near a putt** → drag finger → release: moves the putt to the
 *   new position.  The view is locked while a putt is being dragged.
 *
 * Returns shared values and animated props consumed by GreenMap and its layers.
 */
export function useGestureControl({
  taps,
  setTaps,
  toSvgPoint,
  fromSvgPoint,
  svgSize,
  zoomEnabled = true,
  minScale = 1,
  maxScale = 8,
  initialScale = 5,
  centerScale = 5,
}: GestureControlOptions) {
  // ─── Pan / zoom state ────────────────────────────────────────────────────────
  const scale = useSharedValue(initialScale);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const panStartX = useSharedValue(0);
  const panStartY = useSharedValue(0);
  const scaleStart = useSharedValue(initialScale);
  const focalX = useSharedValue(0);
  const focalY = useSharedValue(0);
  const isPinching = useSharedValue(false);

  // ─── Drag state ───────────────────────────────────────────────────────────────
  /** Index of the currently grabbed putt (-1 = none). */
  const grabbedIndex = useSharedValue(-1);
  /** Current drag position in SVG coordinates during a drag. */
  const dragSvgX = useSharedValue(0);
  const dragSvgY = useSharedValue(0);
  /** Visual scale applied to the grabbed putt marker. */
  const grabScale = useSharedValue(1);

  // ─── Mirror tap SVG positions for worklet-safe proximity checks ───────────────
  // Separate arrays of scalars are more worklet-friendly than arrays of objects.
  const tapSvgXs = useSharedValue<number[]>([]);
  const tapSvgYs = useSharedValue<number[]>([]);

  useEffect(() => {
    const xs: number[] = [];
    const ys: number[] = [];
    for (const tap of taps) {
      const p = toSvgPoint(tap);
      xs.push(p.x);
      ys.push(p.y);
    }
    tapSvgXs.value = xs;
    tapSvgYs.value = ys;
  }, [taps, toSvgPoint, tapSvgXs, tapSvgYs]);

  // ─── Commit drag (JS thread) ──────────────────────────────────────────────────
  const commitDrag = useCallback(
    (index: number, svgX: number, svgY: number) => {
      const newLatLon = fromSvgPoint(svgX, svgY);
      setTaps((prev) =>
        prev.map((tap, i) =>
          i === index
            ? { ...tap, latitude: newLatLon.latitude, longitude: newLatLon.longitude }
            : tap
        )
      );
    },
    [fromSvgPoint, setTaps]
  );

  const triggerHaptic = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  // ─── Gestures ─────────────────────────────────────────────────────────────────

  const longPressGesture = Gesture.LongPress()
    .minDuration(LONG_PRESS_MS)
    .maxDistance(15)
    .onStart((event) => {
      'worklet';
      // Convert screen coords to SVG canvas coords (undo pan + zoom).
      const svgX = (event.x - translateX.value) / scale.value;
      const svgY = (event.y - translateY.value) / scale.value;

      const xs = tapSvgXs.value;
      const ys = tapSvgYs.value;

      for (let i = 0; i < xs.length; i++) {
        const dx = xs[i] - svgX;
        const dy = ys[i] - svgY;
        if (Math.sqrt(dx * dx + dy * dy) < GRAB_THRESHOLD_PX) {
          // Grab this putt.
          grabbedIndex.value = i;
          dragSvgX.value = xs[i]; // start exactly on the marker
          dragSvgY.value = ys[i];
          grabScale.value = withSpring(1.5, { damping: 12, stiffness: 200 });
          runOnJS(triggerHaptic)();
          return;
        }
      }
    });

  const pinchGesture = Gesture.Pinch()
    .onStart((event) => {
      'worklet';
      if (!zoomEnabled) return;
      isPinching.value = true;
      scaleStart.value = scale.value;
      focalX.value = event.focalX;
      focalY.value = event.focalY;
    })
    .onUpdate((event) => {
      'worklet';
      // Only pinch if no putt is being dragged.
      if (grabbedIndex.value >= 0) return;

      const newScale = Math.max(minScale, Math.min(maxScale, scaleStart.value * event.scale));
      translateX.value += focalX.value - focalX.value * (newScale / scale.value);
      translateY.value += focalY.value - focalY.value * (newScale / scale.value);
      scale.value = newScale;
    })
    .onEnd(() => {
      'worklet';
      isPinching.value = false;
    });

  const panGesture = Gesture.Pan()
    .onStart(() => {
      'worklet';
      panStartX.value = translateX.value;
      panStartY.value = translateY.value;
    })
    .onUpdate((event) => {
      'worklet';
      if (grabbedIndex.value >= 0) {
        // Drag mode — move the grabbed putt, lock the view.
        dragSvgX.value = (event.x - translateX.value) / scale.value;
        dragSvgY.value = (event.y - translateY.value) / scale.value;
      } else if (!isPinching.value) {
        // Pan mode — move the view.
        translateX.value = panStartX.value + event.translationX;
        translateY.value = panStartY.value + event.translationY;
      }
    })
    .onEnd(() => {
      'worklet';
      if (grabbedIndex.value >= 0) {
        runOnJS(commitDrag)(grabbedIndex.value, dragSvgX.value, dragSvgY.value);
        grabScale.value = withSpring(1, { damping: 12, stiffness: 200 });
        grabbedIndex.value = -1;
      }
    });

  const gesture = Gesture.Simultaneous(pinchGesture, longPressGesture, panGesture);

  // ─── Animated props ───────────────────────────────────────────────────────────

  /** Applied to the root `AnimatedG` — pans and zooms the entire canvas. */
  const groupAnimatedProps = useAnimatedProps(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  /**
   * Animate the camera to centre on a given SVG coordinate.
   * Call from the JS thread (e.g. useEffect or a button press handler).
   *
   * @param svgX      - Target SVG x coordinate (from toSvgPoint).
   * @param svgY      - Target SVG y coordinate (from toSvgPoint).
  * @param newScale  - Desired zoom level (defaults to the configured centerScale).
   */
  const centerOnSvgPoint = useCallback(
    (svgX: number, svgY: number, newScale = centerScale) => {
      scale.value = withSpring(newScale, SPRING);
      translateX.value = withSpring(svgSize / 2 - svgX * newScale, SPRING);
      translateY.value = withSpring(svgSize / 2 - svgY * newScale, SPRING);
    },
    [scale, translateX, translateY, svgSize]
  );

  return {
    gesture,
    groupAnimatedProps,
    // Individual shared values consumed by layers
    scale,
    grabbedIndex,
    dragSvgX,
    dragSvgY,
    grabScale,
    centerOnSvgPoint,
  };
}


