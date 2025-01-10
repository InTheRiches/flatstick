import {Keyboard, PixelRatio, Pressable, ScrollView, Text, TextInput, View} from "react-native";
import React, {useEffect, useState} from "react";
import Svg, {Path} from "react-native-svg";
import {SvgGoogle} from "../../assets/svg/SvgComponents";
import {createUserWithEmailAndPassword, updateProfile} from "firebase/auth";
import {getAuth} from "../../utils/firebase"
import {doc, getFirestore, setDoc} from "firebase/firestore";
import {useRouter} from "expo-router";
import Loading from "../../components/general/popups/Loading";
import useColors from "../../hooks/useColors";
import {SecondaryButton} from "../../components/general/buttons/SecondaryButton";
import {PrimaryButton} from "../../components/general/buttons/PrimaryButton";
import {SafeAreaView} from "react-native-safe-area-context";

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

// TODO make sure this separates all out into different components
export default function CreateAccount() {
    const colors = useColors();

    const db = getFirestore();
    const router = useRouter();

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
        setFirstName(newName.trim());
        setFirstNameInvalid(newName.length === 0 || newName.trim().includes(" "));
    }

    const updateLastName = (newName) => {
        setLastName(newName.trim());
        setLastNameInvalid(newName.length === 0 || newName.trim().includes(" "))
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

    // TOdo give new users a blank stats file
    const createAccount = () => {
        if (state.invalid) return;
        if (invalidPassword || invalidEmail || firstNameInvalid || lastNameInvalid || firstName.length === 0 || lastName.length === 0) return;

        const auth = getAuth();

        // MAKE LOADING A SEE THROUGH LOADING MODAL SO IT ISN'T AS HARSH OF A TRANSITION
        setLoading(true);

        createUserWithEmailAndPassword(auth, state.email, state.password)
            .then((userCredential) => {
                setLoading(false);
                // Signed up
                const user = userCredential.user;

                updateProfile(user, {
                    displayName: firstName + " " + lastName
                }).then(() => {

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
                    firstName,
                    lastName,
                    strokesGained: 0,
                    preferences: {
                        countMishits: false,
                        selectedPutter: 0,
                        theme: 0,
                        units: 0,
                        reminders: false,
                        selectedGrip: 0,
                    }
                }).catch((error) => {
                        console.log(error);
                });

                setLoading(false);

                setState(prevState => ({
                    ...prevState,
                    tab: prevState.tab + 1,
                }));
            })
            .catch((error) => {
                setErrorCode(error.code);

                if (errorCode === "auth/email-already-in-use")
                    setInvalidEmail(true);

                setLoading(false);
            });
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
                <ScrollView contentContainerStyle={{paddingBottom: keyboardVisible ? inputsHeight : 0}}>
                    <Text style={{color: colors.text.primary, fontSize: 30, fontWeight: 600, marginBottom: 16, marginTop: 28}}>Create Your Account</Text>
                    <Text style={{color: colors.text.primary, fontSize: 16, marginBottom: 4}}>Create with:</Text>
                    <View style={{flexDirection: "row", gap: 12, width: "100%", marginBottom: 12}}>
                        <Pressable style={({pressed}) => [{ opacity: pressed ? 1 : 0.8, flex: 1, borderRadius: 8, paddingVertical: 10, backgroundColor: colors.toggleable.toggled.background, borderWidth: 1, borderColor: colors.toggleable.toggled.border, alignItems: "center", justifyContent: "center"}]}>
                            <SvgGoogle fill={colors.toggleable.color}
                                       style={{width: 24, height: 24}}></SvgGoogle>
                        </Pressable>
                        <Pressable style={({pressed}) => [{ opacity: pressed ? 1 : 0.8, flex: 1, borderRadius: 8, paddingVertical: 10, backgroundColor: colors.toggleable.toggled.background, borderWidth: 1, borderColor: colors.toggleable.toggled.border, alignItems: "center", justifyContent: "center"}]}>
                            <SvgGoogle fill={colors.toggleable.color}
                                       style={{width: 24, height: 24}}></SvgGoogle>
                        </Pressable>
                    </View>
                    <View style={{width: "100%", flexDirection: "row", gap: 10}}>
                        <View style={{
                            height: 1,
                            flex: 1,
                            backgroundColor: colors.text.secondary,
                            marginTop: 12
                        }}></View>
                        <Text style={{color: colors.text.primary, fontSize: 16}} secondary={true}>Or continue with</Text>
                        <View style={{
                            height: 1,
                            flex: 1,
                            backgroundColor: colors.text.secondary,
                            marginTop: 12
                        }}></View>
                    </View>

                    <View onLayout={inputsLayout}>
                        <Text style={{color: colors.text.secondary, fontWeight: 600, marginTop: 12, marginBottom: 6}}>FIRST NAME</Text>
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
                            <Text style={{color: colors.input.invalid.text, marginTop: 4}}>{firstName.length === 0 ? "Please enter a first name!" : "Don't include any spaces!"}</Text>}
                        <Text style={{color: colors.text.secondary, fontWeight: 600, marginTop: 12, marginBottom: 6}}>LAST NAME</Text>
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
                            <Text style={{color: colors.input.invalid.text, marginTop: 4}}>{lastName.length === 0 ? "Please enter a last name!" : "Don't include any spaces!"}</Text>}
                        <Text style={{color: colors.text.secondary, fontWeight: 600, marginTop: 12, marginBottom: 6}}>EMAIL ADDRESS</Text>
                        <View style={{flexDirection: "row"}}>
                            <TextInput
                                style={{
                                    flex: 1,
                                    borderWidth: 1,
                                    borderColor: emailFocused ? invalidEmail ? colors.input.invalid.focusedBorder : colors.input.focused.border : invalidEmail ? colors.input.invalid.border : colors.input.border,
                                    borderRadius: 10,
                                    paddingVertical: 8,
                                    paddingHorizontal: 10,
                                    fontSize: 16,
                                    color: invalidEmail ? colors.input.invalid.text : colors.input.text,
                                    backgroundColor: invalidEmail ? colors.input.invalid.background : emailFocused ? colors.input.focused.background : colors.input.background
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
                        {invalidEmail && errorCode !== "auth/email-already-in-use" &&
                            <Text style={{color: colors.input.invalid.text, marginTop: 4}}>Please enter a valid email.</Text>}
                        {errorCode === "auth/email-already-in-use" &&
                            <Text style={{color: colors.input.invalid.text, marginTop: 4}}>That email is already in use!</Text>}

                        <Text style={{color: colors.text.secondary, fontWeight: 600, marginTop: 12, marginBottom: 6}}>PASSWORD</Text>
                        <View style={{flexDirection: "row", marginBottom: 12}}>
                            <TextInput
                                style={{
                                    flex: 1,
                                    borderWidth: 1,
                                    borderColor: passwordFocused ? invalidPassword ? colors.input.invalid.focusedBorder : colors.input.focused.border : invalidPassword ? colors.input.invalid.border : colors.input.border,
                                    borderRadius: 10,
                                    paddingVertical: 8,
                                    paddingHorizontal: 10,
                                    fontSize: 16,
                                    color: invalidPassword ? colors.input.invalid.text : colors.input.text,
                                    backgroundColor: invalidPassword ? colors.input.invalid.background : passwordFocused ? colors.input.focused.background : colors.input.background
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
                            marginTop: 32
                        }}
                        title={"Create your account"}></PrimaryButton>
                    <Pressable onPress={() => router.push({pathname: `/login`})}
                               style={({pressed}) => [{
                                   marginTop: 24,
                                   borderWidth: 1,
                                   borderRadius: 12,
                                   backgroundColor: pressed ? colors.button.disabled.background : colors.background.secondary,
                                   borderColor: colors.border.default,
                                   paddingVertical: 10
                               }]}>
                        <Text style={{color: colors.text.primary, textAlign: "center"}}>Already have an account? Click <Text
                            style={{color: colors.text.link}}>here</Text> to login.</Text>
                    </Pressable>
                </ScrollView>
        </SafeAreaView>
    )
}

