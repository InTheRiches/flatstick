import React from "react";
import {View} from "react-native";
import Svg, {Path} from "react-native-svg";
import {SecondaryButton} from "../../../general/buttons/SecondaryButton";
import useColors from "../../../../hooks/useColors";

export default function ActionButtons({ session, isSelf, isRecap, setLoading, navigation, shareSessionRef, confirmDeleteRef }) {
    const colors = useColors();

    return (
        <View style={{
            position: "absolute",
            bottom: 0,
            width: "100%",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            paddingHorizontal: 24,
            marginLeft: 24,
            marginBottom: 24
        }}>
            { isSelf && (
                <SecondaryButton onPress={() => shareSessionRef.current.present()} style={{
                    aspectRatio: 1,
                    height: 42,
                    paddingBottom: 2,
                    borderRadius: 50,
                    justifyContent: "center",
                    alignItems: "center"
                }}>
                    <Svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={colors.button.secondary.text} width={26} height={26}>
                        <Path strokeLinecap="round" strokeLinejoin="round"
                              d="M9 8.25H7.5a2.25 2.25 0 0 0-2.25 2.25v9a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25H15m0-3-3-3m0 0-3 3m3-3V15"/>
                    </Svg>
                </SecondaryButton>
            )}

            <SecondaryButton onPress={() => {
                if (isRecap) navigation.navigate("(tabs)");
                else navigation.goBack();
            }} title={isRecap ? "Continue" : "Back"} style={{ paddingVertical: 10, borderRadius: 10, flex: 1 }} />
            { isSelf && (
                <SecondaryButton onPress={() => confirmDeleteRef.current.present()} style={{ aspectRatio: 1, height: 42, borderRadius: 50 }}>
                    <Svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={colors.button.secondary.text} width={24} height={24}>
                        <Path strokeLinecap="round" strokeLinejoin="round"
                              d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"/>
                    </Svg>
                </SecondaryButton>
            )}
        </View>
    );
}