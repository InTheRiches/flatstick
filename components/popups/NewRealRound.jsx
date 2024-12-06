import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import useColors from "@/hooks/useColors";
import { useRouter } from "expo-router";
import Svg, { Path } from "react-native-svg";
import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import CustomBackdrop from "@/components/popups/CustomBackdrop";

export default function NewRealRound({ newRealRoundRef }) {
  const colors = useColors();

  const [holes, setHoles] = useState(9);

  const router = useRouter();

  const [open, setOpen] = useState(true);

  // renders
  return (
    <BottomSheetModal
      ref={newRealRoundRef}
      backdropComponent={({ animatedIndex, style }) => (
        <CustomBackdrop
          open={open}
          reference={newRealRoundRef}
          animatedIndex={animatedIndex}
          style={style}
        />
      )}
      backgroundStyle={{ backgroundColor: colors.background.secondary }}
    >
      <BottomSheetView
        style={{
          paddingBottom: 12,
          backgroundColor: colors.background.secondary,
        }}
      >
        <View style={{ marginHorizontal: 24 }}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: 500,
              color: colors.text.primary,
            }}
          >
            New Real Round Session
          </Text>
          <Text
            style={{
              marginTop: 12,
              fontSize: 18,
              color: colors.text.primary,
              marginBottom: 10,
            }}
          >
            Holes
          </Text>
          <View style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}>
            <Pressable
              onPress={() => setHoles(9)}
              style={{
                flex: 1,
                borderWidth: 1,
                borderColor:
                  holes === 9
                    ? colors.toggleable.toggled.border
                    : colors.toggleable.border,
                borderRadius: 12,
                paddingHorizontal: 8,
                paddingVertical: 8,
                backgroundColor:
                  holes === 9
                    ? colors.toggleable.toggled.background
                    : "transparent",
              }}
            >
              {holes === 9 && (
                <View
                  style={{
                    position: "absolute",
                    right: -7,
                    top: -7,
                    backgroundColor: "#40C2FF",
                    padding: 3,
                    borderRadius: 50,
                  }}
                >
                  <Svg
                    width={18}
                    height={18}
                    stroke={colors.checkmark.color}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="3"
                  >
                    <Path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m4.5 12.75 6 6 9-13.5"
                    />
                  </Svg>
                </View>
              )}
              <Text
                style={{
                  textAlign: "center",
                  color: colors.text.primary,
                  fontSize: 16,
                }}
              >
                9 Holes
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setHoles(18)}
              style={{
                flex: 1,
                borderWidth: 1,
                borderColor:
                  holes === 18
                    ? colors.toggleable.toggled.border
                    : colors.toggleable.border,
                borderRadius: 12,
                paddingHorizontal: 8,
                paddingVertical: 8,
                backgroundColor:
                  holes === 18
                    ? colors.toggleable.toggled.background
                    : "transparent",
              }}
            >
              {holes === 18 && (
                <View
                  style={{
                    position: "absolute",
                    right: -7,
                    top: -7,
                    backgroundColor: "#40C2FF",
                    padding: 3,
                    borderRadius: 50,
                  }}
                >
                  <Svg
                    width={18}
                    height={18}
                    stroke={colors.checkmark.color}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="3"
                  >
                    <Path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m4.5 12.75 6 6 9-13.5"
                    />
                  </Svg>
                </View>
              )}
              <Text
                style={{
                  textAlign: "center",
                  color: colors.text.primary,
                  fontSize: 16,
                }}
              >
                18 Holes
              </Text>
            </Pressable>
          </View>
          <PrimaryButton
            title={"Start Session"}
            onPress={() => {
              newRealRoundRef.current?.dismiss();
              router.push({
                pathname: `/simulation/real`,
                params: {
                  stringHoles: holes,
                },
              });
            }}
          ></PrimaryButton>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}
