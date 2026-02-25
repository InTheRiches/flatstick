/**
 * Raw response shapes from the USGS 3DEP Elevation ImageServer.
 *
 * These types exist ONLY in the fetch and normalization layers.
 * No file above `usgs.normalizer.ts` should import from this module.
 */

// ---------------------------------------------------------------------------
// 3DEP getSamples endpoint
// ---------------------------------------------------------------------------

/**
 * A single sample point as returned by the 3DEP getSamples endpoint.
 * Note: `value` arrives as a string in the JSON — the normalizer converts it.
 */
export type RawUsgs3DEPSample = {
  location: {
    /** Longitude (note: x = longitude in ESRI convention). */
    x: number
    /** Latitude. */
    y: number
    spatialReference?: { wkid: number }
  }
  /** Elevation in metres, encoded as a decimal string. */
  value: string
  /** Present when the raster has named attributes (usually absent). */
  attributes?: Record<string, unknown>
}

/** Successful 3DEP getSamples response body. */
export type Usgs3DEPResponse = {
  samples?: RawUsgs3DEPSample[]
  /** Present when the API returns an application-level error. */
  error?: {
    code: number
    message: string
  }
}
