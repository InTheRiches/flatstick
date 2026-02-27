/**
 * HazardDistanceOverlay
 *
 * Compact bottom-center panel shown while a hazard is focused.
 * Displays hazard type + navigation/exit controls.
 *
 * Distances (min / max) are rendered directly on the map via HazardMapLabels
 * and are NOT shown here.
 *
 * In tap mode  → type label + EXIT button only.
 * In cycle mode → type label + ← EXIT → controls.
 */

import { Ionicons } from "@expo/vector-icons"
import React from "react"
import { Pressable, TextStyle, View, ViewStyle } from "react-native"

import { Text } from "@/components/ui/Text"
import type { Hazard } from "@/models/course"

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface HazardDistanceOverlayProps {
  hazard: Hazard
  /** "tap" → only show EXIT; "cycle" → show prev / next / exit */
  mode: "tap" | "cycle"
  onExit: () => void
  onPrev?: () => void
  onNext?: () => void
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const HazardDistanceOverlay: React.FC<HazardDistanceOverlayProps> = ({
  hazard,
  mode,
  onExit,
  onPrev,
  onNext,
}) => {
  const typeLabel = hazard.type === "water" ? "Water hazard" : "Bunker"
  const typeColor = hazard.type === "water" ? "#4fc3f7" : "#ffcc80"

  return (
    <View style={$container} pointerEvents="box-none">
      <View style={$card}>
        {/* ── Title row ────────────────────────────────────────────────── */}
        <View style={$titleRow}>
          <Ionicons
            name={hazard.type === "water" ? "water" : "ellipse"}
            size={16}
            color={typeColor}
          />
          <Text style={[$typeLabel, { color: typeColor }]} text={typeLabel} weight="bold" />
        </View>

        {/* ── Navigation / exit row ─────────────────────────────────────── */}
        <View style={$navRow}>
          {mode === "cycle" ? (
            <>
              <Pressable style={$navButton} onPress={onPrev} hitSlop={12}>
                <Ionicons name="chevron-back" size={22} color="#ffffff" />
              </Pressable>

              <Pressable style={$exitButton} onPress={onExit} hitSlop={12}>
                <Text style={$exitLabel} text="Exit" weight="semiBold" />
              </Pressable>

              <Pressable style={$navButton} onPress={onNext} hitSlop={12}>
                <Ionicons name="chevron-forward" size={22} color="#ffffff" />
              </Pressable>
            </>
          ) : (
            <Pressable style={[$exitButton, { flex: 1 }]} onPress={onExit} hitSlop={12}>
              <Text style={$exitLabel} text="Exit" weight="semiBold" />
            </Pressable>
          )}
        </View>
      </View>
    </View>
  )
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const $container: ViewStyle = {
  position: "absolute",
  bottom: 36,
  left: 16,
  right: 16,
  alignItems: "center",
  zIndex: 30,
  pointerEvents: "box-none",
}

const $card: ViewStyle = {
  backgroundColor: "rgba(0,0,0,0.92)",
  borderRadius: 16,
  paddingHorizontal: 20,
  paddingVertical: 12,
  gap: 8,
  minWidth: 200,
  maxWidth: 340,
  alignSelf: "center",
  width: "100%",
}

const $titleRow: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: 6,
  justifyContent: "center",
}

const $typeLabel: TextStyle = {
  fontSize: 13,
  letterSpacing: 0.8,
  textTransform: "uppercase",
  color: "#ffffff",
}

const $navRow: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 8,
}

const $navButton: ViewStyle = {
  padding: 6,
  borderRadius: 8,
  backgroundColor: "rgba(255,255,255,0.12)",
  alignItems: "center",
  justifyContent: "center",
}

const $exitButton: ViewStyle = {
  flex: 1,
  paddingVertical: 8,
  borderRadius: 8,
  backgroundColor: "rgba(255,255,255,0.15)",
  alignItems: "center",
}

const $exitLabel: TextStyle = {
  color: "#ffffff",
  fontSize: 14,
}
