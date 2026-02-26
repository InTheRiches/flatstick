import { useCallback, useMemo } from 'react';
import { Dimensions } from 'react-native';
import type { Bounds, LatLon } from '../types';
import type { SvgPoint } from '../utils/curveUtils';

const CANVAS_PADDING = 48;

/**
 * Provides memoised coordinate-transform functions for a given `bounds` and
 * a dynamically measured canvas size.
 *
 * All conversion functions are stable across renders unless `bounds` changes.
 */
export function useCoordinateTransform(bounds: Bounds) {
  /**
   * The canvas is always a square whose side length is the window width minus
   * horizontal padding.  Using a fixed Dimensions call here is intentional:
   * the green map is designed for full-width rendering and the value only
   * changes on device rotation (not a supported use-case for this component).
   */
  const svgSize = useMemo(
    () => Dimensions.get('window').width - CANVAS_PADDING,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  /** Converts a lat/lon coordinate into an SVG pixel point. */
  const toSvgPoint = useCallback(
    (coord: LatLon): SvgPoint => ({
      x: ((coord.longitude - bounds.minLon) / bounds.range) * svgSize,
      // Latitude increases upwards; SVG Y increases downwards → invert.
      y: ((bounds.maxLat - coord.latitude) / bounds.range) * svgSize,
    }),
    [bounds, svgSize]
  );

  /** Inverse of `toSvgPoint` — converts SVG pixel coords back to lat/lon. */
  const fromSvgPoint = useCallback(
    (x: number, y: number): LatLon => ({
      latitude: bounds.maxLat - (y / svgSize) * bounds.range,
      longitude: (x / svgSize) * bounds.range + bounds.minLon,
    }),
    [bounds, svgSize]
  );

  return { svgSize, toSvgPoint, fromSvgPoint };
}
