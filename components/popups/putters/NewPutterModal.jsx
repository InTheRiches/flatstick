import {Keyboard, Text, TextInput, View} from "react-native";
import React, {useCallback, useState} from "react";
import {BottomSheetModal, BottomSheetView} from "@gorhom/bottom-sheet";
import CustomBackdrop from "../CustomBackdrop";
import {PrimaryButton} from "../../buttons/PrimaryButton";
import useColors from "@/hooks/useColors";
import {useAppContext} from "@/contexts/AppCtx";

export default function NewPutterModal({newPutterRef}) {
    const colors = useColors();

    const [putterName, setPutterName] = useState("");
    const [putterFocused, setPutterFocused] = useState(false);
    const [putterInvalid, setPutterInvalid] = useState(false);
    const [open, setOpen] = useState(false);
    const {newPutter, putters} = useAppContext();

    const myBackdrop = useCallback(
        ({animatedIndex, style}) => {
            return (
                <CustomBackdrop
                    open={open}
                    reference={newPutterRef}
                    animatedIndex={animatedIndex}
                    style={style}
                />
            );
        },
        [open]
    );

    const updatePutterName = (name) => {
        if (name.length < 4) {
            setPutterInvalid(true);
            return;
        }
        // if that name is already taken, setPutterInvalid(true)
        for (const putter of putters) {
            if (putter.name === name) {
                setPutterInvalid(true);
                return;
            }
        }

        setPutterInvalid(false);
        setPutterName(name);
    }

    // TODO handle putter name validation, ALSO DECIDE IF YOU WANT POPUP OR menu to slide out from under the "your putters" text, and not be a modal

    return (
        <BottomSheetModal
            ref={newPutterRef}
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
                        New Putter
                    </Text>
                </View>
                <TextInput
                    style={{
                        marginHorizontal: 24,
                        padding: 12,
                        backgroundColor: putterInvalid ? colors.input.invalid.background : colors.input.background,
                        borderRadius: 10,
                        borderWidth: 1,
                        borderColor: putterInvalid ? colors.input.invalid.border : colors.input.border,
                        color: putterInvalid ? colors.input.invalid.text : colors.input.text,
                        fontSize: 16,
                        marginBottom: 12,
                    }}
                    placeholder={"Putter name..."}
                    placeholderTextColor={colors.text.secondary}
                    onChangeText={updatePutterName}
                    onFocus={() => setPutterFocused(true)}
                    onBlur={() => setPutterFocused(false)}
                />
                <PrimaryButton
                    title={"Create"}
                    onPress={() => {
                        if (putterInvalid) return;

                        newPutter(putterName);

                        Keyboard.dismiss();

                        setTimeout(() => {
                            newPutterRef.current.forceClose();
                        }, 400);
                    }}
                    disabled={putterInvalid}
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