import {ThemedText} from '@/components/ThemedText';
import {Pressable, ScrollView, Text, TextInput, View} from 'react-native';

import React, {useEffect, useRef, useState} from 'react';
import {getAuth, updateEmail, updateProfile} from "firebase/auth";
import {getFirestore} from "firebase/firestore";
import useColors from "@/hooks/useColors";
import {useAppContext, useSession} from "@/contexts/AppCtx";
import SaveChangesModal from "../../components/popups/SaveChangesModal";
import useKeyboardVisible from "../../hooks/useKeyboardVisible";
import {PrimaryButton} from "../../components/buttons/PrimaryButton";
import Svg, {Path} from "react-native-svg";

export default function HomeScreen() {
    const colors = useColors();
    const isKeyboardVisible = useKeyboardVisible();
    const {signOut, isLoading} = useSession();
    const {userData} = useAppContext();
    const drawerSaveChanges = useRef(null);

    const auth = getAuth();
    const db = getFirestore();

    const initialState = {
        displayName: auth.currentUser.displayName,
        email: auth.currentUser.email,
        reminders: false,
        goals: false,
        progress: false,
        invalidEmail: false,
        invalidDisplayName: false,
    }
    const [state, setState] = useState(initialState);

    useEffect(() => {
        if (!isKeyboardVisible && (state.displayName !== initialState.displayName || state.email !== auth.currentUser.email))
            drawerSaveChanges.current.expand();
        else
            drawerSaveChanges.current.close();
    }, [state]);

    const updateField = (field, value) => {
        setState(prevState => ({
            ...prevState,
            [field]: value,
        }));
    };

    const saveChanges = () => {
        if (state.invalidEmail || state.invalidDisplayName) return;

        // Save changes to the database
        updateProfile(auth.currentUser, {
            displayName: state.displayName
        }).then(() => {
            drawerSaveChanges.current.close();
            initialState.displayName = state.displayName;
        }).catch((error) => {
            // An error occurred
            // ...
            console.log("Error updating profile: ", error);
        });

        console.log(state.email);
        // TODO this doesnt work, unless the user has recently authenticated, which means we need
        // to prompt the user for their password before updating their email (by modal)
        updateEmail(auth.currentUser, state.email).then(() => {
            // Email updated!
            // ...
            console.log("Email updated!");
        }).catch((error) => {
            // An error occurred
            // ...
            console.log("Error updating email: ", error);
        });
    }

    return (
        <View style={{
            overflow: "hidden",
            flexDirection: "column",
            alignContent: "center",
            borderBottomWidth: 1,
            borderBottomColor: colors.border.default,
            paddingHorizontal: 20,
            backgroundColor: colors.background.primary,
        }}>
            <ScrollView keyboardShouldPersistTaps={'handled'}>
                <View style={{
                    flexDirection: "col",
                    alignItems: "flex-start",
                    flex: 0,
                    paddingTop: 2,
                    paddingBottom: 10,
                }}>
                    <Text style={{color: colors.text.secondary, fontSize: 16}}>Edit Your</Text>
                    <Text style={{
                        fontSize: 24,
                        fontWeight: 500,
                        color: colors.text.primary
                    }}>Settings</Text>
                </View>
                <Profile state={state} updateField={updateField}></Profile>
            </ScrollView>
            <SaveChangesModal saveChangesRef={drawerSaveChanges}
                              save={saveChanges}
                              disabled={state.invalidDisplayName || state.invalidEmail}></SaveChangesModal>
        </View>
    );
}

