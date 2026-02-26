import React, { useMemo } from 'react';
import { Path } from 'react-native-svg';
import type { Bunker, LatLon } from '../types';
import type { SvgPoint } from '../utils/curveUtils';
import { catmullRomClosedPath } from '../utils/curveUtils';

interface BunkerLayerProps {
  bunkers: Bunker[];
  toSvgPoint: (coord: LatLon) => SvgPoint;
}

/** Renders sand bunker polygons as flat sandy-beige filled shapes. */
export const BunkerLayer = React.memo(function BunkerLayer({
  bunkers,
  toSvgPoint,
}: BunkerLayerProps) {
  const paths = useMemo(
    () =>
      bunkers.map((bunker) => {
        const pts = bunker.coordinates.map((c) => toSvgPoint(c));
        return catmullRomClosedPath(pts);
      }),
    [bunkers, toSvgPoint]
  );

  return (
    <>
      {paths.map((d, index) => (
        <Path key={`bunker-${index}`} d={d} fill="#D2B48C" />
      ))}
    </>
  );
});
