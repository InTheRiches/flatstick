import React, { useMemo } from 'react';
import { Circle, G, Text } from 'react-native-svg';
import type { CourseGreen, LatLon } from '../types';
import type { SvgPoint } from '../utils/curveUtils';
import { getPolygonCentroid } from '../utils/polygonUtils';

interface HoleLabelLayerProps {
  courseGreens: CourseGreen[];
  toSvgPoint: (coord: LatLon) => SvgPoint;
  currentHoleNumber: number;
}

const BADGE_RADIUS = 5;
const FONT_SIZE = 5;

/**
 * Renders a numbered badge at the centroid of every green.
 * The active hole's badge is highlighted in white; all others are dark.
 *
 * These labels are rendered inside the animated canvas group, so they scale
 * and pan with the rest of the course.  At the default centering zoom (×5)
 * the badges appear at a comfortable reading size.
 */
export const HoleLabelLayer = React.memo(function HoleLabelLayer({
  courseGreens,
  toSvgPoint,
  currentHoleNumber,
}: HoleLabelLayerProps) {
  const labels = useMemo(
    () =>
      courseGreens.map((green) => {
        const centroid = getPolygonCentroid(green.coords);
        const svgPoint = toSvgPoint(centroid);
        const isActive = green.holeNumber === String(currentHoleNumber);
        return { ...svgPoint, label: green.holeNumber, isActive };
      }),
    [courseGreens, toSvgPoint, currentHoleNumber]
  );

  return (
    <>
      {labels.map(({ x, y, label, isActive }) => (
        <G key={`hole-label-${label}`}>
          <Circle
            cx={x}
            cy={y}
            r={BADGE_RADIUS}
            fill={isActive ? 'white' : 'rgba(0,0,0,0.55)'}
            stroke={isActive ? '#246903' : 'rgba(255,255,255,0.3)'}
            strokeWidth={0.5}
          />
          <Text
            x={x}
            y={y + FONT_SIZE * 0.36}
            fontSize={FONT_SIZE}
            fontWeight="700"
            fill={isActive ? '#246903' : 'white'}
            textAnchor="middle"
          >
            {label}
          </Text>
        </G>
      ))}
    </>
  );
});
