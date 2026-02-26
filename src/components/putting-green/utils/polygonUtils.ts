import type { LatLon } from '../types';

/**
 * Ray-casting algorithm — returns true if `point` is inside `polygon`.
 * Polygon vertices are in `{ latitude, longitude }` format.
 */
export function isPointInPolygon(point: LatLon, polygon: LatLon[]): boolean {
  let inside = false;
  const { latitude: y, longitude: x } = point;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].longitude;
    const yi = polygon[i].latitude;
    const xj = polygon[j].longitude;
    const yj = polygon[j].latitude;

    const intersects =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

    if (intersects) inside = !inside;
  }

  return inside;
}

/**
 * Returns the approximate centroid of a lat/lon polygon.
 */
export function getPolygonCentroid(polygon: LatLon[]): LatLon {
  if (polygon.length === 0) return { latitude: 0, longitude: 0 };

  const sum = polygon.reduce(
    (acc, p) => ({
      latitude: acc.latitude + p.latitude,
      longitude: acc.longitude + p.longitude,
    }),
    { latitude: 0, longitude: 0 }
  );

  return {
    latitude: sum.latitude / polygon.length,
    longitude: sum.longitude / polygon.length,
  };
}
