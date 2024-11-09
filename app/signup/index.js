import {ThemedText} from "@/components/ThemedText";
import {View, Text, Pressable, TextInput} from "react-native";
import {Colors} from "@/constants/Colors";
import {useColorScheme} from "@/hooks/useColorScheme";
import {useState} from "react";
import Svg, {Path} from "react-native-svg";
import {SvgArrow, SvgGoogle} from "@/assets/svg/SvgComponents";
import {createUserWithEmailAndPassword, getAuth, updateProfile} from "firebase/auth";
import {getFirestore, setDoc, doc} from "firebase/firestore";
import {useRouter} from "expo-router";

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
    const colorScheme = useColorScheme();
    const db = getFirestore();
    const router = useRouter();

    const [state, setState] = useState(initialState);

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

        createUserWithEmailAndPassword(auth, state.email, state.password)
            .then((userCredential) => {
                // Signed up
                const user = userCredential.user;

                updateProfile(user, {
                    displayName: state.username,
                }).then(() => {

                }).catch((error) => {

                });

                console.log(user.uid)

                setDoc(doc(db, `users/${user.uid}`), {
                    skill: state.skill,
                    frequency: state.frequency,
                    putts: state.putts,
                    date: new Date().toISOString(),
                    totalPutts: 0,
                    username: state.username
                }).then((data) => {
                    console.log("made document");
                })
                    .catch((error) => {
                        console.log(error);
                    });
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;


            });

        setState(prevState => ({
            ...prevState,
            tab: prevState.tab + 1,
        }));
    }

    return (
        <View style={{
            backgroundColor: Colors[colorScheme ?? "light"].backgroundColor,
            width: "100%",
            height: "100%",
            paddingTop: 50,
            paddingHorizontal: 24,
            justifyContent: "center",
            alignContent: "center"
        }}>
            {state.tab === 0 && <Skill colorScheme={colorScheme} state={state} setState={setState}/>}
            {state.tab === 1 && <Frequency colorScheme={colorScheme} state={state} setState={setState}/>}
            {state.tab === 2 && <Putts colorScheme={colorScheme} state={state} setState={setState}/>}
            {state.tab === 3 &&
                <Signup colorScheme={colorScheme} state={state} setState={setState} create={createAccount}/>}
            {state.tab === 4 && <Done/>}
            <View style={{
                display: state.tab === 3 || state.tab === 5 ? "none" : "static",
                flexDirection: "row",
                justifyContent: "center",
                alignContent: "center"
            }}>
                <Pressable onPress={nextTab} style={{
                    backgroundColor: Colors[colorScheme ?? "light"].buttonPrimaryBorder,
                    padding: 16,
                    aspectRatio: 1,
                    borderRadius: 50,
                    marginTop: 48
                }}>
                    <SvgArrow width={16} height={16} stroke={"white"}
                              style={{transform: [{rotate: "45deg"}]}}></SvgArrow>
                </Pressable>
            </View>
        </View>
    )
}

function Skill({colorScheme, state, setState}) {
    const setSkill = (id) => {
        setState(prevState => ({
            ...prevState,
            skill: id,
        }));
    }

    return (
        <View style={{flexDirection: "column", gap: 10}}>
            <ThemedText type={"title"} style={{marginBottom: 30}}>What is your skill level?</ThemedText>
            <Pressable onPress={() => setSkill(0)} style={{
                borderWidth: 1,
                borderColor: state.skill === 0 ? Colors[colorScheme ?? "light"].buttonPrimaryBorder : Colors[colorScheme ?? "light"].border,
                backgroundColor: state.skill === 0 ? Colors[colorScheme ?? "light"].buttonPrimaryBackground : Colors[colorScheme ?? "light"].background,
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 12
            }}>
                <Text style={{color: Colors[colorScheme ?? "light"].text, fontSize: 18}}>Hacker</Text>
                <Text style={{color: Colors[colorScheme ?? "light"].textSecondary}}>25+ Handicap (or unknown)</Text>
                {state.skill === 0 && <SelectionCheck/>}
            </Pressable>
            <Pressable onPress={() => setSkill(1)} style={{
                borderWidth: 1,
                borderColor: state.skill === 1 ? Colors[colorScheme ?? "light"].buttonPrimaryBorder : Colors[colorScheme ?? "light"].border,
                backgroundColor: state.skill === 1 ? Colors[colorScheme ?? "light"].buttonPrimaryBackground : Colors[colorScheme ?? "light"].background,
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 12
            }}>
                <Text style={{color: Colors[colorScheme ?? "light"].text, fontSize: 18}}>Bogey Golf</Text>
                <Text style={{color: Colors[colorScheme ?? "light"].textSecondary}}>10-25 Handicap</Text>
                {state.skill === 1 && <SelectionCheck/>}
            </Pressable>
            <Pressable onPress={() => setSkill(2)} style={{
                borderWidth: 1,
                borderColor: state.skill === 2 ? Colors[colorScheme ?? "light"].buttonPrimaryBorder : Colors[colorScheme ?? "light"].border,
                backgroundColor: state.skill === 2 ? Colors[colorScheme ?? "light"].buttonPrimaryBackground : Colors[colorScheme ?? "light"].background,
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 12
            }}>
                <Text style={{color: Colors[colorScheme ?? "light"].text, fontSize: 18}}>Single Digit</Text>
                <Text style={{color: Colors[colorScheme ?? "light"].textSecondary}}>&lt;10 Handicap</Text>
                {state.skill === 2 && <SelectionCheck/>}
            </Pressable>
        </View>
    )
}

