import React, { useMemo } from 'react';
import { Circle, G, Path } from 'react-native-svg';
import type { LatLon, PinLocation, SelectedHole } from '../types';
import type { SvgPoint } from '../utils/curveUtils';

// Flag / pin path scaled to a small SVG icon (original is a 24×24 viewBox).
const FLAG_PATH =
  'M3 2.25a.75.75 0 0 1 .75.75v.54l1.838-.46a9.75 9.75 0 0 1 6.725.738l.108.054A8.25 8.25 0 0 0 18 4.524l3.11-.732a.75.75 0 0 1 .917.81 47.784 47.784 0 0 0 .005 10.337.75.75 0 0 1-.574.812l-3.114.733a9.75 9.75 0 0 1-6.594-.77l-.108-.054a8.25 8.25 0 0 0-5.69-.625l-2.202.55V21a.75.75 0 0 1-1.5 0V3A.75.75 0 0 1 3 2.25Z';

const PIN_RADIUS = 6;
const FLAG_SCALE = 0.35;
/** Offset applied to the flag icon so it renders centred on the pin circle. */
const FLAG_OFFSET = -4;

interface PinLayerProps {
  pinLocations: PinLocation[];
  toSvgPoint: (coord: LatLon) => SvgPoint;
  selectedHole?: SelectedHole | null;
}

/**
 * Renders all pin / flag markers on the green.
 *
 * The pin for the currently `selectedHole` is highlighted in red;
 * all others are rendered in white.
 */
export const PinLayer = React.memo(function PinLayer({
  pinLocations,
  toSvgPoint,
  selectedHole,
}: PinLayerProps) {
  const pins = useMemo(
    () =>
      pinLocations.map((pin) => ({
        svgPoint: toSvgPoint(pin),
        isSelected:
          selectedHole != null &&
          pin.latitude === selectedHole.pin.latitude &&
          pin.longitude === selectedHole.pin.longitude,
      })),
    [pinLocations, toSvgPoint, selectedHole]
  );

  return (
    <>
      {pins.map(({ svgPoint, isSelected }, index) => (
        <G key={`pin-${index}`}>
          <Circle
            cx={svgPoint.x}
            cy={svgPoint.y}
            r={PIN_RADIUS}
            fill={isSelected ? '#ef4343' : 'white'}
            stroke="white"
            strokeWidth={isSelected ? 1 : 0}
          />
          <Path
            d={FLAG_PATH}
            fill={isSelected ? 'white' : 'black'}
            scale={FLAG_SCALE}
            x={svgPoint.x + FLAG_OFFSET}
            y={svgPoint.y + FLAG_OFFSET}
            fillRule="evenodd"
            clipRule="evenodd"
          />
        </G>
      ))}
    </>
  );
});
