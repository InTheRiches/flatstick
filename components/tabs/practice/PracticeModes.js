import {View} from "react-native";
import {PracticeMode} from "./PracticeMode";
import React from "react";
import {useAppContext} from "../../../contexts/AppContext";
import useColors from "../../../hooks/useColors";
import FontText from "../../general/FontText";
import {useRouter} from "expo-router";

export function PracticeModes({newSessionRef, unfinishedRound, unfinishedRoundRef}) {
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
                onPress={() => {
                    if (unfinishedRound) {
                        unfinishedRoundRef.current.present();
                        return;
                    }

                    router.push({pathname: `/simulation/full/setup`})
                }}/>
            <PracticeMode
                description={"Just focus on your putting with detailed tracking on a real course."}
                name={"JUST PUTT TRACKING"}
                time={"90-240 min"}
                focus={"Realism"}
                onPress={() => {
                    if (unfinishedRound) {
                        unfinishedRoundRef.current.present();
                        return;
                    }

                    router.push({pathname: `/simulation/real/setup`})
                }}/>
            <PracticeMode
                description={"A realistic mode simulating 9-18 unique holes to track putting performance and improve skills."}
                name={"PUTTING SIMULATION"}
                distance={userData.preferences.units === 0 ? "3 - 40ft" : "1 - 12m"}
                time={"10 - 20min"}
                focus={"Adaptability"}
                onInfo={() => router.push({pathname: "/simulation/putting-green/demo", params: {justInfo: true}})}
                onPress={() => newSessionRef.current?.present()}/>
        </View>
    )
}