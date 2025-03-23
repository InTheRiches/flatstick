import useColors from "../../../../hooks/useColors";
import {useAppContext} from "../../../../contexts/AppCtx";
import {Dimensions, ScrollView, View} from "react-native";
import React, {useMemo} from "react";
import {SGByBreakSlope, SGByDistanceChart} from "./graphs";
import {Toggleable} from "../../../general/buttons/Toggleable";
import FontText from "../../../general/FontText";
import SGOverTime from "./graphs/SGOverTime";

export const StrokesGainedTab = ({statsToUse}) => {
    const colors = useColors();
    const {currentStats, yearlyStats, previousStats} = useAppContext();
    const {width} = Dimensions.get("screen")
    const [byDistance, setByDistance] = React.useState(true);

    let difference = 0;

    if (previousStats !== undefined && previousStats.length > 0 && statsToUse === currentStats)
        difference = statsToUse.strokesGained.overall - previousStats[0].strokesGained.overall;

    const sgByDistance = useMemo(() => {
        return (
            <>
                <View style={{alignItems: "center"}}>
                    <SGByDistanceChart statsToUse={statsToUse}/>
                </View>
                <View style={{flexDirection: "row", width: "100%", alignItems: "center", justifyContent: "center", gap: 6}}>
                    <View style={{backgroundColor: "#40C2FF", aspectRatio: 1, width: 14, borderRadius: 12}}></View>
                    <FontText style={{color: colors.text.primary}}>Your Averages</FontText>
                </View>
            </>
        )
    }, [statsToUse]);

    const sgByBreakSlope = useMemo(() => {
        return (
            <SGByBreakSlope statsToUse={statsToUse}></SGByBreakSlope>
        )
    }, [statsToUse]);

    return (
        <ScrollView contentContainerStyle={{paddingBottom: 0, alignItems: "center"}} showsVerticalScrollIndicator={false} bounces={false} style={{width: width, paddingHorizontal: 20}}>
            <FontText style={{color: colors.text.secondary, fontSize: 14, fontWeight: 400, textAlign: "center"}}>Strokes Gained</FontText>
            <View style={{flexDirection: "row", justifyContent: "center", alignItems: "center", width: "100%", gap: 6}}>
                <FontText style={{color: colors.text.primary, fontSize: 48, fontWeight: 600}}>{statsToUse.strokesGained.overall > 0 ? "+" : ""}{statsToUse.strokesGained.overall}</FontText>
                { previousStats !== undefined && previousStats.length > 0 && difference !== 0 &&
                    <View style={{backgroundColor: difference > 0 ? "#A1ECA8" : "#ffc3c3", alignItems: "center", justifyContent: "center", borderRadius: 32, paddingHorizontal: 10, paddingVertical: 4}}>
                        <FontText style={{color: difference > 0 ? "#275E2B" : "#a60303", fontSize: 14, fontWeight: 500}}>{difference > 0 ? `+ ${difference.toFixed(1)} SG` : `${difference.toFixed(1)} SG`}</FontText>
                    </View>
                }
            </View>
            <FontText style={{color: colors.text.secondary, fontSize: 14, fontWeight: 400, textAlign: "center"}}>(over 18 holes, last 5 sessions)</FontText>
            <View style={{flexDirection: "row", gap: 10, marginTop: 24, marginBottom: 16}}>
                <Toggleable toggled={byDistance} onToggle={() => setByDistance(true)} title={"By Distance"}/>
                <Toggleable toggled={!byDistance} onToggle={() => setByDistance(false)} title={"By Direction"}/>
            </View>
            {byDistance && sgByDistance}
            {!byDistance && sgByBreakSlope}
            <FontText style={{marginTop: 24, fontWeight: 600, fontSize: 16, width: "100%"}}>Strokes Gained Over Time</FontText>

            <SGOverTime statsToUse={yearlyStats}></SGOverTime>

            <FontText style={{marginTop: 24, fontWeight: 600, fontSize: 14, marginBottom: 10}}>HOW TO READ THE DATA</FontText>
            <View>
                <View style={{flexDirection: "row", alignItems: "center", marginBottom: 4}}>
                    <View style={{width: 8, height: 8, borderRadius: 15, backgroundColor: "black", marginRight: 8}}></View>
                    <FontText style={{fontSize: 14, fontWeight: 500}}>Strokes Gained</FontText>
                </View>
                <FontText style={{marginLeft: 16}}>The number of strokes gained or lost compared to the average PGA Tour player over 18 holes. A positive number is better than a negative. The pill showing an increase or decrease in strokes gained represents the change between the last 5 sessions and the current 5.</FontText>
            </View>
        </ScrollView>
    )
}