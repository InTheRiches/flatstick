import {Alert, Linking, Platform, Pressable, ScrollView, View} from 'react-native';

import React, {useRef, useState} from 'react';
import useColors from "@/hooks/useColors";
import {useAppContext} from "@/contexts/AppContext";
import {PrimaryButton} from "../../components/general/buttons/PrimaryButton";
import Svg, {Path} from "react-native-svg";
import {BottomSheetModalProvider} from "@gorhom/bottom-sheet";
import {
    ReauthenticateForDeletion,
    ReauthenticateForProfile,
    SetTheme,
    SetUnits
} from "../../components/tabs/settings/popups";
import {useNavigation, useRouter} from "expo-router";
import DangerButton from "../../components/general/buttons/DangerButton";
import {useSession} from "../../contexts/AuthContext";
import {GoogleSignin} from "@react-native-google-signin/google-signin";
import ScreenWrapper from "../../components/general/ScreenWrapper";
import {auth} from "../../utils/firebase";
import {deleteUser} from "firebase/auth";
import {ConfirmDelete} from "../../components/tabs/settings/popups/ConfirmDelete";
import {BannerAd, BannerAdSize, TestIds, useForeground} from "react-native-google-mobile-ads";
import FontText from "../../components/general/FontText";
import {ConfirmSignOut} from "../../components/tabs/settings/popups/ConfirmSignOut";
import {SecondaryButton} from "../../components/general/buttons/SecondaryButton";

const bannerAdId = __DEV__ ? TestIds.BANNER : Platform.OS === "ios" ? "ca-app-pub-2701716227191721/1882654810" : "ca-app-pub-2701716227191721/8611403632";

