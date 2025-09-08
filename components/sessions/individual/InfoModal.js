import FontText from "../../general/FontText";
import {View} from "react-native";
import React, {useCallback} from "react";
import useColors from "../../../hooks/useColors";
import CustomBackdrop from "../../general/popups/CustomBackdrop";
import {BottomSheetModal, BottomSheetView} from "@gorhom/bottom-sheet";

export default function InfoModal({infoModalRef, putter, grip, mode, difficulty}) {
    const colors = useColors();

    const myBackdrop = useCallback(({animatedIndex, style}) => {
        return (<CustomBackdrop
            reference={infoModalRef}
            animatedIndex={animatedIndex}
            style={style}
        />);
    }, []);

    return (
        <BottomSheetModal
            ref={infoModalRef}
            backdropComponent={myBackdrop}
            backgroundStyle={{backgroundColor: colors.background.primary}}
            keyboardBlurBehavior={"restore"}>
            <BottomSheetView style={{
                paddingBottom: 20, paddingHorizontal: 32, alignItems: "center",
            }}>
                <FontText style={{fontSize: 22, fontWeight: 500}}>Session Information</FontText>
                <FontText style={{fontSize: 18, fontWeight: 600, color: colors.text.primary, marginTop: 8, marginBottom: 4, width: "100%"}}>Putter</FontText>
                <View style={{flexDirection: "row", gap: 0, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, alignItems: "center", backgroundColor: colors.background.secondary}}>
                    <FontText style={{fontSize: 18, color: colors.text.primary, fontWeight: 500, flex: 1}}>{putter.split("-").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}</FontText>
                </View>
                <FontText style={{fontSize: 18, fontWeight: 600, color: colors.text.primary, marginTop: 8, marginBottom: 4, width: "100%"}}>Grip</FontText>
                <View style={{flexDirection: "row", gap: 0, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, alignItems: "center", backgroundColor: colors.background.secondary}}>
                    <FontText style={{fontSize: 18, color: colors.text.primary, fontWeight: 500, flex: 1}}>{grip.split("-").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}</FontText>
                </View>
                { mode && (
                    <>
                        <FontText style={{fontSize: 18, fontWeight: 600, color: colors.text.primary, marginTop: 8, marginBottom: 4, width: "100%"}}>Mode</FontText>
                        <View style={{flexDirection: "row", gap: 0, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, alignItems: "center", backgroundColor: colors.background.secondary}}>
                            <FontText style={{fontSize: 18, color: colors.text.primary, fontWeight: 500, flex: 1}}>{mode.charAt(0).toUpperCase() + mode.slice(1)}</FontText>
                        </View>
                    </>
                )}
                { difficulty && (
                    <>
                        <FontText style={{fontSize: 18, fontWeight: 600, color: colors.text.primary, marginTop: 8, marginBottom: 4, width: "100%"}}>Difficulty</FontText>
                        <View style={{flexDirection: "row", gap: 0, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, alignItems: "center", backgroundColor: colors.background.secondary}}>
                            <FontText style={{fontSize: 18, color: colors.text.primary, fontWeight: 500, flex: 1}}>{difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</FontText>
                        </View>
                    </>
                )}
            </BottomSheetView>
        </BottomSheetModal>
    )
}