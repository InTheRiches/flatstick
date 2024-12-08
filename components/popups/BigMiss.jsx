import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, TextInput } from "react-native";
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import useColors from "@/hooks/useColors";
import { SecondaryButton } from "@/components/buttons/SecondaryButton";
import CustomBackdrop from "@/components/popups/CustomBackdrop";
import { ThemedText } from "@/components/ThemedText";
import ArrowComponent from "@/components/icons/ArrowComponent";
import { SvgClose, SvgWarning } from "@/assets/svg/SvgComponents";
import { PrimaryButton } from "@/components/buttons/PrimaryButton";

export default function BigMissModal({
  updateField,
  rawLargeMissBy,
  bigMissRef,
  nextHole,
  lastHole,
  allPutts,
  hole,
}) {
  const colors = useColors();

  const [open, setOpen] = useState(false);
  const [transitioningBack, setTransitioningBack] = useState(false);

  const [putts, setPutts] = useState("");
  const [puttsFocused, setPuttsFocused] = useState(false);
  const [invalid, setInvalid] = useState(false);

  const [distance, setDistance] = useState("");
  const [distanceFocused, setDistanceFocused] = useState(false);
  const [distanceInvalid, setDistanceInvalid] = useState(false);

  const [largeMissBy, setLargeMissBy] = useState([0, 0]);

  useEffect(() => {
    if (allPutts[hole - 1] && allPutts[hole - 1].largeMiss) {
      setPutts(allPutts[hole - 1].totalPutts.toString());
      setDistance(allPutts[hole - 1].distanceMissed.toString());

      bigMissRef.current.present();

      console.log("presenting");

      // rawLargeMissBy can be like [~,0], [0,-~] with ~ being any number, so we need to convert it to [0,0] or [1,1] etc
      let fixedLargeMissBy = [0, 0];
      if (rawLargeMissBy[0] > 0) {
        fixedLargeMissBy[0] = 1;
      } else if (rawLargeMissBy[0] < 0) {
        fixedLargeMissBy[0] = -1;
      }

      if (rawLargeMissBy[1] > 0) {
        fixedLargeMissBy[1] = 1;
      } else if (rawLargeMissBy[1] < 0) {
        fixedLargeMissBy[1] = -1;
      }

      setLargeMissBy(fixedLargeMissBy);
    }
    else if (allPutts[hole - 1] && !allPutts[hole - 1].largeMiss) {
      bigMissRef.current.dismiss();
      console.log("dismissing");
      close();
    }
    else if (!allPutts[hole - 1]) {
      setPutts("");
      setDistance("");
    }
  }, [hole]);

  const setMissDirection = (direction) => {
    setLargeMissBy(direction);
    updateField("largeMissBy", direction);
  };

  const myBackdrop = useCallback(({ animatedIndex, style }) => {
    return (
      <CustomBackdrop
        open={true}
        reference={largeMissBy}
        animatedIndex={animatedIndex}
        style={style}
      />
    );
  }, []);

  const isEqual = (arr, arr2) =>
    Array.isArray(arr) &&
    arr.length === arr2.length &&
    arr.every((val, index) => val === arr2[index]);

  const close = () => {
    console.log("closing");
    if (transitioningBack) {
      setTransitioningBack(false);
      return;
    }

    console.log("resetting");

    updateField("largeMissBy", [0, 0]);
    updateField("largeMiss", false);

    setPutts("");
    setDistance("");
    setLargeMissBy([0, 0]);

    setPuttsFocused(false);
    setInvalid(false);
    setDistanceFocused(false);
    setDistanceInvalid(false);
  };

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

  const updateDistance = (newDistance) => {
    if (newDistance.match(/[^0-9]/g)) {
      setDistanceInvalid(true);
      return;
    }
    let fixedDistance = parseInt(newDistance.replace(/[^0-9]/g, ""));

    if (fixedDistance < 3 || fixedDistance > 99) {
      setDistanceInvalid(true);
    } else {
      setDistanceInvalid(false);
    }

    setDistance(newDistance);
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
              marginBottom: 8,
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
              color: colors.text.secondary,
              textAlign: "center",
              width: "70%",
              marginBottom: 16,
            }}
          >
            Putting for the rough, are we? You might need GPS for the next one.
            Mark where you missed below.
          </Text>
          <View
            style={{
              flexDirection: "row",
              gap: 12,
              marginBottom: 20,
              alignSelf: "center",
            }}
          >
            <View style={{ flexDirection: "column", gap: 12 }}>
              <Pressable
                onPress={() => setMissDirection([1, 1])}
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
                onPress={() => setMissDirection([1, 0])}
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
                onPress={() => setMissDirection([1, -1])}
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
                onPress={() => setMissDirection([0, 1])}
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
                onPress={() => setMissDirection([0, -1])}
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
                onPress={() => setMissDirection([-1, 1])}
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
                onPress={() => setMissDirection([-1, 0])}
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
                onPress={() => setMissDirection([-1, -1])}
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
          <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
            <Text
              style={{
                fontSize: 18,
                color: colors.text.primary,
                marginBottom: 10,
              }}
            >
              Total putts to complete the hole:
            </Text>
            <View
              style={{
                flexDirection: "row",
                gap: 12,
                marginBottom: 8,
                alignItems: "center",
              }}
            >
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
                defaultValue={putts.toString()}
              />
            </View>
          </View>
          <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
            <Text
              style={{
                fontSize: 18,
                color: colors.text.primary,
                marginBottom: 10,
              }}
            >
              Estimated distance missed (ft):
            </Text>
            <View
              style={{
                flexDirection: "row",
                gap: 12,
                marginBottom: 12,
                alignItems: "center",
              }}
            >
              <TextInput
                style={{
                  width: 36,
                  textAlign: "center",
                  borderWidth: 1,
                  borderColor: distanceFocused
                    ? distanceInvalid
                      ? colors.input.invalid.focusedBorder
                      : colors.input.focused.border
                    : distanceInvalid
                    ? colors.input.invalid.border
                    : colors.input.border,
                  borderRadius: 10,
                  paddingVertical: 6,
                  fontSize: 16,
                  color: colors.input.text,
                  backgroundColor: distanceInvalid
                    ? colors.input.invalid.background
                    : distanceFocused
                    ? colors.input.focused.background
                    : colors.input.background,
                }}
                onFocus={() => setDistanceFocused(true)}
                onBlur={() => setDistanceFocused(false)}
                onChangeText={(text) => updateDistance(text)}
                defaultValue={distance.toString()}
              />
            </View>
          </View>
          <View style={{flexDirection: "row", gap: 12}}>
            <PrimaryButton
              onPress={() => {
                if (hole !== 1) {
                  setTransitioningBack(true);
                  lastHole();
                }
              }}
              disabled={
                hole === 1
              }
              title={"Back"}
            ></PrimaryButton>
            <PrimaryButton
              onPress={() => {
                if (
                  !isEqual(largeMissBy, [0, 0]) &&
                  !invalid &&
                  putts.length !== 0 &&
                  distance.length !== 0 &&
                  !distanceInvalid
                ) {
                  nextHole(parseInt(putts), parseInt(distance));
                  console.log("running")
                }
              }}
              disabled={
                isEqual(largeMissBy, [0, 0]) ||
                invalid ||
                putts.length === 0 ||
                distance.length === 0 ||
                distanceInvalid
              }
              title={"Submit"}
            ></PrimaryButton>
          </View>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}
