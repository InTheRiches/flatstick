import {ThemedText} from "@/components/ThemedText";
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
                        displayName: state.username,
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
                        username: state.username
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

    return ( loading ? <Loading/> :
        <View style={{
                  backgroundColor: colors.background.primary,
                  width: "100%",
                  height: "100%",
                  paddingTop: 50,
                  paddingHorizontal: 24,
                  justifyContent: "center",
                  alignContent: "center"
              }}>
            {state.tab === 0 && <Skill state={state} setState={setState}/>}
            {state.tab === 1 && <Frequency state={state} setState={setState}/>}
            {state.tab === 2 && <Putts state={state} setState={setState}/>}
            {state.tab === 3 &&
                <Signup errorCode={errorCode} setErrorCode={setErrorCode} state={state} setState={setState} create={createAccount}/>}
            {state.tab === 4 && <Done nextTab={nextTab}/>}
            <View style={{
                          display: state.tab === 3 || state.tab === 4 ? "none" : "static",
                flexDirection: "row",
                justifyContent: "center",
                alignContent: "center",
                gap: 72
            }}>
                <Pressable onPress={lastTab} style={{
                    backgroundColor: colors.button.primary.border,
                    padding: 16,
                    aspectRatio: 1,
                    borderRadius: 50,
                    marginTop: 48
                }}>
                    <SvgArrow width={16} height={16} stroke={"white"}
                              style={{transform: [{rotate: "-135 deg"}]}}></SvgArrow>
                </Pressable>
                <Pressable onPress={nextTab} style={{
                    backgroundColor: colors.button.primary.border,
                    padding: 16,
                    aspectRatio: 1,
                    borderRadius: 50,
                    marginTop: 48
                }}>
                    <SvgArrow width={16} height={16} stroke={"white"}
                              style={{transform: [{rotate: "45deg"}]}}></SvgArrow>
                </Pressable>
            </View>
            <Pressable onPress={() => router.push({pathname: `/login`})} style={({ pressed }) => [{ marginTop: 24, borderWidth: 1, borderRadius: 12, backgroundColor: pressed ? colors.button.disabled.background : "transparent", borderColor: colors.border.default, marginHorizontal: 16, paddingVertical: 10 }]}>
                <Text style={{ color: colors.text.primary, textAlign: "center" }}>Already have an account? Click <Text style={{ color: colors.text.link }}>here</Text> to login.</Text>
            </Pressable>
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
            <SelectableButton onPress={() => setSkill(0)} selected={state.skill === 0} title={"Hacker"} subtitle={"25+ Handicap (or unknown)"}/>
            <Pressable onPress={() => setSkill(1)} style={{
                borderWidth: 1,
                borderColor: state.skill === 1 ? colors.button.radio.selected.border : colors.button.radio.border,
                backgroundColor: state.skill === 1 ? colors.button.radio.selected.background : colors.button.radio.background,
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 12
            }}>
                <Text style={{color: colors.text.primary, fontSize: 18}}>Bogey Golf</Text>
                <Text style={{color: colors.text.secondary}}>10-25 Handicap</Text>
                {state.skill === 1 && <SelectionCheck/>}
            </Pressable>
            <Pressable onPress={() => setSkill(2)} style={{
                borderWidth: 1,
                borderColor: state.skill === 2 ? colors.button.radio.selected.border : colors.button.radio.border,
                backgroundColor: state.skill === 2 ? colors.button.radio.selected.background : colors.button.radio.background,
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 12
            }}>
                <Text style={{color: colors.text.primary, fontSize: 18}}>Single Digit</Text>
                <Text style={{color: colors.text.secondary}}>&lt;10 Handicap</Text>
                {state.skill === 2 && <SelectionCheck/>}
            </Pressable>
        </View>
    )
}

function SelectableButton({ onPress, selected, title, subtitle }) {
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
                       {selected && <SelectionCheck/>}
                   </Pressable>
    )
}

