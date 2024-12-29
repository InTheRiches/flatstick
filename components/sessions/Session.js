import useColors from "../../hooks/useColors";
import {useRouter} from "expo-router";
import {Pressable, Text, useColorScheme} from "react-native";
import React from "react";

export function Session({session}) {
    const colors = useColors();
    const router = useRouter();
    const colorScheme = useColorScheme();

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
            <Text style={{color: colors.text.primary, fontSize: 18, flex: 0.7, textAlign: "left"}}>{condensedType[session.type]}</Text>
            <Text style={{color: colors.text.primary, fontSize: 18, flex: 1, textAlign: "center"}}>{new Date(session.timestamp).toLocaleDateString('en-US', {
                year: '2-digit',
                month: '2-digit',
                day: '2-digit'
            })}</Text>
            <Text style={{color: colors.text.primary, fontSize: 18, flex: 1, textAlign: "center"}}>{session.totalPutts}</Text>
            <Text style={{color: colors.text.primary, fontSize: 18, flex: 1, textAlign: "center"}}>{session.strokesGained}</Text>
        </Pressable>
    )
}