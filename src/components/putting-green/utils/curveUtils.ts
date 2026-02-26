/**
 * Pure SVG path generators — no d3 dependency required.
 *
 * Both functions implement the Catmull-Rom spline algorithm converted to
 * cubic Bézier segments (α = 1/6, equivalent to d3.curveCatmullRom with
 * default alpha = 0.5).
 */

export type SvgPoint = { x: number; y: number };

const ALPHA = 1 / 6;

/**
 * Builds a **closed** Catmull-Rom SVG path string.
 * Produces the same output as d3.curveCatmullRomClosed.
 */
export function catmullRomClosedPath(pts: SvgPoint[]): string {
  if (pts.length < 3) return '';
  const n = pts.length;
  let d = `M ${pts[0].x} ${pts[0].y}`;

  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];

    const cp1x = p1.x + ALPHA * (p2.x - p0.x);
    const cp1y = p1.y + ALPHA * (p2.y - p0.y);
    const cp2x = p2.x - ALPHA * (p3.x - p1.x);
    const cp2y = p2.y - ALPHA * (p3.y - p1.y);

    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }

  return d + ' Z';
}

/**
 * Builds an **open** Catmull-Rom SVG path string.
 * Useful for fairway edge lines.
 */
export function catmullRomOpenPath(pts: SvgPoint[]): string {
  if (pts.length < 2) return '';
  if (pts.length === 2) {
    return `M ${pts[0].x} ${pts[0].y} L ${pts[1].x} ${pts[1].y}`;
  }

  const n = pts.length;
  let d = `M ${pts[0].x} ${pts[0].y}`;

  for (let i = 0; i < n - 1; i++) {
    const p0 = i === 0 ? pts[0] : pts[i - 1];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = i + 2 < n ? pts[i + 2] : pts[n - 1];

    const cp1x = p1.x + ALPHA * (p2.x - p0.x);
    const cp1y = p1.y + ALPHA * (p2.y - p0.y);
    const cp2x = p2.x - ALPHA * (p3.x - p1.x);
    const cp2y = p2.y - ALPHA * (p3.y - p1.y);

    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }

  return d;
}
