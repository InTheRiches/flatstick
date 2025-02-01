import useColors from "../../../../hooks/useColors";
import {Dimensions, ScrollView, View} from "react-native";
import React from "react";
import {PuttsByBreakSlope, PuttsByDistance} from "./graphs";
import {Toggleable} from "../../../general/buttons/Toggleable";
import FontText from "../../../general/FontText";

export const PuttsAHoleTab = ({statsToUse}) => {
    const colors = useColors();
    const colorScheme = "light";
    const [byDistance, setByDistance] = React.useState(true);

    const {width} = Dimensions.get("screen");

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
                        <FontText style={{fontSize: 20, color: colors.text.primary, fontWeight: "bold",}}>{statsToUse.puttsAHole.puttsAHole}</FontText>
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
                        <FontText style={{fontSize: 20, color: colors.text.primary, fontWeight: "bold"}}>{statsToUse.puttsAHole.puttsAHoleWhenMishit}</FontText>
                    </View>
                </View>
            </View>
            <View style={{flexDirection: "row", gap: 10, marginTop: 24, marginBottom: 16}}>
                <Toggleable toggled={byDistance} onToggle={() => setByDistance(true)} title={"By Distance"}/>
                <Toggleable toggled={!byDistance} onToggle={() => setByDistance(false)} title={"By Direction"}/>
            </View>
            {byDistance && puttsByDistance}
            {!byDistance && <PuttsByBreakSlope statsToUse={statsToUse}></PuttsByBreakSlope>}
        </ScrollView>
    )
};