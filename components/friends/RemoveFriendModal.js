import React, {useCallback, useImperativeHandle, useRef} from "react";
import {Pressable, View} from "react-native";
import {BottomSheetModal, BottomSheetView} from "@gorhom/bottom-sheet";
import useColors from "@/hooks/useColors";
import CustomBackdrop from "@/components/general/popups/CustomBackdrop";
import {PrimaryButton} from "@/components/general/buttons/PrimaryButton";
import {Exclamation} from "../../assets/svg/SvgComponents";
import FontText from "../general/FontText";

export function RemoveFriendModal({ removeFriendRef, remove }) {
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

    useImperativeHandle(removeFriendRef, () => ({
        open: (id = "0") => {
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
                        Remove Friend
                    </FontText>
                </View>
                <FontText
                    style={{
                        fontSize: 16,
                        fontWeight: 400,
                        color: colors.text.secondary,
                        textAlign: "center",
                        width: "80%",
                        marginBottom: 16,
                    }}>
                    Are you sure you want to remove this friend? You will need to send a new friend request to reconnect.
                </FontText>
                <View style={{flexDirection: "column", width: "80%", alignItems: "center", justifyContent: "flex-end"}}>
                    <Pressable onPress={() => remove(id)} style={({pressed}) => [{
                        backgroundColor: pressed ? colors.button.danger.depressed : colors.button.danger.background,
                        paddingVertical: 10,
                        borderRadius: 10,
                        marginTop: 16,
                        width: "100%"
                    }]}>
                        <FontText style={{textAlign: "center", color: colors.button.danger.text, fontWeight: 500}}>Remove Friend</FontText>
                    </Pressable>
                    <PrimaryButton key={"primary"} onPress={() => bottomSheetModalRef.current.dismiss()} title={"Back"}
                                   style={{marginTop: 10, paddingVertical: 10, borderRadius: 10, width: "100%"}}></PrimaryButton>
                </View>
            </View>
        </BottomSheetView>
    </BottomSheetModal>);
}
