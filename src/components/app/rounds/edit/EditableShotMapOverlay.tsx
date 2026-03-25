import React from "react"
import { TextStyle, View, ViewStyle } from "react-native"
import { Marker, Polyline } from "react-native-maps"

import { Text } from "@/components/ui/Text"
import type { LatLng } from "@/models/geo"
import type { ShotAttempt } from "@/models/round.session.types"

type DragEndEvent = {
  nativeEvent: {
    coordinate: LatLng
  }
}

interface EditableShotMapOverlayProps {
  shots: ShotAttempt[]
  onShotPress?: (shot: ShotAttempt) => void
  onShotEndDrag?: (shot: ShotAttempt, coordinate: LatLng) => void
}

const toLatLng = (point: ShotAttempt["start"]["point"]): LatLng => ({
  latitude: point.lat,
  longitude: point.lon,
})

export function EditableShotMapOverlay({ shots, onShotPress, onShotEndDrag }: EditableShotMapOverlayProps) {
  const completed = shots
    .filter((shot) => !!shot.end)
    .sort((a, b) => a.stroke - b.stroke)

  return (
    <>
      {completed.map((shot) => {
        if (!shot.end) return null

        const start = toLatLng(shot.start.point)
        const end = toLatLng(shot.end.point)

        return (
          <React.Fragment key={shot.id}>
            <Polyline
              coordinates={[start, end]}
              strokeColor="rgba(255, 215, 0, 0.9)"
              strokeWidth={3}
              onPress={() => onShotPress?.(shot)}
            />

            <Marker coordinate={start} tracksViewChanges={false} anchor={{ x: 0.5, y: 0.5 }}>
              <View style={$startMarker} />
            </Marker>

            <Marker
              coordinate={end}
              draggable
              tracksViewChanges={false}
              onPress={() => onShotPress?.(shot)}
              onDragEnd={(e: DragEndEvent) => onShotEndDrag?.(shot, e.nativeEvent.coordinate)}
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <View style={$endMarker}>
                <Text style={$endMarkerLabel}>{shot.stroke}</Text>
              </View>
            </Marker>
          </React.Fragment>
        )
      })}
    </>
  )
}

const $startMarker: ViewStyle = {
  width: 9,
  height: 9,
  borderRadius: 5,
  backgroundColor: "rgba(210, 210, 210, 0.9)",
  borderColor: "#FFFFFF",
  borderWidth: 1,
}

const $endMarker: ViewStyle = {
  width: 24,
  height: 24,
  borderRadius: 12,
  backgroundColor: "rgba(20, 20, 20, 0.8)",
  borderWidth: 1.5,
  borderColor: "#FFFFFF",
  alignItems: "center",
  justifyContent: "center",
}

const $endMarkerLabel: TextStyle = {
  color: "#FFFFFF",
  fontSize: 12,
  fontWeight: "700",
}
