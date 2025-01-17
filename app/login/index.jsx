import {PixelRatio, Pressable, ScrollView, Text, TextInput, View} from "react-native";
import React, {useCallback, useRef, useState} from "react";
import {useRouter} from "expo-router";
import Loading from "../../components/general/popups/Loading";
import useColors from "../../hooks/useColors";
import {useSession} from "../../contexts/AppCtx";
import {PrimaryButton} from "../../components/general/buttons/PrimaryButton";
import Svg, {ClipPath, Defs, Path, Use} from "react-native-svg";
import ResetPassword from "../../components/signin/ResetPassword";
import {
    GoogleSignin,
    isErrorWithCode,
    isSuccessResponse,
    statusCodes,
} from '@react-native-google-signin/google-signin';
import ScreenWrapper from "../../components/general/ScreenWrapper";

const initialState = {
    password: "",
    email: "",
    invalid: false,
    emailFocused: false,
    passwordFocused: false,
    invalidEmail: false
}

export default function Login() {
    const colors = useColors();
    const router = useRouter();
    const {signIn, googleSignIn} = useSession();

    const [state, setState] = useState(initialState);
    const [loading, setLoading] = useState(false);
    const [errorCode, setErrorCode] = useState("");

    const resetPasswordRef = useRef();

    const updateField = (field, value) => {
        setState(prevState => ({
            ...prevState,
            [field]: value,
        }));
    };

    const login = () => {
        if (state.invalid) return;

        // TODO MAKE LOADING A SEE THROUGH LOADING MODAL SO IT ISN'T AS HARSH OF A TRANSITION
        setLoading(true);

        signIn(state.email, state.password).catch((error) => {
            setErrorCode(error.code)
            setLoading(false);
        });
    }

    const validateEmail = (newEmail) => {
        const re = /^[\w\-\.]+@([\w-]+\.)+[\w-]{2,}$/;
        updateField("invalidEmail", !re.test(newEmail));

        updateField("email", newEmail);

        if (errorCode !== "") setErrorCode("");
    }

    const updatePassword = (password) => {
        updateField("password", password);

        if (errorCode !== "") setErrorCode("");
    }

    const google = async () => {
        setLoading(true);
        try {
            await GoogleSignin.hasPlayServices();
            const response = await GoogleSignin.signIn();
            if (isSuccessResponse(response)) {
                googleSignIn(response.data);
            } else {
                console.log("Sign in failed");
                setLoading(false);
            }
        } catch (error) {
            setLoading(false);
            console.log("Error", error)
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

    const updateKeyboardVisibility = useCallback((visible) => {
        setKeyboardVisible(visible);
    }, []);

    // useEffect(() => {
    //     console.log("updating")
    //     const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => updateKeyboardVisibility(true));
    //     const keyboardHidListener = Keyboard.addListener('keyboardDidHide', () => updateKeyboardVisibility(false));
    //     return () => {
    //         keyboardDidShowListener.remove();
    //         keyboardHidListener.remove();
    //     }
    // }, []);

    // TODO this translucent does jack squat because there is nothing underneath it
    return (loading ? <Loading translucent={true}/> :
        <>
            <ScreenWrapper style={{
                paddingHorizontal: 24,
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
            }}>
                <ScrollView contentContainerStyle={{flex: 1, justifyContent: "center", paddingBottom: keyboardVisible ? inputsHeight : 0, width: "100%"}}>
                    <Text style={{color: colors.text.primary, fontSize: 30, fontWeight: 600, textAlign: "center"}}>Sign in to Flatstick</Text>
                    <Text style={{color: colors.text.secondary, fontSize: 16, marginBottom: 32, textAlign: "center"}}>Welcome back! Please sign in to continue</Text>
                    <View style={{flexDirection: "row", gap: 12, width: "100%", marginBottom: 12}}>
                        <Pressable style={({pressed}) => [{ flex: 1, elevation: pressed ? 0 : 1, borderRadius: 8, paddingVertical: 8, backgroundColor: "white", alignItems: "center", justifyContent: "center"}]}
                                    onPress={google}>
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
                        <Pressable style={({pressed}) => [{ flex: 1, elevation: pressed ? 0 : 1, borderRadius: 8, paddingVertical: 8, backgroundColor: "white", alignItems: "center", justifyContent: "center"}]}
                                   onPress={google}>
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
                    <View style={{width: "100%", flexDirection: "row", gap: 10, marginVertical: 12}}>
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
                        <Text style={{color: colors.text.primary, fontSize: 16, marginTop: 16, marginBottom: 4}}>Email Address</Text>
                        <View style={{flexDirection: "row"}}>
                            <TextInput
                                style={{
                                    flex: 1,
                                    borderWidth: 1,
                                    borderColor: state.emailFocused ? state.invalidEmail || errorCode === "auth/invalid-credential" || errorCode === "auth/wrong-password" ? colors.input.invalid.focusedBorder : colors.input.focused.border : state.invalidEmail || errorCode === "auth/invalid-credential" || errorCode === "auth/wrong-password" ? colors.input.invalid.border : colors.input.border,
                                    borderRadius: 10,
                                    paddingVertical: 10,
                                    paddingHorizontal: 14,
                                    fontSize: 16,
                                    color: state.invalidEmail || errorCode === "auth/invalid-credential" || errorCode === "auth/wrong-password" ? colors.input.invalid.text : colors.input.text,
                                    backgroundColor: state.invalidEmail || errorCode === "auth/invalid-credential" || errorCode === "auth/wrong-password" ? colors.input.invalid.background : state.emailFocused ? colors.input.focused.background : colors.input.background
                                }}
                                onFocus={() => updateField("emailFocused", true)}
                                value={state.email}
                                placeholder={"Enter your email..."}
                                placeholderTextColor={colors.text.placeholder}
                                onBlur={() => updateField("emailFocused", false)}
                                onChangeText={(text) => validateEmail(text)}
                            />
                            {(state.invalidEmail || errorCode === "auth/invalid-credential" || errorCode === "auth/wrong-password") && <Text style={{
                                position: "absolute",
                                right: 12,
                                top: 10,
                                color: "white",
                                backgroundColor: "#EF4444",
                                borderRadius: 50,
                                aspectRatio: 1,
                                width: 28,
                                textAlign: "center",
                                fontSize: 20
                            }}>!</Text>}
                        </View>
                        {errorCode === "auth/invalid-credential" || errorCode === "auth/wrong-password" ?
                            <Text style={{color: colors.input.invalid.text, marginTop: 4}}>Please check your email and password
                                and try again.</Text>
                            : state.invalidEmail &&
                            <Text style={{color: colors.input.invalid.text, marginTop: 4}}>Please enter a valid email.</Text>}

                        <Text style={{color: colors.text.primary, fontSize: 16, marginTop: 16, marginBottom: 4}}>Password</Text>
                        <View style={{flexDirection: "row"}}>
                            <TextInput
                                style={{
                                    flex: 1,
                                    borderWidth: 1,
                                    borderColor: state.passwordFocused ? errorCode === "auth/invalid-credential" || errorCode === "auth/wrong-password" ? colors.input.invalid.focusedBorder : colors.input.focused.border : errorCode === "auth/invalid-credential" || errorCode === "auth/wrong-password" ? colors.input.invalid.border : colors.input.border,
                                    borderRadius: 10,
                                    paddingVertical: 10,
                                    paddingHorizontal: 14,
                                    fontSize: 16,
                                    color: errorCode === "auth/invalid-credential" || errorCode === "auth/wrong-password" ? colors.input.invalid.text : colors.input.text,
                                    backgroundColor: errorCode === "auth/invalid-credential" || errorCode === "auth/wrong-password" ? colors.input.invalid.background : state.passwordFocused ? colors.input.focused.background : colors.input.background
                                }}
                                onFocus={() => updateField("passwordFocused", true)}
                                onBlur={() => updateField("passwordFocused", false)}
                                secureTextEntry={true}
                                value={state.password}
                                placeholder={"Enter your password..."}
                                placeholderTextColor={colors.text.placeholder}
                                onChangeText={(text) => updatePassword(text)}
                            />
                            {errorCode === "auth/invalid-credential" || errorCode === "auth/wrong-password" && <Text style={{
                                position: "absolute",
                                right: 12,
                                top: 10,
                                color: "white",
                                backgroundColor: "#EF4444",
                                borderRadius: 50,
                                aspectRatio: 1,
                                width: 28,
                                textAlign: "center",
                                fontSize: 20
                            }}>!</Text>}
                        </View>
                        {errorCode === "auth/invalid-credential" || errorCode === "auth/wrong-password" &&
                            <Text style={{color: colors.input.invalid.text, marginTop: 4}}>Please check your email and password
                                and try again.</Text>}
                    </View>
                    <PrimaryButton title={"Login"} onPress={() => {
                        if (state.invalidEmail) return;
                        login();
                    }} style={{
                        paddingVertical: 10,
                        borderRadius: 10,
                        marginTop: 24,
                    }} disabled={state.invalidEmail || state.email.length === 0 || state.password.length === 0}></PrimaryButton>

                    <Pressable onPress={() => router.push({pathname: `/signup`})} style={({pressed}) => [{
                        marginTop: 32,
                        elevation: pressed ? 0 : 1,
                        borderRadius: 12,
                        backgroundColor: colors.background.secondary,
                        paddingVertical: 10
                    }]}>
                        <Text style={{color: colors.text.primary, textAlign: "center"}}>Don't have an account? Click here to signup.</Text>
                    </Pressable>

                    <Pressable onPress={() => resetPasswordRef.current.present()} style={{
                        marginTop: 24,
                    }}>
                        <Text style={{color: colors.text.link, textAlign: "center"}}>Forgot your password? Click here to reset it.</Text>
                    </Pressable>
                </ScrollView>
            </ScreenWrapper>
            <ResetPassword resetPasswordRef={resetPasswordRef}></ResetPassword>
        </>
    )
}