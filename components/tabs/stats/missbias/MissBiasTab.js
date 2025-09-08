import useColors from "../../../../hooks/useColors";
import {Dimensions, ScrollView, View} from "react-native";
import {LeftRightBias, ShortPastBias} from "../../../sessions/individual";
import {useAppContext} from "../../../../contexts/AppContext";
import FontText from "../../../general/FontText";
import React from "react";
import {roundTo} from "../../../../utils/roundTo";

export default function MissBiasTab({statsToUse, showDifference = false, previousStats, userData}) {
    const {width} = Dimensions.get("screen");
    const colors = useColors();

    let difference = 0;

    if (previousStats !== undefined && previousStats.length > 0 && showDifference)
        difference = statsToUse.percentHigh - previousStats[previousStats.length-1].percentHigh;

    difference = difference * 100;

    // TODO MAKE IT PERCENT LONG NOT PERCENT SHORT WHEN COLLECTING DATA
    return (
        <View>
            <ScrollView contentContainerStyle={{paddingBottom: 0, alignItems: "center"}} showsVerticalScrollIndicator={false} bounces={false} style={{width: width, paddingHorizontal: 20}}>
                <FontText style={{color: colors.text.primary, fontSize: 20, fontWeight: 600, marginBottom: 12, width: "100%"}}>First Putt Bias</FontText>
                <View style={{backgroundColor: colors.background.secondary, borderRadius: 12, flex: 1, flexDirection: 'row', marginBottom: 20}}>
                    <View style={{
                        flexDirection: "column",
                        flex: 1,
                        borderRightWidth: 1,
                        borderColor: colors.border.default,
                        paddingBottom: 6,
                        paddingLeft: 12,
                        paddingTop: 4,
                        justifyContent: "space-between"
                    }}>
                        <FontText style={{fontSize: 14, textAlign: "left", color: colors.text.secondary}}>Percent High-side</FontText>
                        <View style={{flexDirection: "row"}}>
                            <FontText style={{fontSize: 20, color: colors.text.primary, fontWeight: "bold"}}>{statsToUse.percentHigh !== undefined ? roundTo(statsToUse.percentHigh*100, 0) + "%" : "N/A"}</FontText>
                            { previousStats !== undefined && previousStats.length > 0 && difference !== 0 &&
                                <View style={{backgroundColor: difference > 0 ? "#A1ECA8" : "#ffc3c3", alignItems: "center", justifyContent: "center", borderRadius: 32, paddingHorizontal: 10, paddingVertical: 4, marginLeft: 4}}>
                                    <FontText style={{color: difference > 0 ? "#275E2B" : "#a60303", fontSize: 14, fontWeight: 500}}>{difference > 0 ? `+${difference.toFixed(0)}%` : `${difference.toFixed(0)}%`}</FontText>
                                </View>
                            }
                        </View>
                    </View>
                    <View style={{flexDirection: "column", flex: 1, paddingBottom: 6, paddingLeft: 12, paddingTop: 4}}>
                        <FontText style={{fontSize: 14, textAlign: "left", color: colors.text.secondary}}>Percent Long</FontText>
                        <FontText style={{fontSize: 20, color: colors.text.primary, fontWeight: "bold"}}>{statsToUse.percentShort !== undefined ? roundTo(100 - (statsToUse.percentShort*100), 0) + "%" : "N/A"}</FontText>
                    </View>
                </View>
                <LeftRightBias bias={statsToUse.leftRightBias} units={userData.preferences.units}/>
                <ShortPastBias bias={statsToUse.shortPastBias} units={userData.preferences.units}/>

                <FontText style={{marginTop: 24, fontWeight: 700, fontSize: 16, marginBottom: 10}}>HOW TO READ THE DATA</FontText>
                <View>
                    <View style={{flexDirection: "row", alignItems: "center", marginBottom: 2}}>
                        <View style={{width: 8, height: 8, borderRadius: 15, backgroundColor: "black", marginRight: 8}}></View>
                        <FontText style={{fontSize: 14, fontWeight: 500}}>First Putt Placement</FontText>
                    </View>
                    <FontText style={{marginLeft: 16, color: colors.text.secondary}}>Measures how often missed putts end up on the high side of the hole—the side above the break. Missing on the high side typically means you're playing enough break, while low-side misses often slide below the cup with no chance of going in. PGA Tour Pros average 80% high side misses.</FontText>
                </View>
                <View style={{width: "100%", marginTop: 10}}>
                    <View style={{flexDirection: "row", alignItems: "center", marginBottom: 2}}>
                        <View style={{width: 8, height: 8, borderRadius: 15, backgroundColor: "black", marginRight: 8}}></View>
                        <FontText style={{fontSize: 14, fontWeight: 500}}>Left-Right Bias</FontText>
                    </View>
                    <FontText style={{marginLeft: 16, color: colors.text.secondary}}>This shows if you're missing putts left or right. A circle centered at 0ft means you're balanced. If it's left of center, you're pulling your putts the left; right of center means you're pushing putts right.</FontText>
                </View>
                <View style={{marginTop: 10, marginBottom: 24}}>
                    <View style={{flexDirection: "row", alignItems: "center", marginBottom: 2}}>
                        <View style={{width: 8, height: 8, borderRadius: 15, backgroundColor: "black", marginRight: 8}}></View>
                        <FontText style={{fontSize: 14, fontWeight: 500}}>Short-Past Bias</FontText>
                    </View>
                    <FontText style={{marginLeft: 16, color: colors.text.secondary}}>This shows if you're leaving putts short or hitting them past the hole. You always want to hit the ball past the hole, generally 1-2ft past (if it doesn't go in). If you consistently hit it short, it never has a chance to go in.</FontText>
                </View>
            </ScrollView>
        </View>
    )
}