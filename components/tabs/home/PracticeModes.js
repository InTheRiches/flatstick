import {Text, View} from "react-native";
import {PracticeMode} from "./PracticeMode";
import {SecondaryButton} from "../../general/buttons/SecondaryButton";
import Svg, {Path} from "react-native-svg";
import React from "react";
import {useAppContext} from "../../../contexts/AppCtx";
import useColors from "../../../hooks/useColors";
import {useRouter} from "expo-router";

export function PracticeModes({newSessionRef, newRealRoundRef, pressureInfoRef}) {
    const colors = useColors();
    const {puttSessions, updateStats} = useAppContext();
    const router = useRouter();

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
            <PracticeMode
                description={"A mode designed to replicate the pressure of a championship-winning putt, where every stroke counts and the stakes feel real."}
                name={"Pressure Putting"}
                distance={"< 8ft"}
                time={"10min"}
                focus={"Consistency"}
                onInfo={() => pressureInfoRef.current.present()}
                onPress={() => router.push({pathname: `/simulation/pressure/setup`})}/>
            <PracticeMode
                description={"A realistic mode simulating 18 unique holes to track putting performance and improve skills."}
                name={"Ladder Challenge"}
                distance={"< 8ft"}/>
            <SecondaryButton onPress={() => {
                updateStats().catch(console.error);
            }} style={{
                borderRadius: 50,
                flexDirection: "row",
                alignSelf: "center",
                paddingLeft: 12,
                gap: 12,
                paddingRight: 8,
                paddingVertical: 6
            }}>
                <Text style={{color: colors.button.secondary.text, fontSize: 18}}>See All Modes</Text>
                <View style={{
                    borderRadius: 30,
                    padding: 6,
                    backgroundColor: colors.button.secondary.text
                }}>
                    <Svg width={20} height={20} xmlns="http://www.w3.org/2000/svg" fill="none"
                         viewBox="0 0 24 24" strokeWidth={1.5}
                         stroke={colors.button.secondary.background} className="size-6">
                        <Path strokeLinecap="round" strokeLinejoin="round"
                              d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25"/>
                    </Svg>
                </View>
            </SecondaryButton>
        </View>
    )
}