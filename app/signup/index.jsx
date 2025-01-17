import {Keyboard, PixelRatio, Pressable, ScrollView, Text, TextInput, View} from "react-native";
import React, {useEffect, useState} from "react";
import Svg, {ClipPath, Defs, Path, Use} from "react-native-svg";
import {createUserWithEmailAndPassword, updateProfile} from "firebase/auth";
import {getAuth} from "../../utils/firebase"
import {doc, getFirestore, setDoc} from "firebase/firestore";
import {useRouter} from "expo-router";
import Loading from "../../components/general/popups/Loading";
import useColors from "../../hooks/useColors";
import {PrimaryButton} from "../../components/general/buttons/PrimaryButton";
import {SafeAreaView} from "react-native-safe-area-context";
import {GoogleSignin, isErrorWithCode, isSuccessResponse, statusCodes} from "@react-native-google-signin/google-signin";
import {useAppContext, useSession} from "../../contexts/AppCtx";

const initialState = {
    skill: -1,
    frequency: -1,
    putts: -1,
    tab: 0,
    username: "",
    displayName: "",
    password: "",
    email: "",
    invalid: false,
}

export default function CreateAccount() {
    const colors = useColors();

    const db = getFirestore();
    const router = useRouter();

    const {googleSignIn} = useSession();
    const {updateStats} = useAppContext();

    const [state, setState] = useState(initialState);
    const [loading, setLoading] = useState(false);
    const [errorCode, setErrorCode] = useState("");
    const [emailFocused, setEmailFocused] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const [invalidPassword, setInvalidPassword] = useState(false);
    const [invalidEmail, setInvalidEmail] = useState(false);

    const [firstNameFocused, setFirstNameFocused] = useState(false);
    const [lastNameFocused, setLastNameFocused] = useState(false);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [firstNameInvalid, setFirstNameInvalid] = useState(false);
    const [lastNameInvalid, setLastNameInvalid] = useState(false);

    const [requirements, setRequirements] = useState({
        hasLength: false,
        hasUppercase: false,
        hasLowercase: false,
        hasNumber: false,
        invalid: true,
    });

    const updateFirstName = (newName) => {
        const isValid = /^[a-zA-Z\s]*$/.test(newName) &&
            newName.length > 0 &&
            !(newName.length > 1 && newName.endsWith(" ") && newName.slice(0, -1).includes(" "));
        setFirstName(newName);
        setFirstNameInvalid(!isValid);
    }

    const updateLastName = (newName) => {
        const isValid = /^[a-zA-Z\s]*$/.test(newName) &&
            newName.length > 0 &&
            !(newName.length > 1 && newName.endsWith(" ") && newName.slice(0, -1).includes(" "));
        setLastName(newName);
        setLastNameInvalid(!isValid);
    }

    const validateEmail = (newEmail) => {
        const re = /^[\w\-\.]+@([\w-]+\.)+[\w-]{2,}$/;
        setInvalidEmail(!re.test(newEmail));
    }

    const validatePassword = (newPassword) => {
        const re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[a-zA-Z0-9]{6,}$/;

        setInvalidPassword(!re.test(newPassword))

        setRequirements({
            hasLength: newPassword.length >= 6,
            hasUppercase: /[A-Z]/.test(newPassword),
            hasLowercase: /[a-z]/.test(newPassword),
            hasNumber: /[0-9]/.test(newPassword),
            invalid: !re.test(newPassword),
        });
    }

    const updateEmail = (email) => {
        setState(prevState => ({
            ...prevState,
            email: email,
        }));

        if (errorCode === "auth/email-already-in-use") setErrorCode("");

        validateEmail(email);
    }

    const updatePassword = (password) => {
        setState(prevState => ({
            ...prevState,
            password: password,
        }));

        validatePassword(password);
    }

    const createAccount = () => {
        if (state.invalid) return;
        if (invalidPassword || invalidEmail || firstNameInvalid || lastNameInvalid || firstName.length === 0 || lastName.length === 0) return;

        const auth = getAuth();

        setLoading(true);

        createUserWithEmailAndPassword(auth, state.email, state.password)
            .then((userCredential) => {
                setLoading(false);
                // Signed up
                const user = userCredential.user;

                updateProfile(user, {
                    displayName: firstName.trim() + " " + lastName.trim()
                }).catch((error) => {
                });

                setDoc(doc(db, `users/${user.uid}`), {
                    skill: state.skill,
                    frequency: state.frequency,
                    putts: state.putts,
                    date: new Date().toISOString(),
                    totalPutts: 0,
                    sessions: 0,
                    stats: {},
                    firstName: firstName.trim(),
                    lastName: firstName.trim(),
                    strokesGained: 0,
                    preferences: {
                        countMishits: false,
                        selectedPutter: 0,
                        theme: 0,
                        units: 0,
                        reminders: false,
                        selectedGrip: 0,
                    }
                }).then(() => {
                    updateStats()
                }).catch((error) => {
                    console.log(error);
                });

                router.push({pathname: `/`});
            })
            .catch((error) => {
                setErrorCode(error.code);

                if (errorCode === "auth/email-already-in-use")
                    setInvalidEmail(true);

                setLoading(false);
            });
    }

    const googleSignUp = async () => {
        setLoading(true);
        try {
            await GoogleSignin.hasPlayServices();
            const response = await GoogleSignin.signIn();
            if (isSuccessResponse(response)) {
                googleSignIn(response.data)
            } else {
                console.log("Sign in failed");
                setLoading(false);
            }
        } catch (error) {
            console.log("Error", error)
            setLoading(false);
            if (isErrorWithCode(error)) {
                switch (error.code) {
                    case statusCodes.IN_PROGRESS:
                        // operation (eg. sign in) already in progress
                        break;
                    case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
                        // Android only, play services not available or outdated
                        break;
                    default:
                    // some other error happened
                }
            } else{}
        }
    }

    const inputsLayout = (event) => {
        setInputsHeight(event.nativeEvent.layout.height / PixelRatio.get());
    }

    // get height of the android keyboard
    const [inputsHeight, setInputsHeight] = useState(0);
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    useEffect(() => {
        const updateKeyboardVisibility = (visible) => {
            setKeyboardVisible(visible);
        }
        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => updateKeyboardVisibility(true));
        const keyboardHidListener = Keyboard.addListener('keyboardDidHide', () => updateKeyboardVisibility(false));
        return () => {
            keyboardDidShowListener.remove();
            keyboardHidListener.remove();
        }
    }, []);

    return (loading ? <Loading/> :
            <SafeAreaView style={{
                flex: 1,
                paddingHorizontal: 24,
                justifyContent: "center",
                flexDirection: "column",
                backgroundColor: colors.background.primary
            }}>
                <ScrollView contentContainerStyle={{flex: 1, justifyContent: "center", paddingBottom: keyboardVisible ? inputsHeight : 0}}>
                    <Text style={{color: colors.text.primary, fontSize: 30, fontWeight: 600, textAlign: "center"}}>Create Your Account</Text>
                    <Text style={{color: colors.text.secondary, fontSize: 16, marginBottom: 32, textAlign: "center"}}>Welcome! Please fill in the details to get started.</Text>
                    <View style={{flexDirection: "row", gap: 12, width: "100%", marginBottom: 12}}>
                        <Pressable style={({pressed}) => [{ flex: 1, elevation: pressed ? 0 : 1, borderRadius: 8, paddingVertical: 8, backgroundColor: "white", alignItems: "center", justifyContent: "center"}]}
                            onPress={googleSignUp}>
                            <Svg xmlns="http://www.w3.org/2000/svg"
                                 viewBox="0 0 48 48" style={{width: 28, height: 28}}>
                                <Defs>
                                    <Path id="a"
                                          d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z"/>
                                </Defs>
                                <ClipPath id="b">
                                    <Use xlinkHref="#a" overflow="visible"/>
                                </ClipPath>
                                <Path clipPath="url(#b)" fill="#FBBC05" d="M0 37V11l17 13z"/>
                                <Path clipPath="url(#b)" fill="#EA4335" d="M0 11l17 13 7-6.1L48 14V0H0z"/>
                                <Path clipPath="url(#b)" fill="#34A853" d="M0 37l30-23 7.9 1L48 0v48H0z"/>
                                <Path clipPath="url(#b)" fill="#4285F4" d="M48 48L17 24l-4-3 35-10z"/>
                            </Svg>
                        </Pressable>
                        <Pressable style={({pressed}) => [{ flex: 1, elevation: pressed ? 0 : 1, borderRadius: 8, paddingVertical: 8, backgroundColor: "white", alignItems: "center", justifyContent: "center"}]}>
                            <Svg xmlns="http://www.w3.org/2000/svg"
                                 viewBox="0 0 48 48" style={{width: 28, height: 28}}>
                                <Defs>
                                    <Path id="a"
                                          d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z"/>
                                </Defs>
                                <ClipPath id="b">
                                    <Use xlinkHref="#a" overflow="visible"/>
                                </ClipPath>
                                <Path clipPath="url(#b)" fill="#FBBC05" d="M0 37V11l17 13z"/>
                                <Path clipPath="url(#b)" fill="#EA4335" d="M0 11l17 13 7-6.1L48 14V0H0z"/>
                                <Path clipPath="url(#b)" fill="#34A853" d="M0 37l30-23 7.9 1L48 0v48H0z"/>
                                <Path clipPath="url(#b)" fill="#4285F4" d="M48 48L17 24l-4-3 35-10z"/>
                            </Svg>
                        </Pressable>
                    </View>
                    <View style={{width: "100%", flexDirection: "row", gap: 10}}>
                        <View style={{
                            height: 1.5,
                            flex: 1,
                            backgroundColor: "black",
                            marginTop: 12,
                            opacity: 0.1
                        }}></View>
                        <Text style={{color: colors.text.secondary, fontSize: 16}} secondary={true}>or</Text>
                        <View style={{
                            height: 1.5,
                            flex: 1,
                            backgroundColor: "black",
                            marginTop: 12,
                            opacity: 0.1
                        }}></View>
                    </View>
                    <View onLayout={inputsLayout}>
                        <Text style={{color: colors.text.primary, fontSize: 16, marginTop: 16, marginBottom: 4}}>First Name</Text>
                        <View style={{flexDirection: "row"}}>
                            <TextInput
                                style={{
                                    flex: 1,
                                    borderWidth: 1,
                                    borderColor: firstNameFocused ? firstNameInvalid ? colors.input.invalid.focusedBorder : colors.input.focused.border : firstNameInvalid ? colors.input.invalid.border : colors.input.border,
                                    borderRadius: 10,
                                    paddingVertical: 10,
                                    paddingHorizontal: 14,
                                    fontSize: 16,
                                    color: firstNameInvalid ? colors.input.invalid.text : colors.input.text,
                                    backgroundColor: firstNameInvalid ? colors.input.invalid.background : firstNameFocused ? colors.input.focused.background : colors.input.background
                                }}
                                onFocus={() => setFirstNameFocused(true)}
                                onBlur={() => setFirstNameFocused(false)}
                                value={firstName}
                                onChangeText={(text) => updateFirstName(text)}
                                placeholderTextColor={colors.text.placeholder}
                                placeholder={"Enter your first name..."}
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
                            <Text style={{color: colors.input.invalid.text, marginTop: 4}}>{firstName.length === 0 ? "Please enter a first name!" : /^[a-zA-Z\s]*$/.test(firstName) ? "Don't include any spaces!" : "Don't include any special characters!"}</Text>}
                        <Text style={{color: colors.text.primary, fontSize: 16, marginTop: 16, marginBottom: 4}}>Last Name</Text>
                        <View style={{flexDirection: "row"}}>
                            <TextInput
                                style={{
                                    flex: 1,
                                    borderWidth: 1,
                                    borderColor: lastNameFocused ? lastNameInvalid ? colors.input.invalid.focusedBorder : colors.input.focused.border : lastNameInvalid ? colors.input.invalid.border : colors.input.border,
                                    borderRadius: 10,
                                    paddingVertical: 10,
                                    paddingHorizontal: 14,
                                    fontSize: 16,
                                    color: lastNameInvalid ? colors.input.invalid.text : colors.input.text,
                                    backgroundColor: lastNameInvalid ? colors.input.invalid.background : lastNameFocused ? colors.input.focused.background : colors.input.background
                                }}
                                onFocus={() => setLastNameFocused(true)}
                                onBlur={() => setLastNameFocused(false)}
                                value={lastName}
                                onChangeText={(text) => updateLastName(text)}
                                placeholderTextColor={colors.text.placeholder}
                                placeholder={"Enter your last name..."}
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
                            <Text style={{color: colors.input.invalid.text, marginTop: 4}}>{lastName.length === 0 ? "Please enter a last name!" : "Don't include any spaces!"}</Text>}
                        <Text style={{color: colors.text.primary, fontSize: 16, marginTop: 16, marginBottom: 4}}>Email Address</Text>
                        <View style={{flexDirection: "row"}}>
                            <TextInput
                                style={{
                                    flex: 1,
                                    borderWidth: 1,
                                    borderColor: emailFocused ? invalidEmail ? colors.input.invalid.focusedBorder : colors.input.focused.border : invalidEmail ? colors.input.invalid.border : colors.input.border,
                                    borderRadius: 10,
                                    paddingVertical: 10,
                                    paddingHorizontal: 14,
                                    fontSize: 16,
                                    color: invalidEmail ? colors.input.invalid.text : colors.input.text,
                                    backgroundColor: invalidEmail ? colors.input.invalid.background : emailFocused ? colors.input.focused.background : colors.input.background
                                }}
                                onFocus={() => setEmailFocused(true)}
                                value={state.email}
                                onBlur={() => setEmailFocused(false)}
                                onChangeText={(text) => updateEmail(text)}
                                placeholderTextColor={colors.text.placeholder}
                                placeholder={"Enter your email..."}
                            />
                            {invalidEmail && <Text style={{
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
                        {invalidEmail && errorCode !== "auth/email-already-in-use" &&
                            <Text style={{color: colors.input.invalid.text, marginTop: 4}}>Please enter a valid email.</Text>}
                        {errorCode === "auth/email-already-in-use" &&
                            <Text style={{color: colors.input.invalid.text, marginTop: 4}}>That email is already in use!</Text>}

                        <Text style={{color: colors.text.primary, fontSize: 16, marginTop: 16, marginBottom: 4}}>Password</Text>
                        <View style={{flexDirection: "row", marginBottom: 12}}>
                            <TextInput
                                style={{
                                    flex: 1,
                                    borderWidth: 1,
                                    borderColor: passwordFocused ? invalidPassword ? colors.input.invalid.focusedBorder : colors.input.focused.border : invalidPassword ? colors.input.invalid.border : colors.input.border,
                                    borderRadius: 10,
                                    paddingVertical: 10,
                                    paddingHorizontal: 14,
                                    fontSize: 16,
                                    color: invalidPassword ? colors.input.invalid.text : colors.input.text,
                                    backgroundColor: invalidPassword ? colors.input.invalid.background : passwordFocused ? colors.input.focused.background : colors.input.background
                                }}
                                onFocus={() => setPasswordFocused(true)}
                                onBlur={() => setPasswordFocused(false)}
                                secureTextEntry={true}
                                value={state.password}
                                onChangeText={(text) => updatePassword(text)}
                                placeholderTextColor={colors.text.placeholder}
                                placeholder={"Enter a password..."}
                            />
                            {invalidPassword && <Text style={{
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
                        <Text style={{
                            color: !requirements.invalid ? '#16a34a' : colors.input.invalid.text,
                            marginBottom: 4
                        }}>Password
                            Requirements:</Text>
                        <View style={{flexDirection: "row", gap: 10, alignContent: "center", marginBottom: 4}}>
                            {requirements.hasLength ? <ValidRequirement/> : <InvalidRequirement/>}
                            <Text
                                style={{color: requirements.hasLength ? '#16a34a' : colors.input.invalid.text}}>At
                                least 6 characters</Text>
                        </View>
                        <View style={{flexDirection: "row", gap: 10, alignContent: "center", marginBottom: 4}}>
                            {requirements.hasNumber ? <ValidRequirement/> : <InvalidRequirement/>}
                            <Text
                                style={{color: requirements.hasNumber ? '#16a34a' : colors.input.invalid.text}}>At
                                least 1 number</Text>
                        </View>
                        <View style={{flexDirection: "row", gap: 10, alignContent: "center", marginBottom: 4}}>
                            {requirements.hasUppercase ? <ValidRequirement/> : <InvalidRequirement/>}
                            <Text
                                style={{color: requirements.hasUppercase ? '#16a34a' : colors.input.invalid.text}}>Contains
                                an uppercase</Text>
                        </View>
                        <View style={{flexDirection: "row", gap: 10, alignContent: "center", marginBottom: 4}}>
                            {requirements.hasLowercase ? <ValidRequirement/> : <InvalidRequirement/>}
                            <Text
                                style={{color: requirements.hasLowercase ? '#16a34a' : colors.input.invalid.text}}>Contains
                                a lowercase</Text>
                        </View>
                    </View>

                    <PrimaryButton
                        onPress={createAccount}
                        disabled={invalidPassword || invalidEmail || lastNameInvalid || firstNameInvalid || lastName.length === 0 || firstName.length === 0 || state.email.length === 0 || state.email.password === 0}
                        style={{
                            paddingVertical: 10,
                            borderRadius: 10,
                            marginTop: 12
                        }}
                        title={"Create your account"}></PrimaryButton>
                    <Pressable onPress={() => router.push({pathname: `/login`})} style={({pressed}) => [{
                        marginTop: 32,
                        elevation: pressed ? 0 : 1,
                        borderRadius: 12,
                        backgroundColor: colors.background.secondary,
                        paddingVertical: 10
                    }]}>
                        <Text style={{color: colors.text.primary, textAlign: "center"}}>Already have an account? Click <Text
                            style={{color: colors.text.link}}>here</Text> to login.</Text>
                    </Pressable>
                </ScrollView>
        </SafeAreaView>
    )
}

function InvalidRequirement() {
    return (
        <Text style={{
            color: "white",
            backgroundColor: "#EF4444",
            borderRadius: 50,
            aspectRatio: 1,
            width: 18,
            textAlign: "center",
            fontSize: 12
        }}>!</Text>
    )
}

function ValidRequirement() {
    return (
        <Svg width={16} height={16} stroke="#16a34a" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
             strokeWidth="3">
            <Path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5"/>
        </Svg>
    )
}