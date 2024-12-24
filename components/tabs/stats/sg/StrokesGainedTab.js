import useColors from "../../../../hooks/useColors";
import {useAppContext} from "../../../../contexts/AppCtx";
import {Dimensions, ScrollView, Text, View} from "react-native";
import React from "react";
import {SGByDistanceChart, SGByBreakSlope} from "./graphs";

export const StrokesGainedTab = ({statsToUse}) => {
    const colors = useColors();
    const {currentStats, previousStats} = useAppContext();
    const {width} = Dimensions.get("screen")

    let difference = 0;

    if (previousStats !== undefined && previousStats.length > 0 && statsToUse === currentStats)
        difference = currentStats.averagePerformance.strokesGained.overall - previousStats[0].averagePerformance.strokesGained.overall;

    return (
        <ScrollView contentContainerStyle={{paddingBottom: 0, alignItems: "center"}} showsVerticalScrollIndicator={false} bounces={false} style={{width: width, paddingHorizontal: 24}}>
            <Text style={{color: colors.text.secondary, fontSize: 14, fontWeight: 400, textAlign: "center"}}>Strokes Gained</Text>
            <View style={{flexDirection: "row", justifyContent: "center", alignItems: "center", width: "100%", gap: 6}}>
                <Text style={{color: colors.text.primary, fontSize: 48, fontWeight: 600}}>{statsToUse.averagePerformance.strokesGained.overall}</Text>
                { previousStats !== undefined && previousStats.length > 0 && difference !== 0 &&
                    <View style={{backgroundColor: "#A1ECA8", alignItems: "center", justifyContent: "center", borderRadius: 32, paddingHorizontal: 10, paddingVertical: 4}}>
                        <Text style={{color: "#275E2B", fontSize: 14, fontWeight: 500}}>{difference > 0 ? `+ ${difference.toFixed(1)} SG` : `${difference.toFixed(1)} SG`}</Text>
                    </View>
                }
            </View>
            <Text style={{color: colors.text.secondary, fontSize: 14, fontWeight: 400, textAlign: "center"}}>(over 18 holes, last 5 sessions)</Text>
            <Text style={{fontSize: 18, fontWeight: 600, color: colors.text.primary, marginTop: 20, marginBottom: 8, textAlign: "left", width: "100%"}}>Strokes Gained by Distance</Text>
            <View style={{alignItems: "center"}}>
                <SGByDistanceChart statsToUse={statsToUse}/>
            </View>
            <View style={{flexDirection: "row", width: "100%", alignItems: "center", justifyContent: "center", gap: 6}}>
                <View style={{backgroundColor: "#40C2FF", aspectRatio: 1, width: 14, borderRadius: 12}}></View>
                <Text style={{color: colors.text.primary}}>Your Averages</Text>
            </View>
            <Text style={{fontSize: 18, fontWeight: 600, color: colors.text.primary, marginTop: 20, marginBottom: 8, textAlign: "left", width: "100%"}}>Strokes Gained by Break/Slope</Text>
            <SGByBreakSlope statsToUse={statsToUse}></SGByBreakSlope>
        </ScrollView>
    )
}