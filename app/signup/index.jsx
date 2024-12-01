import {ThemedText} from "@/components/ThemedText";
import {PrimaryButton} from "@/components/buttons/PrimaryButton";
import {View, Text, Pressable, TextInput, useColorScheme} from "react-native";
import {useEffect, useState} from "react";
import Svg, {Path} from "react-native-svg";
import {SvgArrow, SvgGoogle} from "@/assets/svg/SvgComponents";
import {createUserWithEmailAndPassword, getAuth, updateProfile} from "firebase/auth";
import {getFirestore, setDoc, doc} from "firebase/firestore";
import {useRouter} from "expo-router";
import Loading from "../../components/popups/Loading";
import useColors from "../../hooks/useColors";

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

// TODO ADD DISPLAY NAME ENTRY, AS WELL AS PROFILE ICON
export default function CreateAccount() {
    const colors = useColors();

    const db = getFirestore();
    const router = useRouter();

    const [state, setState] = useState(initialState);
    const [loading, setLoading] = useState(false);
    const [errorCode, setErrorCode] = useState("");

    const lastTab = () => {
        if (state.tab === 0) return;

        setState(prevState => ({
            ...prevState,
            tab: prevState.tab - 1,
        }));
    }

    const nextTab = () => {
        if (state.tab === 0 && state.skill === -1) return;
        if (state.tab === 1 && state.frequency === -1) return;
        if (state.tab === 2 && state.putts === -1) return;
        if (state.tab === 3 && state.name === "") return;

        if (state.tab === 4) {
            router.push({pathname: `/`});
        }

        setState(prevState => ({
            ...prevState,
            tab: prevState.tab + 1,
        }));
    }

    const createAccount = () => {
        if (state.invalid) return;

        const auth = getAuth();

        // MAKE LOADING A SEE THROUGH LOADING MODAL SO IT ISNT AS HARSH OF A TRANSITION
        setLoading(true);

        createUserWithEmailAndPassword(auth, state.email, state.password)
            .then((userCredential) => {
                setLoading(false);
                // Signed up
                const user = userCredential.user;

                updateProfile(user, {
                    displayName: state.username
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
                }).then((data) => {
                    console.log("made document");
                })
                    .catch((error) => {
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
                const errorMessage = error.message;

                setLoading(false);
            });
    }

    return (loading ? <Loading/> :
            <View style={{
                backgroundColor: colors.background.primary,
                width: "100%",
                height: "100%",
                paddingTop: 50,
                paddingHorizontal: 24,
                justifyContent: "center",
                alignContent: "center",
                flexDirection: "column"
            }}>
                {state.tab === 0 && <Skill state={state} setState={setState}/>}
                {state.tab === 1 && <Frequency state={state} setState={setState}/>}
                {state.tab === 2 && <Putts state={state} setState={setState}/>}
                {state.tab === 3 &&
                    <Signup errorCode={errorCode} setErrorCode={setErrorCode} state={state} setState={setState}
                            create={createAccount}/>}
                {state.tab === 4 && <Done nextTab={nextTab}/>}
                <View style={{
                    display: state.tab === 3 || state.tab === 4 ? "none" : "static",
                    flexDirection: "row",
                    justifyContent: "center",
                    alignContent: "center",
                    gap: 72,
                    marginTop: 48,
                    marginBottom: 48,
                }}>
                    <PrimaryButton onPress={lastTab} style={{aspectRatio: 1, borderRadius: 50, padding: 16,}}>
                        <SvgArrow width={16} height={16} stroke={"black"}
                                  style={{transform: [{rotate: "-135deg"}]}}></SvgArrow>
                    </PrimaryButton>
                    <PrimaryButton onPress={nextTab} style={{aspectRatio: 1, borderRadius: 50, padding: 16,}}>
                        <SvgArrow width={16} height={16} stroke={"black"}
                                  style={{transform: [{rotate: "45deg"}]}}></SvgArrow>
                    </PrimaryButton>
                </View>
                {state.tab !== 4 && <Pressable onPress={() => router.push({pathname: `/login`})}
                                               style={({pressed}) => [{
                                                   marginTop: 24,
                                                   borderWidth: 1,
                                                   borderRadius: 12,
                                                   backgroundColor: pressed ? colors.button.disabled.background : "transparent",
                                                   borderColor: colors.border.default,
                                                   paddingVertical: 10
                                               }]}>
                    <Text style={{color: colors.text.primary, textAlign: "center"}}>Already have an account? Click <Text
                        style={{color: colors.text.link}}>here</Text> to login.</Text>
                </Pressable>}
            </View>
    )
}

function Skill({state, setState}) {
    const colors = useColors();

    const setSkill = (id) => {
        setState(prevState => ({
            ...prevState,
            skill: id,
        }));
    }

    return (
        <View style={{flexDirection: "column", gap: 10}}>
            <ThemedText type={"title"} style={{marginBottom: 12}}>What is your skill level?</ThemedText>
            <SelectableButton onPress={() => setSkill(0)} selected={state.skill === 0} title={"Hacker"}
                              subtitle={"25+ Handicap (or unknown)"}/>
            <SelectableButton onPress={() => setSkill(1)} selected={state.skill === 1} title={"Bogey Golf"}
                              subtitle={"10-25 Handicap"}/>
            <SelectableButton onPress={() => setSkill(2)} selected={state.skill === 2} title={"Single Digit"}
                              subtitle={"<10 Handicap"}/>
        </View>
    )
}

function SelectableButton({onPress, selected, title, subtitle}) {
    const colors = useColors();

    return (
        <Pressable onPress={onPress} style={{
            borderWidth: 1,
            borderColor: selected ? colors.button.radio.selected.border : colors.button.radio.border,
            backgroundColor: selected ? colors.button.radio.selected.background : colors.button.radio.background,
            borderRadius: 10,
            paddingHorizontal: 12,
            paddingVertical: 12
        }}>
            <Text style={{color: colors.text.primary, fontSize: 18}}>{title}</Text>
            <Text style={{color: colors.text.secondary}}>{subtitle}</Text>
            {selected && <View style={{
                position: "absolute",
                right: -10,
                top: -10,
                backgroundColor: colors.checkmark.background,
                padding: 6,
                borderRadius: 50
            }}>
                <Svg width={18} height={18} stroke={colors.checkmark.color} xmlns="http://www.w3.org/2000/svg"
                     fill="none"
                     viewBox="0 0 24 24" strokeWidth="3">
                    <Path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5"/>
                </Svg>
            </View>}
        </Pressable>
    )
}

function Frequency({state, setState}) {
    const colors = useColors();

    const colorScheme = useColorScheme();

    const setFrequency = (id) => {
        setState(prevState => ({
            ...prevState,
            frequency: id,
        }));
    }

    return (
        <View style={{flexDirection: "column", gap: 10}}>
            <ThemedText type={"title"} style={{marginBottom: 12}}>How often do you play?</ThemedText>
            <SelectableButton onPress={() => setFrequency(0)} selected={state.frequency === 0} title={"Occassionally"}
                              subtitle={"<10 Rounds a year"}/>
            <SelectableButton onPress={() => setFrequency(1)} selected={state.frequency === 1} title={"Committed"}
                              subtitle={"10-30 Rounds a year"}/>
            <SelectableButton onPress={() => setFrequency(2)} selected={state.frequency === 2} title={"Addicted"}
                              subtitle={"30+ Rounds a year"}/>
        </View>
    )
}

function Putts({state, setState}) {
    const colors = useColors();

    const colorScheme = useColorScheme();

    const setPutts = (id) => {
        setState(prevState => ({
            ...prevState,
            putts: id,
        }));
    }

    return (
        <View style={{flexDirection: "column", gap: 10}}>
            <ThemedText type={"title"} style={{marginBottom: 12}}>How many putts per round?</ThemedText>
            <SelectableButton onPress={() => setPutts(0)} selected={state.putts === 0} title={"3 Putt Pro"}
                              subtitle={"40+ Putts"}/>
            <SelectableButton onPress={() => setPutts(1)} selected={state.putts === 1} title={"Amateur"}
                              subtitle={"30-40 Putts"}/>
            <SelectableButton onPress={() => setPutts(2)} selected={state.putts === 2} title={"Pro"}
                              subtitle={"<30 Putts"}/>
        </View>
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
            <ThemedText type={"header"} style={{fontWeight: 500, textAlign: "center", marginTop: 14}}>Account
                Created</ThemedText>
            <ThemedText type={"default"} secondary={true}
                        style={{textAlign: "center", lineHeight: 18, marginTop: 10, marginBottom: 48}}>Your account has
                teed-off! Continue to begin your putting journey!</ThemedText>
            <PrimaryButton onPress={nextTab} title={"Continue"}
                           style={{paddingVertical: 10, borderRadius: 10}}></PrimaryButton>
        </View>
    );
}

// TODO ADD USERNAME VALIDATION, AND PREVENT DUPLICATES, ALSO, DO YOU NEED DISPLAY NAME AND USERNAME, OR JUST ONE?
function Signup({errorCode, setErrorCode, setState, state, create}) {
    const colors = useColors();

    const [emailFocused, setEmailFocused] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const [invalidPassword, setInvalidPassword] = useState(false);
    const [invalidUsername, setInvalidUsername] = useState(false);
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

    const setName = (id) => {
        setState(prevState => ({
            ...prevState,
            username: id,
        }));

        if (id.length < 6)
            setInvalidUsername(true);
        else if (invalidUsername === true)
            setInvalidUsername(false)
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
            <ThemedText secondary={true} style={{fontSize: 16, marginBottom: 4}}>Create with:</ThemedText>
            <View style={{flexDirection: "row", gap: 12, width: "100%", marginBottom: 12,}}>
                <Pressable style={({pressed}) => [{
                    flex: 1,
                    paddingVertical: 12,
                    borderRadius: 10,
                    flexDirection: "row",
                    alignContent: "center",
                    justifyContent: "center",
                    borderWidth: 1,
                    borderColor: pressed ? colors.input.focused.border : colors.input.border,
                    backgroundColor: pressed ? colors.input.focused.background : colors.input.background
                }]}>
                    <SvgGoogle fill={colors.input.border}
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
                    borderColor: pressed ? colors.input.focused.border : colors.input.border,
                    backgroundColor: pressed ? colors.input.focused.background : colors.input.background
                }]}>
                    <SvgGoogle fill={colors.input.border}
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
                <ThemedText style={{fontSize: 16}} secondary={true}>Or continue with</ThemedText>
                <View style={{
                    height: 1,
                    flex: 1,
                    backgroundColor: colors.text.secondary,
                    marginTop: 12
                }}></View>
            </View>

            <ThemedText style={{fontSize: 16, marginTop: 12, marginBottom: 4}}>Display Name</ThemedText>
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
            <ThemedText style={{fontSize: 16, marginTop: 16, marginBottom: 4}}>Email Address</ThemedText>
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

            <ThemedText style={{fontSize: 16, marginTop: 16, marginBottom: 4}}>Password</ThemedText>
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