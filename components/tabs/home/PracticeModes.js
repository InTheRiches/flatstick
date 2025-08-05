import {View} from "react-native";
import {PracticeMode} from "./PracticeMode";
import React from "react";
import {useAppContext} from "../../../contexts/AppContext";
import useColors from "../../../hooks/useColors";
import FontText from "../../general/FontText";
import {useRouter} from "expo-router";

export function PracticeModes({newSessionRef, newRealRoundRef, newFullRoundRef}) {
    const colors = useColors();
    const {userData} = useAppContext();

    const router = useRouter();

    return (
        <View style={{marginTop: 24, gap: 12, marginBottom: 18}}>
            <FontText style={{ fontSize: 18, fontWeight: 800 }}>RECORD NEW SESSION</FontText>
            <PracticeMode
                description={"Play a round of golf using score keeping along with detailed putt tracking."}
                name={"FULL ROUND TRACKING"}
                time={"90-240 min"}
                focus={"Realism"}
                onInfo={() => router.push({pathname: "/simulation/real/demo", params: {justInfo: true}})}
                onPress={() => router.push({pathname: `/simulation/full/setup`})}/>
            <PracticeMode
                description={"Track your putts from an actual round of golf."}
                name={"REAL PUTT TRACKING"}
                time={"90-240 min"}
                focus={"Realism"}
                onInfo={() => router.push({pathname: "/simulation/real/demo", params: {justInfo: true}})}
                onPress={() => newRealRoundRef.current.present()}/>
            <PracticeMode
                description={"A realistic mode simulating 9-18 unique holes to track putting performance and improve skills."}
                name={"PUTTING SIMULATION"}
                distance={userData.preferences.units === 0 ? "3 - 40ft" : "1 - 12m"}
                time={"10 - 20min"}
                focus={"Adaptability"}
                onInfo={() => router.push({pathname: "/simulation/round/demo", params: {justInfo: true}})}
                onPress={() => newSessionRef.current?.present()}/>
        </View>
    )
}