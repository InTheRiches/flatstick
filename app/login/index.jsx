import {Pressable, Text, TextInput, View} from "react-native";
import {useState} from "react";
import {SvgGoogle} from "@/assets/svg/SvgComponents";
import {getAuth} from "../../utils/firebase";
import {useRouter} from "expo-router";
import Loading from "../../components/general/popups/Loading";
import useColors from "../../hooks/useColors";
import {useSession} from "../../contexts/AppCtx";
import {SecondaryButton} from "../../components/general/buttons/SecondaryButton";
import {PrimaryButton} from "../../components/general/buttons/PrimaryButton";

const initialState = {
    password: "",
    email: "",
    invalid: false,
    emailFocused: false,
    passwordFocused: false,
    invalidEmail: false
}

// TODO add username validation (like length and stuff)
export default function Login() {
    const colors = useColors();
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

        // MAKE LOADING A SEE THROUGH LOADING MODAL SO IT ISN'T AS HARSH OF A TRANSITION
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
        updateField("password", password);

        if (errorCode !== "") setErrorCode("");
    }

    return (loading ? <Loading/> :
            <View style={{
                backgroundColor: colors.background.primary,
                width: "100%",
                height: "100%",
                paddingTop: 50,
                paddingHorizontal: 24,
                justifyContent: "center",
                alignContent: "center"
            }}>
                <Text style={{color: colors.text.primary, fontSize: 20, fontWeight: 600, marginBottom: 30}}>Sign in to your account</Text>
                <Text style={{color: colors.text.primary, fontSize: 16, marginBottom: 8}} secondary={true}>Login with:</Text>
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
                <Text style={{color: colors.text.primary, fontSize: 16, marginTop: 16, marginBottom: 4}}>Email Address</Text>
                <View style={{flexDirection: "row"}}>
                    <TextInput
                        style={{
                            flex: 1,
                            borderWidth: 1,
                            borderColor: state.emailFocused ? state.invalidEmail || errorCode === "auth/invalid-credential" ? colors.input.invalid.focusedBorder : colors.input.focused.border : state.invalidEmail || errorCode === "auth/invalid-credential" ? colors.input.invalid.border : colors.input.border,
                            borderRadius: 10,
                            paddingVertical: 8,
                            paddingHorizontal: 10,
                            fontSize: 16,
                            color: state.invalidEmail || errorCode === "auth/invalid-credential" ? colors.input.invalid.text : colors.input.text,
                            backgroundColor: state.invalidEmail || errorCode === "auth/invalid-credential" ? colors.input.invalid.background : state.emailFocused ? colors.input.focused.background : colors.input.background
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
                            borderColor: state.passwordFocused ? errorCode === "auth/invalid-credential" ? colors.input.invalid.focusedBorder : colors.input.focused.border : errorCode === "auth/invalid-credential" ? colors.input.invalid.border : colors.input.border,
                            borderRadius: 10,
                            paddingVertical: 8,
                            paddingHorizontal: 10,
                            fontSize: 16,
                            color: errorCode === "auth/invalid-credential" ? colors.input.invalid.text : colors.input.text,
                            backgroundColor: errorCode === "auth/invalid-credential" ? colors.input.invalid.background : state.passwordFocused ? colors.input.focused.background : colors.input.background
                        }}
                        onFocus={() => updateField("passwordFocused", true)}
                        onBlur={() => updateField("passwordFocused", false)}
                        secureTextEntry={true}
                        value={state.password}
                        onChangeText={(text) => updatePassword(text)}
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
                    <Text style={{color: colors.input.invalid.text, marginTop: 4}}>Please check your email and password
                        and try again.</Text>}
                <PrimaryButton onPress={() => {
                    if (state.invalidEmail) return;
                    login();
                }} style={{
                    paddingVertical: 10,
                    borderRadius: 10,
                    marginTop: 48,
                }} disabled={state.invalidEmail || state.email.length === 0 || state.password.length === 0}></PrimaryButton>

                <Pressable onPress={() => router.push({pathname: `/signup`})} style={({pressed}) => [{
                    marginTop: 32,
                    borderWidth: 1,
                    borderRadius: 12,
                    backgroundColor: pressed ? colors.button.disabled.background : colors.background.secondary,
                    borderColor: colors.border.default,
                    paddingVertical: 10
                }]}>
                    <Text style={{color: colors.text.primary, textAlign: "center"}}>Don't have an account? Click <Text
                        style={{color: colors.text.link}}>here</Text> to signup.</Text>
                </Pressable>
            </View>
    )
}