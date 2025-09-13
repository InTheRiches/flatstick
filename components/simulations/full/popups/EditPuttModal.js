import React, {useCallback, useImperativeHandle, useRef} from "react";
import {Pressable, View} from "react-native";
import {BottomSheetModal, BottomSheetView} from "@gorhom/bottom-sheet";
import useColors from "@/hooks/useColors";
import CustomBackdrop from "@/components/general/popups/CustomBackdrop";
import FontText from "../../../general/FontText";
import {SecondaryButton} from "../../../general/buttons/SecondaryButton";

export function EditPuttModal({ editPuttRef, setMisreadSlope, setMisreadLine, deletePutt}) {
    const colors = useColors();
    const bottomSheetRef = useRef(null);
    const [index, setIndex] = React.useState(0);
    const [misreadSlope, setOurMisreadSlope] = React.useState(false);
    const [misreadLine, setOurMisreadLine] = React.useState(false);

    const myBackdrop = useCallback(({animatedIndex, style}) => {
        return (<CustomBackdrop
            reference={bottomSheetRef}
            animatedIndex={animatedIndex}
            style={style}
        />);
    }, []);

    useImperativeHandle(editPuttRef, () => ({
        open: (index, tap) => {
            setIndex(index);
            setOurMisreadSlope(tap.misreadSlope);
            setOurMisreadLine(tap.misreadLine);
            bottomSheetRef.current?.present();
        },
        close: () => {
            bottomSheetRef.current?.dismiss();
        },
    }))

    // renders
    return (<BottomSheetModal
        ref={bottomSheetRef}
        backdropComponent={myBackdrop}
        backgroundStyle={{backgroundColor: colors.background.secondary}}
        stackBehavior={"push"}
        keyboardBlurBehavior={"restore"}>
        <BottomSheetView style={{paddingBottom: 20, backgroundColor: colors.background.secondary,}}>
            <View style={{paddingHorizontal: 32, flexDirection: "column", alignItems: "center",}}>
                <View style={{flexDirection: "row", gap: 12, alignItems: "center", marginBottom: 8,}}>
                    <FontText
                        style={{
                            fontSize: 26, fontWeight: 600, color: colors.text.primary, textAlign: "left",
                        }}>
                        Edit Putt
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
                    If you misread the line or speed of your putt, you can adjust it here.
                </FontText>
                <View style={{flexDirection: "column", width: "80%", alignItems: "center", justifyContent: "flex-end"}}>
                    <View style={{flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 10}}>
                        <Pressable onPress={() => {setMisreadSlope(index); setOurMisreadSlope(!misreadSlope)}} style={{
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
                            <FontText style={{color: misreadSlope ? colors.button.danger.text : colors.button.danger.disabled.text}}>Misread Slope</FontText>
                        </Pressable>
                        <Pressable onPress={() => {setMisreadLine(index); setOurMisreadLine(!misreadLine)}} style={{
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
                            <FontText style={{color: misreadLine ? colors.button.danger.text : colors.button.danger.disabled.text}}>Misread Break</FontText>
                        </Pressable>
                    </View>
                    <Pressable onPress={() => {deletePutt(index); editPuttRef.current.close()}} style={{
                        paddingHorizontal: 12,
                        paddingVertical: 10,
                        borderRadius: 8,
                        borderWidth: 1,
                        marginTop: 10,
                        width: "100%",
                        borderColor: colors.button.danger.border,
                        backgroundColor: colors.button.danger.background,
                        alignSelf: "center",
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: 'center',
                    }}>
                        <FontText style={{color: colors.button.danger.text}}>Delete</FontText>
                    </Pressable>
                    <SecondaryButton onPress={() => editPuttRef.current.close()} title={"Close"} style={{marginTop: 10, paddingVertical: 10, borderRadius: 10, width: "100%"}}></SecondaryButton>
                </View>
            </View>
        </BottomSheetView>
    </BottomSheetModal>);
}
