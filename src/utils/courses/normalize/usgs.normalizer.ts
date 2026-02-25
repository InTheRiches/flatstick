/**
 * USGS 3DEP normalizer.
 *
 * Pure functions that convert raw `RawUsgs3DEPSample[]` arrays into validated
 * `LidarGrid` domain objects.  No network I/O.  No state.  No side effects.
 *
 * Layer contract:
 *   - Input:  `RawUsgs3DEPSample[]` from `@/services/usgs/usgs.types`
 *   - Output: `LidarGrid` from `@/models/lidar`
 */

import type { LidarGrid, LidarSample } from "@/models/lidar";
import type { RawUsgs3DEPSample } from "@/services/usgs/usgs.types";

// ---------------------------------------------------------------------------
// Public result type
// ---------------------------------------------------------------------------

/**
 * Discriminated union returned by `buildLidarGrid`.
 *
 * Errors are typed rather than thrown so callers can decide how to respond
 * (e.g. mark the green as lidar=null vs. hard-fail the load).
 */
export type LidarBuildResult =
  | { ok: true; grid: LidarGrid }
  | { ok: false; reason: "empty" | "non_rectangular" }

// ---------------------------------------------------------------------------
// Normalizer
// ---------------------------------------------------------------------------

/**
 * Convert raw USGS 3DEP samples into a validated, rectangular `LidarGrid`.
 *
 * Steps:
 *   1. Parse `value` strings to numbers (3DEP encodes elevation as a string).
 *   2. Sort samples by y ascending then x ascending (south→north, west→east).
 *   3. Determine grid width by finding the first row break.
 *   4. Validate that total sample count is exactly width × height.
 *   5. Return the structured grid or a typed error.
 *
 * Why validation matters:
 *   The elevation interpolation in `elevation.engine.ts` assumes a rectangular
 *   grid and will silently produce wrong values when that invariant is broken.
 *   This normalizer enforces the invariant at the boundary so the engine can
 *   rely on it unconditionally.
 *
 * @param rawSamples - Samples as returned by `fetch3DEPSamples`.
 */
export function buildLidarGrid(
  rawSamples: RawUsgs3DEPSample[],
): LidarBuildResult {
  if (rawSamples.length === 0) {
    return { ok: false, reason: "empty" }
  }

  // 1. Parse values.
  const parsed: LidarSample[] = rawSamples.map((s) => ({
    location: { x: s.location.x, y: s.location.y },
    value: parseFloat(s.value),
  }))

  // 2. Sort: y ascending, then x ascending.
  parsed.sort((a, b) =>
    a.location.y !== b.location.y
      ? a.location.y - b.location.y
      : a.location.x - b.location.x,
  )

  // 3. Determine width = number of unique x values in the first row.
  const firstY = parsed[0].location.y
  let width = parsed.findIndex((s) => s.location.y !== firstY)
  if (width === -1) {
    // All samples are on the same latitude row — degenerate grid.
    width = parsed.length
  }

  // 4. Validate rectangular invariant.
  if (parsed.length % width !== 0) {
    return { ok: false, reason: "non_rectangular" }
  }

  const height = parsed.length / width

  return {
    ok: true,
    grid: { samples: parsed, width, height },
  }
}
