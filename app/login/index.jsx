import {ThemedText} from "@/components/ThemedText";
import {View, Text, Pressable, TextInput, ActivityIndicator} from "react-native";
import {Colors} from "@/constants/Colors";
import {useColorScheme} from "@/hooks/useColorScheme";
import {useEffect, useState} from "react";
import Svg, {Path} from "react-native-svg";
import {SvgArrow, SvgGoogle} from "@/assets/svg/SvgComponents";
import {createUserWithEmailAndPassword, getAuth, updateProfile} from "firebase/auth";
import {getFirestore, setDoc, doc} from "firebase/firestore";
import {useRouter} from "expo-router";
import {useSession} from "../../contexts/ctx";

const initialState = {
    password: "",
    email: "",
    invalid: false,
    emailFocused: false,
    passwordFocused: false,
    invalidEmail: false
}

// TODO MAKE ALL THE LOADING SCREENS THE SAME FROM GRABBING A GLOBAL COMPONENT
function Loading({}) {
    return (
        <View style={{
            width: "100%",
            height: "100%",
            flexDirection: "flow",
            justifyContent: "center",
            alignItems: "center"
        }}>
            <ActivityIndicator size="large"/>
        </View>
    )
}

export default function Login() {
    const colorScheme = useColorScheme();
    const db = getFirestore();
    const router = useRouter();

    const {signIn} = useSession();

    const [state, setState] = useState(initialState);
    const [loading, setLoading] = useState(false);
    const [errorCode, setErrorCode] = useState("");

    const updateField = (field, value) => {
        setState(prevState => ({
          ...prevState,
          [field]: value,
        }));
      };

    const login = () => {
        if (state.invalid) return;

        const auth = getAuth();

        // MAKE LOADING A SEE THROUGH LOADING MODAL SO IT ISNT AS HARSH OF A TRANSITION
        setLoading(true);

        signIn(state.email, state.password).then(() => {
            router.push({pathname: "/"});
        }).catch((error) => {
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
        updateField("passwrd", password);

        if (errorCode !== "") setErrorCode("");
    }

    return (loading ? <Loading/> :
            <View style={{
                      backgroundColor: Colors[colorScheme ?? "light"].background,
                      width: "100%",
                      height: "100%",
                      paddingTop: 50,
                      paddingHorizontal: 24,
                      justifyContent: "center",
                      alignContent: "center"
                  }}>
                <ThemedText type={"title"} style={{marginBottom: 30}}>Sign in to your account</ThemedText>
                <ThemedText style={{fontSize: 16, marginBottom: 8}}>Login with:</ThemedText>
                <View style={{flexDirection: "row", gap: 12, width: "100%", marginBottom: 12,}}>
                    <Pressable style={({pressed}) => [{
                                   flex: 1,
                                   paddingVertical: 12,
                                   borderRadius: 10,
                                   flexDirection: "row",
                                   alignContent: "center",
                                   justifyContent: "center",
                                   borderWidth: 1,
                                   borderColor: pressed ? Colors[colorScheme ?? "light"].inputFocusedBorder : Colors[colorScheme ?? "light"].inputBorder,
                                   backgroundColor: pressed ? Colors[colorScheme ?? "light"].inputFocusedBackground : Colors[colorScheme ?? "light"].inputBackground
                               }]}>
                        <SvgGoogle fill={Colors[colorScheme ?? "light"].inputBorder}
                                   style={{width: 24, height: 24}}></SvgGoogle>
                    </Pressable>
                    <Pressable style={({pressed}) => [{
                                   flex: 1,
                                   paddingVertical: 12,
                                   borderRadius: 10,
                                   flexDirection: "row",
                                   alignContent: "center",
                                   justifyContent: "center",
                                   borderWidth: 1,
                                   borderColor: pressed ? Colors[colorScheme ?? "light"].inputFocusedBorder : Colors[colorScheme ?? "light"].inputBorder,
                                   backgroundColor: pressed ? Colors[colorScheme ?? "light"].inputFocusedBackground : Colors[colorScheme ?? "light"].inputBackground
                               }]}>
                        <SvgGoogle fill={Colors[colorScheme ?? "light"].inputBorder}
                                   style={{width: 24, height: 24}}></SvgGoogle>
                    </Pressable>
                </View>
                <View style={{width: "100%", flexDirection: "row", gap: 10}}>
                    <View style={{
                              height: 1,
                              flex: 1,
                              backgroundColor: Colors[colorScheme ?? "light"].textSecondary,
                              marginTop: 12
                          }}></View>
                    <ThemedText style={{fontSize: 16}} secondary={true}>Or continue with</ThemedText>
                    <View style={{
                              height: 1,
                              flex: 1,
                              backgroundColor: Colors[colorScheme ?? "light"].textSecondary,
                              marginTop: 12
                          }}></View>
                </View>
                <ThemedText style={{fontSize: 16, marginTop: 16, marginBottom: 4}}>Email Address</ThemedText>
                <View style={{flexDirection: "row"}}>
                    <TextInput
                        style={{
                            flex: 1,
                            borderWidth: 1,
                            borderColor: state.emailFocused ? state.invalidEmail || errorCode === "auth/invalid-credential" ? Colors[colorScheme ?? "light"].inputInvalidFocusedBorder : Colors[colorScheme ?? "light"].inputFocusedBorder : state.invalidEmail || errorCode === "auth/invalid-credential" ? Colors[colorScheme ?? "light"].inputInvalidBorder : Colors[colorScheme ?? "light"].inputBorder,
                            borderRadius: 10,
                            paddingVertical: 8,
                            paddingHorizontal: 10,
                            fontSize: 16,
                            color: state.invalidEmail || errorCode === "auth/invalid-credential" ? Colors[colorScheme ?? "light"].inputInvalidText : Colors[colorScheme ?? "light"].inputText,
                            backgroundColor: state.invalidEmail || errorCode === "auth/invalid-credential" ? Colors[colorScheme ?? "light"].inputInvalidBackground : state.emailFocused ? Colors[colorScheme ?? "light"].inputFocusedBackground : Colors[colorScheme ?? "light"].inputBackground
                        }}
                        onFocus={() => updateField("emailFocused", true)}
                        value={state.email}
                        onBlur={() => updateField("emailFocused", false)}
                        onChangeText={(text) => validateEmail(text)}
                    />
                    {(state.invalidEmail || errorCode === "auth/invalid-credential") && <Text style={{
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
                {errorCode === "auth/invalid-credential" ?
                    <Text style={{color: Colors[colorScheme ?? "light"].inputInvalidText, marginTop: 4}}>Please check your email and password and try again.</Text>
                    : state.invalidEmail &&
                    <Text style={{color: Colors[colorScheme ?? "light"].inputInvalidText, marginTop: 4}}>Please enter a valid email.</Text>}

                <ThemedText style={{fontSize: 16, marginTop: 16, marginBottom: 4}}>Password</ThemedText>
                <View style={{flexDirection: "row"}}>
                    <TextInput
                        style={{
                            flex: 1,
                            borderWidth: 1,
                            borderColor: state.passwordFocused ? errorCode === "auth/invalid-credential" ? Colors[colorScheme ?? "light"].inputInvalidFocusedBorder : Colors[colorScheme ?? "light"].inputFocusedBorder : state.invalidPassword ? Colors[colorScheme ?? "light"].inputInvalidBorder : Colors[colorScheme ?? "light"].inputBorder,
                            borderRadius: 10,
                            paddingVertical: 8,
                            paddingHorizontal: 10,
                            fontSize: 16,
                            color: errorCode === "auth/invalid-credential" ? Colors[colorScheme ?? "light"].inputInvalidText : Colors[colorScheme ?? "light"].inputText,
                            backgroundColor: errorCode === "auth/invalid-credential" ? Colors[colorScheme ?? "light"].inputInvalidBackground : state.passwordFocused ? Colors[colorScheme ?? "light"].inputFocusedBackground : Colors[colorScheme ?? "light"].inputBackground
                        }}
                        onFocus={() => updateField("passwordFocused", true)}
                        onBlur={() => updateField("passwordFocused", false)}
                        secureTextEntry={true}
                        value={state.password}
                        onChangeText={(text) => updateField("password", text)}
                    />
                    {errorCode === "auth/invalid-credential" && <Text style={{
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
                {errorCode === "auth/invalid-credential" &&
                    <Text style={{color: Colors[colorScheme ?? "light"].inputInvalidText, marginTop: 4}}>Please check your email and password and try again.</Text>}
                <Pressable onPress={() => {
                    if (state.invalidEmail) return;
                    login();
                }} style={{
                    paddingVertical: 10,
                    borderRadius: 10,
                    marginTop: 48,
                    borderWidth: state.invalidEmail ? 1 : 0,
                    borderColor: Colors[colorScheme ?? 'light'].buttonSecondaryDisabledBorder,
                    backgroundColor: state.invalidEmail ? Colors[colorScheme ?? 'light'].buttonSecondaryDisabledBackground : Colors[colorScheme ?? "light"].buttonPrimaryBorder
                }}>
                    <Text style={{
                        textAlign: "center",
                        color: state.invalidEmail ? Colors[colorScheme ?? 'light'].buttonSecondaryDisabledText : "white"
                    }}>Login</Text>
                </Pressable>
            </View>
    )
}

function Signup({errorCode, setErrorCode, colorScheme, setState, state, create}) {
    const router = useRouter();

    const [emailFocused, setEmailFocused] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const [invalidPassword, setInvalidPassword] = useState(false);
    const [nameFocused, setNameFocused] = useState(false);
    const [invalidEmail, setInvalidEmail] = useState(false);

    useEffect(() => {
        if (errorCode === "auth/email-already-in-use") {
            setInvalidEmail(true);
        }
    }, [errorCode]);

    const [requirements, setRequirements] = useState({
        hasLength: false,
        hasUppercase: false,
        hasLowercase: false,
        hasNumber: false,
        invalid: true,
    });

    const validatePassword = (newPassword) => {
        const re = /^(?=.*\d)(?=.*[a-zA-Z])[a-zA-Z0-9]{6,}$/;
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

    const setName = (id) => {
        setState(prevState => ({
            ...prevState,
            username: id,
        }));
    }

    const updatePassword = (password) => {
        setState(prevState => ({
            ...prevState,
            password: password,
        }));

        validatePassword(password);
    }

    return (
        <View>
            <ThemedText type={"title"} style={{marginBottom: 30}}>Create Your Account</ThemedText>
            <ThemedText style={{fontSize: 16, marginBottom: 4}}>Create with:</ThemedText>
            <View style={{flexDirection: "row", gap: 12, width: "100%", marginBottom: 12,}}>
                <Pressable style={{
                    flex: 1,
                    paddingVertical: 12,
                    borderRadius: 10,
                    flexDirection: "row",
                    alignContent: "center",
                    justifyContent: "center",
                    borderWidth: 1,
                    borderColor: colorScheme === "light" ? "#ACCD30" : "#606E43",
                    backgroundColor: colorScheme === "light" ? "rgba(191,209,123,0.4)" : "rgba(191,209,123,0.1)"
                }}>
                    <SvgGoogle fill={colorScheme === "light" ? "#99A56B" : "#606E43"}
                               style={{width: 24, height: 24}}></SvgGoogle>
                </Pressable>
                <Pressable style={{
                    flex: 1,
                    paddingVertical: 12,
                    borderRadius: 10,
                    flexDirection: "row",
                    alignContent: "center",
                    justifyContent: "center",
                    borderWidth: 1,
                    borderColor: colorScheme === "light" ? "#ACCD30" : "#606E43",
                    backgroundColor: colorScheme === "light" ? "rgba(191,209,123,0.4)" : "rgba(191,209,123,0.1)"
                }}>
                    <SvgGoogle fill={colorScheme === "light" ? "#99A56B" : "#606E43"}
                               style={{width: 24, height: 24}}></SvgGoogle>
                </Pressable>
            </View>
            <View style={{width: "100%", flexDirection: "row", gap: 10}}>
                <View style={{
                    height: 1,
                    flex: 1,
                    backgroundColor: Colors[colorScheme ?? "light"].textSecondary,
                    marginTop: 12
                }}></View>
                <ThemedText style={{fontSize: 16}} secondary={true}>Or continue with</ThemedText>
                <View style={{
                    height: 1,
                    flex: 1,
                    backgroundColor: Colors[colorScheme ?? "light"].textSecondary,
                    marginTop: 12
                }}></View>
            </View>

            <ThemedText style={{fontSize: 16, marginTop: 12, marginBottom: 4}}>Username</ThemedText>
            <TextInput
                style={{
                    flex: 0,
                    borderWidth: 1,
                    borderColor: nameFocused ? Colors[colorScheme ?? "light"].inputFocusedBorder : Colors[colorScheme ?? "light"].inputBorder,
                    borderRadius: 10,
                    paddingVertical: 8,
                    paddingHorizontal: 10,
                    fontSize: 16,
                    color: Colors[colorScheme ?? "light"].inputText,
                    backgroundColor: nameFocused ? Colors[colorScheme ?? "light"].inputFocusedBackground : Colors[colorScheme ?? "light"].inputBackground
                }}
                onFocus={() => setNameFocused(true)}
                onBlur={() => setNameFocused(false)}
                value={state.username}
                onChangeText={(text) => setName(text)}
            />
            <ThemedText style={{fontSize: 16, marginTop: 16, marginBottom: 4}}>Email Address</ThemedText>
            <View style={{flexDirection: "row"}}>
                <TextInput
                    style={{
                        flex: 1,
                        borderWidth: 1,
                        borderColor: emailFocused ? invalidEmail ? Colors[colorScheme ?? "light"].inputInvalidFocusedBorder : Colors[colorScheme ?? "light"].inputFocusedBorder : invalidEmail ? Colors[colorScheme ?? "light"].inputInvalidBorder : Colors[colorScheme ?? "light"].inputBorder,
                        borderRadius: 10,
                        paddingVertical: 8,
                        paddingHorizontal: 10,
                        fontSize: 16,
                        color: invalidEmail ? Colors[colorScheme ?? "light"].inputInvalidText : Colors[colorScheme ?? "light"].inputText,
                        backgroundColor: invalidEmail ? Colors[colorScheme ?? "light"].inputInvalidBackground : emailFocused ? Colors[colorScheme ?? "light"].inputFocusedBackground : Colors[colorScheme ?? "light"].inputBackground
                    }}
                    onFocus={() => setEmailFocused(true)}
                    value={state.email}
                    onBlur={() => setEmailFocused(false)}
                    onChangeText={(text) => updateEmail(text)}
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
            {errorCode === "auth/email-already-in-use" &&
                <Text style={{color: Colors[colorScheme ?? "light"].inputInvalidText, marginTop: 4}}>That email is
                    already in use!</Text>}

            <ThemedText style={{fontSize: 16, marginTop: 16, marginBottom: 4}}>Password</ThemedText>
            <View style={{flexDirection: "row", marginBottom: 12}}>
                <TextInput
                    style={{
                        flex: 1,
                        borderWidth: 1,
                        borderColor: passwordFocused ? invalidPassword ? Colors[colorScheme ?? "light"].inputInvalidFocusedBorder : Colors[colorScheme ?? "light"].inputFocusedBorder : invalidPassword ? Colors[colorScheme ?? "light"].inputInvalidBorder : Colors[colorScheme ?? "light"].inputBorder,
                        borderRadius: 10,
                        paddingVertical: 8,
                        paddingHorizontal: 10,
                        fontSize: 16,
                        color: invalidPassword ? Colors[colorScheme ?? "light"].inputInvalidText : Colors[colorScheme ?? "light"].inputText,
                        backgroundColor: invalidPassword ? Colors[colorScheme ?? "light"].inputInvalidBackground : passwordFocused ? Colors[colorScheme ?? "light"].inputFocusedBackground : Colors[colorScheme ?? "light"].inputBackground
                    }}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    secureTextEntry={true}
                    value={state.password}
                    onChangeText={(text) => updatePassword(text)}
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
                color: !requirements.invalid ? '#16a34a' : Colors[colorScheme ?? "light"].inputInvalidText,
                marginBottom: 4
            }}>Password
                Requirements:</Text>
            <View style={{flexDirection: "row", gap: 10, alignContent: "center", marginBottom: 4}}>
                {requirements.hasLength ? <ValidRequirement/> : <InvalidRequirement/>}
                <Text
                    style={{color: requirements.hasLength ? '#16a34a' : Colors[colorScheme ?? "light"].inputInvalidText}}>At
                    least 6 characters</Text>
            </View>
            <View style={{flexDirection: "row", gap: 10, alignContent: "center", marginBottom: 4}}>
                {requirements.hasNumber ? <ValidRequirement/> : <InvalidRequirement/>}
                <Text
                    style={{color: requirements.hasNumber ? '#16a34a' : Colors[colorScheme ?? "light"].inputInvalidText}}>At
                    least 1 number</Text>
            </View>
            <View style={{flexDirection: "row", gap: 10, alignContent: "center", marginBottom: 4}}>
                {requirements.hasUppercase ? <ValidRequirement/> : <InvalidRequirement/>}
                <Text
                    style={{color: requirements.hasUppercase ? '#16a34a' : Colors[colorScheme ?? "light"].inputInvalidText}}>Contains
                    an uppercase</Text>
            </View>
            <View style={{flexDirection: "row", gap: 10, alignContent: "center", marginBottom: 4}}>
                {requirements.hasLowercase ? <ValidRequirement/> : <InvalidRequirement/>}
                <Text
                    style={{color: requirements.hasLowercase ? '#16a34a' : Colors[colorScheme ?? "light"].inputInvalidText}}>Contains
                    a lowercase</Text>
            </View>

            <Pressable onPress={() => {
                if (invalidPassword || invalidEmail || state.username.length === 0) return;
                create();
            }} style={{
                paddingVertical: 10,
                borderRadius: 10,
                marginTop: 48,
                borderWidth: (invalidPassword || invalidEmail || state.username.length === 0) ? 1 : 0,
                borderColor: Colors[colorScheme ?? 'light'].buttonSecondaryDisabledBorder,
                backgroundColor: (invalidPassword || invalidEmail || state.username.length === 0) ? Colors[colorScheme ?? 'light'].buttonSecondaryDisabledBackground : Colors[colorScheme ?? "light"].buttonPrimaryBorder
            }}>
                <Text style={{
                    textAlign: "center",
                    color: (invalidPassword || invalidEmail || state.username.length === 0) ? Colors[colorScheme ?? 'light'].buttonSecondaryDisabledText : "white"
                }}>Create your account</Text>
            </Pressable>
        </View>
    )
}