export default function HomeScreen() {
    const colors = useColors();
    const {userData, updateData} = useAppContext();
    const {signOut, setSession} = useSession();
    const router = useRouter();

    const [unitsPressed, setUnitsPressed] = useState(false);

    const setThemeRef = React.useRef(null);
    const setUnitsRef = React.useRef(null);
    const reauthenticateRef = React.useRef(null);
    const reauthenticateDeletionRef = React.useRef(null);
    const confirmDeleteRef = React.useRef(null);
    const confirmSignOutRef = React.useRef(null);
    const bannerRef = useRef(null);

    const navigation = useNavigation();

    useForeground(() => {
        bannerRef.current?.load();
    })

    const isApple = auth.currentUser && auth.currentUser.providerData[0].providerId === "apple.com";

    const deleteAccount = async () => {
        await updateData({ deleted: true });

        const currentUser = auth.currentUser;

        await signOut();

        deleteUser(currentUser).then(() => {
            // User deleted.
            console.log("User deleted");
            setSession(null);
            if (Platform.OS !== "ios") {
                router.replace({pathname: "/login"});
            }
        }).catch((error) => {
            // An error ocurred
            console.log(error);
        });
    }

    const signOutUser = async () => {
        await signOut();
        setSession(null);
        if (Platform.OS !== "ios") {
            router.replace({pathname: "/login"});
        }
    }

    const handleEmailPress = async () => {
        const email = "flatstickstats@gmail.com";
        const subject = "Support Request";
        const body = "Hello, I need help with...";
        const url = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        // Check if supported, then open
        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
            await Linking.openURL(url);
        } else {
            Alert.alert("Error", "No mail app found on this device.");
        }
    };

    return (
        <BottomSheetModalProvider>
            <ScreenWrapper style={{borderBottomWidth: 1, borderBottomColor: colors.border.default}}>
                <View style={{
                    overflow: "hidden",
                    flexDirection: "column",
                    alignContent: "center",
                    paddingHorizontal: 20,
                    flex: 1
                }}>
                    <ScrollView keyboardShouldPersistTaps={'handled'}>
                        <View style={{flexDirection: "row"}}>
                            <Pressable onPress={() => navigation.goBack()} style={{marginLeft: -10, marginTop: 3, paddingHorizontal: 10}}>
                                <Svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3.5}
                                     stroke={colors.text.primary} width={24} height={24}>
                                    <Path strokeLinecap="round" strokeLinejoin="round"
                                          d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"/>
                                </Svg>
                            </Pressable>
                            <View style={{flexDirection: "col", alignItems: "flex-start", flex: 0, paddingBottom: 10,}}>
                                <FontText style={{
                                    fontSize: 24,
                                    fontWeight: 600,
                                    color: colors.text.primary
                                }}>Settings</FontText>
                            </View>
                        </View>
                        <FontText style={{color: colors.text.secondary, fontWeight: 600, marginTop: 16, marginBottom: 6}}>USER DATA</FontText>
                        <Pressable onPress={() => {
                            if (GoogleSignin.getCurrentUser() !== null || isApple) {
                                router.push({pathname: "/settings/user"})
                            } else reauthenticateRef.current.present()
                        }} style={{backgroundColor: colors.background.secondary, borderWidth: 1, borderColor: colors.border.default, borderRadius: 12, paddingLeft: 14, paddingRight: 8, paddingVertical: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12}}>
                            <FontText style={{color: colors.text.primary, fontSize: 18, fontWeight: 500}}>Personal Info</FontText>
                            <Svg style={{transform: [{rotate: "45deg"}], marginRight: 12}} width={24} height={24} xmlns="http://www.w3.org/2000/svg" fill="none"
                                 viewBox="0 0 24 24" strokeWidth={3}
                                 stroke={colors.text.primary}>
                                <Path strokeLinecap="round" strokeLinejoin="round"
                                      d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25"/>
                            </Svg>
                        </Pressable>
                        <Pressable onPress={() => router.push({pathname: "/editputters"})} style={{backgroundColor: colors.background.secondary, borderWidth: 1, borderColor: colors.border.default, borderRadius: 12, paddingLeft: 14, paddingRight: 8, paddingVertical: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12}}>
                            <FontText style={{color: colors.text.primary, fontSize: 18, fontWeight: 500}}>Your Putters</FontText>
                            <Svg style={{transform: [{rotate: "45deg"}], marginRight: 12}} width={24} height={24} xmlns="http://www.w3.org/2000/svg" fill="none"
                                 viewBox="0 0 24 24" strokeWidth={3}
                                 stroke={colors.text.primary}>
                                <Path strokeLinecap="round" strokeLinejoin="round"
                                      d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25"/>
                            </Svg>
                        </Pressable>
                        <Pressable onPress={() => router.push({pathname: "/editgrips"})} style={{backgroundColor: colors.background.secondary, borderWidth: 1, borderColor: colors.border.default, borderRadius: 12, paddingLeft: 14, paddingRight: 8, paddingVertical: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12}}>
                            <FontText style={{color: colors.text.primary, fontSize: 18, fontWeight: 500}}>Your Grip Methods</FontText>
                            <Svg style={{transform: [{rotate: "45deg"}], marginRight: 12}} width={24} height={24} xmlns="http://www.w3.org/2000/svg" fill="none"
                                 viewBox="0 0 24 24" strokeWidth={3}
                                 stroke={colors.text.primary}>
                                <Path strokeLinecap="round" strokeLinejoin="round"
                                      d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25"/>
                            </Svg>
                        </Pressable>
                        {/*<Text style={{color: colors.text.secondary, fontWeight: 600, marginTop: 16, marginBottom: 6}}>NOTIFICATIONS</Text>*/}
                        {/*<Pressable style={{backgroundColor: colors.background.secondary, borderRadius: 12, paddingLeft: 14, paddingRight: 8, paddingVertical: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12}}>*/}
                        {/*    <Text style={{color: colors.text.primary, fontSize: 18, fontWeight: 500}}>Practice Reminders</Text>*/}
                        {/*    <Switch*/}
                        {/*        trackColor={{false: colors.switch.track, true: colors.switch.active.track}}*/}
                        {/*        thumbColor={reminders ? colors.switch.active.thumb : colors.switch.thumb}*/}
                        {/*        ios_backgroundColor="#3e3e3e"*/}
                        {/*        onValueChange={() => setReminders(!reminders)}*/}
                        {/*        value={reminders}*/}
                        {/*    />*/}
                        {/*</Pressable>*/}
                        <FontText style={{color: colors.text.secondary, fontWeight: 600, marginTop: 16, marginBottom: 6}}>INTERFACE</FontText>
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
                            <FontText style={{color: colors.text.primary, fontSize: 18, fontWeight: 500}}>Units</FontText>
                            <Pressable
                                onPressIn={() => setUnitsPressed(true)}
                                onPressOut={() => setUnitsPressed(false)}
                                onPress={() => setUnitsRef.current.present()}
                                style={{padding: 7}}>
                                <FontText style={{color: colors.text.link, opacity: unitsPressed ? 0.3 : 1, fontSize: 18, fontWeight: 500}}>{userData.preferences.units === 0 ? "Imperial" : "Metric"}</FontText>
                            </Pressable>
                        </Pressable>
                        <FontText style={{color: colors.text.secondary, fontWeight: 600, marginTop: 16, marginBottom: 6}}>ACCOUNT ACTIONS</FontText>
                        <View style={{flexDirection: "row", gap: 12}}>
                            <PrimaryButton onPress={() => confirmSignOutRef.current.present()} style={{flex: 1, paddingVertical: 10, borderRadius: 12}}>
                                <FontText style={{color: colors.text.primary, fontSize: 16, fontWeight: 500}}>Sign Out</FontText>
                            </PrimaryButton>
                            <DangerButton style={{flex: 1, paddingVertical: 10, borderRadius: 12}} onPress={() => {
                                if (GoogleSignin.getCurrentUser() !== null || isApple) {
                                    confirmDeleteRef.current.present();
                                } else reauthenticateDeletionRef.current.present();
                            }}>
                                <FontText style={{color: colors.button.danger.text, fontSize: 16, fontWeight: 500}}>Delete Account</FontText>
                            </DangerButton>
                        </View>
                        <FontText style={{color: colors.text.secondary, fontWeight: 600, marginTop: 16, marginBottom: 6}}>SUPPORT AND HELP</FontText>
                        <Pressable onPress={handleEmailPress} style={{backgroundColor: colors.background.secondary, borderWidth: 1, borderColor: colors.border.default, borderRadius: 12, paddingLeft: 14, paddingRight: 8, paddingVertical: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12}}>
                            <FontText style={{color: colors.text.primary, fontSize: 18, fontWeight: 500}}>Contact Support</FontText>
                            <Svg style={{transform: [{rotate: "45deg"}], marginRight: 12}} width={24} height={24} xmlns="http://www.w3.org/2000/svg" fill="none"
                                 viewBox="0 0 24 24" strokeWidth={3}
                                 stroke={colors.text.primary}>
                                <Path strokeLinecap="round" strokeLinejoin="round"
                                      d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25"/>
                            </Svg>
                        </Pressable>
                    </ScrollView>
                </View>
                <View style={{position: "absolute", bottom: 72}}>
                    <BannerAd ref={bannerRef} unitId={bannerAdId} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />
                </View>
                <View style={{position: "absolute", bottom: 0, width: "100%", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 20}}>
                    <SecondaryButton onPress={() => router.back()} title={"Back"}
                                     style={{paddingVertical: 10, borderRadius: 10, flex: 0.7}}></SecondaryButton>
                </View>
            </ScreenWrapper>
            <SetTheme setThemeRef={setThemeRef}/>
            <SetUnits setUnitsRef={setUnitsRef}/>
            <ReauthenticateForProfile reauthenticateRef={reauthenticateRef}/>
            <ReauthenticateForDeletion reauthenticateRef={reauthenticateDeletionRef} confirmDeleteRef={confirmDeleteRef}/>
            <ConfirmDelete onDelete={deleteAccount} cancel={() => confirmDeleteRef.current.dismiss()} confirmDeleteRef={confirmDeleteRef}/>
            <ConfirmSignOut confirmSignOutRef={confirmSignOutRef} onSignOut={signOutUser} cancel={() => confirmSignOutRef.current.dismiss()}/>
        </BottomSheetModalProvider>
    );
}