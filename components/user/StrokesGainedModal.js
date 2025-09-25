import React, {useCallback} from "react";
import {BottomSheetModal, BottomSheetView} from "@gorhom/bottom-sheet";
import {View} from "react-native";
import SGOverTime from "../tabs/stats/sg/graphs/SGOverTime";
import CustomBackdrop from "../general/popups/CustomBackdrop";
import useColors from "../../hooks/useColors";
import FontText from "../general/FontText";

export default function StrokesGainedModal({strokesGainedRef, byMonthStats}) {
    const colors = useColors();

    const myBackdrop = useCallback(
        ({ animatedIndex, style }) => {
            return (
                <CustomBackdrop
                    reference={strokesGainedRef}
                    animatedIndex={animatedIndex}
                    style={style}
                />
            );
        }, []
    );

    return (
        <BottomSheetModal
            ref={strokesGainedRef}
            backdropComponent={myBackdrop}
            android_keyboardInputMode={"adjustPan"}
            keyboardBlurBehavior={"restore"}
            backgroundStyle={{backgroundColor: colors.background.secondary}}>
            <BottomSheetView style={{
                paddingBottom: 12,
                backgroundColor: colors.background.secondary,
            }}>
                <View style={{marginHorizontal: 24, marginBottom: 8}}>
                    <FontText style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>STROKES GAINED</FontText>

                    <SGOverTime statsToUse={byMonthStats} months={12}></SGOverTime>
                </View>
            </BottomSheetView>
        </BottomSheetModal>
    )
}