function Frequency({ state, setState }) {
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
            <Pressable onPress={() => setFrequency(0)} style={{
                borderWidth: 1,
                borderColor: state.frequency === 0 ? colors.button.radio.selected.border : colors.button.radio.border,
                backgroundColor: state.frequency === 0 ? colors.button.radio.selected.background : colors.button.radio.background,
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 12
            }}>
                <Text style={{color: colors.text.primary, fontSize: 18}}>Occassionally</Text>
                <Text style={{color: colors.text.secondary}}>&lt;10 Rounds a year</Text>
                {state.frequency === 0 && <SelectionCheck/>}
            </Pressable>
            <Pressable onPress={() => setFrequency(1)} style={{
                borderWidth: 1,
                borderColor: state.frequency === 1 ? colors.button.radio.selected.border : colors.button.radio.border,
                backgroundColor: state.frequency === 1 ? colors.button.radio.selected.background : colors.button.radio.background,
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 12
            }}>
                <Text style={{color: colors.text.primary, fontSize: 18}}>Committed</Text>
                <Text style={{color: colors.text.secondary}}>10-30 Rounds a year </Text>
                {state.frequency === 1 && <SelectionCheck/>}
            </Pressable>
            <Pressable onPress={() => setFrequency(2)} style={{
                borderWidth: 1,
                borderColor: state.frequency === 2 ? colors.button.radio.selected.border : colors.button.radio.border,
                backgroundColor: state.frequency === 2 ? colors.button.radio.selected.background : colors.button.radio.background,
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 12
            }}>
                <Text style={{color: colors.text.primary, fontSize: 18}}>Addicted</Text>
                <Text style={{color: colors.text.secondary}}>30+ Rounds a year</Text>
                {state.frequency === 2 && <SelectionCheck/>}
            </Pressable>
        </View>
    )
}

function Putts({ state, setState }) {
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
            <Pressable onPress={() => setPutts(0)} style={{
                borderWidth: 1,
                borderColor: state.putts === 0 ? colorScheme === "light" ? "#ACCD30" : "#606E43" : colors.border.default,
                backgroundColor: state.putts === 0 ? colorScheme === "light" ? "rgba(191,209,123,0.4)" : "rgba(191,209,123,0.1)" : colors.background.primary,
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 12
            }}>
                <Text style={{color: colors.text.primary, fontSize: 18}}>3 Putt Pro</Text>
                <Text style={{color: colors.text.secondary}}>40+ Putts</Text>
                {state.putts === 0 && <SelectionCheck/>}
            </Pressable>
            <Pressable onPress={() => setPutts(1)} style={{
                borderWidth: 1,
                borderColor: state.putts === 1 ? colorScheme === "light" ? "#ACCD30" : "#606E43" : colors.border.default,
                backgroundColor: state.putts === 1 ? colorScheme === "light" ? "rgba(191,209,123,0.4)" : "rgba(191,209,123,0.1)" : colors.background.primary,
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 12
            }}>
                <Text style={{color: colors.text.primary, fontSize: 18}}>Average</Text>
                <Text style={{color: colors.text.secondary}}>30-40 Putts </Text>
                {state.putts === 1 && <SelectionCheck/>}
            </Pressable>
            <Pressable onPress={() => setPutts(2)} style={{
                borderWidth: 1,
                borderColor: state.putts === 2 ? colorScheme === "light" ? "#ACCD30" : "#606E43" : colors.border.default,
                backgroundColor: state.putts === 2 ? colorScheme === "light" ? "rgba(191,209,123,0.4)" : "rgba(191,209,123,0.1)" : colors.background.primary,
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 12
            }}>
                <Text style={{color: colors.text.primary, fontSize: 18}}>Pro</Text>
                <Text style={{color: colors.text.secondary}}>&lt;30 Putts</Text>
                {state.putts === 2 && <SelectionCheck/>}
            </Pressable>
            <Pressable onPress={() => setPutts(3)} style={{
                borderWidth: 1,
                borderColor: state.putts === 3 ? colorScheme === "light" ? "#ACCD30" : "#606E43" : colors.border.default,
                backgroundColor: state.putts === 3 ? colorScheme === "light" ? "rgba(191,209,123,0.4)" : "rgba(191,209,123,0.1)" : colors.background.primary,
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 12
            }}>
                <Text style={{color: colors.text.primary, fontSize: 18}}>No clue</Text>
                <Text style={{color: colors.text.secondary}}>We will just assume 30-40</Text>
                {state.putts === 3 && <SelectionCheck/>}
            </Pressable>
        </View>
    )
}

