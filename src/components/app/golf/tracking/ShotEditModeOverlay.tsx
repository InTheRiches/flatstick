import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, TextStyle, View, ViewStyle } from "react-native";

import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import { useAppTheme } from "@/theme/context";
import type { ThemedStyle } from "@/theme/types";

interface ShotEditModeOverlayProps {
  clubLabel: string;
  stroke: number;
  activePoint: "start" | "end";
  measuredYards: number | null;
  reticleTop: number;
  onBack: () => void;
  onCancel: () => void;
  onSave: () => void;
  onSelectPoint: (point: "start" | "end") => void;
}

export const ShotEditModeOverlay: React.FC<ShotEditModeOverlayProps> = ({
  clubLabel,
  stroke,
  activePoint,
  measuredYards,
  reticleTop,
  onBack,
  onCancel,
  onSave,
  onSelectPoint,
}) => {
  const { theme, themed } = useAppTheme();
  const distanceText = measuredYards !== null ? `${measuredYards} yd` : null;
  const instruction =
    activePoint === "start"
      ? "Drag the map until the reticle sits on where the shot started."
      : "Drag the map until the reticle sits on where the shot finished.";

  return (
    <View pointerEvents="box-none" style={$overlay}>
      <View style={$topRegion}>
        <View style={$topRow}>
          <Pressable style={themed($backButton)} onPress={onBack}>
            <Ionicons name="arrow-back" size={22} color={theme.colors.buttons.textColor} />
          </Pressable>

          <View style={themed($titleCard)}>
            <Text style={themed($eyebrow)} text={`Shot ${stroke}`} />
            <Text style={themed($title)} text={clubLabel} />
            {distanceText ? <Text style={themed($meta)} text={distanceText} /> : null}
          </View>

          <View style={$topSpacer} />
        </View>

        <View style={themed($selectorRow)}>
          <Pressable
            style={[themed($selectorButton), activePoint === "start" && themed($selectorButtonActive)]}
            onPress={() => onSelectPoint("start")}
          >
            <Text
              style={[
                themed($selectorText),
                activePoint === "start" && themed($selectorTextActive),
              ]}
              text="Start"
            />
          </Pressable>
          <Pressable
            style={[themed($selectorButton), activePoint === "end" && themed($selectorButtonActive)]}
            onPress={() => onSelectPoint("end")}
          >
            <Text
              style={[
                themed($selectorText),
                activePoint === "end" && themed($selectorTextActive),
              ]}
              text="Finish"
            />
          </Pressable>
        </View>
      </View>

      <View pointerEvents="none" style={themed($instructionCard)}>
        <Text style={themed($instructionText)} text={instruction} />
        <Text
          style={themed($instructionSubtext)}
          text="The reticle sits above your finger so placement stays visible."
        />
      </View>

      <View style={themed($footer)}>
        <Button text="Cancel" preset="secondary" onPress={onCancel} style={$footerButton} />
        <Button text="Save" onPress={onSave} style={$footerButton} />
      </View>
    </View>
  );
};

const $overlay: ViewStyle = {
  ...StyleSheet.absoluteFillObject,
};

const $topRegion: ViewStyle = {
  position: "absolute",
  top: 56,
  left: 16,
  right: 16,
  gap: 12,
};

const $topRow: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: 12,
};

const $topSpacer: ViewStyle = {
  width: 52,
};

const $backButton: ThemedStyle<ViewStyle> = (theme) => ({
  width: 52,
  height: 52,
  borderRadius: 999,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: theme.colors.buttons.background,
  borderWidth: 1,
  borderColor: theme.colors.buttons.border,
});

const $titleCard: ThemedStyle<ViewStyle> = (theme) => ({
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 24,
  paddingHorizontal: 18,
  paddingVertical: 4,
  backgroundColor: theme.colors.backgrounds.elevated,
});

const $eyebrow: ThemedStyle<TextStyle> = (theme) => ({
  fontSize: 12,
  fontWeight: "700",
  letterSpacing: 0.8,
  textTransform: "uppercase",
  color: theme.colors.textDim,
  marginBottom: -4,
});

const $title: ThemedStyle<TextStyle> = (theme) => ({
  fontSize: 20,
  fontWeight: "800",
  color: theme.colors.text,
  marginBottom: -4,
});

const $meta: ThemedStyle<TextStyle> = (theme) => ({
  fontSize: 13,
  fontWeight: "600",
  color: theme.colors.textDim,
});

const $selectorRow: ThemedStyle<ViewStyle> = (theme) => ({
  alignSelf: "center",
  flexDirection: "row",
  gap: 8,
  backgroundColor: theme.colors.backgrounds.elevated,
  borderRadius: 999,
  padding: 4,
});

const $selectorButton: ThemedStyle<ViewStyle> = (theme) => ({
  minWidth: 96,
  minHeight: 32,
  borderRadius: 999,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "transparent",
});

const $selectorButtonActive: ThemedStyle<ViewStyle> = (theme) => ({
  backgroundColor: theme.colors.buttons.background,
});

const $selectorText: ThemedStyle<TextStyle> = (theme) => ({
  fontSize: 14,
  fontWeight: "700",
  color: theme.colors.textDim,
});

const $selectorTextActive: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.buttons.textColor,
});

const $reticleWrap: ViewStyle = {
  position: "absolute",
  left: 0,
  right: 0,
  alignItems: "center",
};

const $reticle: ViewStyle = {
  width: 54,
  height: 54,
  alignItems: "center",
  justifyContent: "center",
};

const $reticleRing: ViewStyle = {
  position: "absolute",
  width: 42,
  height: 42,
  borderRadius: 999,
  borderWidth: 2,
  borderColor: "#000000",
  backgroundColor: "rgba(0, 0, 0, 0.25)",
};

const $reticleCrossHorizontal: ViewStyle = {
  position: "absolute",
  width: 54,
  height: 2,
  backgroundColor: "#000000",
};

const $reticleCrossVertical: ViewStyle = {
  position: "absolute",
  width: 2,
  height: 54,
  backgroundColor: "#000000",
};

const $instructionCard: ThemedStyle<ViewStyle> = (theme) => ({
  position: "absolute",
  left: 20,
  right: 20,
  bottom: 136,
  borderRadius: 22,
  paddingHorizontal: 12,
  paddingVertical: 12,
  backgroundColor: `${theme.colors.backgrounds.elevated}F4`,
  gap: 4,
});

const $instructionText: ThemedStyle<TextStyle> = (theme) => ({
  fontSize: 14,
  fontWeight: "700",
  color: theme.colors.text,
  textAlign: "center",
  lineHeight: 16
});

const $instructionSubtext: ThemedStyle<TextStyle> = (theme) => ({
  fontSize: 12,
  fontWeight: "500",
  color: theme.colors.textDim,
  textAlign: "center",
  lineHeight: 14
});

const $footer: ThemedStyle<ViewStyle> = () => ({
  position: "absolute",
  left: 16,
  right: 16,
  bottom: 56,
  flexDirection: "row",
  gap: 12,
});

const $footerButton: ViewStyle = {
  flex: 1,
};
