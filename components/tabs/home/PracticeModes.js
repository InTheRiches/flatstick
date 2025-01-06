import {Text, View} from "react-native";
import {PracticeMode} from "./PracticeMode";
import React from "react";
import {useAppContext} from "../../../contexts/AppCtx";
import useColors from "../../../hooks/useColors";

export function PracticeModes({newSessionRef, newRealRoundRef}) {
    const colors = useColors();
    const {puttSessions, updateStats} = useAppContext();

    return (
        <View style={{marginTop: puttSessions.length > 0 ? 0 : 24, gap: 12, marginBottom: 18}}>
            <Text style={{color: colors.text.primary, fontSize: 20, fontWeight: 500}}>New
                Practice</Text>
            <PracticeMode
                description={"A realistic mode simulating 18 unique holes to track putting performance and improve skills."}
                name={"18 Hole Simulation"}
                distance={"3 - 40ft"}
                time={"10 - 20min"}
                focus={"Adaptability"}
                onPress={() => newSessionRef.current?.present()}/>
            <PracticeMode
                description={"Allows you to track your putts from a real round, and keep track of real putts."}
                name={"Real Round Tracking"}
                distance={"~ ft"}
                time={"~ min"}
                focus={"Realism"}
                onPress={() => newRealRoundRef.current.present()}/>
            <View style={{
                backgroundColor: colors.background.secondary,
                borderRadius: 50,
                flexDirection: "row",
                alignSelf: "center",
                paddingHorizontal: 16,
                gap: 12,
                paddingVertical: 10
            }}>
                <Text style={{color: colors.text.primary, fontSize: 18}}>More coming soon!</Text>
            </View>
        </View>
    )
}