import React, {useCallback, useState} from "react";
import {Text, TextInput, View} from "react-native";
import {BottomSheetModal, BottomSheetView} from "@gorhom/bottom-sheet";
import useColors from "@/hooks/useColors";
import {PrimaryButton} from "@/components/general/buttons/PrimaryButton";
import CustomBackdrop from "@/components/general/popups/CustomBackdrop";
import Svg, {Path} from "react-native-svg";

// TODO add the same increment/decrement functionality as the distance input
export function TotalPutts({totalPuttsRef, currentPutts, nextHole}) {
    const colors = useColors();

    const [putts, setPutts] = useState(currentPutts);
    const [puttsFocused, setPuttsFocused] = useState(false);
    const [invalid, setInvalid] = useState(false);

    const myBackdrop = useCallback(
        ({animatedIndex, style}) => {
            return (
                <CustomBackdrop
                    reference={totalPuttsRef}
                    animatedIndex={animatedIndex}
                    style={style}
                />
            );
        },
        []
    );

    const updatePutts = (newPutts) => {
        if (newPutts === "") {
            setPutts(-1);
            setInvalid(true);
            return;
        }
        if (newPutts.match(/[^0-9]/g)) {
            setInvalid(true);
            return;
        }


        let fixedPutts = parseInt(newPutts.replace(/[^0-9]/g, ""));
        setInvalid(fixedPutts < 2 || fixedPutts > 9)
        setPutts(fixedPutts);
    }

    // renders
    return (
        <BottomSheetModal
            ref={totalPuttsRef}
            backdropComponent={myBackdrop}
            backgroundStyle={{backgroundColor: colors.background.secondary}}
        >
            <BottomSheetView
                style={{
                    paddingBottom: 12,
                    backgroundColor: colors.background.secondary,
                }}
            >
                <View style={{marginHorizontal: 24}}>
                    <Text
                        style={{
                            fontSize: 20,
                            fontWeight: 500,
                            color: colors.text.primary,
                        }}
                    >
                        Next Hole
                    </Text>
                    <View style={{flexDirection: "row", gap: 12, alignItems: "center"}}>
                        <Text
                            style={{
                                fontSize: 18,
                                color: colors.text.primary,
                                marginBottom: 10,
                            }}
                        >
                            Total putts to complete hole:
                        </Text>
                        <View style={{flexDirection: "row", gap: 12, marginBottom: 12, alignItems: "center"}}>
                            <PrimaryButton style={{
                                aspectRatio: 1,
                                paddingHorizontal: 4,
                                paddingVertical: 4,
                                borderRadius: 16,
                                flex: 0
                            }} onPress={() => {
                                if (putts === -1) setPutts(9);
                                else if (putts === 2) setPutts(9);
                                else setPutts(putts - 1);
                            }}>
                                <Svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={3}
                                    stroke={colors.button.primary.text}
                                    width={18}
                                    height={18}
                                >
                                    <Path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14"/>
                                </Svg>
                            </PrimaryButton>
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
                                value={putts !== -1 ? putts.toString() : ""}
                                defaultValue={currentPutts.toString}
                                onFocus={() => setPuttsFocused(true)}
                                onBlur={() => setPuttsFocused(false)}
                                onChangeText={(text) => updatePutts(text)}
                            />
                            <PrimaryButton style={{
                                aspectRatio: 1,
                                paddingHorizontal: 4,
                                paddingVertical: 4,
                                borderRadius: 16,
                                flex: 0
                            }} onPress={() => {
                                if (putts === -1) setPutts(2);
                                else if (putts === 9) setPutts(2);
                                else setPutts(putts + 1);
                            }}>
                                <Svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={3}
                                    stroke={colors.button.primary.text}
                                    width={18}
                                    height={18}
                                >
                                    <Path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 4.5v15m7.5-7.5h-15"
                                    />
                                </Svg>
                            </PrimaryButton>
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
