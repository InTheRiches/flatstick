import React, {useCallback} from "react";
import {Pressable, View} from "react-native";
import {BottomSheetModal, BottomSheetView} from "@gorhom/bottom-sheet";
import useColors from "@/hooks/useColors";
import CustomBackdrop from "@/components/general/popups/CustomBackdrop";
import {PrimaryButton} from "@/components/general/buttons/PrimaryButton";
import FontText from "../../general/FontText";

export function MisreadModal({ misreadRef, setMisreadSlope, misreadSlope, setMisreadLine, misreadLine}) {
    const colors = useColors();
    const colorScheme = "light";

    const myBackdrop = useCallback(({animatedIndex, style}) => {
        return (<CustomBackdrop
            reference={misreadRef}
            animatedIndex={animatedIndex}
            style={style}
        />);
    }, []);

    // renders
    return (<BottomSheetModal
        ref={misreadRef}
        backdropComponent={myBackdrop}
        backgroundStyle={{backgroundColor: colors.background.secondary}}
        keyboardBlurBehavior={"restore"}>
        <BottomSheetView style={{paddingBottom: 20, backgroundColor: colors.background.secondary,}}>
            <View style={{paddingHorizontal: 32, flexDirection: "column", alignItems: "center",}}>
                <View style={{flexDirection: "row", gap: 12, alignItems: "center", marginBottom: 8,}}>
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
                        <FontText style={{color: "white", fontWeight: 600, fontSize: 24}}>!</FontText>
                    </View>
                    <FontText
                        style={{
                            fontSize: 26, fontWeight: 600, color: colors.text.primary, textAlign: "left",
                        }}>
                        Misread
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
                    Shake it off and show that green who's boss on the next one!
                </FontText>
                <View style={{flexDirection: "column", width: "80%", alignItems: "center", justifyContent: "flex-end"}}>
                    <View style={{flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 10}}>
                        <Pressable onPress={() => setMisreadLine(!misreadLine)} style={{
                            paddingHorizontal: 12,
                            paddingVertical: 10,
                            borderRadius: 8,
                            borderWidth: 1,
                            flex: 1,
                            borderColor: misreadLine ? colors.button.danger.border : colors.button.primary.border,
                            backgroundColor: misreadLine ? colors.button.danger.background : colors.button.danger.disabled.background,
                            alignSelf: "center",
                            flexDirection: "row",
                            justifyContent: "center",
                            alignItems: 'center',
                        }}>
                            <FontText style={{color: misreadLine ? colors.button.danger.text : colors.button.danger.disabled.text}}>Break</FontText>
                        </Pressable>
                        <Pressable onPress={() => setMisreadSlope(!misreadSlope)} style={{
                            paddingHorizontal: 12,
                            paddingVertical: 10,
                            borderRadius: 8,
                            borderWidth: 1,
                            flex: 1,
                            borderColor: misreadSlope ? colors.button.danger.border : colors.button.primary.border,
                            backgroundColor: misreadSlope ? colors.button.danger.background : colors.button.danger.disabled.background,
                            alignSelf: "center",
                            flexDirection: "row",
                            justifyContent: "center",
                            alignItems: 'center',
                        }}>
                            <FontText style={{color: misreadSlope ? colors.button.danger.text : colors.button.danger.disabled.text}}>Speed</FontText>
                        </Pressable>
                    </View>
                    <PrimaryButton onPress={() => misreadRef.current.close()} title={"Close"} style={{marginTop: 10, paddingVertical: 10, borderRadius: 10, width: "100%"}}></PrimaryButton>
                </View>
            </View>
        </BottomSheetView>
    </BottomSheetModal>);
}
