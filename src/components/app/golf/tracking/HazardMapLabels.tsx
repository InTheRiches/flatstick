/**
 * HazardMapLabels
 *
 * Renders min / max distance callouts directly on the map surface, placed at
 * the nearest and farthest vertices of the focused hazard polygon from the
 * player's position.
 *
 * When the player location is unavailable (e.g. cycling through hazards
 * off-course), vertices are found by projecting along the current map heading
 * so the "front" label appears at the screen-bottom of the hazard and the
 * "back" label appears at the screen-top.
 *
 * Must be rendered as a direct child of <MapView>.
 */

import React, { useMemo } from "react"
import { TextStyle, View, ViewStyle } from "react-native"
import { Marker } from "react-native-maps"

import { Text } from "@/components/ui/Text"
import type { Hazard } from "@/models/course"
import type { LatLng } from "@/models/geo"
import { haversineMeters } from "@/utils/courses/geometry/distance.utils"
import { padPolygonCoordinates } from "@/utils/courses/geometry/polygon.utils"

// ---------------------------------------------------------------------------
// Sub-component
// ---------------------------------------------------------------------------

function DistanceLabel({ yards, sublabel }: { yards: number; sublabel: string }) {
  return (
    <View style={$label}>
      <Text style={$labelYards} text={`${yards} yd`}/>
    </View>
  )
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Pick the nearest and farthest vertices from the player. */
function verticesByDistance(
  coords: LatLng[],
  player: LatLng,
): { minVertex: LatLng; maxVertex: LatLng } {
  const withDist = coords.map((c) => ({ c, d: haversineMeters(player, c) }))
  withDist.sort((a, b) => a.d - b.d)
  return {
    minVertex: withDist[0].c,
    maxVertex: withDist[withDist.length - 1].c,
  }
}

/**
 * When player location is unknown, project vertices onto the heading direction
 * and pick the extremes — "back" is the vertex furthest in the heading
 * direction (top of screen) and "front" is opposite (bottom of screen).
 */
function verticesByHeading(
  coords: LatLng[],
  heading: number,
): { minVertex: LatLng; maxVertex: LatLng } {
  const lats = coords.map((c) => c.latitude)
  const lons = coords.map((c) => c.longitude)
  const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2
  const centerLon = (Math.min(...lons) + Math.max(...lons)) / 2
  const rad = (heading * Math.PI) / 180

  // Dot product of each vertex offset against the heading unit vector.
  // Heading 0° → north (+lat), 90° → east (+lon).
  const dot = (c: LatLng) => {
    const dlat = (c.latitude - centerLat) * 111_111
    const dlon =
      (c.longitude - centerLon) *
      111_111 *
      Math.cos((centerLat * Math.PI) / 180)
    // heading 0 = north = positive lat component
    return dlat * Math.cos(rad) + dlon * Math.sin(rad)
  }

  let minV = coords[0]
  let maxV = coords[0]
  let minD = dot(coords[0])
  let maxD = dot(coords[0])

  for (const c of coords) {
    const d = dot(c)
    if (d < minD) { minD = d; minV = c }
    if (d > maxD) { maxD = d; maxV = c }
  }

  return { minVertex: minV, maxVertex: maxV }
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface HazardMapLabelsProps {
  hazard: Hazard
  /** Player location for nearest/farthest calculation. May be null. */
  userLocation: LatLng | null
  /** Current map heading — used when userLocation is unavailable. */
  heading: number
  min: number
  max: number
}

export const HazardMapLabels: React.FC<HazardMapLabelsProps> = ({
  hazard,
  userLocation,
  heading,
  min,
  max,
}) => {
  const { minVertex, maxVertex } = useMemo(() => {
    let coords = hazard.coordinates;

    // add padding so that the labels are slightly above and below the hazard
    coords = padPolygonCoordinates(coords, 4);

    if (coords.length === 0) return { minVertex: null, maxVertex: null }
    if (userLocation) return verticesByDistance(coords, userLocation)
    return verticesByHeading(coords, heading)
  }, [hazard.coordinates, userLocation, heading])

  if (!minVertex || !maxVertex) return null

  return (
    <>
      {/* Front / nearest edge label — anchored so it sits below the vertex */}
      <Marker
        coordinate={minVertex}
        anchor={{ x: 0.5, y: 0 }}
        tracksViewChanges={false}
        flat={false}
      >
        <DistanceLabel yards={min} sublabel="front" />
      </Marker>

      {/* Back / farthest edge label — anchored so it sits above the vertex */}
      <Marker
        coordinate={maxVertex}
        anchor={{ x: 0.5, y: 1 }}
        tracksViewChanges={false}
        flat={false}
      >
        <DistanceLabel yards={max} sublabel="back" />
      </Marker>
    </>
  )
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const $label: ViewStyle = {
  backgroundColor: "rgba(0,0,0,0.85)",
  borderRadius: 6,
  paddingHorizontal: 8,
  paddingVertical: 4,
  alignItems: "center",
}

const $labelYards: TextStyle = {
  fontSize: 15,
  color: "#ffffff",
  lineHeight: 20,
  fontWeight: 800
}

const $labelSub: TextStyle = {
  fontSize: 11,
  color: "rgba(255,255,255,0.6)",
  lineHeight: 14,
  textTransform: "uppercase",
  letterSpacing: 0.5,
}
