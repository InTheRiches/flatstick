import { BottomSheetModal } from "@gorhom/bottom-sheet";
import React, { useImperativeHandle, useState } from "react";
import { TextStyle, TouchableOpacity, View, ViewStyle } from "react-native";
import { Circle, Path, Svg } from "react-native-svg";

import { BottomSheetModalFactory } from "@/components/app/modals/BottomSheetFactory";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import { LiveShotAttempt } from "@/models/round.live.types";
import type { LieType, ShotFinish, ShotShape } from "@/models/round.session.types";
import { useAppTheme } from "@/theme/context";
import { $styles } from "@/theme/styles";
import { ThemedStyle } from "@/theme/types";
import {
    BunkerIcon,
    FairwayIcon,
    FringeIcon,
    GreenIcon,
    RoughIcon,
    TeeIcon,
    TreeIcon,
} from "@assets/icons/svg/lies";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface PostShotDetailsModalReference {
  open: (defaults?: PostShotDefaults) => void;
  openForEdit: (shot: LiveShotAttempt) => void;
  close: () => void;
}

/** Optional pre-population from GPS / context. */
export interface PostShotDefaults {
  finish?: ShotFinish;
  shape?: ShotShape;
  finishLie?: LieType;
}

/** The full result block from LiveShotAttempt. */
export type PostShotModalResult = LiveShotAttempt["result"];

interface PostShotDetailsModalProps {
  reference: React.RefObject<PostShotDetailsModalReference | null>;
  onConfirm: (result: PostShotModalResult) => void;
  onCancel: () => void;
  /** Called when saving edits to an existing shot. */
  onEditConfirm?: (shotId: string, result: PostShotModalResult) => void;
  /** Called when the user wants to switch to editing the shot intent instead. */
  onEditIntent?: (shotId: string, currentResult: PostShotModalResult) => void;
}

type ContactType = "pure" | "thin" | "fat" | "toe" | "heel" | "unknown";

// ── Component ──────────────────────────────────────────────────────────────────

