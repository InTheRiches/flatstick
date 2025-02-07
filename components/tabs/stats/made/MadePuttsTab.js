import useColors from "../../../../hooks/useColors";
import {Dimensions, ScrollView, View} from "react-native";
import React, {useMemo} from "react";
import {MakeByBreakSlope, MakeByDistance} from "./graphs";
import {useAppContext} from "../../../../contexts/AppCtx";
import {roundTo} from "../../../../utils/roundTo";
import {Toggleable} from "../../../general/buttons/Toggleable";
import FontText from "../../../general/FontText";

export const MadePuttsTab = ({statsToUse}) => {
    const colors = useColors();
    const colorScheme = "light";
    const {currentStats, previousStats} = useAppContext();
    const [byDistance, setByDistance] = React.useState(true);

    const {width} = Dimensions.get("screen")

    let difference = 0;

    if (previousStats !== undefined && previousStats.length > 0 && statsToUse === currentStats)
        difference = ((currentStats.madePutts.overall - previousStats[0].madePutts.overall) * 100).toFixed(0);

    const madeByDistance = useMemo(() =>
        <>
            <View style={{alignItems: "center"}}>
                <MakeByDistance statsToUse={statsToUse}/>
            </View>
            <View style={{flexDirection: "row", width: "100%", alignItems: "center", justifyContent: "center", gap: 12}}>
                <View style={{flexDirection: "row", alignItems: "center", gap: 6}}>
                    <View style={{backgroundColor: "#40C2FF", aspectRatio: 1, width: 14, borderRadius: 12}}></View>
                    <FontText style={{color: colors.text.primary}}>Your Averages</FontText>
                </View>
                <View style={{flexDirection: "row", alignItems: "center", gap: 6}}>
                    <View style={{backgroundColor: colorScheme === "light" ? "#0e4e75" : "white", aspectRatio: 1, width: 14, borderRadius: 12}}></View>
                    <FontText style={{color: colors.text.primary}}>Tour Pro</FontText>
                </View>
            </View>
        </>
    , [statsToUse]);

    const madeBySlope = useMemo(() => (
        <MakeByBreakSlope statsToUse={statsToUse}></MakeByBreakSlope>
    ), [statsToUse]);

    return (
        <ScrollView contentContainerStyle={{paddingBottom: 0, alignItems: "center"}} showsVerticalScrollIndicator={false} bounces={false} style={{width: width, paddingHorizontal: 24}}>
            <View style={{flexDirection: "row", justifyContent: "center", alignItems: "center", width: "100%", gap: 6}}>
                <FontText style={{color: colors.text.primary, fontSize: 48, fontWeight: 600}}>{roundTo(statsToUse.madePutts.overall*100, 0)}%</FontText>
                { previousStats !== undefined && previousStats.length > 0 && difference != 0 &&
                    <View style={{backgroundColor: difference > 0 ? "#A1ECA8" : "#f8aeae", alignItems: "center", justifyContent: "center", borderRadius: 32, paddingHorizontal: 10, paddingVertical: 4}}>
                        <FontText style={{color: difference > 0 ? "#275E2B" : "#a60303", fontSize: 14, fontWeight: 500}}>{difference > 0 ? `+ ${difference}%` : `${difference}%`}</FontText>
                    </View>
                }
            </View>
            <FontText style={{color: colors.text.secondary, fontSize: 14, fontWeight: 400, textAlign: "center"}}>(over 18 holes, last 5 sessions)</FontText>
            <View style={{flexDirection: "row", gap: 10, marginTop: 24, marginBottom: 16}}>
                <Toggleable toggled={byDistance} onToggle={() => setByDistance(true)} title={"By Distance"}/>
                <Toggleable toggled={!byDistance} onToggle={() => setByDistance(false)} title={"By Direction"}/>
            </View>
            {byDistance && madeByDistance}
            {!byDistance && madeBySlope}
        </ScrollView>
    )
};