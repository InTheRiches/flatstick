/**
 * USGS 3DEP Elevation fetch layer.
 *
 * Single responsibility: query the USGS National Map 3DEP ImageServer and
 * return the raw sample array.  Parsing, validation, and grid assembly live
 * in `usgs.normalizer.ts`.
 */

import type { BoundingBox } from "@/models/geo"
import type { RawUsgs3DEPSample, Usgs3DEPResponse } from "./usgs.types"

const THREEDEP_URL =
  "https://elevation.nationalmap.gov/arcgis/rest/services/3DEPElevation/ImageServer/getSamples"

/**
 * Fetch elevation samples from the USGS 3DEP ImageServer for the given
 * bounding box.
 *
 * The 3DEP service uses an ESRI `esriGeometryEnvelope` query; the coordinate
 * order is `{xmin, ymin, xmax, ymax}` which maps to `{west, south, east, north}`.
 *
 * Returns an empty array when:
 *   - The API reports no coverage for the requested area
 *   - The response contains an application-level error object
 *
 * Throws on network/HTTP failure so the caller can decide on retry strategy.
 *
 * @param bbox - Bounding box in WGS84 lon/lat.
 * @param signal - Optional AbortSignal for cancellation.
 */
export async function fetch3DEPSamples(
  bbox: BoundingBox,
  signal?: AbortSignal,
): Promise<RawUsgs3DEPSample[]> {
  const geometry = {
    xmin: bbox.xmin,
    ymin: bbox.ymin,
    xmax: bbox.xmax,
    ymax: bbox.ymax,
    spatialReference: { wkid: 4326 },
  }

  const params = new URLSearchParams({
    geometry: JSON.stringify(geometry),
    geometryType: "esriGeometryEnvelope",
    returnFirstValueOnly: "false",
    f: "json",
  })

  const res = await fetch(`${THREEDEP_URL}?${params.toString()}`, { signal })

  if (!res.ok) {
    throw new Error(`3DEP HTTP ${res.status}: ${res.statusText}`)
  }

  const data: Usgs3DEPResponse = await res.json()

  // Surface an application-level error as a thrown error so the loader can
  // decide whether to mark the green as lidar=null or to abort.
  if (data.error) {
    throw new Error(
      `3DEP API error ${data.error.code}: ${data.error.message}`,
    )
  }

  return data.samples ?? []
}
