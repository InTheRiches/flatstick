import {Pressable, Text, TextInput, View} from "react-native";
import useColors from "../../../hooks/useColors";
import React, {useState} from "react";
import {useAppContext} from "../../../contexts/AppCtx";
import Svg, {Path} from "react-native-svg";
import {useNavigation} from "expo-router";
import {auth} from "../../../utils/firebase";
import {updateEmail, updateProfile} from "firebase/auth";
import Loading from "../../../components/general/popups/Loading";

export default function UserSettings({}) {
    const colors = useColors();
    const navigation = useNavigation();
    const {updateData, userData} = useAppContext();

    const [firstNameFocused, setFirstNameFocused] = useState(false);
    const [lastNameFocused, setLastNameFocused] = useState(false);
    const [emailFocused, setEmailFocused] = useState(false);
    const [firstNameInvalid, setFirstNameInvalid] = useState(false);
    const [lastNameInvalid, setLastNameInvalid] = useState(false);
    const [emailInvalid, setEmailInvalid] = useState(false);
    const [firstName, setFirstName] = useState(userData.firstName);
    const [lastName, setLastName] = useState(userData.lastName);
    const [email, setEmail] = useState(auth.currentUser.email);

    const [loading, setLoading] = useState(false);

    let emailErrorCode = "";
    let nameErrorCode = "";

    const updateFirstName = (newName) => {
        setFirstName(newName);
        setFirstNameInvalid(newName.length === 0)
    }

    const updateLastName = (newName) => {
        setLastName(newName);
        setLastNameInvalid(newName.length === 0)
    }

    const updateEmailAddress = (newEmail) => {
        setEmail(newEmail);
        const re = /^[\w\-.]+@([\w-]+\.)+[\w-]{2,}$/;
        setEmailInvalid(!re.test(newEmail));
    }

    const save = () => {
        if (firstNameInvalid || lastNameInvalid || emailInvalid) return;

        setLoading(true);

        updateData({firstName, lastName});

        // Save changes to the database
        updateProfile(auth.currentUser, {displayName: firstName + " " + lastName})
            .then(() => {
                updateEmail(auth.currentUser, email)
                    .then(() => {
                        navigation.goBack();
                    }).catch((error) => {
                        emailErrorCode = error.code;
                        setEmailInvalid(true);
                        setLoading(false);
                    });
            }).catch((error) => {
                nameErrorCode = error.code;
                setLoading(false);
            });
    }

    return loading ? <Loading></Loading> : (
        <View style={{backgroundColor: colors.background.primary, flex: 1, paddingHorizontal: 24}}>
            <View style={{flexDirection: "row", alignItems: "center", gap: 12}}>
                <Pressable onPress={save} style={{padding: 4, paddingLeft: 0, opacity: emailInvalid || firstNameInvalid || lastNameInvalid ? 0.25 : 1}}>
                    <Svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3}
                         stroke={colors.text.primary} width={24} height={24}>
                        <Path strokeLinecap="round" strokeLinejoin="round"
                              d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"/>
                    </Svg>
                </Pressable>
                <Text style={{fontSize: 24, fontWeight: 500, color: colors.text.primary}}>Personal Info</Text>
            </View>
            <Text style={{color: colors.text.secondary, fontWeight: 600, marginTop: 24, marginBottom: 6}}>FIRST NAME</Text>
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
                {firstNameInvalid && <Text style={{
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
            {firstNameInvalid &&
                <Text style={{color: colors.input.invalid.text, marginTop: 4}}>Please enter a first name!</Text>}
            <Text style={{color: colors.text.secondary, fontWeight: 600, marginTop: 24, marginBottom: 6}}>LAST NAME</Text>
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
                {lastNameInvalid && <Text style={{
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
            {lastNameInvalid &&
                <Text style={{color: colors.input.invalid.text, marginTop: 4}}>Please enter a last name!</Text>}
            <Text style={{color: colors.text.secondary, fontWeight: 600, marginTop: 24, marginBottom: 6}}>EMAIL ADDRESS</Text>
            <View style={{flexDirection: "row"}}>
                <TextInput
                    style={{
                        flex: 1,
                        borderWidth: 1,
                        borderColor: emailFocused ? emailInvalid ? colors.input.invalid.focusedBorder : colors.input.focused.border : emailInvalid ? colors.input.invalid.border : colors.input.border,
                        borderRadius: 10,
                        paddingVertical: 8,
                        paddingHorizontal: 10,
                        fontSize: 16,
                        color: emailInvalid? colors.input.invalid.text : colors.input.text,
                        backgroundColor: emailInvalid? colors.input.invalid.background : emailFocused ? colors.input.focused.background : colors.input.background
                    }}
                    onFocus={() => setEmailFocused(true)}
                    value={email}
                    onBlur={() => setEmailFocused(false)}
                    onChangeText={(text) => updateEmailAddress(text)}
                />
                {emailInvalid && <Text style={{
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
            {emailInvalid && emailErrorCode !== "auth/email-already-in-use" &&
                <Text style={{color: colors.input.invalid.text, marginTop: 4}}>Please enter a valid email.</Text>}
            {emailErrorCode === "auth/email-already-in-use" &&
                <Text style={{color: colors.input.invalid.text, marginTop: 4}}>That email is already in use!</Text>}
        </View>
    )
}