function Done({ nextTab }) {
    const colors = useColors();

    return (
        <View style={{ width: "80%", alignSelf: "center", height: "100%", paddingTop: 212 }}>
            <View style={{justifyContent: "center", flexDirection: "row", width: "100%"}}>
                <View style={{
                    padding: 12,
                    alignContent: "center",
                    flexDirection: "row",
                    justifyContent: "center",
                    borderRadius: 50,
                    backgroundColor: colors.button.primary.background
                }}>
                    <Svg width={24} height={24} stroke={"white"} xmlns="http://www.w3.org/2000/svg" fill="none"
                         viewBox="0 0 24 24" strokeWidth="3">
                        <Path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5"/>
                    </Svg>
                </View>
            </View>
            <ThemedText type={"header"} style={{fontWeight: 500, textAlign: "center", marginTop: 14}}>Account Created</ThemedText>
            <ThemedText type={"default"} secondary={true} style={{textAlign: "center", lineHeight: 18, marginTop: 10, marginBottom: 16}}>Your account has teed-off! Continue to begin your putting journey!</ThemedText>
            <Pressable onPress={nextTab} style={{
                backgroundColor: colors.button.primary.background,
                paddingVertical: 10,
                borderRadius: 10,
                marginTop: 16
            }}>
                <Text style={{
                    textAlign: "center",
                    color: colors.button.danger.text,
                    fontWeight: 500
                }}>Continue</Text>
            </Pressable>
        </View>
    );
}

function SelectionCheck({}) {
    return (
        <View style={{
            position: "absolute",
            right: -10,
            top: -10,
            backgroundColor: "#333D20",
            padding: 6,
            borderRadius: 50
        }}>
            <Svg width={18} height={18} stroke="white" xmlns="http://www.w3.org/2000/svg" fill="none"
                 viewBox="0 0 24 24" strokeWidth="3">
                <Path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5"/>
            </Svg>
        </View>
    )
}

function Signup({ errorCode, setErrorCode, setState, state, create}) {
    const router = useRouter();
    const colors = useColors();

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

    const validateEmail = (newEmail) => {
        const re = /^[\w\-\.]+@([\w-]+\.)+[\w-]{2,}$/;
        setInvalidEmail(!re.test(newEmail));
    }

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

            <ThemedText style={{fontSize: 16, marginTop: 12, marginBottom: 4}}>Username</ThemedText>
            <TextInput
                style={{
                    flex: 0,
                    borderWidth: 1,
                    borderColor: nameFocused ? colors.input.focused.border : colors.input.border,
                    borderRadius: 10,
                    paddingVertical: 8,
                    paddingHorizontal: 10,
                    fontSize: 16,
                    color: colors.input.text,
                    backgroundColor: nameFocused ? colors.input.focused.background : colors.input.background
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
            {errorCode === "auth/email-already-in-use" && <Text style={{color: colors.input.invalid.text, marginTop: 4 }}>That email is already in use!</Text>}

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
                        backgroundColor: invalidPassword ? colors.input.invalid.background : passwordFocused ? colors.input.focused.background : colors.input.backgroundd
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

            <Pressable onPress={() => {
                           if (invalidPassword || invalidEmail || state.username.length === 0) return;
                           create();
                       }} style={{
                paddingVertical: 10,
                borderRadius: 10,
                marginTop: 48,
                borderWidth: (invalidPassword || invalidEmail || state.username.length === 0) ? 1 : 0,
                borderColor: colors.button.disabled.border,
                backgroundColor: (invalidPassword || invalidEmail || state.username.length === 0) ? colors.button.disabled.background : colors.button.primary.border
            }}>
                <Text style={{textAlign: "center", color: (invalidPassword || invalidEmail || state.username.length === 0) ? colors.button.disabled.text : "white"}}>Create your account</Text>
            </Pressable>
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