import { BottomSheetModal } from "@gorhom/bottom-sheet";
import React, { useImperativeHandle, useState } from "react";
import { TextStyle, TouchableOpacity, View, ViewStyle } from "react-native";

import { Circle, Path, Svg } from "react-native-svg";

import { BottomSheetModalFactory } from "@/components/app/modals/BottomSheetFactory";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import { WheelPicker } from "@/components/ui/WheelPicker";
import { LiveShotAttempt } from "@/models/round.live.types";
import type { ClubType, LieType, ShotCategory, ShotShape } from "@/models/round.session.types";
import { useAppTheme } from "@/theme/context";
import { $styles } from "@/theme/styles";
import { ThemedStyle } from "@/theme/types";
import { BunkerIcon, FairwayIcon, FringeIcon, GreenIcon, RoughIcon, TeeIcon, TreeIcon } from "@assets/icons/svg/lies";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ShotDetailsModalReference {
  open: (defaults?: ShotDefaults) => void;
  openForEdit: (shot: LiveShotAttempt) => void;
  close: () => void;
}

/** Auto-populated initial values derived from course + location context. */
export interface ShotDefaults {
  lie?: LieType;
  clubLabel?: string;
  isGreensideChip?: boolean;
  isGoalGreen?: boolean;
}

/** Fields the modal resolves and passes back to the screen. */
export type ShotModalResult = Pick<LiveShotAttempt, "category" | "club" | "lie" | "intent" | "notes">;

