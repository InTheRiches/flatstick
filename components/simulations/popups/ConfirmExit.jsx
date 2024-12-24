import React, {useCallback, useState} from "react";
import {Pressable, Text, useColorScheme, View} from "react-native";
import {BottomSheetModal, BottomSheetView} from "@gorhom/bottom-sheet";
import useColors from "@/hooks/useColors";
import CustomBackdrop from "@/components/general/popups/CustomBackdrop";
import {PrimaryButton} from "@/components/general/buttons/PrimaryButton";
import {SecondaryButton} from "../../general/buttons/SecondaryButton";

export function ConfirmExit({ confirmExitRef, end, cancel, partial}) {
    const colors = useColors();
    const colorScheme = useColorScheme();

    const myBackdrop = useCallback(({animatedIndex, style}) => {
        return (<CustomBackdrop
            reference={confirmExitRef}
            animatedIndex={animatedIndex}
            style={style}
        />);
    }, []);

    // renders
    return (<BottomSheetModal
        ref={confirmExitRef}
        backdropComponent={myBackdrop}
        backgroundStyle={{backgroundColor: colors.background.secondary}}
        keyboardBlurBehavior={"restore"}
    >
        <BottomSheetView
            style={{
                paddingBottom: 20, backgroundColor: colors.background.secondary,
            }}
        >
            <View
                style={{
                    paddingHorizontal: 32, flexDirection: "column", alignItems: "center",
                }}
            >
                <View style={{
                        flexDirection: "row", gap: 12, alignItems: "center", marginBottom: 8,
                    }}>
                    <View
                        style={{
                            height: 32,
                            aspectRatio: 1,
                            alignItems: "center",
                            flexDirection: "row",
                            justifyContent: "center",
                            borderRadius: 50,
                            backgroundColor: colors.button.danger.background,
                        }}>
                        <Text style={{color: "white", fontWeight: 600, fontSize: 24}}>
                            !
                        </Text>
                    </View>
                    <Text
                        style={{
                            fontSize: 26, fontWeight: 600, color: colors.text.primary, textAlign: "left",
                        }}>
                        End Session
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
                    }}>
                    Are you sure you want to end this session? You can always upload the partial round, otherwise all data will be lost. This action cannot be undone.
                </Text>
                <View style={{
                    flexDirection: "column", width: "80%", alignItems: "center", justifyContent: "flex-end"
                }}>
                    <Pressable onPress={end} style={({pressed}) => [{
                        backgroundColor: pressed ? colors.button.danger.depressed : colors.button.danger.background,
                        paddingVertical: 10,
                        borderRadius: 10,
                        marginTop: 16,
                        width: "100%"
                    }]}>
                        <Text style={{textAlign: "center", color: colors.button.danger.text, fontWeight: 500}}>End
                            Session</Text>
                    </Pressable>
                    {colorScheme === "light" ?
                        [
                            <PrimaryButton key={"secondary"} onPress={partial} title={"Upload as Partial"}
                                           style={{marginTop: 10, paddingVertical: 10, borderRadius: 10, width: "100%"}}></PrimaryButton>,
                            <PrimaryButton key={"primary"} onPress={cancel} title={"Cancel"}
                                           style={{marginTop: 10, paddingVertical: 10, borderRadius: 10, width: "100%"}}></PrimaryButton>
                        ]
                        :
                        [
                            <SecondaryButton key={"secondary"} onPress={partial} title={"Upload as Partial"}
                                             style={{marginTop: 10, paddingVertical: 10, borderRadius: 10, width: "100%"}}></SecondaryButton>,
                            <SecondaryButton key={"primary"} onPress={cancel} title={"Cancel"}
                                             style={{marginTop: 10, paddingVertical: 10, borderRadius: 10, width: "100%"}}></SecondaryButton>
                        ]
                    }
                </View>
            </View>
        </BottomSheetView>
    </BottomSheetModal>);
}
