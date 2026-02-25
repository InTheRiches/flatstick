/**
 * Elevation data types produced from USGS 3DEP samples.
 *
 * These types exist only after the USGS normalizer has validated and
 * structured the raw API response.  Nothing above the normalizer layer
 * ever touches a raw `RawUsgs3DEPSample`.
 */

import type { XYPoint } from "./geo"

// ---------------------------------------------------------------------------
// Grid sample
// ---------------------------------------------------------------------------

/**
 * A single elevation point in a validated lidar grid.
 * The `value` field has already been parsed from a string to a number.
 */
export type LidarSample = {
  /** Geographic position: x = longitude, y = latitude. */
  location: XYPoint
  /** Elevation above sea level in metres (WGS84 / NAVD88). */
  value: number
}

// ---------------------------------------------------------------------------
// Validated grid
// ---------------------------------------------------------------------------

/**
 * A rectangular, regularly-spaced elevation grid covering a green's bounding
 * box. Produced by `buildLidarGrid` in `usgs.normalizer.ts`.
 *
 * Sorting contract (enforced by the normalizer):
 *   Samples are ordered first by y ascending (south → north), then by x
 *   ascending (west → east) within each row.
 *
 * Grid indexing:
 *   sample at column i, row j → samples[j * width + i]
 */
export type LidarGrid = {
  samples: LidarSample[]
  /** Number of columns (unique x values). */
  width: number
  /** Number of rows (unique y values). Must satisfy width × height === samples.length. */
  height: number
}
