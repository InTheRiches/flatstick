import {BottomSheetModal, BottomSheetView} from "@gorhom/bottom-sheet";
import {Appearance, Platform, Pressable, Text} from "react-native";
import Svg, {Path} from "react-native-svg";
import React from "react";
import {useAppContext} from "../../../../contexts/AppCtx";
import useColors from "../../../../hooks/useColors";
import CustomBackdrop from "../../../general/popups/CustomBackdrop";

export function SetTheme({setThemeRef}) {
    const {userData, updateData} = useAppContext()
    const colors = useColors();

    const setTheme = (theme) => {
        setThemeRef.current.dismiss();
        updateData({preferences: {...userData.preferences, theme: theme}})

        const nativeColor = Platform.OS === "android" ? Appearance.getNativeColorScheme() : null;

        console.log(nativeColor);

        // TODO find out why this doesnt work for Auto-Detect
        Appearance.setColorScheme(theme === 0 ? nativeColor : theme === 1 ? "dark" : "light");
    }

    return (
        <BottomSheetModal
              backdropComponent={({animatedIndex, style}) => <CustomBackdrop reference={setThemeRef} animatedIndex={animatedIndex} style={style}/>}
              enableDismissOnClose={true}
              handleIndicatorStyle={{backgroundColor: colors.text.primary}}
              stackBehavior={"replace"}
              ref={setThemeRef}
              backgroundStyle={{backgroundColor: colors.background.primary}}>
            <BottomSheetView style={{paddingBottom: 24, marginHorizontal: 24, backgroundColor: colors.background.primary, gap: 12}}>
                <Text style={{marginTop: 12, fontSize: 18, color: colors.text.primary, fontWeight: 500}}>Set App Theme</Text>
                <Pressable
                    style={{flexDirection: "row", alignItems: "center", padding: 12, backgroundColor: colors.background.secondary, borderRadius: 12, justifyContent: "space-between"}}
                    onPress={() => {
                        if (userData.preferences.theme !== 0)
                            setTheme(0);
                    }}>
                    <Text style={{color: colors.text.primary, fontSize: 16}}>Auto-Detect</Text>
                    {
                        userData.preferences.theme === 0 &&
                        <Svg width={22} height={22} stroke={colors.checkmark.background} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="3">
                            <Path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5"/>
                        </Svg>
                    }
                </Pressable>
                <Pressable
                    style={{flexDirection: "row", alignItems: "center", padding: 12, backgroundColor: colors.background.secondary, borderRadius: 12, justifyContent: "space-between"}}
                    onPress={() => {
                        if (userData.preferences.theme !== 1)
                            setTheme(1);
                    }}>
                    <Text style={{color: colors.text.primary, fontSize: 16}}>Dark</Text>
                    {
                        userData.preferences.theme === 1 &&
                        <Svg width={22} height={22} stroke={colors.checkmark.background} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="3">
                            <Path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5"/>
                        </Svg>
                    }
                </Pressable>
                <Pressable
                    style={{flexDirection: "row", alignItems: "center", padding: 12, backgroundColor: colors.background.secondary, borderRadius: 12, justifyContent: "space-between"}}
                    onPress={() => {
                        if (userData.preferences.theme !== 2)
                            setTheme(2);
                    }}>
                    <Text style={{color: colors.text.primary, fontSize: 16}}>Light</Text>
                    {
                        userData.preferences.theme === 2 &&
                        <Svg width={22} height={22} stroke={colors.checkmark.background} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="3">
                            <Path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5"/>
                        </Svg>
                    }
                </Pressable>
            </BottomSheetView>
        </BottomSheetModal>
    );
}