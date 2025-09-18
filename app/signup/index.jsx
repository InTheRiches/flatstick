import {KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View} from "react-native";
import React, {useState} from "react";
import Svg, {ClipPath, Defs, Path, Use} from "react-native-svg";
import {useRouter} from "expo-router";
import Loading from "../../components/general/popups/Loading";
import useColors from "../../hooks/useColors";
import {useSession} from "../../contexts/AuthContext";
import FontText from "../../components/general/FontText";
import ScreenWrapper from "../../components/general/ScreenWrapper";
import {AppleButton} from "@invertase/react-native-apple-authentication";
import {SecondaryButton} from "../../components/general/buttons/SecondaryButton";

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

    const router = useRouter();

    const {googleSignIn, appleSignIn, createEmailAccount, setSession} = useSession();

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
        const re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[a-zA-Z\d\S]{6,}$/;

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

        setLoading(true);

        createEmailAccount(state.email, state.password, firstName, lastName, setLoading, setErrorCode, setInvalidEmail).then(() => {
            console.log("Account created successfully");
        });
    }

    const signInWithApple = () => {
        setLoading(true);
        appleSignIn().then(token => {
            setLoading(false);
            setSession(token || null);
            router.replace({pathname: `/`});
        }).catch(error => {
            setLoading(false);
            console.error("Apple Sign In Error:", error);
        });
    }

    const signInWithGoogle = () => {
        setLoading(true);
        googleSignIn(setLoading).then(token => {
            setLoading(false);
            setSession(token || null);
            router.replace({pathname: `/`});
        });
    }

    return (loading ? <Loading/> :
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, width: "100%" }}>
            <ScreenWrapper style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
                paddingHorizontal: 20,
            }}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{justifyContent: "center", flex: 1, width: "100%"}}>
                    <FontText style={{color: colors.text.primary, fontSize: 30, fontWeight: 600, textAlign: "center"}}>Create Your Account</FontText>
                    <Pressable onPress={() => router.push({pathname: `/login`})} style={{
                        marginBottom: 32,
                    }}>
                        <FontText style={{color: colors.text.secondary, fontSize: 16, marginTop: 12, textAlign: "center"}}>Already have an account? Click <Text
                            style={{color: colors.text.link}}>here</Text> to login.</FontText>
                    </Pressable>
                    <View style={{flexDirection: "row", gap: 12, width: "100%", marginBottom: 12}}>
                        <Pressable style={({pressed}) => [{ flex: 1, elevation: pressed ? 0 : 1, borderRadius: 8, paddingVertical: 8, backgroundColor: "white", alignItems: "center", justifyContent: "center"}]}
                            onPress={signInWithGoogle}>
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
                        { Platform.OS === "ios" &&
                            <AppleButton
                                buttonStyle={AppleButton.Style.WHITE}
                                buttonType={AppleButton.Type.SIGN_IN}
                                style={{
                                    flex: 1,
                                    height: 45, // You must specify a height
                                }}
                                onPress={signInWithApple}
                            />
                        }
                    </View>
                    <View style={{width: "100%", flexDirection: "row", gap: 10}}>
                        <View style={{
                            height: 1.5,
                            flex: 1,
                            backgroundColor: "black",
                            marginTop: 12,
                            opacity: 0.1
                        }}></View>
                        <FontText style={{color: colors.text.secondary, fontSize: 16}} secondary={true}>or</FontText>
                        <View style={{
                            height: 1.5,
                            flex: 1,
                            backgroundColor: "black",
                            marginTop: 12,
                            opacity: 0.1
                        }}></View>
                    </View>
                    <FontText style={{color: colors.text.primary, fontSize: 16, marginTop: 16, marginBottom: 4}}>First Name</FontText>
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
                            placeholderTextColor={firstNameInvalid ? "#b65454" : colors.text.placeholder}
                            placeholder={"Enter your first name..."}
                        />
                        {firstNameInvalid && <View style={{
                            position: "absolute",
                            right: 12,
                            top: 10,
                            backgroundColor: "#EF4444",
                            borderRadius: 30,
                            aspectRatio: 1,
                            width: 24,
                        }}><FontText style={{textAlign: "center", color: "white", fontSize: 16}}>!</FontText></View>}
                    </View>
                    {firstNameInvalid &&
                        <FontText style={{color: colors.input.invalid.text, marginTop: 4}}>{firstName.length === 0 ? "Please enter a first name!" : /^[a-zA-Z\s]*$/.test(firstName) ? "Don't include any spaces!" : "Don't include any special characters!"}</FontText>}
                    <FontText style={{color: colors.text.primary, fontSize: 16, marginTop: 16, marginBottom: 4}}>Last Name</FontText>
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
                            placeholderTextColor={lastNameInvalid ? "#b65454" : colors.text.placeholder}
                            placeholder={"Enter your last name..."}
                        />
                        {lastNameInvalid && <View style={{
                            position: "absolute",
                            right: 12,
                            top: 10,
                            backgroundColor: "#EF4444",
                            borderRadius: 30,
                            aspectRatio: 1,
                            width: 24,
                        }}><FontText style={{textAlign: "center", color: "white", fontSize: 16}}>!</FontText></View>}
                    </View>
                    {lastNameInvalid &&
                        <FontText style={{color: colors.input.invalid.text, marginTop: 4}}>{lastName.length === 0 ? "Please enter a last name!" : "Don't include any spaces!"}</FontText>}
                    <FontText style={{color: colors.text.primary, fontSize: 16, marginTop: 16, marginBottom: 4}}>Email Address</FontText>
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
                            placeholderTextColor={invalidEmail ? "#b65454" : colors.text.placeholder}
                            placeholder={"Enter your email..."}
                        />
                        {invalidEmail && <View style={{
                            position: "absolute",
                            right: 12,
                            top: 10,
                            backgroundColor: "#EF4444",
                            borderRadius: 30,
                            aspectRatio: 1,
                            width: 24,
                        }}><FontText style={{textAlign: "center", color: "white", fontSize: 16}}>!</FontText></View>}
                    </View>
                    {invalidEmail && errorCode !== "auth/email-already-in-use" &&
                        <FontText style={{color: colors.input.invalid.text, marginTop: 4}}>Please enter a valid email.</FontText>}
                    {errorCode === "auth/email-already-in-use" &&
                        <FontText style={{color: colors.input.invalid.text, marginTop: 4}}>That email is already in use!</FontText>}

                    <FontText style={{color: colors.text.primary, fontSize: 16, marginTop: 16, marginBottom: 4}}>Password</FontText>
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
                            placeholderTextColor={invalidPassword ? "#b65454" : colors.text.placeholder}
                            placeholder={"Enter a password..."}
                        />
                        {invalidPassword && <View style={{
                            position: "absolute",
                            right: 12,
                            top: 10,
                            backgroundColor: "#EF4444",
                            borderRadius: 30,
                            aspectRatio: 1,
                            width: 24,
                        }}><FontText style={{textAlign: "center", color: "white", fontSize: 16}}>!</FontText></View>}
                    </View>
                    <FontText style={{
                        color: !requirements.invalid ? '#16a34a' : colors.input.invalid.text,
                        marginBottom: 4
                    }}>Password
                        Requirements:</FontText>
                    <View style={{flexDirection: "row", gap: 10, alignContent: "center", marginBottom: 4}}>
                        {requirements.hasLength ? <ValidRequirement/> : <InvalidRequirement/>}
                        <FontText
                            style={{color: requirements.hasLength ? '#16a34a' : colors.input.invalid.text}}>At
                            least 6 characters</FontText>
                    </View>
                    <View style={{flexDirection: "row", gap: 10, alignContent: "center", marginBottom: 4}}>
                        {requirements.hasNumber ? <ValidRequirement/> : <InvalidRequirement/>}
                        <FontText
                            style={{color: requirements.hasNumber ? '#16a34a' : colors.input.invalid.text}}>At
                            least 1 number</FontText>
                    </View>
                    <View style={{flexDirection: "row", gap: 10, alignContent: "center", marginBottom: 4}}>
                        {requirements.hasUppercase ? <ValidRequirement/> : <InvalidRequirement/>}
                        <FontText
                            style={{color: requirements.hasUppercase ? '#16a34a' : colors.input.invalid.text}}>Contains
                            an uppercase</FontText>
                    </View>
                    <View style={{flexDirection: "row", gap: 10, alignContent: "center", marginBottom: 4}}>
                        {requirements.hasLowercase ? <ValidRequirement/> : <InvalidRequirement/>}
                        <FontText
                            style={{color: requirements.hasLowercase ? '#16a34a' : colors.input.invalid.text}}>Contains
                            a lowercase</FontText>
                    </View>

                    <SecondaryButton
                        onPress={createAccount}
                        disabled={invalidPassword || invalidEmail || lastNameInvalid || firstNameInvalid || lastName.length === 0 || firstName.length === 0 || state.email.length === 0 || state.email.password === 0}
                        style={{
                            paddingVertical: 10,
                            borderRadius: 10,
                            marginTop: 12
                        }}
                        title={"Create your account"}></SecondaryButton>
                </ScrollView>
            </ScreenWrapper>
        </KeyboardAvoidingView>
    )
}

function InvalidRequirement() {
    return (
        <View style={{backgroundColor: "#EF4444", borderRadius: 50, aspectRatio: 1, width: 18}}>
            <FontText style={{
                color: "white",
                textAlign: "center",
                fontSize: 12
            }}>!</FontText>
        </View>
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