function Frequency({colorScheme, state, setState}) {
    const setFrequency = (id) => {
        setState(prevState => ({
            ...prevState,
            frequency: id,
        }));
    }

    return (
        <View style={{flexDirection: "column", gap: 10}}>
            <ThemedText type={"title"} style={{marginBottom: 30}}>How often do you play?</ThemedText>
            <Pressable onPress={() => setFrequency(0)} style={{
                borderWidth: 1,
                borderColor: state.frequency === 0 ? Colors[colorScheme ?? "light"].buttonPrimaryBorder : Colors[colorScheme ?? "light"].border,
                backgroundColor: state.frequency === 0 ? Colors[colorScheme ?? "light"].buttonPrimaryBackground : Colors[colorScheme ?? "light"].background,
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 12
            }}>
                <Text style={{color: Colors[colorScheme ?? "light"].text, fontSize: 18}}>Occassionally</Text>
                <Text style={{color: Colors[colorScheme ?? "light"].textSecondary}}>&lt;10 Rounds a year</Text>
                {state.frequency === 0 && <SelectionCheck/>}
            </Pressable>
            <Pressable onPress={() => setFrequency(1)} style={{
                borderWidth: 1,
                borderColor: state.frequency === 1 ? Colors[colorScheme ?? "light"].buttonPrimaryBorder : Colors[colorScheme ?? "light"].border,
                backgroundColor: state.frequency === 1 ? Colors[colorScheme ?? "light"].buttonPrimaryBackground : Colors[colorScheme ?? "light"].background,
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 12
            }}>
                <Text style={{color: Colors[colorScheme ?? "light"].text, fontSize: 18}}>Committed</Text>
                <Text style={{color: Colors[colorScheme ?? "light"].textSecondary}}>10-30 Rounds a year </Text>
                {state.frequency === 1 && <SelectionCheck/>}
            </Pressable>
            <Pressable onPress={() => setFrequency(2)} style={{
                borderWidth: 1,
                borderColor: state.frequency === 2 ? Colors[colorScheme ?? "light"].buttonPrimaryBorder : Colors[colorScheme ?? "light"].border,
                backgroundColor: state.frequency === 2 ? Colors[colorScheme ?? "light"].buttonPrimaryBackground : Colors[colorScheme ?? "light"].background,
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 12
            }}>
                <Text style={{color: Colors[colorScheme ?? "light"].text, fontSize: 18}}>Addicted</Text>
                <Text style={{color: Colors[colorScheme ?? "light"].textSecondary}}>30+ Rounds a year</Text>
                {state.frequency === 2 && <SelectionCheck/>}
            </Pressable>
        </View>
    )
}

