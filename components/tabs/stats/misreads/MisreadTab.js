import useColors from "../../../../hooks/useColors";
import {Dimensions, ScrollView, View} from "react-native";
import React from "react";
import {BreakMisreadsByDistance} from "./distances/BreakMisreadsByDistance";
import {SlopeMisreadsByDistance} from "./distances/SlopeMisreadsByDistance";
import {BreakMisreadsByBreakSlope} from "./distances/BreakMisreadsByBreakSlope";
import {SlopeMisreadsByBreakSlope} from "./distances/SlopeMisreadsByBreakSlope";
import FontText from "../../../general/FontText";

export function MisreadTab({statsToUse}) {
    const colors = useColors();

    const {width} = Dimensions.get("screen")

    return (
        <ScrollView contentContainerStyle={{paddingBottom: 0, alignItems: "center"}} showsVerticalScrollIndicator={false} bounces={false} style={{width: width, paddingHorizontal: 24}}>
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
                    <FontText style={{fontSize: 16, textAlign: "left", color: colors.text.primary, fontWeight: "bold", flex: 1}}>Average Performance</FontText>
                    <FontText style={{fontSize: 14, textAlign: "right", color: colors.text.secondary, fontWeight: "normal", flex: 1}}>(last 5 sessions)</FontText>
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
                        <FontText style={{fontSize: 14, textAlign: "left", color: colors.text.secondary}}>Misreads a Round</FontText>
                        <FontText style={{fontSize: 20, color: colors.text.primary, fontWeight: "bold",}}>{statsToUse.puttsMisread}</FontText>
                    </View>
                    <View style={{flexDirection: "column", flex: 1, paddingBottom: 12, paddingTop: 6, paddingLeft: 12}}>
                        <FontText style={{fontSize: 14, textAlign: "left", color: colors.text.secondary}}>Mishits a Round</FontText>
                        <FontText style={{fontSize: 20, color: colors.text.primary, fontWeight: "bold"}}>{statsToUse.puttsMishits}</FontText>
                    </View>
                </View>
            </View>
            <FontText style={{fontSize: 18, fontWeight: 600, color: colors.text.primary, marginTop: 20, marginBottom: 8, textAlign: "left", width: "100%"}}>Line Misreads by Distance</FontText>
            <View style={{alignItems: "center"}}>
                <BreakMisreadsByDistance statsToUse={statsToUse}/>
            </View>
            <FontText style={{fontSize: 18, fontWeight: 600, color: colors.text.primary, marginTop: 20, marginBottom: 8, textAlign: "left", width: "100%"}}>Slope Misreads by Distance</FontText>
            <View style={{alignItems: "center"}}>
                <SlopeMisreadsByDistance statsToUse={statsToUse}/>
            </View>
            <FontText style={{fontSize: 18, fontWeight: 600, color: colors.text.primary, marginTop: 20, marginBottom: 8, textAlign: "left", width: "100%"}}>Line Misreads by Break/Slope</FontText>
            <BreakMisreadsByBreakSlope statsToUse={statsToUse}></BreakMisreadsByBreakSlope>
            <FontText style={{fontSize: 18, fontWeight: 600, color: colors.text.primary, marginTop: 20, marginBottom: 8, textAlign: "left", width: "100%"}}>Slope Misreads by Break/Slope</FontText>
            <SlopeMisreadsByBreakSlope statsToUse={statsToUse}></SlopeMisreadsByBreakSlope>
        </ScrollView>
    )
}