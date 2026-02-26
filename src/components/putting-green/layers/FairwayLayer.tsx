import React, { useMemo } from 'react';
import { Platform } from 'react-native';
import { Defs, Path, Pattern, Rect } from 'react-native-svg';
import type { Bounds, LatLon } from '../types';
import { clampLineToBounds } from '../utils/boundsUtils';
import type { SvgPoint } from '../utils/curveUtils';
import { catmullRomClosedPath } from '../utils/curveUtils';

interface FairwayLayerProps {
  fairways: LatLon[][];
  bounds: Bounds;
  toSvgPoint: (coord: LatLon) => SvgPoint;
}

/**
 * Renders one or more fairway polygons with a striped grass pattern.
 * Each fairway is clipped to the current bounding box before rendering.
 */
export const FairwayLayer = React.memo(function FairwayLayer({
  fairways,
  bounds,
  toSvgPoint,
}: FairwayLayerProps) {
  const clippedPaths = useMemo(() => {
    const clipped = clampLineToBounds(fairways, bounds);
    return clipped.map((segment) => {
      const pts = segment.map((c) => toSvgPoint(c));
      return catmullRomClosedPath(pts);
    });
  }, [fairways, bounds, toSvgPoint]);

  const patternRotation =
    Platform.OS === 'android' ? 'rotate(-45)' : 'rotate(0)';

  if (clippedPaths.length === 0) return null;

  return (
    <>
      <Defs>
        <Pattern
          id="fairwayPattern"
          patternUnits="userSpaceOnUse"
          width="60"
          height="40"
          patternTransform={patternRotation}
        >
          <Rect
            width="60"
            height="40"
            fill={Platform.OS === 'android' ? '#43ac0a' : '#429a06'}
          />
          <Rect
            width="30"
            height="40"
            fill={Platform.OS === 'android' ? '#2a9100' : '#0b7200'}
            opacity={0.4}
          />
        </Pattern>
      </Defs>
      {clippedPaths.map((d, index) => (
        <Path key={`fairway-${index}`} d={d} fill="url(#fairwayPattern)" />
      ))}
    </>
  );
});
