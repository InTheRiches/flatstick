import { useRouter } from "expo-router"
import React, { FC, useMemo, useRef } from "react"
import { Alert, Pressable, ScrollView, TextStyle, View, ViewStyle } from "react-native"

import PostShotDetailsModal, {
    PostShotDetailsModalReference,
    type PostShotModalResult,
} from "@/components/app/golf/modals/PostShotDetailsModal"
import ShotDetailsModal, {
    type ShotDetailsModalReference,
    type ShotModalResult,
} from "@/components/app/golf/modals/ShotDetailsModal"
import { Button } from "@/components/ui/Button"
import { Screen } from "@/components/ui/Screen"
import { Text } from "@/components/ui/Text"
import { useRoundEdit } from "@/context/RoundEditProvider"
import type { LiveShotAttempt } from "@/models/round.live.types"
import type { ShotAttempt } from "@/models/round.session.types"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

interface HoleEditScreenProps {
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

export const HoleEditScreen: FC<HoleEditScreenProps> = ({ roundId, holeNumber }) => {
  const router = useRouter()
  const { themed } = useAppTheme()
  const {
    editableRound,
    isDirty,
    updateHole,
    updateShot,
    deleteShot,
    saveChanges,
    discardChanges,
  } = useRoundEdit()

  const shotModalRef = useRef<ShotDetailsModalReference>(null)
  const resultModalRef = useRef<PostShotDetailsModalReference>(null)
  const selectedShotId = useRef<string | null>(null)

  const hole = useMemo(
    () => editableRound?.holes.find((h) => h.hole === holeNumber),
    [editableRound, holeNumber],
  )

  const shots = useMemo(
    () =>
      (editableRound?.shots ?? [])
        .filter((shot) => shot.hole === holeNumber)
        .sort((a, b) => a.stroke - b.stroke),
    [editableRound, holeNumber],
  )

  const handleExit = () => {
    if (!isDirty) {
      router.back()
      return
    }

    Alert.alert("Unsaved changes", "Save your round edits before leaving this hole?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Discard",
        style: "destructive",
        onPress: () => {
          discardChanges()
          router.replace(`/(app)/round-edit/${roundId}` as never)
        },
      },
      {
        text: "Save",
        onPress: async () => {
          await saveChanges()
          router.replace(`/(app)/round-edit/${roundId}` as never)
        },
      },
    ])
  }

  if (!editableRound || !hole) {
    return (
      <Screen preset="fixed" contentContainerStyle={$screen}>
        <Text text="Hole not found" />
        <Button text="Back" onPress={() => router.back()} />
      </Screen>
    )
  }

  const updateCounter = (field: "score" | "putts" | "penalties", delta: number) => {
    const next = Math.max(0, hole[field] + delta)
    updateHole(holeNumber, { [field]: next })
  }

  const handleShotPress = (shot: ShotAttempt) => {
    selectedShotId.current = shot.id
    resultModalRef.current?.openForEdit(toLiveShot(shot))
  }

  const handleEditResultConfirm = (shotId: string, result: PostShotModalResult) => {
    updateShot(shotId, { result })
  }

  const handleEditIntentFromResult = (shotId: string, currentResult: PostShotModalResult) => {
    updateShot(shotId, { result: currentResult })
    const target = shots.find((s) => s.id === shotId)
    if (!target) return
    shotModalRef.current?.openForEdit(toLiveShot(target))
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
    const target = shots.find((s) => s.id === shotId)
    if (!target) return
    resultModalRef.current?.openForEdit(
      toLiveShot({
        ...target,
        lie: details.lie,
        club: details.club,
        category: details.category,
        intent: details.intent,
        notes: details.notes,
      }),
    )
  }

  return (
    <Screen preset="fixed" contentContainerStyle={$screen}>
      <View style={$headerRow}>
        <Button text="Back" preset="secondary" onPress={handleExit} style={$inlineButton} />
        <Text preset="subheading" text={`Hole ${hole.hole} Quick Edit`} />
        <Button
          text="Map"
          onPress={() => router.push(`/(app)/round-edit/${roundId}/hole/${holeNumber}/map` as never)}
          style={$inlineButton}
        />
      </View>

      <ScrollView contentContainerStyle={$content}>
        <View style={themed($card)}>
          <CounterRow
            label="Score"
            value={hole.score}
            onDecrement={() => updateCounter("score", -1)}
            onIncrement={() => updateCounter("score", 1)}
          />
          <CounterRow
            label="Putts"
            value={hole.putts}
            onDecrement={() => updateCounter("putts", -1)}
            onIncrement={() => updateCounter("putts", 1)}
          />
          <CounterRow
            label="Penalties"
            value={hole.penalties}
            onDecrement={() => updateCounter("penalties", -1)}
            onIncrement={() => updateCounter("penalties", 1)}
          />

          <View style={$toggleRow}>
            <Button
              text={`FIR: ${hole.fairwayHit ? "Yes" : "No"}`}
              preset="secondary"
              disabled={hole.par === 3}
              onPress={() => updateHole(holeNumber, { fairwayHit: !hole.fairwayHit })}
              style={$toggleButton}
            />
            <Button
              text={`GIR: ${hole.gir ? "Yes" : "No"}`}
              preset="secondary"
              onPress={() => updateHole(holeNumber, { gir: !hole.gir })}
              style={$toggleButton}
            />
          </View>
        </View>

        <View style={themed($card)}>
          <View style={$listHeaderRow}>
            <Text text="Shots" style={themed($listTitle)} />
            <Text text="Tap a shot to edit" style={themed($listHint)} />
          </View>

          {shots.length === 0 ? (
            <Text text="No shots recorded for this hole." style={themed($listHint)} />
          ) : (
            shots.map((shot) => (
              <Pressable key={shot.id} style={themed($shotRow)} onPress={() => handleShotPress(shot)}>
                <View>
                  <Text text={`#${shot.stroke} ${shot.club.label ?? shot.club.type}`} style={themed($shotTitle)} />
                  <Text
                    text={`${shot.lie} • ${Math.round(shot.distance.measuredM ?? 0)}m`}
                    style={themed($shotMeta)}
                  />
                </View>
                <Button
                  text="Delete"
                  preset="secondary"
                  style={$deleteButton}
                  onPress={() => deleteShot(shot.id)}
                />
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>

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

interface CounterRowProps {
  label: string
  value: number
  onIncrement: () => void
  onDecrement: () => void
}

function CounterRow({ label, value, onIncrement, onDecrement }: CounterRowProps) {
  const { themed } = useAppTheme()
  return (
    <View style={$counterRow}>
      <Text text={label} style={themed($counterLabel)} />
      <View style={$counterControls}>
        <Button text="-" preset="secondary" onPress={onDecrement} style={$counterButton} />
        <Text text={String(value)} style={themed($counterValue)} />
        <Button text="+" preset="secondary" onPress={onIncrement} style={$counterButton} />
      </View>
    </View>
  )
}

const $screen: ViewStyle = {
  flex: 1,
  padding: 16,
  gap: 12,
}

const $headerRow: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 8,
}

const $inlineButton: ViewStyle = {
  width: 92,
}

const $content: ViewStyle = {
  gap: 12,
  paddingBottom: 36,
}

const $card: ThemedStyle<ViewStyle> = (theme) => ({
  backgroundColor: theme.colors.backgrounds.elevated,
  borderWidth: 1,
  borderColor: theme.colors.border,
  borderRadius: 12,
  padding: 12,
  gap: 10,
})

const $counterRow: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
}

const $counterControls: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: 10,
}

const $counterButton: ViewStyle = {
  width: 44,
  minHeight: 38,
}

const $counterLabel: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.text,
  fontWeight: "600",
})

const $counterValue: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.text,
  minWidth: 28,
  textAlign: "center",
  fontWeight: "700",
})

const $toggleRow: ViewStyle = {
  flexDirection: "row",
  gap: 8,
  marginTop: 4,
}

const $toggleButton: ViewStyle = {
  flex: 1,
}

const $listHeaderRow: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
}

const $listTitle: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.text,
  fontWeight: "700",
})

const $listHint: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.textDim,
  fontSize: 12,
})

const $shotRow: ThemedStyle<ViewStyle> = (theme) => ({
  borderWidth: 1,
  borderColor: theme.colors.border,
  borderRadius: 10,
  paddingHorizontal: 10,
  paddingVertical: 8,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
})

const $shotTitle: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.text,
  fontWeight: "600",
})

const $shotMeta: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.textDim,
  fontSize: 12,
})

const $deleteButton: ViewStyle = {
  width: 86,
  minHeight: 36,
}