function Putts({colorScheme, state, setState}) {
    const setPutts = (id) => {
        setState(prevState => ({
            ...prevState,
            putts: id,
        }));
    }

    return (
        <View style={{flexDirection: "column", gap: 10}}>
            <ThemedText type={"title"} style={{marginBottom: 30}}>How many putts per round?</ThemedText>
            <Pressable onPress={() => setPutts(0)} style={{
                borderWidth: 1,
                borderColor: state.putts === 0 ? Colors[colorScheme ?? "light"].buttonPrimaryBorder : Colors[colorScheme ?? "light"].border,
                backgroundColor: state.putts === 0 ? Colors[colorScheme ?? "light"].buttonPrimaryBackground : Colors[colorScheme ?? "light"].background,
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 12
            }}>
                <Text style={{color: Colors[colorScheme ?? "light"].text, fontSize: 18}}>3 Putt Pro</Text>
                <Text style={{color: Colors[colorScheme ?? "light"].textSecondary}}>40+ Putts</Text>
                {state.putts === 0 && <SelectionCheck/>}
            </Pressable>
            <Pressable onPress={() => setPutts(1)} style={{
                borderWidth: 1,
                borderColor: state.putts === 1 ? Colors[colorScheme ?? "light"].buttonPrimaryBorder : Colors[colorScheme ?? "light"].border,
                backgroundColor: state.putts === 1 ? Colors[colorScheme ?? "light"].buttonPrimaryBackground : Colors[colorScheme ?? "light"].background,
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 12
            }}>
                <Text style={{color: Colors[colorScheme ?? "light"].text, fontSize: 18}}>Average</Text>
                <Text style={{color: Colors[colorScheme ?? "light"].textSecondary}}>30-40 Putts </Text>
                {state.putts === 1 && <SelectionCheck/>}
            </Pressable>
            <Pressable onPress={() => setPutts(2)} style={{
                borderWidth: 1,
                borderColor: state.putts === 2 ? Colors[colorScheme ?? "light"].buttonPrimaryBorder : Colors[colorScheme ?? "light"].border,
                backgroundColor: state.putts === 2 ? Colors[colorScheme ?? "light"].buttonPrimaryBackground : Colors[colorScheme ?? "light"].background,
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 12
            }}>
                <Text style={{color: Colors[colorScheme ?? "light"].text, fontSize: 18}}>Pro</Text>
                <Text style={{color: Colors[colorScheme ?? "light"].textSecondary}}>&lt;30 Putts</Text>
                {state.putts === 2 && <SelectionCheck/>}
            </Pressable>
            <Pressable onPress={() => setPutts(3)} style={{
                borderWidth: 1,
                borderColor: state.putts === 3 ? Colors[colorScheme ?? "light"].buttonPrimaryBorder : Colors[colorScheme ?? "light"].border,
                backgroundColor: state.putts === 3 ? Colors[colorScheme ?? "light"].buttonPrimaryBackground : Colors[colorScheme ?? "light"].background,
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 12
            }}>
                <Text style={{color: Colors[colorScheme ?? "light"].text, fontSize: 18}}>No clue</Text>
                <Text style={{color: Colors[colorScheme ?? "light"].textSecondary}}>We will just assume 30-40</Text>
                {state.putts === 3 && <SelectionCheck/>}
            </Pressable>
        </View>
    )
}

function Name({colorScheme, state, setState}) {

}

function Done({}) {
    return (
        <View style={{flexDirection: "row", gap: 10, flex: 0, justifyContent: "center"}}>
            <View style={{
                backgroundColor: "#3EC264",
                padding: 4,
                borderRadius: 50,
                aspectRatio: 1,
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center"
            }}>
                <Svg width={18} height={18} stroke="white" xmlns="http://www.w3.org/2000/svg" fill="none"
                     viewBox="0 0 24 24" strokeWidth="3">
                    <Path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5"/>
                </Svg>
            </View>
            <ThemedText type={"title"} style={{flex: 0}}>Your All Done!</ThemedText>
        </View>
    );
}

function SelectionCheck({}) {
    return (
        <View style={{
            position: "absolute",
            right: -7,
            top: -7,
            backgroundColor: "#06B2FF",
            padding: 4,
            borderRadius: 50
        }}>
            <Svg width={18} height={18} stroke="white" xmlns="http://www.w3.org/2000/svg" fill="none"
                 viewBox="0 0 24 24" strokeWidth="3">
                <Path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5"/>
            </Svg>
        </View>
    )
}

