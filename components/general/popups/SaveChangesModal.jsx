import React from "react";
import {Pressable, Text, View} from "react-native";
import BottomSheet, {BottomSheetView,} from "@gorhom/bottom-sheet";
import useColors from "@/hooks/useColors";
import {PrimaryButton} from "@/components/general/buttons/PrimaryButton";

const SaveChangesModal = ({ saveChangesRef, save, disabled }) => {
  const colors = useColors();

  // renders
  return (
    <BottomSheet
      index={-1}
      ref={saveChangesRef}
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
            marginHorizontal: 24,
            paddingBottom: 12,
            flexDirection: "column",
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: 500,
              color: colors.text.primary,
            }}
          >
            Save your changes?
          </Text>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 16,
            }}
          >
            <Pressable
              onPress={() => {}}
              style={({ pressed }) => [
                {
                  backgroundColor: pressed
                    ? colors.button.danger.depressed
                    : colors.button.danger.background,
                  paddingVertical: 10,
                  borderRadius: 10,
                  paddingHorizontal: 32,
                },
              ]}
            >
              <Text
                style={{
                  textAlign: "center",
                  color: "white",
                  fontWeight: 500,
                }}
              >
                Discard
              </Text>
            </Pressable>
            <PrimaryButton
              disabled={disabled}
              title={"Save"}
              onPress={save}
            ></PrimaryButton>
          </View>
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
};

export default SaveChangesModal;
