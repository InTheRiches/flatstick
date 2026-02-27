/**
 * Geographic distance utilities.
 *
 * All public functions deal in meters unless the name includes explicit units.
 * The `toYards` helper converts meters → yards for display.
 */

import type { LatLng, XYPoint } from "@/models/geo";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const EARTH_RADIUS_M = 6_371_000; // metres
const METERS_PER_YARD = 0.9144;

// ---------------------------------------------------------------------------
// Core haversine
// ---------------------------------------------------------------------------

/**
 * Haversine great-circle distance between two LatLng points (metres).
 */
export function haversineMeters(a: LatLng, b: LatLng, padding?: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;

  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);

  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);

  const c =
    sinDLat * sinDLat +
    sinDLon * sinDLon * Math.cos(lat1) * Math.cos(lat2);

  let result = 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(c));
  if (padding !== undefined) {
    result += padding;
  }
  return result;
}

/** Convert metres to yards (rounded). */
export function toYards(meters: number): number {
  return Math.round(meters / METERS_PER_YARD);
}

/**
 * Bearing in degrees (0–360) from `a` to `b`.
 */
export function bearingDegrees(a: LatLng, b: LatLng): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const toDeg = (r: number) => (r * 180) / Math.PI;

  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const dLon = toRad(b.longitude - a.longitude);

  const y = Math.sin(dLon) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

  const brng = toDeg(Math.atan2(y, x));
  return (brng + 360) % 360;
}

/**
 * Linearly interpolate between two LatLng points.
 * @param t - 0 = a, 1 = b
 */
export function lerpLatLng(a: LatLng, b: LatLng, t: number): LatLng {
  return {
    latitude: a.latitude + (b.latitude - a.latitude) * t,
    longitude: a.longitude + (b.longitude - a.longitude) * t,
  };
}

// ---------------------------------------------------------------------------
// Green geometry helpers
// ---------------------------------------------------------------------------

/** Centroid of an XYPoint polygon (x = lon, y = lat). */
export function polygonCentroid(polygon: XYPoint[]): LatLng {
  if (polygon.length === 0) return { latitude: 0, longitude: 0 };
  const sum = polygon.reduce(
    (acc, p) => ({ lat: acc.lat + p.y, lon: acc.lon + p.x }),
    { lat: 0, lon: 0 },
  );
  return {
    latitude: sum.lat / polygon.length,
    longitude: sum.lon / polygon.length,
  };
}

export type GreenDistances = {
  /** Yards to the nearest polygon vertex from player (front). */
  front: number;
  /** Yards to the polygon centroid (center). */
  center: number;
  /** Yards to the farthest polygon vertex from player (back). */
  back: number;
};

/**
 * Compute front / center / back distances (in yards) from `player` to a
 * ProcessedGreen polygon.
 */
export function greenDistances(
  player: LatLng,
  polygon: XYPoint[],
): GreenDistances {
  const vertices: LatLng[] = polygon.map((p) => ({
    latitude: p.y,
    longitude: p.x,
  }));

  const distancesM = vertices.map((v) => haversineMeters(player, v));

  const front = toYards(Math.min(...distancesM));
  const back = toYards(Math.max(...distancesM));
  const center = toYards(haversineMeters(player, polygonCentroid(polygon)));

  return { front, center, back };
}

/**
 * Min and max yard distances from `player` to any vertex of a hazard polygon
 * (LatLng vertices, not XY).
 *   min → nearest edge / "front"
 *   max → farthest edge / "back"
 */
export type HazardDistances = { min: number; max: number };

export function hazardDistances(
  player: LatLng,
  coordinates: LatLng[],
): HazardDistances {
  if (coordinates.length === 0) return { min: 0, max: 0 };
  const metersArr = coordinates.map((v) => haversineMeters(player, v));
  return {
    min: toYards(Math.min(...metersArr)),
    max: toYards(Math.max(...metersArr)),
  };
}
