// ─── Coordinate primitives ───────────────────────────────────────────────────

export interface LatLon {
  latitude: number;
  longitude: number;
}

/**
 * Pre-computed bounding box for a green with a unified `range` value so the
 * SVG can be rendered as a square canvas without distortion.
 */
export interface Bounds {
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
  /** The larger of (latSpan, lonSpan) — used as the scale denominator. */
  range: number;
}

// ─── Domain types ─────────────────────────────────────────────────────────────

export interface PuttTap extends LatLon {
  /** True when the player flagged this read as having incorrect line. */
  misreadLine?: boolean;
  /** True when the player flagged this read as having incorrect slope. */
  misreadSlope?: boolean;
}

export interface Bunker {
  coordinates: LatLon[];
}

export interface PinLocation extends LatLon {}

export interface SelectedHole {
  /** Where the putt started (ball position). */
  start: LatLon;
  /** Hole location (pin). */
  pin: LatLon;
}

// ─── Course-wide types ────────────────────────────────────────────────────────

/**
 * A single hole's green — all holes are passed together so the entire
 * course can be rendered in one unified SVG canvas.
 */
export interface CourseGreen {
  /** OSM ref string (e.g. "1", "10", "10a"). */
  holeNumber: string;
  /** Polygon vertices in LatLon format. */
  coords: LatLon[];
}

// ─── Component props ──────────────────────────────────────────────────────────

export interface GreenMapProps {
  /**
   * All putting greens across the course.
   * The entire course is rendered in a single SVG canvas so the player can
   * pan freely between holes.
   */
  courseGreens: CourseGreen[];
  /**
   * Course-wide bounding box — must encompass all greens, fairways and
   * bunkers so that the SVG coordinate system covers the full course.
   */
  bounds: Bounds;
  /**
   * The 1-based hole number that is currently being played.
   * The map camera will animate to centre on this hole whenever it changes.
   */
  currentHoleNumber: number;

  /** All recorded putting taps for the current hole. */
  taps: PuttTap[];
  /** Setter — accepts a value or an updater function (matching useState). */
  setTaps: React.Dispatch<React.SetStateAction<PuttTap[]>>;

  // ── Optional layers ──
  pinLocations?: PinLocation[];
  setPinLocations?: React.Dispatch<React.SetStateAction<PinLocation[]>>;
  userLocation?: LatLon | null;
  bunkers?: Bunker[];
  /** Each entry is an array of LatLon vertices forming one fairway polygon. */
  fairways?: LatLon[][];

  // ── Behaviour flags ──
  /** Render the animated compass-heading arrow on the user's location dot. */
  showHeading?: boolean;
  // ── Zoom configuration (optional) ──
  /** Enable pinch-to-zoom and panning gestures. Defaults to true. */
  zoomEnabled?: boolean;
  /** Minimum allowed zoom scale (1 = full-course size). */
  minZoom?: number;
  /** Maximum allowed zoom scale. */
  maxZoom?: number;
  /** Initial zoom scale when the component mounts. */
  initialZoom?: number;
  /** Default zoom used when centering on a hole. */
  centerZoom?: number;
}
