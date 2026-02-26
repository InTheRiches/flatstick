import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import Svg, { G } from 'react-native-svg';

import { useCoordinateTransform } from './hooks/useCoordinateTransform';
import { useDeviceHeading } from './hooks/useDeviceHeading';
import { useGestureControl } from './hooks/useGestureControl';

import { BunkerLayer } from './layers/BunkerLayer';
import { FairwayLayer } from './layers/FairwayLayer';
import { GreenLayer } from './layers/GreenLayer';
import { HoleLabelLayer } from './layers/HoleLabelLayer';
import { PinLayer } from './layers/PinLayer';
import { PuttPathLayer } from './layers/PuttPathLayer';
import { UserLocationLayer } from './layers/UserLocationLayer';

import type { GreenMapProps, LatLon } from './types';
import { getPolygonCentroid } from './utils/polygonUtils';

const AnimatedG = Animated.createAnimatedComponent(G);

/**
 * GreenMap — a zoomable, pannable SVG map of an entire golf course.
 *
 * All holes are rendered in a single unified SVG canvas.  The camera
 * (pan + zoom) animates to centre on `currentHoleNumber` whenever it changes.
 *
 * Gestures:
 * - **Pan** (one finger): pan the view.
 * - **Pinch**: zoom the view.
 * - **Long press near a putt + drag → release**: move the putt to a new
 *   position.  The view is locked during a drag.
 * - **Tap**: no action.
 *
 * UI controls:
 * - **Recenter button**: floating button that snaps the camera back to the
 *   current hole's green.
 */
export const GreenMap = React.memo(function GreenMap({
  courseGreens,
  bounds,
  currentHoleNumber,
  taps,
  setTaps,
  pinLocations,
  userLocation,
  bunkers = [],
  fairways = [],
  showHeading = false,
  // Zoom defaults
  zoomEnabled = true,
  minZoom = 1,
  maxZoom = 5,
  initialZoom = 8,
  centerZoom = 40,
}: GreenMapProps) {
  // ── Coordinate transforms ────────────────────────────────────────────────
  const { svgSize, toSvgPoint, fromSvgPoint } = useCoordinateTransform(bounds);

  // ── Gesture handling + drag state ────────────────────────────────────────
  const {
    gesture,
    groupAnimatedProps,
    scale,
    grabbedIndex,
    dragSvgX,
    dragSvgY,
    grabScale,
    centerOnSvgPoint,
  } = useGestureControl({
    taps,
    setTaps,
    toSvgPoint,
    fromSvgPoint,
    svgSize,
    zoomEnabled,
    minScale: minZoom,
    maxScale: maxZoom,
    initialScale: initialZoom,
    centerScale: centerZoom,
  });

  // ── Device compass ───────────────────────────────────────────────────────
  const heading = useDeviceHeading(showHeading);

  // ── Active green centroid (SVG space) ────────────────────────────────────
  const activeGreenCentroidSvg = useMemo(() => {
    const active = courseGreens.find(
      (g) => g.holeNumber === String(currentHoleNumber),
    );
    if (!active || active.coords.length === 0) return null;
    const centroid: LatLon = getPolygonCentroid(active.coords);
    return toSvgPoint(centroid);
  }, [courseGreens, currentHoleNumber, toSvgPoint]);

  // ── Auto-center whenever the active hole changes ─────────────────────────
  useEffect(() => {
    if (activeGreenCentroidSvg) {
      centerOnSvgPoint(activeGreenCentroidSvg.x, activeGreenCentroidSvg.y);
    }
    // Only re-run when the hole number changes — not on every centroid recalc.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentHoleNumber]);

  // ── Recenter button handler ──────────────────────────────────────────────
  const handleRecenter = useCallback(() => {
    if (activeGreenCentroidSvg) {
      centerOnSvgPoint(activeGreenCentroidSvg.x, activeGreenCentroidSvg.y);
    }
  }, [activeGreenCentroidSvg, centerOnSvgPoint]);

  const activePinLocations = pinLocations ?? [];

  return (
    <View style={[styles.container, { width: svgSize, height: svgSize }]}>
      <GestureDetector gesture={gesture}>
        <Animated.View style={styles.canvas}>
          <Svg width={svgSize} height={svgSize} style={styles.svg}>
            {/*
             * AnimatedG is the single transform root.  All layers live inside
             * so they pan and zoom as a unit.
             */}
            <AnimatedG animatedProps={groupAnimatedProps}>

              {/* ── Terrain (back to front) ────────────────────────────── */}

              {fairways.length > 0 && (
                <FairwayLayer
                  fairways={fairways}
                  bounds={bounds}
                  toSvgPoint={toSvgPoint}
                />
              )}

              {courseGreens.map((green) => (
                <GreenLayer
                  key={`green-${green.holeNumber}`}
                  greenCoords={green.coords}
                  toSvgPoint={toSvgPoint}
                  patternId={`greenPattern-${green.holeNumber}`}
                  isActive={green.holeNumber === String(currentHoleNumber)}
                />
              ))}

              {bunkers.length > 0 && (
                <BunkerLayer bunkers={bunkers} toSvgPoint={toSvgPoint} />
              )}

              {/* ── Hole badges ────────────────────────────────────────── */}
              {/*<HoleLabelLayer*/}
              {/*  courseGreens={courseGreens}*/}
              {/*  toSvgPoint={toSvgPoint}*/}
              {/*  currentHoleNumber={currentHoleNumber}*/}
              {/*/>*/}

              {/* ── Gameplay (current hole only) ───────────────────────── */}

              <PuttPathLayer
                taps={taps}
                toSvgPoint={toSvgPoint}
                grabbedIndex={grabbedIndex}
                dragSvgX={dragSvgX}
                dragSvgY={dragSvgY}
                grabScale={grabScale}
                scale={scale}
              />

              {activePinLocations.length > 0 && (
                <PinLayer
                  pinLocations={activePinLocations}
                  toSvgPoint={toSvgPoint}
                />
              )}

              {userLocation && (
                <UserLocationLayer
                  userLocation={userLocation}
                  toSvgPoint={toSvgPoint}
                  heading={heading}
                  scale={scale}
                />
              )}

            </AnimatedG>
          </Svg>
        </Animated.View>
      </GestureDetector>

      {/* ── Recenter button ─────────────────────────────────────────────── */}
      <Pressable
        onPress={handleRecenter}
        style={({ pressed }) => [
          styles.recenterButton,
          pressed && styles.recenterPressed,
        ]}
        hitSlop={8}
        accessibilityLabel="Re-centre on current hole"
        accessibilityRole="button"
      >
        <Ionicons name="locate" size={18} color="white" />
      </Pressable>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexShrink: 1,
    overflow: 'hidden',
    borderRadius: 12,
  },
  canvas: {
    flex: 1,
  },
  svg: {
    backgroundColor: '#246903',
    borderRadius: 12,
  },
  recenterButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recenterPressed: {
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
});
