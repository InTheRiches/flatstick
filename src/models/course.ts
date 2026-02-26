/**
 * Domain-level course types.
 *
 * These are the canonical shapes the simulation screens, stats engine, and
 * break prediction engine work with.  No raw API types appear here.
 */

import type { BoundingBox, LatLng, XYPoint } from "./geo"
import type { LidarGrid } from "./lidar"

// ---------------------------------------------------------------------------
// Green
// ---------------------------------------------------------------------------

/**
 * A single golf hole's putting green, fully processed and ready for the
 * simulation UI and putting-engine functions.
 */
export type ProcessedGreen = {
  /**
   * Hole number as a string (matches the OSM tag `ref`).
   * Stored as a string because OSM ref values are not guaranteed to be
   * pure integers (e.g. "10a", "B2").
   */
  hole: string

  /**
   * Closed polygon vertices in XY (GeoJSON) convention.
   * x = longitude, y = latitude.
   * Use `isPointInPolygonXY` from polygon.utils.ts to test containment.
   */
  polygon: XYPoint[]

  /**
   * Axis-aligned bounding box used as the query envelope for 3DEP.
   * Derived from polygon extents in the OSM normalizer.
   */
  bbox: BoundingBox

  /**
   * Elevation grid covering this green.
   * `null` when the 3DEP API returned no samples (partial/coastal courses).
   * Functions that require lidar should check for null and surface a typed
   * error rather than crashing.
   */
  lidar: LidarGrid | null
}

// ---------------------------------------------------------------------------
// Course features
// ---------------------------------------------------------------------------

/** A bunker (sand trap) polygon. */
export type BunkerPolygon = {
  /** Original OSM way id — stable across calls for the same feature. */
  osmId: number
  /** Polygon vertices in LatLng convention. */
  coordinates: LatLng[]
}

/**
 * A single fairway segment or polygon.
 * Fairways can be osm `way` or `relation` members; the normalizer flattens
 * them all to this shape.
 */
export type FairwayPolygon = {
  osmId: number
  coordinates: LatLng[]
}

/** A tee box polygon or point. */
export type TeeBox = {
  osmId: number
  coordinates: LatLng[]
}

/** A hole path (centerline from tee to green). */
export type HolePath = {
  hole: string
  coordinates: LatLng[]
}

// ---------------------------------------------------------------------------
// Full course dataset (Firestore-cacheable)
// ---------------------------------------------------------------------------

/**
 * The complete processed dataset for one golf course.
 * This is the object that gets persisted to Firestore and returned to
 * simulation screens.
 */
export type CourseData = {
  /** OSM relation/way id identifying the course. */
  osmId: number
  /** Display name from OSM tags. */
  name: string
  /** All processed putting greens, ordered by hole number string ascending. */
  greens: ProcessedGreen[]
  /** All bunker polygons across the course. */
  bunkers: BunkerPolygon[]
  /** All fairway polygons/segments across the course. */
  fairways: FairwayPolygon[]
  /** All tee boxes across the course. */
  teeBoxes: TeeBox[]
  /** All hole paths across the course. */
  holes: HolePath[]
  /** Unix epoch ms when this record was last fetched from the network. */
  lastFetchedAt: number
}

// ---------------------------------------------------------------------------
// Putting-green practice mode dataset (Firestore-cacheable)
// ---------------------------------------------------------------------------

/**
 * Lightweight dataset for the putting-green practice simulation.
 * One green only — no fairways, no bunkers, no hole numbering.
 */
export type PuttingGreenData = {
  /** OSM way id of the putting green. */
  osmId: number
  /**
   * Green boundary vertices in LatLng convention.
   * (PuttingGreenPolygon renders directly with lat/lon, so we keep LatLng
   * here rather than converting to XY.)
   */
  boundary: LatLng[]
  /** Elevation grid covering the green. */
  lidar: LidarGrid
  /** Unix epoch ms when this record was last fetched from the network. */
  lastFetchedAt: number
}

// ---------------------------------------------------------------------------
// Putt data (session / round data)
// ---------------------------------------------------------------------------

/**
 * A single tap/location recorded during a real or putting-green round.
 * The final tap in a sequence represents the ball location after the last miss;
 * the pin location is stored separately on the hole record.
 */
export type PuttTap = LatLng

/**
 * One hole's recorded data within a real-course round.
 */
export type RealRoundHole = {
  /** 1-based hole number. */
  hole: number
  pinLocation: LatLng | null
  /** Sequence of GPS tap locations representing ball positions between putts. */
  taps: PuttTap[]
  /** True when the player marked the final putt as holed out. */
  holedOut: boolean
  /** Elapsed time on this hole in milliseconds. */
  timeElapsed: number
}

/**
 * One hole's recorded data within a putting-green practice round.
 */
export type PuttingGreenHole = {
  holeNumber: number
  /** Generated start position inside the green. */
  startLocation: LatLng
  pinLocation: LatLng
  /** Sequence of GPS tap locations (misses). */
  taps: PuttTap[]
}
