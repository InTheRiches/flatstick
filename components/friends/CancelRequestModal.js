import React, {useCallback, useImperativeHandle, useRef} from "react";
import {Pressable, View} from "react-native";
import {BottomSheetModal, BottomSheetView} from "@gorhom/bottom-sheet";
import useColors from "@/hooks/useColors";
import CustomBackdrop from "@/components/general/popups/CustomBackdrop";
import {PrimaryButton} from "@/components/general/buttons/PrimaryButton";
import {Exclamation} from "../../assets/svg/SvgComponents";
import FontText from "../general/FontText";

export function CancelRequestModal({ cancelRequestRef, cancel }) {
    const colors = useColors();
    const bottomSheetModalRef = useRef(null);

    const myBackdrop = useCallback(({animatedIndex, style}) => {
        return (<CustomBackdrop
            reference={bottomSheetModalRef}
            animatedIndex={animatedIndex}
            style={style}
        />);
    }, []);

    const [id, setId] = React.useState("");

    useImperativeHandle(cancelRequestRef, () => ({
        open: (id) => {
            bottomSheetModalRef.current?.present();
            setId(id);
        },
        close: () => {
            bottomSheetModalRef.current?.dismiss();
        },
    }));

    // renders
    return (<BottomSheetModal
        ref={bottomSheetModalRef}
        backdropComponent={myBackdrop}
        backgroundStyle={{backgroundColor: colors.background.secondary}}
        keyboardBlurBehavior={"restore"}>
        <BottomSheetView style={{
            paddingBottom: 20, backgroundColor: colors.background.secondary,
        }}>
            <View style={{paddingHorizontal: 32, flexDirection: "column", alignItems: "center",}}>
                <View style={{flexDirection: "row", gap: 12, alignItems: "center", marginBottom: 8,}}>
                    <Exclamation width={48} height={48}></Exclamation>
                    <FontText style={{fontSize: 26, fontWeight: 600, color: colors.text.primary, textAlign: "left",}}>
                        Cancel Friend Request
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
                    Are you sure you want to cancel your friend request?
                </FontText>
                <View style={{flexDirection: "column", width: "80%", alignItems: "center", justifyContent: "flex-end"}}>
                    <Pressable onPress={() => cancel(id)} style={({pressed}) => [{
                        backgroundColor: pressed ? colors.button.danger.depressed : colors.button.danger.background,
                        paddingVertical: 10,
                        borderRadius: 10,
                        marginTop: 16,
                        width: "100%"
                    }]}>
                        <FontText style={{textAlign: "center", color: colors.button.danger.text, fontWeight: 500}}>Cancel Request</FontText>
                    </Pressable>
                    <PrimaryButton key={"primary"} onPress={() => bottomSheetModalRef.current.dismiss()} title={"Back"}
                                   style={{marginTop: 10, paddingVertical: 10, borderRadius: 10, width: "100%"}}></PrimaryButton>
                </View>
            </View>
        </BottomSheetView>
    </BottomSheetModal>);
}
