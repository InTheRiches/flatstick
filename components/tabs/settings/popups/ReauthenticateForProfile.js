import React, {useState} from "react";
import {BottomSheetModal, BottomSheetTextInput, BottomSheetView} from "@gorhom/bottom-sheet";
import CustomBackdrop from "../../../general/popups/CustomBackdrop";
import useColors from "../../../../hooks/useColors";
import {Platform, TextInput, View} from "react-native";
import {SecondaryButton} from "../../../general/buttons/SecondaryButton";
import Svg, {Path} from "react-native-svg";
import {EmailAuthProvider, getAuth, reauthenticateWithCredential} from 'firebase/auth'
import {useRouter} from "expo-router";
import FontText from "../../../general/FontText";

export function ReauthenticateForProfile({reauthenticateRef}) {
    const colors = useColors();
    const [password, setPassword] = useState("");
    const [passwordInvalid, setPasswordInvalid] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);

    const router = useRouter();

    const updatePassword = (text) => {
        setPassword(text);
    }

    const submit = () => {
        if (password.length < 6) return;

        const auth = getAuth()
        const credential = EmailAuthProvider.credential(
            auth.currentUser.email,
            password
        )
        reauthenticateWithCredential(auth.currentUser, credential).then(() => {
            router.push({pathname: "/settings/user"})
            reauthenticateRef.current.dismiss();
            setPassword("");
        }).catch((error) => {
            setPasswordInvalid(true);
        });
    }

    return (
        <BottomSheetModal
              backdropComponent={({animatedIndex, style}) => <CustomBackdrop reference={reauthenticateRef} animatedIndex={animatedIndex} style={style}/>}
              enableDismissOnClose={true}
              handleIndicatorStyle={{backgroundColor: colors.text.primary}}
              ref={reauthenticateRef}
              keyboardBlurBehavior={"restore"}
              backgroundStyle={{backgroundColor: colors.background.primary}}>
            <BottomSheetView style={{paddingBottom: 64, marginHorizontal: 24, backgroundColor: colors.background.primary, gap: 12}}>
                <FontText style={{marginTop: 12, fontSize: 18, color: colors.text.primary, fontWeight: 500}}>Re-Authenticate</FontText>
                <FontText style={{color: colors.text.secondary, fontWeight: 600}}>PASSWORD</FontText>
                <View style={{flexDirection: "row", gap: 10}}>
                    {Platform.OS === "ios" ? (
                        <BottomSheetTextInput
                            style={{
                                flex: 1,
                                borderWidth: 1,
                                borderColor: passwordFocused ? passwordInvalid ? colors.input.invalid.focusedBorder : colors.input.focused.border : passwordInvalid ? colors.input.invalid.border : colors.input.border,
                                borderRadius: 10,
                                paddingVertical: 8,
                                paddingHorizontal: 10,
                                fontSize: 16,
                                color: passwordInvalid? colors.input.invalid.text : colors.input.text,
                                backgroundColor: passwordInvalid? colors.input.invalid.background : passwordFocused ? colors.input.focused.background : colors.input.background
                            }}
                            secureTextEntry={true}
                            onFocus={() => setPasswordFocused(true)}
                            onBlur={() => setPasswordFocused(false)}
                            onChangeText={(text) => updatePassword(text)}
                        />
                    ) : (
                        <TextInput
                            style={{
                                flex: 1,
                                borderWidth: 1,
                                borderColor: passwordFocused ? passwordInvalid ? colors.input.invalid.focusedBorder : colors.input.focused.border : passwordInvalid ? colors.input.invalid.border : colors.input.border,
                                borderRadius: 10,
                                paddingVertical: 8,
                                paddingHorizontal: 10,
                                fontSize: 16,
                                color: passwordInvalid? colors.input.invalid.text : colors.input.text,
                                backgroundColor: passwordInvalid? colors.input.invalid.background : passwordFocused ? colors.input.focused.background : colors.input.background
                            }}
                            secureTextEntry={true}
                            onFocus={() => setPasswordFocused(true)}
                            onBlur={() => setPasswordFocused(false)}
                            onChangeText={(text) => updatePassword(text)}
                        />
                    )}
                    {passwordInvalid && <FontText style={{
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
                    <SecondaryButton style={{aspectRatio: 1, borderRadius: 10}} onPress={submit} disabled={password.length < 6}>
                        <Svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={password.length < 6 ? colors.button.disabled.text : colors.button.secondary.text} stroke={password.length < 6 ? colors.button.disabled.text : colors.button.secondary.text} width={20} height={20} strokeWidth={1}>
                            <Path fillRule="evenodd"
                                  d="M12.97 3.97a.75.75 0 0 1 1.06 0l7.5 7.5a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 1 1-1.06-1.06l6.22-6.22H3a.75.75 0 0 1 0-1.5h16.19l-6.22-6.22a.75.75 0 0 1 0-1.06Z"
                                  clipRule="evenodd"/>
                        </Svg>

                    </SecondaryButton>
                </View>
                {passwordInvalid &&
                    <FontText style={{color: colors.input.invalid.text, marginTop: -6}}>That password is incorrect!</FontText>}
            </BottomSheetView>
        </BottomSheetModal>
    );
}