export default function PostShotDetailsModal({
  reference,
  onConfirm,
  onCancel,
  onEditConfirm,
  onEditIntent,
}: PostShotDetailsModalProps) {
  const { themed, theme } = useAppTheme();
  const innerRef = React.useRef<BottomSheetModal>(null);

  const [shape, setShape] = useState<ShotShape>("straight");
  const [finishLie, setFinishLie] = useState<LieType>("fairway");
  const [isPenalty, setIsPenalty] = useState(false);
  const [isOutOfBounds, setIsOutOfBounds] = useState(false);
  const [editingShotId, setEditingShotId] = useState<string | null>(null);

  useImperativeHandle(reference, () => ({
    open: (defaults?: PostShotDefaults) => {
      setEditingShotId(null);
      if (defaults) {
        if (defaults.shape !== undefined) setShape(defaults.shape);
        if (defaults.finishLie !== undefined) setFinishLie(defaults.finishLie);
      }
      innerRef.current?.present();
    },
    openForEdit: (shot: LiveShotAttempt) => {
      setEditingShotId(shot.id);
      if (shot.result?.shape !== undefined) setShape(shot.result.shape);
      if (shot.result?.finishLie !== undefined) setFinishLie(shot.result.finishLie);
      setIsPenalty(shot.result?.isPenalty ?? false);
      setIsOutOfBounds(shot.result?.isOutOfBounds ?? false);
      innerRef.current?.present();
    },
    close: () => innerRef.current?.dismiss(),
  }));

  const handleConfirm = () => {
    const result: PostShotModalResult = {
      shape,
      finishLie,
      isPenalty,
      isOutOfBounds,
    };
    if (editingShotId) {
      onEditConfirm?.(editingShotId, result);
    } else {
      onConfirm(result);
    }
    innerRef.current?.dismiss();
  };

  const handleCancel = () => {
    onCancel();
    innerRef.current?.dismiss();
  };

  const handleEditIntent = () => {
    if (!editingShotId) return;
    const result: PostShotModalResult = { shape, finishLie, isPenalty, isOutOfBounds };
    onEditIntent?.(editingShotId, result);
    innerRef.current?.dismiss();
  };

  // Derive color tokens once per render so SVG renderers can close over them.
  const tintColor = themed($selectedColor).color as string;
  const inactiveColor = themed($unselectedColor).color as string;
  const dimColor = themed($dimColor).color as string;

  // ── Options ─────────────────────────────────────────────────────────────────

  const shapeOptions: {
    label: string;
    value: ShotShape;
    renderIcon: (active: boolean) => React.ReactNode;
  }[] = [
    {
      label: "Draw",
      value: "draw",
      renderIcon: (active) => (
        <Svg width={28} height={28} viewBox="0 0 28 28">
          <Path
            d="M 14 24 Q 4 14 14 4"
            stroke={active ? tintColor : dimColor}
            strokeWidth={2}
            strokeLinecap="round"
            fill="none"
          />
          <Circle cx={14} cy={4} r={3} fill={active ? tintColor : dimColor} />
        </Svg>
      ),
    },
    {
      label: "Straight",
      value: "straight",
      renderIcon: (active) => (
        <Svg width={28} height={28} viewBox="0 0 28 28">
          <Path
            d="M 14 24 L 14 4"
            stroke={active ? tintColor : dimColor}
            strokeWidth={2}
            strokeLinecap="round"
            fill="none"
          />
          <Circle cx={14} cy={4} r={3} fill={active ? tintColor : dimColor} />
        </Svg>
      ),
    },
    {
      label: "Fade",
      value: "fade",
      renderIcon: (active) => (
        <Svg width={28} height={28} viewBox="0 0 28 28">
          <Path
            d="M 14 24 Q 24 14 14 4"
            stroke={active ? tintColor : dimColor}
            strokeWidth={2}
            strokeLinecap="round"
            fill="none"
          />
          <Circle cx={14} cy={4} r={3} fill={active ? tintColor : dimColor} />
        </Svg>
      ),
    },
    {
      label: "Hook",
      value: "hook",
      renderIcon: (active) => (
        <Svg width={28} height={28} viewBox="0 0 28 28">
          {/* Tight curve hard left */}
          <Path
            d="M 14 24 Q -4 14 14 4"
            stroke={active ? tintColor : dimColor}
            strokeWidth={2}
            strokeLinecap="round"
            fill="none"
          />
          <Circle cx={14} cy={4} r={3} fill={active ? tintColor : dimColor} />
        </Svg>
      ),
    },
    {
      label: "Slice",
      value: "slice",
      renderIcon: (active) => (
        <Svg width={28} height={28} viewBox="0 0 28 28">
          {/* Tight curve hard right */}
          <Path
            d="M 14 24 Q 32 14 14 4"
            stroke={active ? tintColor : dimColor}
            strokeWidth={2}
            strokeLinecap="round"
            fill="none"
          />
          <Circle cx={14} cy={4} r={3} fill={active ? tintColor : dimColor} />
        </Svg>
      ),
    },
    {
      label: "Other",
      value: "other",
      renderIcon: (active) => (
        <Svg width={28} height={28} viewBox="0 0 28 28">
          <Path
            d="M 14 24 C 22 20 6 12 14 4"
            stroke={active ? tintColor : dimColor}
            strokeWidth={2}
            strokeLinecap="round"
            fill="none"
          />
          <Circle cx={14} cy={4} r={3} fill={active ? tintColor : dimColor} />
        </Svg>
      ),
    },
  ];

  const contactOptions: { label: string; value: ContactType }[] = [
    { label: "Pure",    value: "pure" },
    { label: "Thin",    value: "thin" },
    { label: "Fat",     value: "fat" },
    { label: "Toe",     value: "toe" },
    { label: "Heel",    value: "heel" },
    { label: "Unknown", value: "unknown" },
  ];

  const lieOptions: { label: string; value: LieType; Icon: React.ComponentType<any> }[] = [
    { label: "Tee",      value: "tee",      Icon: TeeIcon },
    { label: "Fairway",  value: "fairway",  Icon: FairwayIcon },
    { label: "Fringe",   value: "fringe",   Icon: FringeIcon },
    { label: "Rough",    value: "rough",    Icon: RoughIcon },
    { label: "Bunker",   value: "sand",     Icon: BunkerIcon },
    { label: "Green",    value: "green",    Icon: GreenIcon },
    { label: "Recovery", value: "recovery", Icon: TreeIcon },
  ];

  return (
    <BottomSheetModalFactory reference={innerRef}>
      <View style={$container}>
        <Text preset="heading" style={$styles.modalHeader}>Shot Result</Text>

        {/* ── Actual Shot Shape ── */}
        <Text style={themed($sectionHeader)}>Actual Shot Shape</Text>
        <View style={[$lieRow, $shapeRow]}>
        {shapeOptions.map(({ label, value, renderIcon }) => (
            <TouchableOpacity
            key={value}
            onPress={() => setShape(value)}
            style={$shapeButton}
            accessibilityRole="button"
            accessibilityState={{ selected: shape === value }}
            >
            <View style={[themed($shapeIconCircle), shape === value && themed($shapeIconCircleActive)]}>
                {renderIcon(shape === value)}
            </View>
            <Text style={shape === value ? [themed($lieLabel), themed($lieLabelSelected)] : themed($lieLabel)}>
                {label}
            </Text>
            </TouchableOpacity>
        ))}
        </View>

        {/* ── Ball Lie After ── */}
        <Text style={themed($sectionHeader)}>Ball Lie After</Text>
        <View style={$lieRow}>
        {lieOptions.map(({ label, value, Icon }) => (
            <TouchableOpacity
                key={value}
                onPress={() => setFinishLie(value)}
                style={$lieButton}
                accessibilityRole="button"
                accessibilityState={{ selected: finishLie === value }}
                >
                <Icon
                    width={36}
                    height={36}
                    secondary={theme.colors.backgrounds.elevated}
                    color={finishLie === value ? tintColor : inactiveColor}
                />
                <Text style={finishLie === value ? [themed($lieLabel), themed($lieLabelSelected)] : themed($lieLabel)}>
                    {label}
                </Text>
            </TouchableOpacity>
        ))}
        </View>

        {/* ── Flags ── */}
        <View style={$checkboxGroup}>
            <TouchableOpacity
                style={$checkboxRow}
                onPress={() => setIsPenalty((v) => !v)}
                activeOpacity={0.7}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isPenalty }}
            >
                <View style={[themed($checkbox), isPenalty && themed($checkboxChecked)]}>
                {isPenalty && <Text style={themed($checkmark)}>✓</Text>}
                </View>
                <Text style={themed($checkboxLabel)}>Penalty stroke</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={$checkboxRow}
                onPress={() => setIsOutOfBounds((v) => !v)}
                activeOpacity={0.7}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isOutOfBounds }}
            >
                <View style={[themed($checkbox), isOutOfBounds && themed($checkboxChecked)]}>
                {isOutOfBounds && <Text style={themed($checkmark)}>✓</Text>}
                </View>
                <Text style={themed($checkboxLabel)}>Out of bounds</Text>
            </TouchableOpacity>
        </View>

        <View style={$footer}>
          {editingShotId ? (
            <Button text="Edit Intent" preset="secondary" onPress={handleEditIntent} style={$button} />
          ) : (
            <Button text="Cancel" preset="secondary" onPress={handleCancel} style={$button} />
          )}
          <Button text="Save Result" preset="default" onPress={handleConfirm} style={$button} />
        </View>
      </View>
    </BottomSheetModalFactory>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const $container: ViewStyle = {
  flex: 1,
  gap: 12,
};

