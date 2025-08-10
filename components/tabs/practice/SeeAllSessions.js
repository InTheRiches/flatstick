import {View} from "react-native";
import Svg, {Path} from "react-native-svg";
import React from "react";
import {useRouter} from "expo-router";
import {useAppContext} from "../../../contexts/AppContext";
import {SecondaryButton} from "../../general/buttons/SecondaryButton";
import useColors from "../../../hooks/useColors";
import FontText from "../../general/FontText";

export function SeeAllSessions({}) {
    const router = useRouter();
    const {sessions} = useAppContext();
    const colors = useColors();

    if (sessions.length === 0)
        return <></>

    return (
        <SecondaryButton onPress={() => router.push({pathname: "sessions", params: {puttSessionsString: JSON.stringify(sessions)}})} style={{
                borderRadius: 50,
                flexDirection: "row",
                alignSelf: "center",
                paddingLeft: 12,
                gap: 12,
                paddingRight: 8,
                paddingVertical: 6,
                marginTop: 12,
            }}>
                <FontText style={{color: colors.button.secondary.text, fontSize: 18}}>See All Sessions</FontText>
                <View style={{borderRadius: 30, padding: 6, backgroundColor: colors.button.secondary.text}}>
                    <Svg width={20} height={20} xmlns="http://www.w3.org/2000/svg" fill="none"
                         viewBox="0 0 24 24" strokeWidth={1.5}
                         stroke={colors.button.secondary.background} className="size-6">
                        <Path strokeLinecap="round" strokeLinejoin="round"
                              d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25"/>
                    </Svg>
                </View>
            </SecondaryButton>
    )
}