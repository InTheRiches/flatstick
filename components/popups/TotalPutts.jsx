import React, { useCallback, useMemo, useState } from "react";
import { View, Text, Pressable, TextInput } from "react-native";
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import useColors from "@/hooks/useColors";
import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import CustomBackdrop from "@/components/popups/CustomBackdrop";

export default function TotalPutts({ totalPuttsRef, nextHole }) {
  const colors = useColors();

  const [putts, setPutts] = useState(2);
  const [puttsFocused, setPuttsFocused] = useState(false);
  const [invalid, setInvalid] = useState(false);

  const [open, setOpen] = useState(true);

  const myBackdrop = useCallback(
    ({ animatedIndex, style }) => {
      return (
        <CustomBackdrop
          open={open}
          reference={totalPuttsRef}
          animatedIndex={animatedIndex}
          style={style}
        />
      );
    },
    [open]
  );

  const updatePutts = (newPutts) => {
    if (newPutts.match(/[^0-9]/g)) {
      setInvalid(true);
      return;
    }

    let fixedPutts = parseInt(newPutts.replace(/[^0-9]/g, ""));

    if (fixedPutts < 2 || fixedPutts > 9) {
      setInvalid(true);
    } else {
      setInvalid(false);
    }

    setPutts(newPutts);
  };

  // renders
  return (
    <BottomSheetModal
      ref={totalPuttsRef}
      backdropComponent={myBackdrop}
      backgroundStyle={{ backgroundColor: colors.background.secondary }}
    >
      <BottomSheetView
        style={{
          paddingBottom: 12,
          backgroundColor: colors.background.secondary,
        }}
      >
        <View style={{ marginHorizontal: 24}}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: 500,
              color: colors.text.primary,
            }}
          >
            Next Hole
          </Text>
          <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
            <Text
              style={{
                fontSize: 18,
                color: colors.text.primary,
                marginBottom: 10,
              }}
            >
              Total putts to complete hole:
            </Text>
            <View style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}>
              <TextInput
                style={{
                  width: 36,
                  textAlign: "center",
                  borderWidth: 1,
                  borderColor: puttsFocused
                    ? invalid
                      ? colors.input.invalid.focusedBorder
                      : colors.input.focused.border
                    : invalid
                    ? colors.input.invalid.border
                    : colors.input.border,
                  borderRadius: 10,
                  paddingVertical: 6,
                  fontSize: 16,
                  color: colors.input.text,
                  backgroundColor: invalid
                    ? colors.input.invalid.background
                    : puttsFocused
                    ? colors.input.focused.background
                    : colors.input.background,
                }}
                onFocus={() => setPuttsFocused(true)}
                onBlur={() => setPuttsFocused(false)}
                onChangeText={(text) => updatePutts(text)}
              />
            </View>
          </View>
          <PrimaryButton
            title={"Next Hole"}
            disabled={invalid}
            onPress={() => {
              if (invalid) return;
              nextHole(parseInt(putts));
              totalPuttsRef.current?.dismiss();
            }}
          ></PrimaryButton>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}