function Done({nextTab}) {
    const colors = useColors();

    return (
        <View style={{width: "80%", alignSelf: "center"}}>
            <View style={{justifyContent: "center", flexDirection: "row", width: "100%"}}>
                <View style={{
                    padding: 12,
                    alignContent: "center",
                    flexDirection: "row",
                    justifyContent: "center",
                    borderRadius: 50,
                    backgroundColor: colors.checkmark.background
                }}>
                    <Svg width={24} height={24} stroke={colors.checkmark.color} xmlns="http://www.w3.org/2000/svg"
                         fill="none"
                         viewBox="0 0 24 24" strokeWidth="3">
                        <Path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5"/>
                    </Svg>
                </View>
            </View>
            <Text style={{color: colors.text.primary, fontSize: 18, fontWeight: 500, textAlign: "center", marginTop: 14}}>Account
                Created</Text>
            <Text style={{color: colors.text.secondary, textAlign: "center", lineHeight: 18, marginTop: 10, marginBottom: 48}}>Your account has
                teed-off! Continue to begin your putting journey!</Text>
            <PrimaryButton onPress={nextTab} title={"Continue"}
                           style={{paddingVertical: 10, borderRadius: 10}}></PrimaryButton>
        </View>
    );
}

function Signup({errorCode, setErrorCode, setState, state, create}) {
    return (
        <View>
            <Text style={{color: colors.text.primary, fontSize: 20, fontWeight: 600, marginBottom: 30}}>Create Your Account</Text>
            <Text style={{color: colors.text.primary, fontSize: 16, marginBottom: 4}}>Create with:</Text>
            <View style={{flexDirection: "row", gap: 12, width: "100%", marginBottom: 12,}}>
                <SecondaryButton style={{ flex: 1, borderRadius: 8, paddingVertical: 10}}>
                    <SvgGoogle fill={colors.button.secondary.text}
                               style={{width: 24, height: 24}}></SvgGoogle>
                </SecondaryButton>
                <SecondaryButton style={{ flex: 1, borderRadius: 8, paddingVertical: 10}}>
                    <SvgGoogle fill={colors.button.secondary.text}
                               style={{width: 24, height: 24}}></SvgGoogle>
                </SecondaryButton>
            </View>
            <View style={{width: "100%", flexDirection: "row", gap: 10}}>
                <View style={{
                    height: 1,
                    flex: 1,
                    backgroundColor: colors.text.secondary,
                    marginTop: 12
                }}></View>
                <Text style={{color: colors.text.primary, fontSize: 16}} secondary={true}>Or continue with</Text>
                <View style={{
                    height: 1,
                    flex: 1,
                    backgroundColor: colors.text.secondary,
                    marginTop: 12
                }}></View>
            </View>

            <Text style={{color: colors.text.primary, fontSize: 16, marginTop: 12, marginBottom: 4}}>Display Name</Text>
            <View style={{flexDirection: "row"}}>
                <TextInput
                    style={{
                        flex: 1,
                        borderWidth: 1,
                        borderColor: nameFocused ? invalidUsername ? colors.input.invalid.focusedBorder : colors.input.focused.border : invalidUsername ? colors.input.invalid.border : colors.input.border,
                        borderRadius: 10,
                        paddingVertical: 8,
                        paddingHorizontal: 10,
                        fontSize: 16,
                        color: invalidUsername ? colors.input.invalid.text : colors.input.text,
                        backgroundColor: invalidUsername ? colors.input.invalid.background : nameFocused ? colors.input.focused.background : colors.input.background
                    }}
                    onFocus={() => setNameFocused(true)}
                    onBlur={() => setNameFocused(false)}
                    value={state.username}
                    onChangeText={(text) => setName(text)}
                />
                {invalidUsername && <Text style={{
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
            {invalidUsername &&
                <Text style={{color: colors.input.invalid.text, marginTop: 4}}>Your display name must be at least 6
                    characters!</Text>}
            <Text style={{color: colors.text.primary, fontSize: 16, marginTop: 16, marginBottom: 4}}>Email Address</Text>
            <View style={{flexDirection: "row"}}>
                <TextInput
                    style={{
                        flex: 1,
                        borderWidth: 1,
                        borderColor: emailFocused ? invalidEmail ? colors.input.invalid.focusedBorder : colors.input.focused.border : invalidEmail ? colors.input.invalid.border : colors.input.border,
                        borderRadius: 10,
                        paddingVertical: 8,
                        paddingHorizontal: 10,
                        fontSize: 16,
                        color: invalidEmail ? colors.input.invalid.text : colors.input.text,
                        backgroundColor: invalidEmail ? colors.input.invalid.background : emailFocused ? colors.input.focused.background : colors.input.background
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
                        paddingVertical: 8,
                        paddingHorizontal: 10,
                        fontSize: 16,
                        color: invalidPassword ? colors.input.invalid.text : colors.input.text,
                        backgroundColor: invalidPassword ? colors.input.invalid.background : passwordFocused ? colors.input.focused.background : colors.input.background
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

            <PrimaryButton
                onPress={!invalidPassword && !invalidEmail && !invalidUsername && state.username.length !== 0 ? create : () => {
                }}
                disabled={invalidPassword || invalidEmail || invalidUsername || state.username.length === 0 || state.email.length === 0 || state.email.password === 0}
                style={{
                    paddingVertical: 10,
                    borderRadius: 10,
                    marginTop: 32
                }}
                title={"Create your account"}></PrimaryButton>
        </View>
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