function Profile({state, updateField}) {
    const [nameFocused, setNameFocused] = useState(false);
    const [emailFocused, setEmailFocused] = useState(false);
    const colors = useColors();

    let errorCode = "";

    const setName = (name) => {
        updateField("displayName", name);
        updateField("invalidDisplayName", name.length < 6)
    }

    const setEmail = (email) => {
        updateField("email", email);
        const re = /^[\w\-.]+@([\w-]+\.)+[\w-]{2,}$/;
        updateField("invalidEmail", !re.test(email));
    }

    return (
        <View style={{paddingBottom: 32}}>
            <Text style={{fontSize: 20, fontWeight: 500, color: colors.text.primary}}>Profile</Text>
            <Text style={{fontSize: 16, fontWeight: 400, color: colors.text.secondary}}>General information about you,
                this information is displayed publicly, so beware.</Text>
            <ThemedText style={{fontSize: 16, marginTop: 12, marginBottom: 4}}>Display Name</ThemedText>
            <View style={{flexDirection: "row"}}>
                <TextInput
                    style={{
                        flex: 1,
                        borderWidth: 1,
                        borderColor: nameFocused ? state.invalidDisplayName ? colors.input.invalid.focusedBorder : colors.input.focused.border : state.invalidDisplayName ? colors.input.invalid.border : colors.input.border,
                        borderRadius: 10,
                        paddingVertical: 8,
                        paddingHorizontal: 10,
                        fontSize: 16,
                        color: state.invalidDisplayName ? colors.input.invalid.text : colors.input.text,
                        backgroundColor: state.invalidDisplayName ? colors.input.invalid.background : nameFocused ? colors.input.focused.background : colors.input.background
                    }}
                    onFocus={() => setNameFocused(true)}
                    onBlur={() => setNameFocused(false)}
                    value={state.displayName}
                    onChangeText={(text) => setName(text)}
                />
                {state.invalidDisplayName && <Text style={{
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
                }}>!</Text>}
            </View>
            {state.invalidDisplayName &&
                <Text style={{color: colors.input.invalid.text, marginTop: 4}}>Your display name must be at least 6
                    characters!</Text>}

            <ThemedText style={{fontSize: 16, marginTop: 12}}>Photo</ThemedText>
            <View style={{flexDirection: "row", gap: 12}}>
                <Svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white"
                     width={96} height={96}>
                    <Path strokeLinecap="round" strokeLinejoin="round"
                          d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
                </Svg>
                <PrimaryButton title={"Change"} style={{
                    borderRadius: 8,
                    paddingHorizontal: 10,
                    paddingVertical: 8,
                    alignSelf: "center"
                }}/>
            </View>
            <Text style={{fontSize: 20, fontWeight: 500, color: colors.text.primary, marginTop: 24}}>Personal
                Info</Text>
            <Text style={{fontSize: 16, fontWeight: 400, color: colors.text.secondary}}>Information about you, never
                shared.</Text>
            <ThemedText style={{fontSize: 16, marginTop: 16, marginBottom: 4}}>Email Address</ThemedText>
            <View style={{flexDirection: "row"}}>
                <TextInput
                    style={{
                        flex: 1,
                        borderWidth: 1,
                        borderColor: emailFocused ? state.invalidEmail ? colors.input.invalid.focusedBorder : colors.input.focused.border : state.invalidEmail ? colors.input.invalid.border : colors.input.border,
                        borderRadius: 10,
                        paddingVertical: 8,
                        paddingHorizontal: 10,
                        fontSize: 16,
                        color: state.invalidEmail ? colors.input.invalid.text : colors.input.text,
                        backgroundColor: state.invalidEmail ? colors.input.invalid.background : emailFocused ? colors.input.focused.background : colors.input.background
                    }}
                    onFocus={() => setEmailFocused(true)}
                    value={state.email}
                    onBlur={() => setEmailFocused(false)}
                    onChangeText={(text) => setEmail(text)}
                />
                {state.invalidEmail && <Text style={{
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
                }}>!</Text>}
            </View>
            {state.invalidEmail && errorCode !== "auth/email-already-in-use" &&
                <Text style={{color: colors.input.invalid.text, marginTop: 4}}>Please enter a valid email.</Text>}
            {/*{errorCode === "auth/email-already-in-use" &&*/}
            {/*    <Text style={{color: colors.input.invalid.text, marginTop: 4}}>That email is already in use!</Text>}*/}
            <Text style={{fontSize: 20, marginTop: 16, color: colors.text.primary}}>Push
                Notifications</Text>
            <Text style={{fontSize: 16, fontWeight: 400, color: colors.text.secondary, marginBottom: 12}}>These are
                delivered through the
                app to your mobile devices.</Text>
            <Pressable onPress={() => updateField("reminders", !state.reminders)} style={{
                borderWidth: 1,
                borderColor: state.reminders ? colors.toggleable.toggled.border : colors.toggleable.border,
                borderRadius: 12,
                paddingHorizontal: 24,
                paddingVertical: 8,
                backgroundColor: state.reminders ? colors.toggleable.toggled.background : colors.toggleable.background,
                flexDirection: "row",
                alignSelf: "flex-start",
                marginBottom: 12
            }}>
                {state.reminders && <View style={{
                    position: "absolute",
                    right: -7,
                    top: -7,
                    backgroundColor: "#40C2FF",
                    padding: 3,
                    borderRadius: 50
                }}>
                    <Svg width={18} height={18} stroke={colors.checkmark.color}
                         xmlns="http://www.w3.org/2000/svg"
                         fill="none"
                         viewBox="0 0 24 24" strokeWidth="3">
                        <Path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5"/>
                    </Svg>
                </View>}
                <View style={{alignSelf: "flex-start", paddingRight: 1}}>
                    <Text style={{textAlign: "left", color: colors.text.primary, fontSize: 16}}>Reminders</Text>
                </View>
            </Pressable>
            <Pressable onPress={() => updateField("goals", !state.goals)} style={{
                borderWidth: 1,
                borderColor: state.goals ? colors.toggleable.toggled.border : colors.toggleable.border,
                borderRadius: 12,
                paddingHorizontal: 24,
                paddingVertical: 8,
                backgroundColor: state.goals ? colors.toggleable.toggled.background : colors.toggleable.background,
                flexDirection: "row",
                alignSelf: "flex-start",
                marginBottom: 12
            }}>
                {state.goals && <View style={{
                    position: "absolute",
                    right: -7,
                    top: -7,
                    backgroundColor: "#40C2FF",
                    padding: 3,
                    borderRadius: 50
                }}>
                    <Svg width={18} height={18} stroke={colors.checkmark.color}
                         xmlns="http://www.w3.org/2000/svg"
                         fill="none"
                         viewBox="0 0 24 24" strokeWidth="3">
                        <Path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5"/>
                    </Svg>
                </View>}
                <View style={{alignSelf: "flex-start", paddingRight: 1}}>
                    <Text style={{textAlign: "left", color: colors.text.primary, fontSize: 16}}>Goals</Text>
                </View>
            </Pressable>
            <Pressable onPress={() => updateField("progress", !state.progress)} style={{
                borderWidth: 1,
                borderColor: state.progress ? colors.toggleable.toggled.border : colors.toggleable.border,
                borderRadius: 12,
                paddingHorizontal: 24,
                paddingVertical: 8,
                backgroundColor: state.progress ? colors.toggleable.toggled.background : colors.toggleable.background,
                flexDirection: "row",
                alignSelf: "flex-start"
            }}>
                {state.progress && <View style={{
                    position: "absolute",
                    right: -7,
                    top: -7,
                    backgroundColor: "#40C2FF",
                    padding: 3,
                    borderRadius: 50
                }}>
                    <Svg width={18} height={18} stroke={colors.checkmark.color}
                         xmlns="http://www.w3.org/2000/svg"
                         fill="none"
                         viewBox="0 0 24 24" strokeWidth="3">
                        <Path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5"/>
                    </Svg>
                </View>}
                <View style={{alignSelf: "flex-start", paddingRight: 1}}>
                    <Text style={{textAlign: "left", color: colors.text.primary, fontSize: 16}}>Progress</Text>
                </View>
            </Pressable>
        </View>
    )
}