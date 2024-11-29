import {ThemedText} from '@/components/ThemedText';
import {Pressable, View, Text, ScrollView, TextInput} from 'react-native';

import React, {useEffect, useRef, useState} from 'react';
import {getAuth} from "firebase/auth";
import {getFirestore, query, limit, orderBy, collection, getDocs} from "firebase/firestore";
import useColors from "@/hooks/useColors";
import {useAppContext, useSession} from "@/contexts/AppCtx";
import DrawerSaveChanges from "../../components/popups/DrawerSaveChanges";
import useKeyboardVisible from "../../hooks/useKeyboardVisible";

export default function HomeScreen() {
    const colors = useColors();
    const isKeyboardVisible = useKeyboardVisible();
    const {signOut, isLoading} = useSession();
    const {userData} = useAppContext();
    const drawerSaveChanges = useRef(null);
    const [changes, setChanges] = useState(false);

    const auth = getAuth();
    const db = getFirestore();

    const initialState = {
        displayName: auth.currentUser.displayName,
        invalidDisplayName: false,
    }
    const [state, setState] = useState(initialState);

    useEffect(() => {
        setChanges(state.displayName !== initialState.displayName)
    }, [state]);

    const updateField = (field, value) => {
        setState(prevState => ({
            ...prevState,
            [field]: value,
        }));
    };

    return (
        <View style={{
            height: "100%",
            flex: 1,
            overflow: "hidden",
            flexDirection: "column",
            alignContent: "center",
            borderBottomWidth: 1,
            borderBottomColor: colors.border.default,
            paddingHorizontal: 20,
            backgroundColor: colors.background.primary
        }}>
            <ScrollView>
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
            <DrawerSaveChanges saveChangesRef={drawerSaveChanges}
                               show={!isKeyboardVisible && changes}
                               disabled={state.invalidDisplayName}></DrawerSaveChanges>
        </View>
    );
}

function Profile({state, updateField}) {
    const [nameFocused, setNameFocused] = useState(false);
    const colors = useColors();

    const setName = (name) => {
        updateField("displayName", name);
        updateField("invalidDisplayName", name.length < 6)
    }

    return (
        <View>
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
        </View>
    )
}