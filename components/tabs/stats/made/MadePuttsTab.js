import useColors from "../../../../hooks/useColors";
import {Dimensions, ScrollView, Text, useColorScheme, View} from "react-native";
import React from "react";
import {MakeByBreakSlope} from "./graphs";
import {MakeByDistance} from "./graphs";

export const MadePuttsTab = ({statsToUse}) => {
    const colors = useColors();
    const colorScheme = useColorScheme();

    const {width} = Dimensions.get("screen")

    return (
        <ScrollView contentContainerStyle={{paddingBottom: 0, alignItems: "center"}} showsVerticalScrollIndicator={false} bounces={false} style={{width: width, paddingHorizontal: 24}}>
            <Text style={{fontSize: 18, fontWeight: 600, color: colors.text.primary, marginTop: 20, marginBottom: 8, textAlign: "left", width: "100%"}}>Make Percent by Distance</Text>
            <View style={{alignItems: "center"}}>
                <MakeByDistance statsToUse={statsToUse}/>
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
            <Text style={{fontSize: 18, fontWeight: 600, color: colors.text.primary, marginTop: 20, marginBottom: 8, textAlign: "left", width: "100%"}}>Make Percent by Break/Slope</Text>
            <MakeByBreakSlope statsToUse={statsToUse}></MakeByBreakSlope>
        </ScrollView>
    )
};