import useColors from "../../hooks/useColors";
import {useRouter} from "expo-router";
import {Pressable} from "react-native";
import React from "react";
import FontText from "../general/FontText";

export function Session({session}) {
    const colors = useColors();
    const router = useRouter();
    const colorScheme = "light";

    const condensedType = {
        "real-simulation": "Round",
        "round-simulation": "Sim"
    }
    return (
        <Pressable onPress={() => router.push({pathname: "sessions/individual", params: {jsonSession: JSON.stringify(session), recap: false}})}
                   style={({pressed}) =>
                       [{
                           backgroundColor: colorScheme === "light" ? pressed ? colors.button.primary.depressed : colors.button.primary.background : pressed ? colors.button.primary.depressed : colors.button.primary.background,
                       }, {
                           flexDirection: "row",
                           borderBottomWidth: 1,
                           borderColor: colors.border.default,
                           paddingLeft: 12,
                           paddingVertical: 10
                       }]}>
            <FontText style={{color: colors.text.primary, fontSize: 18, flex: 0.7, textAlign: "left"}}>{condensedType[session.type]}</FontText>
            <FontText style={{color: colors.text.primary, fontSize: 18, flex: 1, textAlign: "center"}}>{new Date(session.timestamp).toLocaleDateString('en-US', {
                year: '2-digit',
                month: '2-digit',
                day: '2-digit'
            })}</FontText>
            <FontText style={{color: colors.text.primary, fontSize: 18, flex: 1, textAlign: "center"}}>{session.totalPutts}</FontText>
            <FontText style={{color: colors.text.primary, fontSize: 18, flex: 1, textAlign: "center"}}>{session.strokesGained}</FontText>
        </Pressable>
    )
}