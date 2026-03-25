import { useRouter } from "expo-router"
import React, { FC, useEffect, useMemo, useRef, useState } from "react"
import { Alert, Pressable, TextStyle, View, ViewStyle } from "react-native"
import MapView, { Marker, Polygon, Polyline } from "react-native-maps"

import PostShotDetailsModal, {
    PostShotDetailsModalReference,
    type PostShotModalResult,
} from "@/components/app/golf/modals/PostShotDetailsModal"
import ShotDetailsModal, {
    type ShotDetailsModalReference,
    type ShotModalResult,
} from "@/components/app/golf/modals/ShotDetailsModal"
import { EditableShotMapOverlay } from "@/components/app/rounds/edit/EditableShotMapOverlay"
import { Button } from "@/components/ui/Button"
import { Screen } from "@/components/ui/Screen"
import { Text } from "@/components/ui/Text"
import { useRoundEdit } from "@/context/RoundEditProvider"
import { useRoundEditHoleMap } from "@/hooks/rounds/useRoundEditHoleMap"
import type { LatLng } from "@/models/geo"
import type { LiveShotAttempt } from "@/models/round.live.types"
import type { ShotAttempt } from "@/models/round.session.types"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

interface MapHoleEditorScreenProps {
  roundId: string
  holeNumber: number
}

const toLiveShot = (shot: ShotAttempt): LiveShotAttempt => ({
  id: shot.id,
  hole: shot.hole,
  stroke: shot.stroke,
  par: shot.par,
  category: shot.category,
  club: { ...shot.club },
  lie: shot.lie,
  distance: { ...shot.distance },
  start: {
    point: {
      latitude: shot.start.point.lat,
      longitude: shot.start.point.lon,
    },
    timestamp: shot.start.timestamp,
  },
  end: shot.end
    ? {
        point: {
          latitude: shot.end.point.lat,
          longitude: shot.end.point.lon,
        },
        timestamp: shot.end.timestamp,
      }
    : undefined,
  intent: shot.intent ? { ...shot.intent } : undefined,
  result: shot.result ? { ...shot.result } : undefined,
  notes: shot.notes,
})

