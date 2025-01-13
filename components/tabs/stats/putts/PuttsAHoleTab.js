import useColors from "../../../../hooks/useColors";
import {Dimensions, ScrollView, Text, useColorScheme, View} from "react-native";
import React from "react";
import {PuttsByBreakSlope, PuttsByDistance} from "./graphs";

export const PuttsAHoleTab = ({statsToUse}) => {
    const colors = useColors();
    const colorScheme = "light";

    const {width} = Dimensions.get("screen");

    return (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{alignItems: "center", paddingBottom: 12}} style={{width: width, paddingHorizontal: 24}}>
            <View style={{backgroundColor: colors.background.secondary, borderRadius: 12, paddingTop: 8, width: "100%"}}>
                <View style={{
                    paddingHorizontal: 12,
                    borderBottomWidth: 1,
                    borderColor: colors.border.default,
                    paddingBottom: 6,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center"
                }}>
                    <Text style={{fontSize: 16, textAlign: "left", color: colors.text.primary, fontWeight: "bold", flex: 1}}>Average Performance</Text>
                    <Text style={{fontSize: 14, textAlign: "right", color: colors.text.secondary, fontWeight: "normal", flex: 1}}>(last 5 sessions)</Text>
                </View>
                <View style={{flexDirection: "row"}}>
                    <View style={{
                        flexDirection: "column",
                        flex: 1,
                        borderRightWidth: 1,
                        borderColor: colors.border.default,
                        paddingBottom: 12,
                        paddingTop: 6,
                        paddingLeft: 12,
                    }}>
                        <Text style={{fontSize: 14, textAlign: "left", color: colors.text.secondary}}>Putts per Hole</Text>
                        <Text style={{fontSize: 20, color: colors.text.primary, fontWeight: "bold",}}>{statsToUse.puttsAHole.puttsAHole}</Text>
                    </View>
                    <View style={{
                        flexDirection: "column",
                        flex: 1,
                        borderRightWidth: 1,
                        borderColor: colors.border.default,
                        paddingBottom: 12,
                        paddingTop: 6,
                        paddingLeft: 12
                    }}>
                        <Text style={{fontSize: 14, textAlign: "left", color: colors.text.secondary}}>Putts When Misread</Text>
                        <Text style={{fontSize: 20, color: colors.text.primary, fontWeight: "bold"}}>{statsToUse.puttsAHole.puttsAHoleWhenMisread}</Text>
                    </View>
                    <View style={{flexDirection: "column", flex: 1, paddingBottom: 12, paddingTop: 6, paddingLeft: 12}}>
                        <Text style={{fontSize: 14, textAlign: "left", color: colors.text.secondary}}>Putts When Mishit</Text>
                        <Text style={{fontSize: 20, color: colors.text.primary, fontWeight: "bold"}}>{statsToUse.puttsAHole.puttsAHoleWhenMishit}</Text>
                    </View>
                </View>
            </View>
            <Text style={{fontSize: 18, fontWeight: 600, color: colors.text.primary, marginTop: 20, marginBottom: 8, textAlign: "left", width: "100%"}}>Putts a Hole by Break/Slope</Text>
            <PuttsByBreakSlope statsToUse={statsToUse}></PuttsByBreakSlope>
            <Text style={{fontSize: 18, fontWeight: 600, color: colors.text.primary, marginTop: 20, marginBottom: 8, textAlign: "left", width: "100%"}}>Putts a Hole by Distance</Text>
            <View style={{overflow: "hidden", marginRight: 32, paddingLeft: 24}}>
                <PuttsByDistance statsToUse={statsToUse}/>
            </View>
            <View style={{flexDirection: "row", width: "100%", alignItems: "center", justifyContent: "center", gap: 12}}>
                <View style={{flexDirection: "row", alignItems: "center", gap: 6}}>
                    <View style={{backgroundColor: "#40C2FF", aspectRatio: 1, width: 14, borderRadius: 12}}></View>
                    <Text style={{color: colors.text.primary}}>Your Averages</Text>
                </View>
                <View style={{flexDirection: "row", alignItems: "center", gap: 6}}>
                    <View style={{backgroundColor: colorScheme === "light" ? "#0e4e75" : "white", aspectRatio: 1, width: 14, borderRadius: 12}}></View>
                    <Text style={{color: colors.text.primary}}>Tour Pro</Text>
                </View>
            </View>
        </ScrollView>
    )
};