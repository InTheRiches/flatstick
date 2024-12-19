import {Text, TextInput, View} from "react-native";
import React, {useCallback, useState} from "react";
import {BottomSheetModal, BottomSheetView} from "@gorhom/bottom-sheet";
import CustomBackdrop from "../CustomBackdrop";
import {PrimaryButton} from "../../buttons/PrimaryButton";
import {doc, getFirestore, setDoc} from "firebase/firestore";
import {createSimpleStats} from "../../../utils/PuttUtils";
import useColors from "@/hooks/useColors";
import {useAppContext} from "@/contexts/AppCtx";
import {getAuth} from "firebase/auth";

export default function NewPutterModal({newPutterRef, setPutters, putters}) {
    const colors = useColors();

    const [putterName, setPutterName] = useState("");
    const [putterFocused, setPutterFocused] = useState(false);
    const [open, setOpen] = useState(false);
    const db = getFirestore();
    const auth = getAuth();
    const {updateData, user} = useAppContext();

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

    // TODO handle putter name validation

    return (
        <BottomSheetModal
            ref={newPutterRef}
            backdropComponent={myBackdrop}
            backgroundStyle={{backgroundColor: colors.background.secondary}}
            stackBehavior={"push"}>
            <BottomSheetView style={{
                    paddingBottom: 12,
                    backgroundColor: colors.background.secondary,
                }}>
                <View style={{marginHorizontal: 24, marginBottom: 4}}>
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
                        backgroundColor: colors.input.background,
                        borderRadius: 10,
                        borderWidth: 1,
                        borderColor: colors.input.border,
                        color: colors.text.primary,
                        fontSize: 16,
                        marginBottom: 12,
                    }}
                    placeholder={"Putter name..."}
                    placeholderTextColor={colors.text.secondary}
                    onChangeText={setPutterName}
                    onFocus={() => setPutterFocused(true)}
                    onBlur={() => setPutterFocused(false)}
                />
                <PrimaryButton
                    title={"Create"}
                    onPress={() => {
                        const id = putterName.toLowerCase().replace(/\s/g, "-");
                        setDoc(doc(db, `users/${auth.currentUser.uid}/putter/` + id), createSimpleStats()).then((data) => {
                            console.log("made new putter document");
                        }).catch((error) => {
                            console.log(error);
                        });

                        const newPutterArray = [...putters.map((putter) => putter.type), id];

                        updateData({putters: newPutterArray}).then(() => {
                            console.log("updated putters array: " + newPutterArray);
                        }).catch((error) => {
                            console.log(":failed ", error);
                        });

                        setPutters(prev => [...prev, {
                            type: id,
                            name: putterName,
                            stats: createSimpleStats()
                        }]);

                        newPutterRef.current.dismiss();
                    }}
                    style={{
                        marginHorizontal: 24,
                        borderRadius: 10,
                        paddingVertical: 12,
                        backgroundColor: colors.primary,
                    }}
                ></PrimaryButton>
            </BottomSheetView>
        </BottomSheetModal>
    )
}