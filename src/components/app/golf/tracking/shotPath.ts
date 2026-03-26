import type { LatLng } from "@/models/geo";
import type { ShotShape } from "@/models/round.session.types";

/**
 * Returns a control point that bows the line left or right relative to the
 * direction of travel.
 */
export function curveControlPoint(
  start: LatLng,
  end: LatLng,
  shape: ShotShape,
): LatLng | null {
  const dlat = end.latitude - start.latitude;
  const dlng = end.longitude - start.longitude;

  let sign = 0;
  let fraction = 0;

  switch (shape) {
    case "draw":
      sign = 1;
      fraction = 0.1;
      break;
    case "hook":
      sign = 1;
      fraction = 0.25;
      break;
    case "fade":
      sign = -1;
      fraction = 0.1;
      break;
    case "slice":
      sign = -1;
      fraction = 0.25;
      break;
    default:
      return null;
  }

  return {
    latitude: (start.latitude + end.latitude) / 2 + sign * dlng * fraction,
    longitude: (start.longitude + end.longitude) / 2 + sign * -dlat * fraction,
  };
}

/**
 * Samples `steps + 1` points along a quadratic Bezier from `start` through
 * `ctrl` to `end`. Falls back to a straight segment when no control point exists.
 */
export function bezierPoints(
  start: LatLng,
  end: LatLng,
  ctrl: LatLng | null,
  steps = 24,
): LatLng[] {
  if (!ctrl) return [start, end];

  const points: LatLng[] = [];
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const mt = 1 - t;
    points.push({
      latitude: mt * mt * start.latitude + 2 * mt * t * ctrl.latitude + t * t * end.latitude,
      longitude: mt * mt * start.longitude + 2 * mt * t * ctrl.longitude + t * t * end.longitude,
    });
  }

  return points;
}

/** Point on the Bezier at t = 0.5 (visual midpoint of the arc). */
export function bezierMidpoint(start: LatLng, end: LatLng, ctrl: LatLng | null): LatLng {
  if (!ctrl) {
    return {
      latitude: (start.latitude + end.latitude) / 2,
      longitude: (start.longitude + end.longitude) / 2,
    };
  }

  const t = 0.5;
  const mt = 1 - t;
  return {
    latitude: mt * mt * start.latitude + 2 * mt * t * ctrl.latitude + t * t * end.latitude,
    longitude: mt * mt * start.longitude + 2 * mt * t * ctrl.longitude + t * t * end.longitude,
  };
}
