import {Pressable, ScrollView, Switch, Text, View} from 'react-native';

import React, {useState} from 'react';
import useColors from "@/hooks/useColors";
import {useAppContext} from "@/contexts/AppCtx";
import {PrimaryButton} from "../../components/general/buttons/PrimaryButton";
import Svg, {Path} from "react-native-svg";
import {BottomSheetModalProvider} from "@gorhom/bottom-sheet";
import {Reauthenticate, SetTheme, SetUnits} from "../../components/tabs/settings/popups/";
import {useRouter} from "expo-router";
import DangerButton from "../../components/general/buttons/DangerButton";
import {useSession} from "../../contexts/AppCtx";
import {GoogleSignin} from "@react-native-google-signin/google-signin";
import ScreenWrapper from "../../components/general/ScreenWrapper";

export default function HomeScreen() {
    const colors = useColors();
    const {userData} = useAppContext();
    const {signOut} = useSession();
    const router = useRouter();

    const [reminders, setReminders] = useState(userData.preferences.reminders);

    // const [themePressed, setThemePressed] = useState(false);
    const [unitsPressed, setUnitsPressed] = useState(false);

    const setThemeRef = React.useRef(null);
    const setUnitsRef = React.useRef(null);
    const reauthenticateRef = React.useRef(null);

    return (
        <BottomSheetModalProvider>
            <ScreenWrapper>
                <View style={{
                    overflow: "hidden",
                    flexDirection: "column",
                    alignContent: "center",
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border.default,
                    paddingHorizontal: 20,
                    flex: 1
                }}>
                    <ScrollView keyboardShouldPersistTaps={'handled'}>
                        <View style={{
                            flexDirection: "col",
                            alignItems: "flex-start",
                            flex: 0,
                            paddingTop: 2,
                            paddingBottom: 10,
                        }}>
                            <Text style={{
                                fontSize: 24,
                                fontWeight: 500,
                                color: colors.text.primary
                            }}>Settings</Text>
                        </View>
                        <Text style={{color: colors.text.secondary, fontWeight: 600, marginTop: 16, marginBottom: 6}}>USER DATA</Text>
                        <Pressable onPress={() => {
                            if (GoogleSignin.getCurrentUser() !== null) {
                                router.push({pathname: "/settings/user"})
                            } else reauthenticateRef.current.present()
                        }} style={{backgroundColor: colors.background.secondary, borderRadius: 12, paddingLeft: 14, paddingRight: 8, paddingVertical: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12}}>
                            <Text style={{color: colors.text.primary, fontSize: 18, fontWeight: 500}}>Personal Info</Text>
                            <Svg style={{transform: [{rotate: "45deg"}], marginRight: 12}} width={24} height={24} xmlns="http://www.w3.org/2000/svg" fill="none"
                                 viewBox="0 0 24 24" strokeWidth={3}
                                 stroke={colors.text.primary}>
                                <Path strokeLinecap="round" strokeLinejoin="round"
                                      d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25"/>
                            </Svg>
                        </Pressable>
                        <Pressable onPress={() => router.push({pathname: "/editputters"})} style={{backgroundColor: colors.background.secondary, borderRadius: 12, paddingLeft: 14, paddingRight: 8, paddingVertical: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12}}>
                            <Text style={{color: colors.text.primary, fontSize: 18, fontWeight: 500}}>Your Putters</Text>
                            <Svg style={{transform: [{rotate: "45deg"}], marginRight: 12}} width={24} height={24} xmlns="http://www.w3.org/2000/svg" fill="none"
                                 viewBox="0 0 24 24" strokeWidth={3}
                                 stroke={colors.text.primary}>
                                <Path strokeLinecap="round" strokeLinejoin="round"
                                      d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25"/>
                            </Svg>
                        </Pressable>
                        <Pressable onPress={() => router.push({pathname: "/editgrips"})} style={{backgroundColor: colors.background.secondary, borderRadius: 12, paddingLeft: 14, paddingRight: 8, paddingVertical: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12}}>
                            <Text style={{color: colors.text.primary, fontSize: 18, fontWeight: 500}}>Your Grip Methods</Text>
                            <Svg style={{transform: [{rotate: "45deg"}], marginRight: 12}} width={24} height={24} xmlns="http://www.w3.org/2000/svg" fill="none"
                                 viewBox="0 0 24 24" strokeWidth={3}
                                 stroke={colors.text.primary}>
                                <Path strokeLinecap="round" strokeLinejoin="round"
                                      d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25"/>
                            </Svg>
                        </Pressable>
                        <Text style={{color: colors.text.secondary, fontWeight: 600, marginTop: 16, marginBottom: 6}}>NOTIFICATIONS</Text>
                        <Pressable style={{backgroundColor: colors.background.secondary, borderRadius: 12, paddingLeft: 14, paddingRight: 8, paddingVertical: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12}}>
                            <Text style={{color: colors.text.primary, fontSize: 18, fontWeight: 500}}>Practice Reminders</Text>
                            <Switch
                                trackColor={{false: colors.switch.track, true: colors.switch.active.track}}
                                thumbColor={reminders ? colors.switch.active.thumb : colors.switch.thumb}
                                ios_backgroundColor="#3e3e3e"
                                onValueChange={() => setReminders(!reminders)}
                                value={reminders}
                            />
                        </Pressable>
                        <Text style={{color: colors.text.secondary, fontWeight: 600, marginTop: 16, marginBottom: 6}}>INTERFACE</Text>
                        {/*<Pressable style={{backgroundColor: colors.background.secondary, borderRadius: 12, paddingLeft: 14, paddingRight:18, paddingVertical: 6, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12}}>*/}
                        {/*    <Text style={{color: colors.text.primary, fontSize: 18, fontWeight: 500}}>App Theme</Text>*/}
                        {/*    <Pressable*/}
                        {/*        onPress={() => setThemeRef.current.present()}*/}
                        {/*        onPressIn={() => setThemePressed(true)}*/}
                        {/*        onPressOut={() => setThemePressed(false)}*/}
                        {/*        style={{padding: 7}}>*/}
                        {/*        <Text style={{color: colors.text.link, opacity: themePressed ? 0.3 : 1, fontSize: 18, fontWeight: 500}}>{userData.preferences.theme === 0 ? "Auto-Detect" : userData.preferences.theme === 1 ? "Dark" : "Light"}</Text>*/}
                        {/*    </Pressable>*/}
                        {/*</Pressable>*/}
                        <Pressable style={{backgroundColor: colors.background.secondary, borderRadius: 12, paddingLeft: 14, paddingRight: 18, paddingVertical: 6, flexDirection: "row", alignItems: "center", justifyContent: "space-between"}}>
                            <Text style={{color: colors.text.primary, fontSize: 18, fontWeight: 500}}>Units</Text>
                            <Pressable
                                onPressIn={() => setUnitsPressed(true)}
                                onPressOut={() => setUnitsPressed(false)}
                                onPress={() => setUnitsRef.current.present()}
                                style={{padding: 7}}>
                                <Text style={{color: colors.text.link, opacity: unitsPressed ? 0.3 : 1, fontSize: 18, fontWeight: 500}}>{userData.preferences.units === 0 ? "Imperial" : "Metric"}</Text>
                            </Pressable>
                        </Pressable>
                        <Text style={{color: colors.text.secondary, fontWeight: 600, marginTop: 16, marginBottom: 6}}>ACCOUNT ACTIONS</Text>
                        <View style={{flexDirection: "row", gap: 12}}>
                            <PrimaryButton onPress={signOut} style={{flex: 1, paddingVertical: 10, borderRadius: 12}}>
                                <Text style={{color: colors.text.primary, fontSize: 16, fontWeight: 500}}>Sign Out</Text>
                            </PrimaryButton>
                            <DangerButton style={{flex: 1, paddingVertical: 10, borderRadius: 12}}>
                                <Text style={{color: colors.button.danger.text, fontSize: 16, fontWeight: 500}}>Delete Account</Text>
                            </DangerButton>
                        </View>
                    </ScrollView>
                </View>
            </ScreenWrapper>
            <SetTheme setThemeRef={setThemeRef}/>
            <SetUnits setUnitsRef={setUnitsRef}/>
            <Reauthenticate reauthenticateRef={reauthenticateRef}/>
        </BottomSheetModalProvider>
    );
}