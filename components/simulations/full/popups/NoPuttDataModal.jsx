import React, {useCallback} from "react";
import {Pressable, View} from "react-native";
import {BottomSheetModal, BottomSheetView} from "@gorhom/bottom-sheet";
import useColors from "@/hooks/useColors";
import CustomBackdrop from "@/components/general/popups/CustomBackdrop";
import {PrimaryButton} from "@/components/general/buttons/PrimaryButton";
import FontText from "../../../general/FontText";
import {Exclamation} from "../../../../assets/svg/SvgComponents";

export function NoPuttDataModal({ noPuttDataModalRef, isLastHole, puttTrackingRef, nextHole}) {
    const colors = useColors();
    const colorScheme = "light";

    const myBackdrop = useCallback(({animatedIndex, style}) => {
        return (<CustomBackdrop
            reference={noPuttDataModalRef}
            animatedIndex={animatedIndex}
            style={style}
        />);
    }, []);

    // renders
    return (<BottomSheetModal
        ref={noPuttDataModalRef}
        backdropComponent={myBackdrop}
        backgroundStyle={{backgroundColor: colors.background.secondary}}
        keyboardBlurBehavior={"restore"}>
        <BottomSheetView style={{paddingBottom: 20, backgroundColor: colors.background.secondary,}}>
            <View style={{
                    paddingHorizontal: 32, flexDirection: "column", alignItems: "center",
                }}>
                <View style={{flexDirection: "row", gap: 12, alignItems: "center", marginBottom: 8,}}>
                    <Exclamation width={48} height={48}></Exclamation>
                    <FontText
                        style={{
                            fontSize: 26, fontWeight: 600, color: colors.text.primary, textAlign: "left",
                        }}>
                        Missing Putting Data
                    </FontText>
                </View>
                <FontText
                    style={{
                        fontSize: 16,
                        fontWeight: 400,
                        color: colors.text.secondary,
                        textAlign: "center",
                        width: "70%",
                        marginBottom: 16,
                    }}>
                    You didn’t enter any putting data for this hole. Are you sure you want to continue?
                </FontText>
                <View style={{
                    flexDirection: "column", width: "80%", alignItems: "center", justifyContent: "flex-end"
                }}>
                    <Pressable onPress={() => {
                        nextHole();
                        noPuttDataModalRef.current.dismiss();
                    }} style={({pressed}) => [{
                        backgroundColor: pressed ? colors.button.danger.depressed : colors.button.danger.background,
                        paddingVertical: 10,
                        borderRadius: 10,
                        marginTop: 16,
                        width: "100%"
                    }]}>
                        <FontText style={{textAlign: "center", color: colors.button.danger.text, fontWeight: 500}}>{isLastHole ? "Submit" : "Next Hole"}</FontText>
                    </Pressable>
                    {puttTrackingRef ?
                            [<PrimaryButton key={"secondary"} onPress={() => {
                                puttTrackingRef.current.open();
                                noPuttDataModalRef.current.dismiss();
                            }} title={"Edit Putts"} style={{marginTop: 10, paddingVertical: 10, borderRadius: 10, width: "100%"}}></PrimaryButton>,
                                <PrimaryButton key={"primary"} onPress={() => noPuttDataModalRef.current.dismiss()} title={"Cancel"} style={{marginTop: 10, paddingVertical: 10, borderRadius: 10, width: "100%"}}></PrimaryButton>]
                    : <PrimaryButton key={"primary"} onPress={() => noPuttDataModalRef.current.dismiss()} title={"Cancel"} style={{marginTop: 10, paddingVertical: 10, borderRadius: 10, width: "100%"}}></PrimaryButton>
                }
            </View>
            </View>
        </BottomSheetView>
    </BottomSheetModal>);
}
