import {BottomSheetModal, BottomSheetView} from "@gorhom/bottom-sheet";
import {Pressable, Text} from "react-native";
import Svg, {Path} from "react-native-svg";
import React, {useState} from "react";
import {useAppContext} from "../../../../contexts/AppCtx";
import useColors from "../../../../hooks/useColors";
import CustomBackdrop from "../../../general/popups/CustomBackdrop";

export function SetUnits({setUnitsRef}) {
    const {userData, updateData, setUserData} = useAppContext()
    const colors = useColors();
    const [open, setOpen] = useState(false);

    const close = () => {
        updateData({...userData});
    }

    const setUnits = (units) => {
        setUserData({preferences: {...userData.preferences, units: units}})
    }

    return (
        <BottomSheetModal onChange={() => {
            if (open) {
                close();
            }
            setOpen(!open);
        }}
              backdropComponent={({animatedIndex, style}) => <CustomBackdrop reference={setUnitsRef} animatedIndex={animatedIndex} style={style}/>}
              enableDismissOnClose={true}
              stackBehavior={"replace"}
              ref={setUnitsRef}
              backgroundStyle={{backgroundColor: colors.background.primary}}>
            <BottomSheetView style={{paddingBottom: 24, marginHorizontal: 24, backgroundColor: colors.background.primary, gap: 12}}>
                <Text style={{marginTop: 12, fontSize: 18, color: colors.text.primary, fontWeight: 500}}>Set App Theme</Text>
                <Pressable
                    style={{flexDirection: "row", alignItems: "center", padding: 12, backgroundColor: colors.background.secondary, borderRadius: 12, justifyContent: "space-between"}}
                    onPress={() => {
                        if (userData.preferences.units !== 0)
                            setUnits(0);
                    }}>
                    <Text style={{color: colors.text.primary, fontSize: 16}}>Imperial</Text>
                    {
                        userData.preferences.units === 0 &&
                        <Svg width={22} height={22} stroke={colors.checkmark.background} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="3">
                            <Path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5"/>
                        </Svg>
                    }
                </Pressable>
                <Pressable
                    style={{flexDirection: "row", alignItems: "center", padding: 12, backgroundColor: colors.background.secondary, borderRadius: 12, justifyContent: "space-between"}}
                    onPress={() => {
                        if (userData.preferences.units !== 1)
                            setUnits(1);
                    }}>
                    <Text style={{color: colors.text.primary, fontSize: 16}}>Metric</Text>
                    {
                        userData.preferences.units === 1 &&
                        <Svg width={22} height={22} stroke={colors.checkmark.background} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="3">
                            <Path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5"/>
                        </Svg>
                    }
                </Pressable>
            </BottomSheetView>
        </BottomSheetModal>
    );
}