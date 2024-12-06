import React, { useCallback, useMemo, useState } from "react";
import { View, Text, Pressable, TextInput } from "react-native";
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import useColors from "@/hooks/useColors";
import { SecondaryButton } from "@/components/buttons/SecondaryButton";
import CustomBackdrop from "@/components/popups/CustomBackdrop";
import { ThemedText } from "@/components/ThemedText";
import ArrowComponent from "@/components/icons/ArrowComponent";
import { SvgClose, SvgWarning } from "@/assets/svg/SvgComponents";

export default function BigMissModal({
  updateField,
  largeMissBy,
  bigMissRef,
  nextHole,
}) {
  const colors = useColors();

  const [open, setOpen] = useState(false);

  const myBackdrop = useCallback(
    ({ animatedIndex, style }) => {
      return (
        <CustomBackdrop
          open={true}
          reference={largeMissBy}
          animatedIndex={animatedIndex}
          style={style}
        />
      );
    },
    []
  );

  const isEqual = (arr, arr2) =>
    Array.isArray(arr) &&
    arr.length === arr2.length &&
    arr.every((val, index) => val === arr2[index]);

  const close = () => {
    updateField("largeMissBy", [0, 0]);
    updateField("largeMiss", false);
  };

  // renders
  return (
    <BottomSheetModal
      ref={bigMissRef}
      backdropComponent={myBackdrop}
      onChange={() => {
        if (open) {
          close();
        }
        setOpen(!open);
      }}
      backgroundStyle={{ backgroundColor: colors.background.secondary }}
    >
      <BottomSheetView
        style={{
          paddingBottom: 12,
          backgroundColor: colors.background.secondary,
        }}
      >
        <View
          style={{
            paddingHorizontal: 24,
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              gap: 12,
              alignItems: "center",
              marginBottom: 8
            }}
          >
            <View
              style={{
                height: 32,
                aspectRatio: 1,
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
                borderRadius: 50,
                backgroundColor: colors.button.danger.background,
              }}
            >
              <Text style={{ color: "white", fontWeight: 600, fontSize: 24 }}>
                !
              </Text>
            </View>
            <Text
              style={{
                fontSize: 26,
                fontWeight: 600,
                color: colors.text.primary,
                textAlign: "left",
              }}
            >
              Miss &gt;3ft
            </Text>
          </View>
          <Text
              style={{
                fontSize: 16,
                fontWeight: 400,
                color: colors.text.primary,
                textAlign: "center",
                width: "70%",
                marginBottom: 16
              }}
            >
            Putting for the rough, are we? You might need GPS for the next
            one. Mark where you missed below.
          </Text>
          <View
            style={{
              flexDirection: "row",
              gap: 12,
              alignSelf: "center",
            }}
          >
            <View style={{ flexDirection: "column", gap: 12 }}>
              <Pressable
                onPress={() => updateField("largeMissBy", [1, 1])}
                style={{
                  aspectRatio: 1,
                  padding: 20,
                  backgroundColor: isEqual(largeMissBy, [1, 1])
                    ? colors.button.danger.background
                    : colors.button.danger.disabled.background,
                  justifyContent: "center",
                  flexDirection: "row",
                  alignItems: "center",
                  borderRadius: 50,
                }}
              >
                <ArrowComponent
                  horizontalBreak={1}
                  verticalSlope={0}
                  selected={isEqual(largeMissBy, [1, 1])}
                ></ArrowComponent>
              </Pressable>
              <Pressable
                onPress={() => updateField("largeMissBy", [1, 0])}
                style={{
                  aspectRatio: 1,
                  padding: 20,
                  backgroundColor: isEqual(largeMissBy, [1, 0])
                    ? colors.button.danger.background
                    : colors.button.danger.disabled.background,
                  justifyContent: "center",
                  flexDirection: "row",
                  alignItems: "center",
                  borderRadius: 50,
                }}
              >
                <ArrowComponent
                  horizontalBreak={1}
                  verticalSlope={1}
                  selected={isEqual(largeMissBy, [1, 0])}
                ></ArrowComponent>
              </Pressable>
              <Pressable
                onPress={() => updateField("largeMissBy", [1, -1])}
                style={{
                  aspectRatio: 1,
                  padding: 20,
                  backgroundColor: isEqual(largeMissBy, [1, -1])
                    ? colors.button.danger.background
                    : colors.button.danger.disabled.background,
                  justifyContent: "center",
                  flexDirection: "row",
                  alignItems: "center",
                  borderRadius: 50,
                }}
              >
                <ArrowComponent
                  horizontalBreak={1}
                  verticalSlope={2}
                  selected={isEqual(largeMissBy, [1, -1])}
                ></ArrowComponent>
              </Pressable>
            </View>
            <View
              style={{
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <Pressable
                onPress={() => updateField("largeMissBy", [0, 1])}
                style={{
                  aspectRatio: 1,
                  padding: 20,
                  backgroundColor: isEqual(largeMissBy, [0, 1])
                    ? colors.button.danger.background
                    : colors.button.danger.disabled.background,
                  justifyContent: "center",
                  flexDirection: "row",
                  alignItems: "center",
                  borderRadius: 50,
                }}
              >
                <ArrowComponent
                  horizontalBreak={2}
                  verticalSlope={0}
                  selected={isEqual(largeMissBy, [0, 1])}
                ></ArrowComponent>
              </Pressable>
              <Pressable
                onPress={() => updateField("largeMissBy", [0, -1])}
                style={{
                  aspectRatio: 1,
                  padding: 20,
                  backgroundColor: isEqual(largeMissBy, [0, -1])
                    ? colors.button.danger.background
                    : colors.button.danger.disabled.background,
                  justifyContent: "center",
                  flexDirection: "row",
                  alignItems: "center",
                  borderRadius: 50,
                }}
              >
                <ArrowComponent
                  horizontalBreak={2}
                  verticalSlope={2}
                  selected={isEqual(largeMissBy, [0, -1])}
                ></ArrowComponent>
              </Pressable>
            </View>
            <View style={{ flexDirection: "column", gap: 12 }}>
              <Pressable
                onPress={() => updateField("largeMissBy", [-1, 1])}
                style={{
                  aspectRatio: 1,
                  padding: 20,
                  backgroundColor: isEqual(largeMissBy, [-1, 1])
                    ? colors.button.danger.background
                    : colors.button.danger.disabled.background,
                  justifyContent: "center",
                  flexDirection: "row",
                  alignItems: "center",
                  borderRadius: 50,
                }}
              >
                <ArrowComponent
                  horizontalBreak={0}
                  verticalSlope={0}
                  selected={isEqual(largeMissBy, [-1, 1])}
                ></ArrowComponent>
              </Pressable>
              <Pressable
                onPress={() => updateField("largeMissBy", [-1, 0])}
                style={{
                  aspectRatio: 1,
                  padding: 20,
                  backgroundColor: isEqual(largeMissBy, [-1, 0])
                    ? colors.button.danger.background
                    : colors.button.danger.disabled.background,
                  justifyContent: "center",
                  flexDirection: "row",
                  alignItems: "center",
                  borderRadius: 50,
                }}
              >
                <ArrowComponent
                  horizontalBreak={0}
                  verticalSlope={1}
                  selected={isEqual(largeMissBy, [-1, 0])}
                ></ArrowComponent>
              </Pressable>
              <Pressable
                onPress={() => updateField("largeMissBy", [-1, -1])}
                style={{
                  aspectRatio: 1,
                  padding: 20,
                  backgroundColor: isEqual(largeMissBy, [-1, -1])
                    ? colors.button.danger.background
                    : colors.button.danger.disabled.background,
                  justifyContent: "center",
                  flexDirection: "row",
                  alignItems: "center",
                  borderRadius: 50,
                }}
              >
                <ArrowComponent
                  horizontalBreak={0}
                  verticalSlope={2}
                  selected={isEqual(largeMissBy, [-1, -1])}
                ></ArrowComponent>
              </Pressable>
            </View>
          </View>
          <Pressable
            onPress={() => {
              if (!isEqual(largeMissBy, [0, 0])) {
                nextHole();
              }
            }}
            style={{
              backgroundColor: isEqual(largeMissBy, [0, 0])
                ? colors.button.disabled.background
                : colors.button.danger.background,
              paddingVertical: 10,
              borderRadius: 10,
              marginTop: 20,
              borderWidth: 1,
              borderColor: isEqual(largeMissBy, [0, 0])
                ? colors.button.disabled.border
                : "transparent",
              paddingHorizontal: 64,
            }}
          >
            <Text
              style={{
                textAlign: "center",
                color: isEqual(largeMissBy, [0, 0])
                  ? colors.button.disabled.text
                  : colors.button.danger.text,
                fontWeight: 500,
              }}
            >
              Submit
            </Text>
          </Pressable>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}
