import { BottomSheetModal } from "@gorhom/bottom-sheet";
import React, { useImperativeHandle, useState } from "react";
import { TextStyle, TouchableOpacity, View, ViewStyle } from "react-native";

import { BottomSheetModalFactory } from "@/components/app/modals/BottomSheetFactory";
import { Button } from "@/components/ui/Button";
import DropdownPicker from "@/components/ui/DropdownPicker";
import { Text } from "@/components/ui/Text";
import type { Shot } from "@/hooks/courses/useRoundTracking";
import { useAppTheme } from "@/theme/context";
import BunkerIcon from "@assets/icons/lieTypes/bunkerLie";

export interface ShotDetailsModalReference {
  open: () => void;
  close: () => void;
}

interface ShotDetailsModalProps {
  reference: React.RefObject<ShotDetailsModalReference | null>;
  onConfirm: (details: Pick<Shot, "lie" | "club" | "goal" | "shotShape">) => void;
  onCancel: () => void;
}

export default function ShotDetailsModal({ reference, onConfirm, onCancel }: ShotDetailsModalProps) {
  const { theme } = useAppTheme();
  const innerRef = React.useRef<BottomSheetModal>(null);

  const [lie, setLie] = useState<Shot["lie"]>("fairway");
  const [club, setClub] = useState<string>("Driver");
  const [goal, setGoal] = useState<Shot["goal"]>("green");
  const [shotShape, setShotShape] = useState<Shot["shotShape"]>("straight");

  useImperativeHandle(reference, () => ({
    open: () => {
      innerRef.current?.present();
    },
    close: () => {
      innerRef.current?.dismiss();
    },
  }));

  const handleConfirm = () => {
    onConfirm({ lie, club, goal, shotShape });
    innerRef.current?.dismiss();
  };

  const handleCancel = () => {
    onCancel();
    innerRef.current?.dismiss();
  };

  const lieIconOptions: { label: string; value: Shot["lie"]; Icon: React.ComponentType<any> }[] = [
    { label: "Bunker", value: "bunker", Icon: BunkerIcon },
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

  const goalOptions = [
    { label: "Green", value: "green" },
    { label: "Layup", value: "layup" },
    { label: "Recovery", value: "recovery" },
    { label: "Other", value: "other" },
  ];

  const shapeOptions = [
    { label: "Straight", value: "straight" },
    { label: "Draw", value: "draw" },
    { label: "Fade", value: "fade" },
    { label: "Other", value: "other" },
  ];

  return (
    <BottomSheetModalFactory
      reference={innerRef}
      snapPoints={["60%"]}
    >
      <View style={$container}>
        <Text preset="heading" style={$title}>Shot Details</Text>

        <View style={$form}>
          <View style={$lieRow}>
            {lieIconOptions.map(({ label, value, Icon }) => (
              <TouchableOpacity
                key={value}
                onPress={() => setLie(value)}
                style={lie === value ? [$lieButton, $lieButtonSelected] : $lieButton}
                accessibilityRole="button"
                accessibilityState={{ selected: lie === value }}
              >
                <Icon width={36} height={36} />
                <Text style={$lieLabel}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <DropdownPicker
            label="Club"
            options={clubOptions}
            value={club}
            onChange={(val) => setClub(val as string)}
          />

          <DropdownPicker
            label="Goal"
            options={goalOptions}
            value={goal}
            onChange={(val) => setGoal(val as Shot["goal"])}
          />

          <DropdownPicker
            label="Shot Shape"
            options={shapeOptions}
            value={shotShape}
            onChange={(val) => setShotShape(val as Shot["shotShape"])}
          />
        </View>

        <View style={$footer}>
          <Button
            text="Cancel"
            preset="default"
            onPress={handleCancel}
            style={$button}
          />
          <Button
            text="Save Shot"
            preset="filled"
            onPress={handleConfirm}
            style={$button}
          />
        </View>
      </View>
    </BottomSheetModalFactory>
  );
}

const $container: ViewStyle = {
  padding: 24,
  flex: 1,
};

const $title: TextStyle = {
  marginBottom: 24,
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
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  paddingVertical: 8,
};

const $lieButton: ViewStyle = {
  alignItems: "center",
  padding: 8,
  borderRadius: 8,
};

const $lieButtonSelected: ViewStyle = {
  backgroundColor: "rgba(0,0,0,0.06)",
};

const $lieLabel: TextStyle = {
  marginTop: 6,
  fontSize: 12,
};
