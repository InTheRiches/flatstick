import useColors from "../../hooks/useColors";
import React, {useState} from "react";
import {getAuth, sendPasswordResetEmail} from "firebase/auth";
import {BottomSheetModal, BottomSheetTextInput, BottomSheetView} from "@gorhom/bottom-sheet";
import CustomBackdrop from "../general/popups/CustomBackdrop";
import {ActivityIndicator, View} from "react-native";
import {SecondaryButton} from "../general/buttons/SecondaryButton";
import Svg, {Path} from "react-native-svg";
import FontText from "../general/FontText";

export default function ResetPassword({resetPasswordRef}) {
    const colors = useColors();
    const [email, setEmail] = useState("");
    const [emailInvalid, setEmailInvalid] = useState(false);
    const [emailFocused, setEmailFocused] = useState(false);
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);

    const [error, setError] = useState("");

    const updateEmail = (text) => {
        setEmail(text);
        setEmailInvalid(!text.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/));
        if (error.length !== 0) setError("");
    }

    const submit = () => {
        if (email.length < 6) return;

        setLoading(true);

        sendPasswordResetEmail(getAuth(), email).then(() => {
            setDone(true);

            setTimeout(() => {
                resetPasswordRef.current.dismiss();
                setDone(false);
                setLoading(false);
                setEmail("");
            }, 3000);
        }).catch((error) => {
            setError(error.message);
            setLoading(false);
            setEmailFocused(false);
        });
    }

    return (
        <BottomSheetModal
            backdropComponent={({animatedIndex, style}) => <CustomBackdrop reference={resetPasswordRef} animatedIndex={animatedIndex} style={style}/>}
            enableDismissOnClose={true}
            handleIndicatorStyle={{backgroundColor: colors.text.primary}}
            ref={resetPasswordRef}
            keyboardBlurBehavior={"restore"}
            backgroundStyle={{backgroundColor: colors.background.primary}}>
            <BottomSheetView style={{paddingBottom: 64, marginHorizontal: 24, backgroundColor: colors.background.primary, gap: 12}}>
                <FontText style={{marginTop: 12, fontSize: 22, color: colors.text.primary, fontWeight: 500}}>Reset Password</FontText>
                {   done ? (
                    <View style={{flexDirection: "row", gap: 12}}>
                        <View style={{
                            backgroundColor: "#40C2FF",
                            aspectRatio: 1,
                            justifyContent: "center",
                            alignItems: "center",
                            borderRadius: 50,
                            marginVertical: 10
                        }}>
                            <Svg width={26} height={26} stroke={colors.checkmark.color}
                                 xmlns="http://www.w3.org/2000/svg"
                                 fill="none"
                                 viewBox="0 0 24 24" strokeWidth="3">
                                <Path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5"/>
                            </Svg>
                        </View>
                        <FontText style={{color: colors.text.primary, fontSize: 16, marginBottom: 4, flex: 1}}>An email has been sent to <FontText style={{fontWeight: 700}}>{email}</FontText> with instructions on how to reset your password.</FontText>
                    </View>
                ) : loading ? (
                        <ActivityIndicator size="large"/>
                    ) : (
                        <>
                            <FontText style={{color: colors.text.primary, fontSize: 16, marginBottom: 4}}>Email Address</FontText>
                            <View style={{flexDirection: "row", gap: 10}}>
                                <BottomSheetTextInput
                                    style={{
                                        flex: 1,
                                        borderWidth: 1,
                                        borderColor: emailFocused ? emailInvalid ? colors.input.invalid.focusedBorder : colors.input.focused.border : emailInvalid ? colors.input.invalid.border : colors.input.border,
                                        borderRadius: 10,
                                        paddingVertical: 8,
                                        paddingHorizontal: 10,
                                        fontSize: 16,
                                        color: emailInvalid ? colors.input.invalid.text : colors.input.text,
                                        backgroundColor: emailInvalid ? colors.input.invalid.background : emailFocused ? colors.input.focused.background : colors.input.background
                                    }}
                                    defaultValue={email}
                                    onFocus={() => setEmailFocused(true)}
                                    onBlur={() => setEmailFocused(false)}
                                    onChangeText={(text) => updateEmail(text)}
                                />
                                {emailInvalid && <FontText style={{
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
                                }}>!</FontText>}
                                <SecondaryButton style={{aspectRatio: 1, borderRadius: 10}} onPress={submit} disabled={emailInvalid}>
                                    <Svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={emailInvalid ? colors.button.disabled.text : colors.button.secondary.text} stroke={emailInvalid ? colors.button.disabled.text : colors.button.secondary.text} width={20} height={20} strokeWidth={1}>
                                        <Path fillRule="evenodd"
                                              d="M12.97 3.97a.75.75 0 0 1 1.06 0l7.5 7.5a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 1 1-1.06-1.06l6.22-6.22H3a.75.75 0 0 1 0-1.5h16.19l-6.22-6.22a.75.75 0 0 1 0-1.06Z"
                                              clipRule="evenodd"/>
                                    </Svg>
                                </SecondaryButton>
                            </View>
                            {emailInvalid &&
                                <FontText style={{color: colors.input.invalid.text, marginTop: -6}}>Enter a valid email!</FontText>}
                            {error &&
                                <FontText style={{color: colors.input.invalid.text, marginTop: -6}}>There is no account with that email!</FontText>}
                        </>
                    )
                }
            </BottomSheetView>
        </BottomSheetModal>
    );
}