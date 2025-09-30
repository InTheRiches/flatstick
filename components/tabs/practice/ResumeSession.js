import {Pressable, View} from "react-native";
import FontText from "../../general/FontText";
import React from "react";
import useColors from "../../../hooks/useColors";
import {useRouter} from "expo-router";
import Svg, {Path} from "react-native-svg";

export default function ResumeSession({session}) {
    const colors = useColors();
    const router = useRouter();

    const hours = new Date(session.startedAt).getHours();

    return (
        <Pressable
            onPress={() => {
                switch(session.type) {
                    case "full":
                        router.push({
                            pathname: "simulation/full", params: {
                                stringHoles: session.stringHoles,
                                stringTee: session.stringTee,
                                stringFront: session.stringFront,
                                stringCourse: session.stringCourse,
                                stringCurrentHole: session.currentHole,
                                stringHoleHistory: session.holeHistory,
                                stringTimeElapsed: session.timeElapsed
                            }
                        });
                        break;
                    case "real":
                        router.push({
                            pathname: "simulation/real", params: {
                                stringHoles: session.stringHoles,
                                stringFront: session.stringFront,
                                stringCourse: session.stringCourse,
                                stringCurrentHole: session.currentHole,
                                stringHoleHistory: session.holeHistory,
                                stringTimeElapsed: session.timeElapsed
                            }
                        });
                        break;
                }
            }}
            style={{
                backgroundColor: colors.background.secondary,
                paddingHorizontal: 12,
                paddingTop: 8,
                paddingBottom: 14,
                borderTopLeftRadius: 8,
                borderTopRightRadius: 8,
                borderBottomLeftRadius: 16,
                borderBottomRightRadius: 16
            }}>
            <View style={{
                flexDirection: "column",
                paddingBottom: 10,
            }}>
                <View style={{flexDirection: "row"}}>
                    <View style={{flex: 1}}>
                        <FontText style={{textAlign: "left", color: "#777777"}}>Unfinished{session.type === "real" && " Putts-Only"} Round</FontText>
                    </View>
                    <View style={{flex: 0.6}}>
                        <FontText style={{textAlign: "right", color: "#777777"}}>Played at {hours > 12 ? hours - 12 : hours}:{new Date(session.startedAt).getMinutes()}</FontText>
                    </View>
                </View>
                <View style={{flexDirection: "row", alignItems: "center"}}>
                    <FontText style={{textAlign: "left", color: colors.text.primary, fontSize: 24, flex: 1, fontWeight: 600}}>{session.type === "full" || session.type === "real" ? JSON.parse(session.stringCourse).course_name : "Simulation"}</FontText>
                    <View style={{flexDirection: "row", flex: 0.7, alignItems: "center", justifyContent: "flex-end"}}>
                        <FontText style={{textAlign: "right", color: colors.text.primary, fontSize: 24, marginRight: 4}}>Resume</FontText>
                        <Svg style={{marginTop: 3}} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="black" width={24} height={24}>
                            <Path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm4.28 10.28a.75.75 0 0 0 0-1.06l-3-3a.75.75 0 1 0-1.06 1.06l1.72 1.72H8.25a.75.75 0 0 0 0 1.5h5.69l-1.72 1.72a.75.75 0 1 0 1.06 1.06l3-3Z" clipRule="evenodd" />
                        </Svg>
                    </View>
                </View>
            </View>
            <View style={{flexDirection: "row", alignItems: "center"}}>
                <View
                    style={{
                        height: 5,
                        backgroundColor: "black",
                        borderRadius: 24,
                        flex: session.holesPlayed / parseInt(session.stringHoles),
                    }}></View>
                <View
                    style={{
                        height: 5,
                        backgroundColor: colors.background.primary,
                        borderRadius: 24,
                        flex: 1 - (session.holesPlayed / parseInt(session.stringHoles)),
                    }}></View>
                <View style={{alignSelf: 'center', paddingLeft: 10}}>
                    <FontText style={{color: colors.text.primary}}>Hole {session.holesPlayed}</FontText>
                </View>
            </View>
        </Pressable>
    )
}