export const MapHoleEditorScreen: FC<MapHoleEditorScreenProps> = ({ roundId, holeNumber }) => {
  const router = useRouter()
  const { themed, theme } = useAppTheme()
  const {
    editableRound,
    isDirty,
    updateShot,
    moveShotEnd,
    addShotToHole,
    deleteShot,
    saveChanges,
    discardChanges,
  } = useRoundEdit()

  const resultModalRef = useRef<PostShotDetailsModalReference>(null)
  const shotModalRef = useRef<ShotDetailsModalReference>(null)

  const [pendingAddCoord, setPendingAddCoord] = useState<LatLng | null>(null)

  const holeShots = useMemo(
    () =>
      (editableRound?.shots ?? [])
        .filter((shot) => shot.hole === holeNumber)
        .sort((a, b) => a.stroke - b.stroke),
    [editableRound, holeNumber],
  )

  const locationSeed = useMemo<LatLng | null>(() => {
    const first = holeShots[0]
    if (first) {
      return {
        latitude: first.start.point.lat,
        longitude: first.start.point.lon,
      }
    }

    const hole = editableRound?.holes.find((h) => h.hole === holeNumber)
    if (!hole) return null

    return {
      latitude: hole.pinLocation.lat,
      longitude: hole.pinLocation.lon,
    }
  }, [editableRound?.holes, holeNumber, holeShots])

  const {
    courseDataState,
    courseData,
    mapRef,
    activeHoleData,
    recenterOnHole,
    isPannedAway,
    onPanDrag,
    defaultCenter,
  } = useRoundEditHoleMap(holeNumber, locationSeed)

  useEffect(() => {
    if (courseDataState.status === "success") {
      recenterOnHole()
    }
  }, [courseDataState.status, recenterOnHole])

  const handleExit = () => {
    if (!isDirty) {
      router.back()
      return
    }

    Alert.alert("Unsaved changes", "Save map edits before leaving?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Discard",
        style: "destructive",
        onPress: () => {
          discardChanges()
          router.replace(`/(app)/round-edit/${roundId}/hole/${holeNumber}` as never)
        },
      },
      {
        text: "Save",
        onPress: async () => {
          await saveChanges()
          router.replace(`/(app)/round-edit/${roundId}/hole/${holeNumber}` as never)
        },
      },
    ])
  }

  const handleShotPress = (shot: ShotAttempt) => {
    resultModalRef.current?.openForEdit(toLiveShot(shot))
  }

  const handleEditResultConfirm = (shotId: string, result: PostShotModalResult) => {
    updateShot(shotId, { result })
  }

  const handleEditIntentFromResult = (shotId: string, currentResult: PostShotModalResult) => {
    updateShot(shotId, { result: currentResult })
    const shot = holeShots.find((entry) => entry.id === shotId)
    if (!shot) return
    shotModalRef.current?.openForEdit(toLiveShot(shot))
  }

  const handleEditIntentConfirm = (shotId: string, details: ShotModalResult) => {
    updateShot(shotId, {
      lie: details.lie,
      club: details.club,
      category: details.category,
      intent: details.intent,
      notes: details.notes,
    })
  }

  const handleEditResultFromIntent = (shotId: string, details: ShotModalResult) => {
    updateShot(shotId, {
      lie: details.lie,
      club: details.club,
      category: details.category,
      intent: details.intent,
      notes: details.notes,
    })

    const shot = holeShots.find((entry) => entry.id === shotId)
    if (!shot) return

    resultModalRef.current?.openForEdit(
      toLiveShot({
        ...shot,
        lie: details.lie,
        club: details.club,
        category: details.category,
        intent: details.intent,
        notes: details.notes,
      }),
    )
  }

  if (!editableRound || !defaultCenter) {
    return (
      <Screen preset="fixed" contentContainerStyle={$loadingScreen}>
        <Text text="Map editor unavailable for this hole." />
        <Button text="Back" onPress={() => router.back()} />
      </Screen>
    )
  }

  return (
    <Screen preset="fixed" useSafeAreaInsets={false} style={$screen}>
      <MapView
        ref={mapRef}
        style={$map}
        mapType="satellite"
        initialRegion={defaultCenter}
        onPanDrag={onPanDrag}
        onPress={(event) => setPendingAddCoord(event.nativeEvent.coordinate)}
      >
        {courseData?.fairways.map((fairway, index) => (
          <Polygon
            key={`fairway-${index}`}
            coordinates={fairway.coordinates}
            fillColor="rgba(136, 203, 137, 0.28)"
            strokeColor="rgba(136, 203, 137, 0.6)"
            strokeWidth={1}
          />
        ))}

        {courseData?.greens.map((green, index) => (
          <Polygon
            key={`green-${index}`}
            coordinates={green.polygon.map((point) => ({ latitude: point.y, longitude: point.x }))}
            fillColor={green.hole === String(holeNumber) ? "rgba(64, 180, 64, 0.45)" : "rgba(64, 180, 64, 0.25)"}
            strokeColor="rgba(42, 122, 42, 0.9)"
            strokeWidth={2}
          />
        ))}

        {activeHoleData?.holePath && (
          <Polyline
            coordinates={activeHoleData.holePath.coordinates}
            strokeColor="rgba(255, 255, 255, 0.6)"
            strokeWidth={2}
            lineDashPattern={[5, 5]}
          />
        )}

        <EditableShotMapOverlay
          shots={holeShots}
          onShotPress={handleShotPress}
          onShotEndDrag={(shot, coord) => moveShotEnd(shot.id, coord, courseData)}
        />

        {pendingAddCoord && (
          <Marker coordinate={pendingAddCoord} tracksViewChanges={false} anchor={{ x: 0.5, y: 0.5 }}>
            <View style={$pendingMarker} />
          </Marker>
        )}
      </MapView>

      <View style={themed($topBar)}>
        <Button text="Back" preset="secondary" onPress={handleExit} style={$topButton} />
        <Text text={`Hole ${holeNumber} Map Edit`} style={themed($topText)} />
        <Button text="Save" onPress={saveChanges} disabled={!isDirty} style={$topButton} />
      </View>

      <View style={themed($bottomBar)}>
        <Button
          text={pendingAddCoord ? "Add Shot" : "Tap Map To Place"}
          onPress={() => {
            if (!pendingAddCoord) return
            addShotToHole(holeNumber, pendingAddCoord, courseData)
            setPendingAddCoord(null)
          }}
          disabled={!pendingAddCoord}
          style={$bottomButton}
        />
        <Button
          text="Delete Last"
          preset="secondary"
          onPress={() => {
            const last = holeShots[holeShots.length - 1]
            if (!last) return
            deleteShot(last.id)
          }}
          disabled={holeShots.length === 0}
          style={$bottomButton}
        />
      </View>

      {isPannedAway && (
        <Pressable style={themed($recenterButton)} onPress={recenterOnHole}>
          <Text text="Recenter" style={themed($recenterText)} />
        </Pressable>
      )}

      <ShotDetailsModal
        reference={shotModalRef}
        onConfirm={() => {}}
        onCancel={() => {}}
        onEditConfirm={handleEditIntentConfirm}
        onEditResult={handleEditResultFromIntent}
      />

      <PostShotDetailsModal
        reference={resultModalRef}
        onConfirm={() => {}}
        onCancel={() => {}}
        onEditConfirm={handleEditResultConfirm}
        onEditIntent={handleEditIntentFromResult}
      />
    </Screen>
  )
}

const $screen: ViewStyle = {
  flex: 1,
}

const $loadingScreen: ViewStyle = {
  flex: 1,
  padding: 16,
  justifyContent: "center",
  gap: 12,
}

const $map: ViewStyle = {
  flex: 1,
}

const $topBar: ThemedStyle<ViewStyle> = (theme) => ({
  position: "absolute",
  top: 52,
  left: 12,
  right: 12,
  backgroundColor: theme.colors.backgrounds.elevated,
  borderColor: theme.colors.border,
  borderWidth: 1,
  borderRadius: 12,
  padding: 10,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 8,
})

const $topButton: ViewStyle = {
  width: 92,
}

const $topText: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.text,
  fontWeight: "700",
})

const $bottomBar: ThemedStyle<ViewStyle> = (theme) => ({
  position: "absolute",
  left: 12,
  right: 12,
  bottom: 20,
  backgroundColor: theme.colors.backgrounds.elevated,
  borderColor: theme.colors.border,
  borderWidth: 1,
  borderRadius: 12,
  padding: 10,
  flexDirection: "row",
  gap: 8,
})

const $bottomButton: ViewStyle = {
  flex: 1,
}

const $pendingMarker: ViewStyle = {
  width: 14,
  height: 14,
  borderRadius: 7,
  backgroundColor: "rgba(255, 255, 255, 0.95)",
  borderWidth: 2,
  borderColor: "rgba(0, 0, 0, 0.8)",
}

const $recenterButton: ThemedStyle<ViewStyle> = (theme) => ({
  position: "absolute",
  right: 16,
  bottom: 92,
  backgroundColor: theme.colors.backgrounds.elevated,
  borderColor: theme.colors.border,
  borderWidth: 1,
  borderRadius: 16,
  paddingHorizontal: 10,
  paddingVertical: 6,
})

const $recenterText: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.text,
  fontWeight: "600",
})
