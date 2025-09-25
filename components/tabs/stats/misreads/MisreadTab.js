import useColors from "../../../../hooks/useColors";
import {Dimensions, ScrollView, View} from "react-native";
import React, {useMemo, useState} from "react";
import {BreakMisreadsByDistance} from "./distances/BreakMisreadsByDistance";
import {SlopeMisreadsByDistance} from "./distances/SlopeMisreadsByDistance";
import {BreakMisreadsByBreakSlope} from "./distances/BreakMisreadsByBreakSlope";
import FontText from "../../../general/FontText";
import {Toggleable} from "../../../general/buttons/Toggleable";

export function MisreadTab({statsToUse}) {
    const colors = useColors();

    const {width} = Dimensions.get("screen");

    const [breakStats, setBreakStats] = useState(true);
    const [dirBreakStats, setDirBreakStats] = useState(true);

    const breakMisreadsByBreakSlope = useMemo(() => (
        <BreakMisreadsByBreakSlope statsToUse={statsToUse}></BreakMisreadsByBreakSlope>
    ), [statsToUse]);
    // const slopeMisreadsByBreakSlope = useMemo(() => (
    //     <SlopeMisreadsByBreakSlope statsToUse={statsToUse}></SlopeMisreadsByBreakSlope>
    // ), [statsToUse]);

    return (
        <ScrollView contentContainerStyle={{paddingBottom: 0, alignItems: "center"}} showsVerticalScrollIndicator={false} bounces={false} style={{width: width, paddingHorizontal: 20}}>
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
                    {/*<FontText style={{fontSize: 14, textAlign: "right", color: colors.text.secondary, fontWeight: "normal", flex: 1}}>(last 5 sessions)</FontText>*/}
                </View>
                <View style={{flexDirection: "row"}}>
                    <View style={{
                        flexDirection: "column",
                        flex: 1,
                        // borderRightWidth: 1,
                        // borderColor: colors.border.default,
                        paddingBottom: 8,
                        paddingTop: 6,
                        paddingLeft: 12,
                    }}>
                        <FontText style={{fontSize: 14, textAlign: "left", color: colors.text.secondary}}>Misreads a Round</FontText>
                        <FontText style={{fontSize: 20, color: colors.text.primary, fontWeight: "bold",}}>{statsToUse.misreadData.totalMisreads / (statsToUse.holesPlayed/18)}</FontText>
                    </View>
                </View>
            </View>
            <FontText style={{fontSize: 18, fontWeight: 600, color: colors.text.primary, marginTop: 20, marginBottom: 8, textAlign: "left", width: "100%"}}>Misreads by Distance</FontText>
            <View style={{flexDirection: "row", gap: 10, marginBottom: 16}}>
                <Toggleable toggled={breakStats} onToggle={() => setBreakStats(true)} title={"Break Misreads"}/>
                <Toggleable toggled={!breakStats} onToggle={() => setBreakStats(false)} title={"Slope Misreads"}/>
            </View>
            <View style={{alignItems: "center"}}>
                {breakStats && <BreakMisreadsByDistance statsToUse={statsToUse}/>}
                {!breakStats && <SlopeMisreadsByDistance statsToUse={statsToUse}/>}
            </View>
            <FontText style={{fontSize: 18, fontWeight: 600, color: colors.text.primary, marginTop: 20, marginBottom: 8, textAlign: "left", width: "100%"}}>Misreads by Direction</FontText>
            <View style={{flexDirection: "row", gap: 10, marginBottom: 16}}>
                <Toggleable toggled={dirBreakStats} onToggle={() => setDirBreakStats(true)} title={"Break Misreads"}/>
                <Toggleable toggled={!dirBreakStats} onToggle={() => setDirBreakStats(false)} title={"Slope Misreads"}/>
            </View>
            {dirBreakStats && breakMisreadsByBreakSlope}
            {/*{!dirBreakStats && slopeMisreadsByBreakSlope}*/}
            <FontText style={{marginTop: 24, fontWeight: 700, fontSize: 16, marginBottom: 10}}>HOW TO READ THE DATA</FontText>
            <View>
                <View style={{flexDirection: "row", alignItems: "center", marginBottom: 2}}>
                    <View style={{width: 8, height: 8, borderRadius: 15, backgroundColor: "black", marginRight: 8}}></View>
                    <FontText style={{fontSize: 14, fontWeight: 500}}>By Distance</FontText>
                </View>
                <FontText style={{marginLeft: 16, color: colors.text.secondary}}>Your misread percents by distance have been plotted by their respective distance range. You can choose whether you want to see break misreads or slope misreads at those distances. The higher the value, the more you misread either breaks/slopes from that distance.</FontText>
            </View>
            <View style={{marginTop: 10, marginBottom: 24}}>
                <View style={{flexDirection: "row", alignItems: "center", marginBottom: 2}}>
                    <View style={{width: 8, height: 8, borderRadius: 15, backgroundColor: "black", marginRight: 8}}></View>
                    <FontText style={{fontSize: 14, fontWeight: 500}}>By Direction</FontText>
                </View>
                <FontText style={{marginLeft: 16, color: colors.text.secondary}}>Each vertex on the radar graph corresponds to a certain kind of break/slope. The closer the blue area is to each outside vertex, the more you misread that break/slope combo. The closer you are to the center, the better.</FontText>
            </View>
        </ScrollView>
    )
}