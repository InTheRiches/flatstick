import React, {useCallback, useMemo, useState} from "react";
import {View, Text, Pressable, TextInput, useColorScheme} from "react-native";
import {BottomSheetModal, BottomSheetView} from "@gorhom/bottom-sheet";
import useColors from "@/hooks/useColors";
import {PrimaryButton} from "@/components/general/buttons/PrimaryButton";
import CustomBackdrop from "@/components/general/popups/CustomBackdrop";
import Svg, {Path} from "react-native-svg";
import {SecondaryButton} from "../../general/buttons/SecondaryButton";

export function SubmitModal({submitRef, submit, cancel}) {
    const colors = useColors();
    const colorScheme = "light";

    const myBackdrop = useCallback(
        ({animatedIndex, style}) => {
            return (
                <CustomBackdrop
                    reference={submitRef}
                    animatedIndex={animatedIndex}
                    style={style}
                />
            );
        },
        []
    );

    // renders
    return (
        <BottomSheetModal
            ref={submitRef}
            backdropComponent={myBackdrop}
            backgroundStyle={{backgroundColor: colors.background.secondary}}
        >
            <BottomSheetView
                style={{
                    paddingBottom: 12,
                    backgroundColor: colors.background.secondary,
                }}>
                <View style={{marginHorizontal: 24}}>
                    <View style={{
                        flexDirection: "row",
                        gap: 12,
                        alignItems: "center",
                        marginBottom: 8,
                    }}>
                        <View style={{
                            height: 32,
                            aspectRatio: 1,
                            alignItems: "center",
                            flexDirection: "row",
                            justifyContent: "center",
                            borderRadius: 50,
                            backgroundColor: colors.checkmark.background
                        }}>
                            <Svg width={24} height={24} stroke={colors.checkmark.color} xmlns="http://www.w3.org/2000/svg"
                                 fill="none"
                                 viewBox="0 0 24 24" strokeWidth="3">
                                <Path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5"/>
                            </Svg>
                        </View>
                        <Text style={{
                            fontSize: 26,
                            fontWeight: 600,
                            color: colors.text.primary,
                            textAlign: "left",
                        }}>
                            Submit Round
                        </Text>
                    </View>
                    <Text style={{textAlign: "center", fontSize: 16, marginTop: 8, color: colors.text.secondary}}>Done
                        putting? Submit to find out if you should celebrate—or blame the slope, the wind, and your
                        shoes.</Text>
                    <View style={{flexDirection: "row", alignItems: "center", justifyContent: "space-around", marginTop: 24}}>
                        {colorScheme === "light" ?
                            [
                                <PrimaryButton key={"secondary"} onPress={cancel} title={"Cancel"}
                                               style={{paddingVertical: 10, borderRadius: 10, paddingHorizontal: 48}}></PrimaryButton>,
                                <SecondaryButton key={"primary"} onPress={submit} title={"Submit"}
                                                 style={{paddingVertical: 10, borderRadius: 10, paddingHorizontal: 48}}></SecondaryButton>,
                            ]
                            :
                            [
                                <SecondaryButton key={"primary"} onPress={cancel} title={"Cancel"}
                                                 style={{paddingVertical: 10, borderRadius: 10, paddingHorizontal: 48}}></SecondaryButton>,
                                <PrimaryButton key={"secondary"} onPress={submit} title={"Submit"}
                                               style={{paddingVertical: 10, borderRadius: 10, paddingHorizontal: 48}}></PrimaryButton>,
                            ]
                        }
                    </View>
                </View>
            </BottomSheetView>
        </BottomSheetModal>
    );
}
