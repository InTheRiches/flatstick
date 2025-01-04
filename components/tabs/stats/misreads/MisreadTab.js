import useColors from "../../../../hooks/useColors";
import {Dimensions, ScrollView, Text, View} from "react-native";
import React from "react";
import {BreakMisreadsByDistance} from "./distances/BreakMisreadsByDistance";
import {SlopeMisreadsByDistance} from "./distances/SlopeMisreadsByDistance";
import {BreakMisreadsByBreakSlope} from "./distances/BreakMisreadsByBreakSlope";
import {SlopeMisreadsByBreakSlope} from "./distances/SlopeMisreadsByBreakSlope";

export function MisreadTab({statsToUse}) {
    const colors = useColors();

    const {width} = Dimensions.get("screen")

    return (
        <ScrollView contentContainerStyle={{paddingBottom: 0, alignItems: "center"}} showsVerticalScrollIndicator={false} bounces={false} style={{width: width, paddingHorizontal: 24}}>
            <Text style={{fontSize: 18, fontWeight: 600, color: colors.text.primary, marginTop: 20, marginBottom: 8, textAlign: "left", width: "100%"}}>Break Misreads by Distance</Text>
            <View style={{alignItems: "center"}}>
                <BreakMisreadsByDistance statsToUse={statsToUse}/>
            </View>
            <Text style={{fontSize: 18, fontWeight: 600, color: colors.text.primary, marginTop: 20, marginBottom: 8, textAlign: "left", width: "100%"}}>Slope Misreads by Distance</Text>
            <View style={{alignItems: "center"}}>
                <SlopeMisreadsByDistance statsToUse={statsToUse}/>
            </View>
            <Text style={{fontSize: 18, fontWeight: 600, color: colors.text.primary, marginTop: 20, marginBottom: 8, textAlign: "left", width: "100%"}}>Break Misreads by Break/Slope</Text>
            <BreakMisreadsByBreakSlope statsToUse={statsToUse}></BreakMisreadsByBreakSlope>
            <Text style={{fontSize: 18, fontWeight: 600, color: colors.text.primary, marginTop: 20, marginBottom: 8, textAlign: "left", width: "100%"}}>Slope Misreads by Break/Slope</Text>
            <SlopeMisreadsByBreakSlope statsToUse={statsToUse}></SlopeMisreadsByBreakSlope>
        </ScrollView>
    )
}