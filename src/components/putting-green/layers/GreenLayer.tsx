import React, { useMemo } from 'react';
import { Platform } from 'react-native';
import { Defs, G, Path, Pattern, Rect } from 'react-native-svg';
import type { LatLon } from '../types';
import type { SvgPoint } from '../utils/curveUtils';
import { catmullRomClosedPath } from '../utils/curveUtils';

interface GreenLayerProps {
  greenCoords: LatLon[];
  toSvgPoint: (coord: LatLon) => SvgPoint;
  /**
   * Unique identifier used for the SVG Pattern element.
   * Must be unique across all greens rendered in the same SVG canvas.
   */
  patternId: string;
  /**
   * Whether this is the currently active (selected) hole.
   * Active greens are fully opaque; inactive greens are dimmed.
   */
  isActive: boolean;
}

/**
 * Renders a single putting green polygon with a striped grass pattern.
 * The stripe direction is adjusted per-platform to compensate for rendering
 * differences (Android rotates patterns differently to iOS).
 */
export const GreenLayer = React.memo(function GreenLayer({
  greenCoords,
  toSvgPoint,
  patternId,
  isActive,
}: GreenLayerProps) {
  const pathData = useMemo(() => {
    const pts = greenCoords.map((c) => toSvgPoint(c));
    return catmullRomClosedPath(pts);
  }, [greenCoords, toSvgPoint]);

  const patternRotation = Platform.OS === 'android' ? 'rotate(45)' : 'rotate(0)';
  const stripeBase = Platform.OS === 'android' ? '#259704' : '#1f7a04';

  return (
    <G opacity={isActive ? 1 : 0.55}>
      <Defs>
        <Pattern
          id={patternId}
          patternUnits="userSpaceOnUse"
          width="40"
          height="40"
          patternTransform={patternRotation}
        >
          <Rect width="40" height="40" fill="#35aa03" />
          <Rect width="20" height="40" fill={stripeBase} opacity={0.4} />
          <Rect width="40" height="20" fill={stripeBase} opacity={0.4} />
        </Pattern>
      </Defs>
      <Path
        d={pathData}
        fill={`url(#${patternId})`}
        stroke={isActive ? 'white' : 'rgba(0,0,0,0.4)'}
        strokeWidth={0.4}
      />
    </G>
  );
});
