import useColors from "../../hooks/useColors";
import {useRouter} from "expo-router";
import {Pressable} from "react-native";
import React from "react";
import FontText from "../general/FontText";

export function Session({session, userId}) {
    const colors = useColors();
    const router = useRouter();
    const colorScheme = "light";

    const condensedType = {
        "real": "Putts",
        "green": "Sim",
        "sim": "Sim",
        "full": "Full",
    }
    return (
        <Pressable onPress={() => router.push({pathname: session.meta.type === "full" ? "sessions/individual/full" : "sessions/individual", params: {jsonSession: JSON.stringify(session), recap: false, userId}})}
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
            <FontText style={{color: colors.text.primary, fontSize: 18, flex: 0.5, textAlign: "left"}}>{condensedType[session.meta.type]}</FontText>
            <FontText style={{color: colors.text.primary, fontSize: 18, flex: 1, textAlign: "center"}}>{new Date(session.meta.date).toLocaleDateString('en-US', {
                year: '2-digit',
                month: '2-digit',
                day: '2-digit'
            })}</FontText>
            <FontText style={{color: colors.text.primary, fontSize: 18, flex: 0.7, textAlign: "center"}}>{session.stats.holes}</FontText>
            <FontText style={{color: colors.text.primary, fontSize: 18, flex: 0.7, textAlign: "center"}}>{session.stats.totalPutts}</FontText>
            <FontText style={{color: colors.text.primary, fontSize: 18, flex: 0.7, textAlign: "center"}}>{session.stats.strokesGained > 0 ? "+" : ""}{session.stats.strokesGained}</FontText>
        </Pressable>
    )
}