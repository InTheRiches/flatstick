import {Pressable, View} from "react-native";
import FontText from "../../general/FontText";
import React from "react";
import useColors from "../../../hooks/useColors";
import {useRouter} from "expo-router";

export default function ResumeSession({session}) {
    const colors = useColors();
    const router = useRouter();

    const hours = new Date(session.timestamp).getHours();

    return (
        <Pressable
            onPress={() => {
                router.push({pathname: "simulation/full", params: {
                        stringHoles: session.stringHoles,
                        stringTee: session.stringTee,
                        stringFront: session.stringFront,
                        stringCourse: session.stringCourse,
                        stringCurrentHole: session.currentHole,
                        stringHoleHistory: session.holeHistory,
                        stringTimeElapsed: session.timeElapsed
                    }})
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
                        <FontText style={{textAlign: "left", color: "#777777"}}>Unfinished Round</FontText>
                    </View>
                    <View style={{flex: 1}}>
                        <FontText style={{textAlign: "right", color: "#777777"}}>Started at {hours > 12 ? hours - 12 : hours}:{new Date(session.timestamp).getMinutes()}</FontText>
                    </View>
                </View>
                <View style={{flexDirection: "row", alignItems: "center", gap: 1}}>
                    <FontText style={{textAlign: "left", color: colors.text.primary, fontSize: 24, flex: 1}}>{session.type === "full" ? JSON.parse(session.stringCourse).course_name : "Simulation"}</FontText>
                    <FontText style={{textAlign: "right", color: colors.text.primary, fontSize: 24, flex: 1}}>Resume -></FontText>
                </View>
            </View>
            <View style={{flexDirection: "row", alignItems: "center"}}>
                <View
                    style={{
                        height: 5,
                        backgroundColor: "black",
                        borderRadius: 24,
                        flex: session.currentHole / parseInt(session.stringHoles),
                    }}></View>
                <View
                    style={{
                        height: 5,
                        backgroundColor: colors.background.primary,
                        borderRadius: 24,
                        flex: 1 - (session.currentHole / parseInt(session.stringHoles)),
                    }}></View>
                <View style={{alignSelf: 'center', paddingLeft: 10}}>
                    <FontText style={{color: colors.text.primary}}>Hole {session.currentHole}</FontText>
                </View>
            </View>
        </Pressable>
    )
}