interface ShotDetailsModalProps {
  reference: React.RefObject<ShotDetailsModalReference | null>;
  onConfirm: (details: ShotModalResult) => void;
  onCancel: () => void;
  /** Called when saving intent edits to an existing shot. */
  onEditConfirm?: (shotId: string, details: ShotModalResult) => void;
  /** Called when the user wants to switch to editing the shot result instead. */
  onEditResult?: (shotId: string, currentDetails: ShotModalResult) => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Derive the shot category from the starting lie. */
function categoryFromLie(lie: LieType): ShotCategory {
  switch (lie) {
    case "tee":          return "tee";
    case "green":        return "putt";
    case "fringe":       return "short_game";
    case "sand":         return "short_game";
    case "recovery":     return "recovery";
    default:             return "approach";
  }
}

/** Map a human-readable club label to the structured club object. */
function clubFromLabel(label: string): LiveShotAttempt["club"] {
  const lower = label.toLowerCase();
  let type: ClubType = "other";
  if (lower === "driver")                             type = "driver";
  else if (lower.includes("wood"))                   type = "wood";
  else if (lower.includes("hybrid"))                 type = "hybrid";
  else if (/\d\s*iron/.test(lower))                  type = "iron";
  else if (lower.includes("wedge"))                  type = "wedge";
  else if (lower === "putter")                       type = "putter";
  return { type, label };
}

// ── Component ─────────────────────────────────────────────────────────────────

// Concrete type for intent target (excludes undefined for easier state management)
type IntentTarget = "center" | "left" | "right" | "layup" | "attack" | "other"

export default function ShotDetailsModal({ reference, onConfirm, onCancel, onEditConfirm, onEditResult }: ShotDetailsModalProps) {
  const { themed, theme } = useAppTheme();
  const innerRef = React.useRef<BottomSheetModal>(null);

  const [lie, setLie] = useState<LieType>("fairway");
  const [clubLabel, setClubLabel] = useState<string>("Driver");
  const [intentShape, setIntentShape] = useState<ShotShape>("straight");
  const [isGreensideChip, setIsGreensideChip] = useState(false);
  const [isGoalGreen, setIsGoalGreen] = useState(true);
  const [editingShotId, setEditingShotId] = useState<string | null>(null);

  useImperativeHandle(reference, () => ({
    open: (defaults?: ShotDefaults) => {
      setEditingShotId(null);
      if (defaults) {
        if (defaults.lie !== undefined) setLie(defaults.lie);
        if (defaults.clubLabel !== undefined) setClubLabel(defaults.clubLabel);
        if (defaults.isGreensideChip !== undefined) setIsGreensideChip(defaults.isGreensideChip);
        if (defaults.isGoalGreen !== undefined) setIsGoalGreen(defaults.isGoalGreen);
      }
      innerRef.current?.present();
    },
    openForEdit: (shot: LiveShotAttempt) => {
      setEditingShotId(shot.id);
      setLie(shot.lie);
      setClubLabel(shot.club.label ?? shot.club.type);
      setIntentShape(shot.intent?.shape ?? "straight");
      setIsGreensideChip(shot.intent?.greensideChip ?? false);
      setIsGoalGreen(shot.intent?.goalIsGreen ?? true);
      innerRef.current?.present();
    },
    close: () => {
      innerRef.current?.dismiss();
    },
  }));

  const handleConfirm = () => {
    const result: ShotModalResult = {
      lie,
      club: clubFromLabel(clubLabel),
      category: categoryFromLie(lie),
      intent: { shape: intentShape, goalIsGreen: isGoalGreen, greensideChip: isGreensideChip }
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

  const handleEditResult = () => {
    if (!editingShotId) return;
    const result: ShotModalResult = {
      lie,
      club: clubFromLabel(clubLabel),
      category: categoryFromLie(lie),
      intent: { shape: intentShape, goalIsGreen: isGoalGreen, greensideChip: isGreensideChip }
    };
    onEditResult?.(editingShotId, result);
    innerRef.current?.dismiss();
  };

  // ── Picker options ──────────────────────────────────────────────────────────

  const lieIconOptions: { label: string; value: LieType; Icon: React.ComponentType<any> }[] = [
    { label: "Tee", value: "tee", Icon: TeeIcon },
    { label: "Fairway", value: "fairway", Icon: FairwayIcon },
    { label: "Fringe", value: "fringe", Icon: FringeIcon },
    { label: "Rough", value: "rough", Icon: RoughIcon },
    { label: "Bunker", value: "sand", Icon: BunkerIcon },
    { label: "Green", value: "green", Icon: GreenIcon },
    { label: "Recovery", value: "recovery", Icon: TreeIcon },
  ];

  const clubOptions = [
    { label: "Driver", value: "Driver" },
    { label: "3 Wood", value: "3 Wood" },
    { label: "5 Wood", value: "5 Wood" },
    { label: "4 Iron", value: "4 Iron" },
    { label: "5 Iron", value: "5 Iron" },
    { label: "6 Iron", value: "6 Iron" },
    { label: "7 Iron", value: "7 Iron" },
    { label: "8 Iron", value: "8 Iron" },
    { label: "9 Iron", value: "9 Iron" },
    { label: "Pitching Wedge", value: "Pitching Wedge" },
    { label: "Gap Wedge", value: "Gap Wedge" },
    { label: "Sand Wedge", value: "Sand Wedge" },
    { label: "Lob Wedge", value: "Lob Wedge" },
    { label: "Putter", value: "Putter" },
  ];

  const shapeOptions: { label: string; value: ShotShape; renderIcon: (active: boolean) => React.ReactNode }[] = [
    {
      label: "Draw",
      value: "draw",
      renderIcon: (active) => (
        <Svg width={28} height={28} viewBox="0 0 28 28">
          {/* Arc curving left — ball starts bottom-center, exits top-left */}
          <Path
            d="M 14 24 Q 4 14 14 4"
            stroke={active ? activeShapeColor : dimShapeColor}
            strokeWidth={2}
            strokeLinecap="round"
            fill="none"
          />
          <Circle cx={14} cy={4} r={3} fill={active ? activeShapeColor : dimShapeColor} />
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
            stroke={active ? activeShapeColor : dimShapeColor}
            strokeWidth={2}
            strokeLinecap="round"
            fill="none"
          />
          <Circle cx={14} cy={4} r={3} fill={active ? activeShapeColor : dimShapeColor} />
        </Svg>
      ),
    },
    {
      label: "Fade",
      value: "fade",
      renderIcon: (active) => (
        <Svg width={28} height={28} viewBox="0 0 28 28">
          {/* Arc curving right */}
          <Path
            d="M 14 24 Q 24 14 14 4"
            stroke={active ? activeShapeColor : dimShapeColor}
            strokeWidth={2}
            strokeLinecap="round"
            fill="none"
          />
          <Circle cx={14} cy={4} r={3} fill={active ? activeShapeColor : dimShapeColor} />
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
            stroke={active ? activeShapeColor : dimShapeColor}
            strokeWidth={2}
            strokeLinecap="round"
            fill="none"
          />
          <Circle cx={14} cy={4} r={3} fill={active ? activeShapeColor : dimShapeColor} />
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
            stroke={active ? activeShapeColor : dimShapeColor}
            strokeWidth={2}
            strokeLinecap="round"
            fill="none"
          />
          <Circle cx={14} cy={4} r={3} fill={active ? activeShapeColor : dimShapeColor} />
        </Svg>
      ),
    },
    {
      label: "Other",
      value: "other",
      renderIcon: (active) => (
        <Svg width={28} height={28} viewBox="0 0 28 28">
          {/* S-curve */}
          <Path
            d="M 14 24 C 22 20 6 12 14 4"
            stroke={active ? activeShapeColor : dimShapeColor}
            strokeWidth={2}
            strokeLinecap="round"
            fill="none"
          />
          <Circle cx={14} cy={4} r={3} fill={active ? activeShapeColor : dimShapeColor} />
        </Svg>
      ),
    },
  ];

  const activeShapeColor = themed($lieLabelSelected).color as string;
  const dimShapeColor = themed($lieLabel).color as string;

  return (
    <BottomSheetModalFactory
      reference={innerRef}
    >
      <View style={$container}>
        <Text preset="heading" style={$styles.modalHeader}>Shot Details</Text>

        <View style={$form}>
          <Text style={themed($sectionHeader)}>Ball Lie</Text>
          <View style={$lieRow}>
            {lieIconOptions.map(({ label, value, Icon }) => (
              <TouchableOpacity
                key={value}
                onPress={() => setLie(value)}
                style={$lieButton}
                accessibilityRole="button"
                accessibilityState={{ selected: lie === value }}
              >
                <Icon width={36} height={36} secondary={theme.colors.backgrounds.elevated} color={lie === value ? themed($lieLabelSelected).color : themed($lieLabel).color } />
                <Text style={lie === value ? [themed($lieLabel), themed($lieLabelSelected)] : themed($lieLabel)}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <WheelPicker
            label="Club"
            options={clubOptions}
            value={clubLabel}
            onChange={(val) => setClubLabel(val)}
          />

          <View>
            <Text style={themed($sectionHeader)}>Intended Shot Shape</Text>
            <View style={[$lieRow, $shapeRow]}>
              {shapeOptions.map(({ label, value, renderIcon }) => (
                <TouchableOpacity
                  key={value}
                  onPress={() => setIntentShape(value)}
                  style={$shapeButton}
                  accessibilityRole="button"
                  accessibilityState={{ selected: intentShape === value }}
                >
                  <View style={[themed($shapeIconCircle), intentShape === value && themed($shapeIconCircleActive)]}>
                    {renderIcon(intentShape === value)}
                  </View>
                  <Text style={intentShape === value ? [themed($lieLabel), themed($lieLabelSelected)] : themed($lieLabel)}>
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={$checkboxGroup}>
            <TouchableOpacity
              style={$checkboxRow}
              onPress={() => setIsGreensideChip((v) => !v)}
              activeOpacity={0.7}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isGreensideChip }}
            >
              <View style={[themed($checkbox), isGreensideChip && themed($checkboxChecked)]}>
                {isGreensideChip && <Text style={themed($checkmark)}>✓</Text>}
              </View>
              <Text style={themed($checkboxLabel)}>Greenside chip</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={$checkboxRow}
              onPress={() => setIsGoalGreen((v) => !v)}
              activeOpacity={0.7}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isGoalGreen }}
            >
              <View style={[themed($checkbox), isGoalGreen && themed($checkboxChecked)]}>
                {isGoalGreen && <Text style={themed($checkmark)}>✓</Text>}
              </View>
              <Text style={themed($checkboxLabel)}>Goal is the green</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={$footer}>
          {editingShotId ? (
            <Button
              text="Edit Result"
              preset="secondary"
              onPress={handleEditResult}
              style={$button}
            />
          ) : (
            <Button
              text="Cancel"
              preset="secondary"
              onPress={handleCancel}
              style={$button}
            />
          )}
          <Button
            text="Save Shot"
            preset="default"
            onPress={handleConfirm}
            style={$button}
          />
        </View>
      </View>
    </BottomSheetModalFactory>
  );
}

const $container: ViewStyle = {
  flex: 1,
};

const $form: ViewStyle = {
  gap: 16,
  flex: 1,
};

const $footer: ViewStyle = {
  flexDirection: "row",
  gap: 12,
  marginTop: 24,
  paddingBottom: 24,
};

const $button: ViewStyle = {
  flex: 1,
};

const $lieRow: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-around",
  alignItems: "center",
  gap: 12,
  marginTop: -8,
};

const $lieButton: ViewStyle = {
  alignItems: "center",
};

const $lieLabel: ThemedStyle<TextStyle> = (theme) => ({
  marginTop: 6,
  fontSize: 12,
  fontWeight: 500,
  color: theme.colors.tintInactive
});

const $lieLabelSelected: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.tint,
});

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

const $checkmark: ThemedStyle<TextStyle> = (_theme) => ({
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

const $shapeRow: ViewStyle = {
  marginTop: 8,
  justifyContent: "space-around",
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

const $sectionHeader: ThemedStyle<TextStyle> = (theme) => ({
    fontSize: 13,
    color: theme.colors.textDim,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
});
