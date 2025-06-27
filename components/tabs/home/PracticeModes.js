import {View} from "react-native";
import {PracticeMode} from "./PracticeMode";
import React from "react";
import {useAppContext} from "../../../contexts/AppCtx";
import useColors from "../../../hooks/useColors";
import FontText from "../../general/FontText";
import {useRouter} from "expo-router";

export function PracticeModes({newSessionRef, newRealRoundRef, newFullRoundRef}) {
    const colors = useColors();
    const {userData} = useAppContext();

    const router = useRouter();

    return (
        <View style={{marginTop: 24, gap: 12, marginBottom: 18}}>
            <FontText style={{color: colors.text.primary, fontSize: 20, fontWeight: 500}}>Record New Session</FontText>
            <PracticeMode
                description={"Play a round of golf using a GPS rangefinder and score keeping, along with detailed putt tracking."}
                name={"Full Round Tracking"}
                time={"90-240 min"}
                focus={"Realism"}
                onInfo={() => router.push({pathname: "/simulation/real/demo", params: {justInfo: true}})}
                onPress={() => router.push({pathname: `/simulation/full/setup`})}/>
            <PracticeMode
                description={"Track your putts from an actual round of golf."}
                name={"Real Putt Tracking"}
                time={"90-240 min"}
                focus={"Realism"}
                onInfo={() => router.push({pathname: "/simulation/real/demo", params: {justInfo: true}})}
                onPress={() => newRealRoundRef.current.present()}/>
            <PracticeMode
                description={"A realistic mode simulating 18 unique holes to track putting performance and improve skills."}
                name={"18 Hole Simulation"}
                distance={userData.preferences.units === 0 ? "3 - 40ft" : "1 - 12m"}
                time={"10 - 20min"}
                focus={"Adaptability"}
                onInfo={() => router.push({pathname: "/simulation/round/demo", params: {justInfo: true}})}
                onPress={() => newSessionRef.current?.present()}/>
        </View>
    )
}