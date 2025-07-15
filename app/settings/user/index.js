import {Platform, Pressable, TextInput, View} from "react-native";
import useColors from "../../../hooks/useColors";
import React, {useRef, useState} from "react";
import {useAppContext} from "../../../contexts/AppCtx";
import Svg, {Path} from "react-native-svg";
import {useNavigation} from "expo-router";
import {auth, getAuth} from "../../../utils/firebase";
import {updateEmail, updateProfile} from "firebase/auth";
import Loading from "../../../components/general/popups/Loading";
import {SafeAreaView} from "react-native-safe-area-context";
import {GoogleSignin} from "@react-native-google-signin/google-signin";
import {BannerAd, BannerAdSize, TestIds, useForeground} from "react-native-google-mobile-ads";
import FontText from "../../../components/general/FontText";

const bannerAdId = __DEV__ ? TestIds.BANNER : Platform.OS === "ios" ? "ca-app-pub-2701716227191721/1882654810" : "ca-app-pub-2701716227191721/8611403632";

export default function UserSettings({}) {
    const colors = useColors();
    const navigation = useNavigation();
    const {updateData, userData} = useAppContext();

    const [emailFocused, setEmailFocused] = useState(false);
    const [emailInvalid, setEmailInvalid] = useState(false);
    const [firstNameFocused, setFirstNameFocused] = useState(false);
    const [lastNameFocused, setLastNameFocused] = useState(false);
    const [firstName, setFirstName] = useState(userData.firstName);
    const [lastName, setLastName] = useState(userData.lastName);
    const [firstNameInvalid, setFirstNameInvalid] = useState(false);
    const [lastNameInvalid, setLastNameInvalid] = useState(false);
    const [displayName, setDisplayName] = useState(auth.currentUser.displayName || "");
    const [displayNameInvalid, setDisplayNameInvalid] = useState(false);
    const [displayNameFocused, setDisplayNameFocused] = useState(false);
    const [email, setEmail] = useState(auth.currentUser.email);
    const [loading, setLoading] = useState(false);
    const bannerRef = useRef(null);

    useForeground(() => {
        bannerRef.current?.load();
    })

    let emailErrorCode = "";
    let nameErrorCode = "";

    const isGoogle = GoogleSignin.getCurrentUser() !== null;
    const isApple = auth.currentUser.providerData[0].providerId === "apple.com";

    const updateFirstName = (newName) => {
        setFirstName(newName.trim());
        setFirstNameInvalid(newName.length === 0 || newName.trim().includes(" "));
    }

    const updateLastName = (newName) => {
        setLastName(newName.trim());
        setLastNameInvalid(newName.length === 0 || newName.trim().includes(" "))
    }

    const updateEmailAddress = (newEmail) => {
        setEmail(newEmail);
        const re = /^[\w\-.]+@([\w-]+\.)+[\w-]{2,}$/;
        setEmailInvalid(!re.test(newEmail));
    }

    const updateDisplayName = (newName) => {
        setDisplayName(newName);
        setDisplayNameInvalid(newName.length < 5);
    }

    const save = () => {
        if (firstNameInvalid || lastNameInvalid || emailInvalid || displayNameInvalid) return;
        if (firstName === userData.firstName && lastName === userData.lastName && displayName === auth.currentUser.displayName && email === auth.currentUser.email) {
            navigation.goBack();
            return;
        }

        setLoading(true);

        updateData({firstName, lastName, displayName, displayNameLower: displayName.toLowerCase()}).then(() => {
            if (isGoogle || isApple) {
                navigation.goBack();
                return;
            }
            updateEmail(auth.currentUser, email)
                .then(() => {
                    navigation.goBack();
                }).catch((error) => {
                emailErrorCode = error.code;
                setEmailInvalid(true);
                setLoading(false);
            });
        }).catch((error => {
            console.log("Error updating user data:", error);
            navigation.goBack();
        }));
    }

    return loading ? <Loading></Loading> : (
        <SafeAreaView style={{flex: 1, paddingHorizontal: 20, backgroundColor: colors.background.primary}}>
            <View style={{flexDirection: "row", alignItems: "center", gap: 12}}>
                <Pressable onPress={save} style={{padding: 4, paddingLeft: 0, opacity: emailInvalid || firstNameInvalid || displayNameInvalid || lastNameInvalid ? 0.25 : 1}}>
                    <Svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3.5}
                         stroke={colors.text.primary} width={24} height={24}>
                        <Path strokeLinecap="round" strokeLinejoin="round"
                              d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"/>
                    </Svg>
                </Pressable>
                <FontText style={{fontSize: 24, fontWeight: 500, color: colors.text.primary}}>Personal Info</FontText>
            </View>
            <FontText style={{color: colors.text.secondary, fontWeight: 600, marginTop: 24, marginBottom: 6}}>FIRST NAME</FontText>
            <View style={{flexDirection: "row"}}>
                <TextInput
                    style={{
                        flex: 1,
                        borderWidth: 1,
                        borderColor: firstNameFocused ? firstNameInvalid ? colors.input.invalid.focusedBorder : colors.input.focused.border : firstNameInvalid ? colors.input.invalid.border : colors.input.border,
                        borderRadius: 10,
                        paddingVertical: 8,
                        paddingHorizontal: 10,
                        fontSize: 16,
                        color: firstNameInvalid ? colors.input.invalid.text : colors.input.text,
                        backgroundColor: firstNameInvalid ? colors.input.invalid.background : firstNameFocused ? colors.input.focused.background : colors.input.background
                    }}
                    onFocus={() => setFirstNameFocused(true)}
                    onBlur={() => setFirstNameFocused(false)}
                    value={firstName}
                    onChangeText={(text) => updateFirstName(text)}
                />
                {firstNameInvalid && <FontText style={{
                    position: "absolute",
                    right: 12,
                    top: 7.5,
                    color: "white",
                    backgroundColor: "#EF4444",
                    borderRadius: 50,
                    aspectRatio: 1,
                    width: 22,
                    textAlign: "center",
                    fontSize: 16
                }}>!</FontText>}
            </View>
            {firstNameInvalid &&
                <FontText style={{color: colors.input.invalid.text, marginTop: 4}}>{firstName.length === 0 ? "Please enter a first name!" : "Don't include any spaces!"}</FontText>
            }
            <FontText style={{color: colors.text.secondary, fontWeight: 600, marginTop: 12, marginBottom: 6}}>LAST NAME</FontText>
            <View style={{flexDirection: "row"}}>
                <TextInput
                    style={{
                        flex: 1,
                        borderWidth: 1,
                        borderColor: lastNameFocused ? lastNameInvalid ? colors.input.invalid.focusedBorder : colors.input.focused.border : lastNameInvalid ? colors.input.invalid.border : colors.input.border,
                        borderRadius: 10,
                        paddingVertical: 8,
                        paddingHorizontal: 10,
                        fontSize: 16,
                        color: lastNameInvalid ? colors.input.invalid.text : colors.input.text,
                        backgroundColor: lastNameInvalid ? colors.input.invalid.background : lastNameFocused ? colors.input.focused.background : colors.input.background
                    }}
                    onFocus={() => setLastNameFocused(true)}
                    onBlur={() => setLastNameFocused(false)}
                    value={lastName}
                    onChangeText={(text) => updateLastName(text)}
                />
                {lastNameInvalid && <FontText style={{
                    position: "absolute",
                    right: 12,
                    top: 7.5,
                    color: "white",
                    backgroundColor: "#EF4444",
                    borderRadius: 50,
                    aspectRatio: 1,
                    width: 22,
                    textAlign: "center",
                    fontSize: 16
                }}>!</FontText>}
            </View>
            {lastNameInvalid &&
                <FontText style={{color: colors.input.invalid.text, marginTop: 4}}>{lastName.length === 0 ? "Please enter a last name!" : "Don't include any spaces!"}</FontText>
            }
            <FontText style={{color: colors.text.secondary, fontWeight: 600, marginTop: 12, marginBottom: 6}}>DISPLAY NAME</FontText>
            <View style={{flexDirection: "row"}}>
                <TextInput
                    style={{
                        flex: 1,
                        borderWidth: 1,
                        borderColor: displayNameFocused ? displayNameInvalid ? colors.input.invalid.focusedBorder : colors.input.focused.border : displayNameInvalid ? colors.input.invalid.border : colors.input.border,
                        borderRadius: 10,
                        paddingVertical: 8,
                        paddingHorizontal: 10,
                        fontSize: 16,
                        color: displayNameInvalid ? colors.input.invalid.text : colors.input.text,
                        backgroundColor: displayNameInvalid ? colors.input.invalid.background : displayNameFocused ? colors.input.focused.background : colors.input.background
                    }}
                    onFocus={() => setDisplayNameFocused(true)}
                    onBlur={() => setDisplayNameFocused(false)}
                    value={displayName}
                    onChangeText={(text) => updateDisplayName(text)}
                />
                {displayNameInvalid && <FontText style={{
                    position: "absolute",
                    right: 12,
                    top: 7.5,
                    color: "white",
                    backgroundColor: "#EF4444",
                    borderRadius: 50,
                    aspectRatio: 1,
                    width: 22,
                    textAlign: "center",
                    fontSize: 16
                }}>!</FontText>}
            </View>
            {displayNameInvalid &&
                <FontText style={{color: colors.input.invalid.text, marginTop: 4}}>{displayName.length === 0 ? "Please enter a display name!" : "Please enter a display name longer than 4 characters."}</FontText>
            }
            <FontText style={{color: colors.text.secondary, fontWeight: 600, marginTop: 12, marginBottom: 6}}>EMAIL ADDRESS</FontText>
            <View style={{flexDirection: "row"}}>
                <TextInput
                    style={{
                        flex: 1,
                        borderWidth: 1,
                        borderColor: isGoogle || isApple ? colors.input.disabled.border : emailFocused ? emailInvalid ? colors.input.invalid.focusedBorder : colors.input.focused.border : emailInvalid ? colors.input.invalid.border : colors.input.border,
                        borderRadius: 10,
                        paddingVertical: 8,
                        paddingHorizontal: 10,
                        fontSize: 16,
                        color: isGoogle || isApple ? colors.input.disabled.text : emailInvalid? colors.input.invalid.text : colors.input.text,
                        backgroundColor: isGoogle || isApple ? colors.input.disabled.background : emailInvalid? colors.input.invalid.background : emailFocused ? colors.input.focused.background : colors.input.background
                    }}
                    onFocus={() => setEmailFocused(true)}
                    value={email}
                    onBlur={() => setEmailFocused(false)}
                    onChangeText={(text) => updateEmailAddress(text)}
                    editable={!isGoogle && !isApple}
                    caretHidden={isGoogle && !isApple}
                />
                {
                    (isGoogle || isApple) &&
                        <Svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                             stroke={colors.input.disabled.text} style={{position: "absolute", right: 12, top: 7.5, width: 24, height: 24}}>
                            <Path strokeLinecap="round" strokeLinejoin="round"
                                  d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"/>
                        </Svg>
                }
                {emailInvalid && <FontText style={{
                    position: "absolute",
                    right: 12,
                    top: 7.5,
                    color: "white",
                    backgroundColor: "#EF4444",
                    borderRadius: 50,
                    aspectRatio: 1,
                    width: 22,
                    textAlign: "center",
                    fontSize: 16
                }}>!</FontText>}
            </View>
            { isGoogle && (
                <FontText style={{color: colors.text.secondary, marginTop: 4}}>You are signed in with google.</FontText>
            )}
            { isApple && (
                <FontText style={{color: colors.text.secondary, marginTop: 4}}>You are signed in with apple.</FontText>
            )}
            {emailInvalid && emailErrorCode !== "auth/email-already-in-use" &&
                <FontText style={{color: colors.input.invalid.text, marginTop: 4}}>Please enter a valid email.</FontText>}
            {emailErrorCode === "auth/email-already-in-use" &&
                <FontText style={{color: colors.input.invalid.text, marginTop: 4}}>That email is already in use!</FontText>}
            <View style={{position: "absolute", bottom: 0}}>
                <BannerAd ref={bannerRef} unitId={bannerAdId} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />
            </View>
        </SafeAreaView>
    )
}