import useColors from "../../../../hooks/useColors";
import {Dimensions, ScrollView, View} from "react-native";
import React from "react";
import {PuttsByBreakSlope, PuttsByDistance} from "./graphs";
import {Toggleable} from "../../../general/buttons/Toggleable";
import FontText from "../../../general/FontText";
import {useAppContext} from "../../../../contexts/AppContext";

export const PuttsAHoleTab = ({statsToUse}) => {
    const colors = useColors();
    const colorScheme = "light";
    const [byDistance, setByDistance] = React.useState(true);

    const {width} = Dimensions.get("screen");
    const {currentStats, previousStats} = useAppContext();

    let difference = 0;

    if (previousStats !== undefined && previousStats.length > 0 && statsToUse === currentStats)
        difference = (currentStats.puttsAHole.puttsAHole - previousStats[0].puttsAHole.puttsAHole).toFixed(1);

    const puttsByDistance = (
        <>
            <View style={{overflow: "hidden", marginRight: 32, paddingLeft: 24}}>
                <PuttsByDistance statsToUse={statsToUse}/>
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
    );

    return (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{alignItems: "center", paddingBottom: 12}} style={{width: width, paddingHorizontal: 20}}>
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
                        <FontText style={{fontSize: 14, textAlign: "left", color: colors.text.secondary}}>Putts per Hole</FontText>
                        <View style={{flexDirection: "row"}}>
                            <FontText style={{fontSize: 20, color: colors.text.primary, fontWeight: "bold",}}>{statsToUse.puttsAHole.puttsAHole}</FontText>
                            { previousStats !== undefined && previousStats.length > 0 && difference != 0 &&
                                <View style={{marginLeft: 4, backgroundColor: difference < 0 ? "#A1ECA8" : "#ffc3c3", alignItems: "center", justifyContent: "center", borderRadius: 32, paddingHorizontal: 10, paddingVertical: 4}}>
                                    <FontText style={{color: difference < 0 ? "#275E2B" : "#a60303", fontSize: 14, fontWeight: 500}}>{difference > 0 ? `+${difference}` : `${difference}`}</FontText>
                                </View>
                            }
                        </View>
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
                        <FontText style={{fontSize: 14, textAlign: "left", color: colors.text.secondary}}>Putts When Misread</FontText>
                        <FontText style={{fontSize: 20, color: colors.text.primary, fontWeight: "bold"}}>{statsToUse.puttsAHole.puttsAHoleWhenMisread}</FontText>
                    </View>
                    <View style={{flexDirection: "column", flex: 1, paddingBottom: 12, paddingTop: 6, paddingLeft: 12}}>
                        <FontText style={{fontSize: 14, textAlign: "left", color: colors.text.secondary}}>Putts When Mishit</FontText>
                        <FontText style={{fontSize: 20, color: colors.text.primary, fontWeight: "bold"}}>{statsToUse.puttsAHole.puttsAHoleWhenMishit === 0 ? "?" : statsToUse.puttsAHole.puttsAHoleWhenMishit}</FontText>
                    </View>
                </View>
            </View>
            <View style={{flexDirection: "row", gap: 10, marginTop: 24, marginBottom: 16}}>
                <Toggleable toggled={byDistance} onToggle={() => setByDistance(true)} title={"By Distance"}/>
                <Toggleable toggled={!byDistance} onToggle={() => setByDistance(false)} title={"By Direction"}/>
            </View>
            {byDistance && puttsByDistance}
            {!byDistance && <PuttsByBreakSlope statsToUse={statsToUse}></PuttsByBreakSlope>}
            <FontText style={{marginTop: 24, fontWeight: 700, fontSize: 16, marginBottom: 10}}>HOW TO READ THE DATA</FontText>
            <View>
                <View style={{flexDirection: "row", alignItems: "center", marginBottom: 2}}>
                    <View style={{width: 8, height: 8, borderRadius: 15, backgroundColor: "black", marginRight: 8}}></View>
                    <FontText style={{fontSize: 14, fontWeight: 500}}>Putts a Hole</FontText>
                </View>
                <FontText style={{marginLeft: 16, color: colors.text.secondary}}>Putts a hole is determined by averaging your number of putts on a given hole. The lower the number the better. You can also see what your average putts a hole when you misread or mishit, which reveals how much you suffer from those mistakes.</FontText>
            </View>
            <View style={{marginTop: 10}}>
                <View style={{flexDirection: "row", alignItems: "center", marginBottom: 2}}>
                    <View style={{width: 8, height: 8, borderRadius: 15, backgroundColor: "black", marginRight: 8}}></View>
                    <FontText style={{fontSize: 14, fontWeight: 500}}>By Distance</FontText>
                </View>
                <FontText style={{marginLeft: 16, color: colors.text.secondary}}>Your putts a hole has been averaged by distance, and plotted next to the PGA Tour averages. Being at or below the Tour Pro bar means you have less putts at that distance than Tour Pros.</FontText>
            </View>
            <View style={{marginTop: 10, marginBottom: 24}}>
                <View style={{flexDirection: "row", alignItems: "center", marginBottom: 2}}>
                    <View style={{width: 8, height: 8, borderRadius: 15, backgroundColor: "black", marginRight: 8}}></View>
                    <FontText style={{fontSize: 14, fontWeight: 500}}>By Direction</FontText>
                </View>
                <FontText style={{marginLeft: 16, color: colors.text.secondary}}>Each vertex on the radar graph corresponds to a certain kind of break/slope. The closer the blue area is to the center, the better you putt with that break/slope. The closer you are to the edges, the worse.</FontText>
            </View>
        </ScrollView>
    )
};