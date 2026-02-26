import type { Bounds, LatLon } from '../types';

const EPS = 1e-9;

// ─── Internal helpers ─────────────────────────────────────────────────────────

function within(v: number, a: number, b: number): boolean {
  return v >= Math.min(a, b) - EPS && v <= Math.max(a, b) + EPS;
}

function isInside(p: LatLon, b: Bounds): boolean {
  return (
    p.latitude >= b.minLat &&
    p.latitude <= b.maxLat &&
    p.longitude >= b.minLon &&
    p.longitude <= b.maxLon
  );
}

interface Hit {
  t: number;
  latitude: number;
  longitude: number;
}

/**
 * Returns the first intersection of segment p1→p2 with the bounding box,
 * parameterised as t ∈ [0, 1].
 */
function firstIntersection(p1: LatLon, p2: LatLon, b: Bounds): Hit | null {
  const dx = p2.longitude - p1.longitude;
  const dy = p2.latitude - p1.latitude;
  const hits: Hit[] = [];

  if (Math.abs(dx) > EPS) {
    let t = (b.minLon - p1.longitude) / dx;
    let lat = p1.latitude + t * dy;
    if (t >= 0 && t <= 1 && within(lat, b.minLat, b.maxLat))
      hits.push({ t, longitude: b.minLon, latitude: lat });

    t = (b.maxLon - p1.longitude) / dx;
    lat = p1.latitude + t * dy;
    if (t >= 0 && t <= 1 && within(lat, b.minLat, b.maxLat))
      hits.push({ t, longitude: b.maxLon, latitude: lat });
  }

  if (Math.abs(dy) > EPS) {
    let t = (b.minLat - p1.latitude) / dy;
    let lon = p1.longitude + t * dx;
    if (t >= 0 && t <= 1 && within(lon, b.minLon, b.maxLon))
      hits.push({ t, latitude: b.minLat, longitude: lon });

    t = (b.maxLat - p1.latitude) / dy;
    lon = p1.longitude + t * dx;
    if (t >= 0 && t <= 1 && within(lon, b.minLon, b.maxLon))
      hits.push({ t, latitude: b.maxLat, longitude: lon });
  }

  if (hits.length === 0) return null;
  hits.sort((a, z) => a.t - z.t);
  return hits[0];
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Clips each segment of a polyline to the bounding box.
 * Segments where both endpoints are outside the bounds are dropped.
 * When exactly one endpoint is outside, it is replaced with the boundary
 * intersection.
 *
 * Returns an array of independent clipped sub-polylines (one per visible
 * segment group, so gaps are handled naturally).
 */
export function clampLineToBounds(
  lines: LatLon[][],
  bounds: Bounds
): LatLon[][] {
  const result: LatLon[][] = [];

  for (const line of lines) {
    const clipped: LatLon[] = [];

    for (let i = 0; i < line.length - 1; i++) {
      const p1 = line[i];
      const p2 = line[i + 1];
      const p1In = isInside(p1, bounds);
      const p2In = isInside(p2, bounds);

      if (p1In && p2In) {
        if (clipped.length === 0) clipped.push(p1);
        clipped.push(p2);
      } else if (p1In && !p2In) {
        if (clipped.length === 0) clipped.push(p1);
        const hit = firstIntersection(p1, p2, bounds);
        if (hit) clipped.push({ latitude: hit.latitude, longitude: hit.longitude });
      } else if (!p1In && p2In) {
        const hit = firstIntersection(p1, p2, bounds);
        if (hit) clipped.push({ latitude: hit.latitude, longitude: hit.longitude });
        clipped.push(p2);
      }
      // Both outside: skip
    }

    if (clipped.length > 1) result.push(clipped);
  }

  return result;
}

/**
 * Computes a Bounds object from an array of LatLon coordinates with an
 * optional padding factor (default 10 %).
 */
export function computeBounds(coords: LatLon[], paddingFactor = 0.1): Bounds {
  const lats = coords.map((c) => c.latitude);
  const lons = coords.map((c) => c.longitude);

  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);

  const latSpan = maxLat - minLat;
  const lonSpan = maxLon - minLon;
  const range = Math.max(latSpan, lonSpan) * (1 + paddingFactor);

  return { minLat, maxLat, minLon, maxLon, range };
}