function Signup({colorScheme, setState, state, create}) {
    const router = useRouter();

    const [emailFocused, setEmailFocused] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const [invalidPassword, setInvalidPassword] = useState(false);
    const [nameFocused, setNameFocused] = useState(false);
    const [invalidEmail, setInvalidEmail] = useState(false);

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
                    borderColor: Colors[colorScheme ?? "light"].buttonSecondaryBorder,
                    backgroundColor: Colors[colorScheme ?? "light"].buttonSecondaryBackground
                }}>
                    <SvgGoogle fill={Colors[colorScheme ?? "light"].buttonSecondaryText}
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
                    borderColor: Colors[colorScheme ?? "light"].buttonSecondaryBorder,
                    backgroundColor: Colors[colorScheme ?? "light"].buttonSecondaryBackground
                }}>
                    <SvgGoogle fill={Colors[colorScheme ?? "light"].buttonSecondaryText}
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
                    borderColor: nameFocused ? Colors[colorScheme ?? "light"].buttonPrimaryBorder : Colors[colorScheme ?? "light"].buttonSecondaryBorder,
                    borderRadius: 10,
                    paddingVertical: 4,
                    paddingHorizontal: 10,
                    fontSize: 16,
                    color: Colors[colorScheme ?? "light"].text,
                    backgroundColor: Colors[colorScheme ?? "light"].buttonSecondaryBackground
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
                        paddingVertical: 4,
                        paddingHorizontal: 10,
                        fontSize: 16,
                        color: invalidEmail ? Colors[colorScheme ?? "light"].inputInvalidText : Colors[colorScheme ?? "light"].text,
                        backgroundColor: invalidEmail ? Colors[colorScheme ?? "light"].inputInvalidBackground : Colors[colorScheme ?? "light"].inputBackground
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

            <ThemedText style={{fontSize: 16, marginTop: 16, marginBottom: 4}}>Password</ThemedText>
            <View style={{flexDirection: "row", marginBottom: 12}}>
                <TextInput
                    style={{
                        flex: 1,
                        borderWidth: 1,
                        borderColor: passwordFocused ? invalidPassword ? Colors[colorScheme ?? "light"].inputInvalidFocusedBorder : Colors[colorScheme ?? "light"].buttonPrimaryBorder : invalidPassword ? Colors[colorScheme ?? "light"].inputInvalidBorder : Colors[colorScheme ?? "light"].buttonSecondaryBorder,
                        borderRadius: 10,
                        paddingVertical: 4,
                        paddingHorizontal: 10,
                        fontSize: 16,
                        color: invalidPassword ? Colors[colorScheme ?? "light"].inputInvalidText : Colors[colorScheme ?? "light"].text,
                        backgroundColor: invalidPassword ? Colors[colorScheme ?? "light"].inputInvalidBackground : Colors[colorScheme ?? "light"].buttonSecondaryBackground
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
            <Text style={{color: !requirements.invalid ? '#16a34a' : Colors[colorScheme ?? "light"].inputInvalidText}}>Password
                Requirements:</Text>
            <View style={{flexDirection: "row", gap: 10, alignContent: "center"}}>
                {requirements.hasLength ? <ValidRequirement/> : <InvalidRequirement/>}
                <Text
                    style={{color: requirements.hasLength ? '#16a34a' : Colors[colorScheme ?? "light"].inputInvalidText}}>At
                    least 6 characters</Text>
            </View>
            <View style={{flexDirection: "row", gap: 10, alignContent: "center"}}>
                {requirements.hasNumber ? <ValidRequirement/> : <InvalidRequirement/>}
                <Text
                    style={{color: requirements.hasNumber ? '#16a34a' : Colors[colorScheme ?? "light"].inputInvalidText}}>At
                    least 1 number</Text>
            </View>
            <View style={{flexDirection: "row", gap: 10, alignContent: "center"}}>
                {requirements.hasUppercase ? <ValidRequirement/> : <InvalidRequirement/>}
                <Text
                    style={{color: requirements.hasUppercase ? '#16a34a' : Colors[colorScheme ?? "light"].inputInvalidText}}>Contains
                    an uppercase</Text>
            </View>
            <View style={{flexDirection: "row", gap: 10, alignContent: "center"}}>
                {requirements.hasLowercase ? <ValidRequirement/> : <InvalidRequirement/>}
                <Text
                    style={{color: requirements.hasLowercase ? '#16a34a' : Colors[colorScheme ?? "light"].inputInvalidText}}>Contains
                    a lowercase</Text>
            </View>

            <Pressable onPress={create} style={{
                paddingVertical: 10,
                borderRadius: 10,
                marginTop: 48,
                backgroundColor: Colors[colorScheme ?? "light"].buttonPrimaryBorder
            }}>
                <Text style={{textAlign: "center", color: "white"}}>Create your account</Text>
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