const $footer: ViewStyle = {
  flexDirection: "row",
  gap: 12,
  marginTop: 16,
  paddingBottom: 12,
};

const $button: ViewStyle = {
  flex: 1,
};

// ── Lie row (reused for finishLie) ────────────────────────────────────────────

const $lieRow: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-around",
  alignItems: "center",
  gap: 12,
  marginTop: 0,
};

const $lieButton: ViewStyle = {
  alignItems: "center",
};

const $lieLabel: ThemedStyle<TextStyle> = (theme) => ({
  marginTop: 6,
  fontSize: 12,
  fontWeight: "500",
  color: theme.colors.textDim,
});

const $lieLabelSelected: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.tint,
});

// ── Shape picker (mirrors ShotDetailsModal) ───────────────────────────────────

const $shapeRow: ViewStyle = {
  flexWrap: "wrap",
  justifyContent: "space-around",
  rowGap: 16,
};

const $shapeButton: ViewStyle = {
  alignItems: "center",
  gap: 6,
};

const $shapeIconCircle: ThemedStyle<ViewStyle> = (theme) => ({
  width: 52,
  height: 52,
  borderRadius: 26,
  borderWidth: 1.5,
  marginBottom: -10,
  borderColor: theme.colors.border,
  backgroundColor: theme.colors.backgrounds.elevated,
  alignItems: "center",
  justifyContent: "center",
});

const $shapeIconCircleActive: ThemedStyle<ViewStyle> = (theme) => ({
  borderColor: theme.colors.tint,
  backgroundColor: `${theme.colors.tint}15`,
});

// ── Checkboxes ────────────────────────────────────────────────────────────────

const $checkboxGroup: ViewStyle = {
  gap: 12,
};

const $checkboxRow: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: 10,
};

const $checkbox: ThemedStyle<ViewStyle> = (theme) => ({
  width: 22,
  height: 22,
  borderRadius: 6,
  borderWidth: 1.5,
  borderColor: theme.colors.border,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: theme.colors.backgrounds.elevated,
});

const $checkboxChecked: ThemedStyle<ViewStyle> = (theme) => ({
  backgroundColor: theme.colors.tint,
  borderColor: theme.colors.tint,
});

const $checkmark: ThemedStyle<TextStyle> = () => ({
  fontSize: 13,
  fontWeight: "700",
  color: "#fff",
  lineHeight: 16,
});

const $checkboxLabel: ThemedStyle<TextStyle> = (theme) => ({
  fontSize: 15,
  color: theme.colors.text,
  fontWeight: "500",
});

// ── Section header ────────────────────────────────────────────────────────────

const $sectionHeader: ThemedStyle<TextStyle> = (theme) => ({
  fontSize: 13,
  color: theme.colors.textDim,
  fontWeight: "500",
  textTransform: "uppercase",
  letterSpacing: 0.5,
});

// ── Token helpers (for icon colour derivation) ────────────────────────────────

const $selectedColor: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.tint,
});

const $unselectedColor: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.tintInactive,
});

const $dimColor: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.textDim,
});
