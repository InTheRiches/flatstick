import {View} from "react-native";
import FontText from "../../general/FontText";
import React from "react";
import useColors from "../../../hooks/useColors";

export default function ResumeSession({session}) {
    const colors = useColors();

    return (
        <View
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
                flexDirection: "row",
                paddingBottom: 10,
            }}>
                <View style={{flex: 1}}>
                    <FontText style={{textAlign: "left", color: "#777777"}}>Unfinished Round</FontText>
                    <FontText style={{textAlign: "left", color: colors.text.primary, fontSize: 24}}>Simulation</FontText>
                </View>
                <View style={{flex: 1}}>
                    <FontText style={{textAlign: "right", color: "#777777"}}>Started at {new Date(session.timestamp).getHours()}:{new Date(session.timestamp).getMinutes()}</FontText>
                    <FontText style={{textAlign: "right", color: colors.text.primary, fontSize: 24}}>Resume -></FontText>
                </View>
            </View>
            <View style={{flexDirection: "row", alignItems: "center"}}>
                <View
                    style={{
                        height: 5,
                        backgroundColor: "black",
                        borderRadius: 24,
                        flex: 1,
                    }}></View>
                <View
                    style={{
                        height: 5,
                        backgroundColor: colors.background.primary,
                        borderRadius: 24,
                        flex: 1,
                    }}></View>
                <View style={{alignSelf: 'center', paddingLeft: 10}}>
                    <FontText style={{color: colors.text.primary}}>Hole {session.currentHole}</FontText>
                </View>
            </View>
        </View>
    )
}