/**
 * Elevation interpolation engine.
 *
 * Pure functions that operate on a validated `LidarGrid` to derive elevation
 * values and gradient vectors at arbitrary geographic coordinates.
 *
 * These functions are the foundation for both break prediction and the
 * practice-round generator — nothing in this file touches the network or state.
 */

import type { LidarGrid } from "@/models/lidar"
import {
    METERS_PER_LAT_DEGREE,
    metersPerLonDegree
} from "@/utils/courses/geometry/geo.math"

// ---------------------------------------------------------------------------
// Bilinear interpolation
// ---------------------------------------------------------------------------

/**
 * Interpolate the elevation at geographic position (`lon`, `lat`) using bilinear
 * interpolation on the `LidarGrid`.
 *
 * The grid is treated as regularly spaced in both x (longitude) and y (latitude).
 * Grid spacing is derived from adjacent sample positions rather than assumed.
 *
 * Returns `null` when:
 *   - The grid contains fewer than 4 samples (not interpolatable).
 *   - The grid is degenerate (all points on a single row).
 *
 * Points outside the grid extents are clamped to the nearest grid cell rather
 * than returning null, so that edge-of-green queries degrade gracefully.
 *
 * @param lon  - Longitude of the query point.
 * @param lat  - Latitude of the query point.
 * @param grid - Validated rectangular elevation grid.
 */
export function getElevationBilinear(
  lon: number,
  lat: number,
  grid: LidarGrid,
): number | null {
  const { samples, width, height } = grid

  if (samples.length < 4 || width < 2 || height < 2) return null

  const xOrigin = samples[0].location.x
  const yOrigin = samples[0].location.y

  // x-spacing: distance between adjacent columns in the first row.
  const xSpacing = samples[1].location.x - xOrigin
  // y-spacing: distance between the first two rows.
  const ySpacing = samples[width].location.y - yOrigin

  if (xSpacing === 0 || ySpacing === 0) return null

  // Fractional grid position of the query point.
  const col = (lon - xOrigin) / xSpacing
  const row = (lat - yOrigin) / ySpacing

  // Integer cell indices, clamped to valid range.
  const i = Math.max(0, Math.min(Math.floor(col), width - 2))
  const j = Math.max(0, Math.min(Math.floor(row), height - 2))

  // Bilinear weights.
  const u = col - Math.floor(col) // horizontal (within cell)
  const v = row - Math.floor(row) // vertical   (within cell)

  // Four surrounding grid points (row-major, y-then-x order):
  //   (i,j)   — top-left      (i+1,j)   — top-right
  //   (i,j+1) — bottom-left   (i+1,j+1) — bottom-right
  const z00 = samples[j * width + i].value
  const z10 = samples[j * width + (i + 1)].value
  const z01 = samples[(j + 1) * width + i].value
  const z11 = samples[(j + 1) * width + (i + 1)].value

  // Interpolate across the top edge, then the bottom edge, then vertically.
  const zTop = z00 * (1 - u) + z10 * u
  const zBottom = z01 * (1 - u) + z11 * u
  return zTop * (1 - v) + zBottom * v
}

// ---------------------------------------------------------------------------
// Gradient (slope vector)
// ---------------------------------------------------------------------------

/**
 * The slope vector at a grid point, expressed as dimensionless rise-over-run
 * ratios (metres of elevation per metre of horizontal distance).
 */
export type GradientVector = {
  /** Slope in the longitude direction (east–west). Positive = tilts east. */
  dx: number
  /** Slope in the latitude direction (south–north). Positive = tilts north. */
  dy: number
}

/**
 * Compute the elevation gradient at (`lon`, `lat`) using central finite
 * differences with a step distance of `stepMeters`.
 *
 * Both the longitude and latitude step sizes are converted from metres to
 * degrees using the correct scale factors for the given latitude, so the
 * returned gradient is in consistent m/m units regardless of position.
 *
 * Returns `null` when `getElevationBilinear` returns null for any of the four
 * surrounding sample points (e.g. degenerate grid).
 *
 * @param lon        - Longitude of the query point.
 * @param lat        - Latitude of the query point.
 * @param grid       - Validated rectangular elevation grid.
 * @param stepMeters - Central-difference step size in metres (default 1 m).
 */
export function getPuttGradient(
  lon: number,
  lat: number,
  grid: LidarGrid,
  stepMeters = 1,
): GradientVector | null {
  const hLat = stepMeters / METERS_PER_LAT_DEGREE
  const hLon = stepMeters / metersPerLonDegree(lat)

  const zxPlus = getElevationBilinear(lon + hLon, lat, grid)
  const zxMinus = getElevationBilinear(lon - hLon, lat, grid)
  const zyPlus = getElevationBilinear(lon, lat + hLat, grid)
  const zyMinus = getElevationBilinear(lon, lat - hLat, grid)

  if (
    zxPlus === null ||
    zxMinus === null ||
    zyPlus === null ||
    zyMinus === null
  ) {
    return null
  }

  return {
    dx: (zxPlus - zxMinus) / (2 * stepMeters),
    dy: (zyPlus - zyMinus) / (2 * stepMeters),
  }
}
