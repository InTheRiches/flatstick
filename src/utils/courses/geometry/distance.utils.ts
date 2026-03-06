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
  /** Yards to the green edge intersected first along the player→pin axis (front). */
  front: number;
  /** Yards to the pin (or centroid if no pin provided). */
  center: number;
  /** Yards to the green edge intersected last along the player→pin axis (back). */
  back: number;
};

/**
 * Compute front / center / back distances (in yards) from `player` to a
 * ProcessedGreen polygon.
 *
 * Casts a ray from `player` through `pinCoord` (defaulting to the polygon
 * centroid) and finds where it intersects the polygon boundary, giving
 * directionally-correct front and back distances regardless of green shape.
 */
export function greenDistances(
  player: LatLng,
  polygon: XYPoint[],
  pinCoord?: LatLng | null,
): GreenDistances {
  const centroid = polygonCentroid(polygon);
  const pin = pinCoord ?? centroid;
  const center = toYards(haversineMeters(player, pin));

  // Project everything onto a local metric plane (player = origin).
  // Equirectangular approximation is accurate enough at green scales (<200 m).
  const cosLat = Math.cos((player.latitude * Math.PI) / 180);
  const latScale = EARTH_RADIUS_M * (Math.PI / 180);
  const lonScale = latScale * cosLat;

  const toLocal = (c: LatLng) => ({
    x: (c.longitude - player.longitude) * lonScale,
    y: (c.latitude - player.latitude) * latScale,
  });

  const pinLocal = toLocal(pin);
  const dirLen = Math.sqrt(pinLocal.x ** 2 + pinLocal.y ** 2);

  // Fallback: player is essentially standing on the pin.
  if (dirLen < 0.1) {
    const verts = polygon.map((p) => ({ latitude: p.y, longitude: p.x }));
    const dists = verts.map((v) => haversineMeters(player, v));
    return { front: toYards(Math.min(...dists)), center, back: toYards(Math.max(...dists)) };
  }

  const dir = { x: pinLocal.x / dirLen, y: pinLocal.y / dirLen };
  const localVerts = polygon.map((p) => toLocal({ latitude: p.y, longitude: p.x }));

  // Ray–segment intersection for each polygon edge.
  // Ray: P = t * dir  (t in metres, t ≥ 0 means ahead of player)
  // Edge: Q = a + s * (b − a),  s ∈ [0, 1]
  // Cramer's rule:  det = dx * dir.y − dy * dir.x
  //                 t   = (dx * a.y − dy * a.x) / det
  //                 s   = (dir.x * a.y − dir.y * a.x) / det
  const tValues: number[] = [];
  const n = localVerts.length;

  for (let i = 0; i < n; i++) {
    const a = localVerts[i];
    const b = localVerts[(i + 1) % n];
    const dx = b.x - a.x;
    const dy = b.y - a.y;

    const det = dx * dir.y - dy * dir.x;
    if (Math.abs(det) < 1e-9) continue; // ray parallel to edge

    const t = (dx * a.y - dy * a.x) / det;
    const s = (dir.x * a.y - dir.y * a.x) / det;

    if (t >= -0.1 && s >= -1e-6 && s <= 1 + 1e-6) {
      tValues.push(Math.max(0, t)); // clamp negatives from floating-point error
    }
  }

  // Need at least two intersections for a meaningful front/back.
  if (tValues.length < 2) {
    const verts = polygon.map((p) => ({ latitude: p.y, longitude: p.x }));
    const dists = verts.map((v) => haversineMeters(player, v));
    return { front: toYards(Math.min(...dists)), center, back: toYards(Math.max(...dists)) };
  }

  return {
    front: toYards(Math.min(...tValues)),
    center,
    back: toYards(Math.max(...tValues)),
  };
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
