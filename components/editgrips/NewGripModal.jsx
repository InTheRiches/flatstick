import {Keyboard, Text, View} from "react-native";
import React, {useCallback, useState} from "react";
import {BottomSheetModal, BottomSheetTextInput, BottomSheetView} from "@gorhom/bottom-sheet";
import CustomBackdrop from "../general/popups/CustomBackdrop";
import {PrimaryButton} from "../general/buttons/PrimaryButton";
import useColors from "@/hooks/useColors";
import {useAppContext} from "@/contexts/AppCtx";

export function NewGripModal({newGripRef}) {
    const colors = useColors();

    const [gripName, setGripName] = useState("");
    const [gripFocused, setGripFocused] = useState(false);
    const [gripInvalid, setGripInvalid] = useState(false);
    const {newGrip, grips} = useAppContext();

    const myBackdrop = useCallback(
        ({animatedIndex, style}) => {
            return (
                <CustomBackdrop
                    open={false}
                    reference={newGripRef}
                    animatedIndex={animatedIndex}
                    style={style}
                />
            );
        },
        []
    );

    const updateGripName = (name) => {
        if (name.length < 4) {
            setGripInvalid(true);
            return;
        }
        // if that name is already taken, setGripInvalid(true)
        for (const grip of grips) {
            if (grip.name === name) {
                setGripInvalid(true);
                return;
            }
        }

        setGripInvalid(false);
        setGripName(name);
    }

    return (
        <BottomSheetModal
            ref={newGripRef}
            backdropComponent={myBackdrop}
            android_keyboardInputMode={"adjustPan"}
            keyboardBlurBehavior={"restore"}
            backgroundStyle={{backgroundColor: colors.background.secondary}}>
            <BottomSheetView style={{
                    paddingBottom: 12,
                    backgroundColor: colors.background.secondary,
                }}>
                <View style={{marginHorizontal: 24, marginBottom: 8}}>
                    <Text style={{
                            fontSize: 20,
                            fontWeight: 500,
                            color: colors.text.primary,
                        }}>
                        New Grip Method
                    </Text>
                </View>
                <BottomSheetTextInput
                    style={{
                        marginHorizontal: 24,
                        padding: 12,
                        backgroundColor: gripInvalid ? colors.input.invalid.background : gripFocused ? colors.input.focused.background : colors.input.background,
                        borderRadius: 10,
                        borderWidth: 1,
                        borderColor: gripFocused ? gripInvalid ? colors.input.invalid.focusedBorder : colors.input.focused.border : gripInvalid ? colors.input.invalid.border : colors.input.border,
                        color: gripInvalid ? colors.input.invalid.text : colors.input.text,
                        fontSize: 16,
                        marginBottom: 12,
                    }}
                    placeholder={"Grip method name..."}
                    placeholderTextColor={colors.text.secondary}
                    onChangeText={updateGripName}
                    onFocus={() => setGripFocused(true)}
                    onBlur={() => setGripFocused(false)}
                />
                <PrimaryButton
                    title={"Create"}
                    onPress={() => {
                        if (gripInvalid) return;

                        newGrip(gripName);

                        Keyboard.dismiss();

                        setTimeout(() => {
                            newGripRef.current.forceClose();
                        }, 400);
                    }}
                    disabled={gripInvalid}
                    style={{
                        borderRadius: 10,
                        paddingVertical: 10,
                        paddingHorizontal: 48,
                        alignSelf: "center"
                    }}
                ></PrimaryButton>
            </BottomSheetView>
        </BottomSheetModal>
    )
}