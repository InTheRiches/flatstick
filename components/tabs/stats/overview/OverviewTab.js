import useColors from "../../../../hooks/useColors";
import {useAppContext} from "../../../../contexts/AppCtx";
import {Dimensions, ScrollView, View} from "react-native";
import {roundTo} from "../../../../utils/roundTo";
import {RecentSession} from "./RecentSession";
import React from "react";
import FontText from "../../../general/FontText";
import {SeeAllSessions} from "../../home";

export const OverviewTab = ({statsToUse}) => {
    const colors = useColors();
    const {puttSessions, previousStats, userData} = useAppContext();
    const {width} = Dimensions.get("screen")

    let difference = 0;

    if (previousStats !== undefined && previousStats.length > 0)
        difference = statsToUse.strokesGained.overall - previousStats[0].strokesGained.overall;

    return (
        <ScrollView contentContainerStyle={{paddingBottom: 32}} showsVerticalScrollIndicator={false} bounces={false} style={{width: width, paddingHorizontal: 24}}>
            <FontText style={{color: colors.text.secondary, fontSize: 14, fontWeight: 400, textAlign: "center"}}>Strokes Gained</FontText>
            <View style={{flexDirection: "row", justifyContent: "center", alignItems: "center", width: "100%", gap: 6}}>
                <FontText style={{color: colors.text.primary, fontSize: 48, fontWeight: 600}}>{statsToUse.strokesGained.overall}</FontText>
                { previousStats !== undefined && previousStats.length > 0 && difference !== 0 &&
                    <View style={{backgroundColor: difference > 0 ? "#A1ECA8" : "#ffc3c3", alignItems: "center", justifyContent: "center", borderRadius: 32, paddingHorizontal: 10, paddingVertical: 4}}>
                        <FontText style={{color: difference > 0 ? "#275E2B" : "#a60303", fontSize: 14, fontWeight: 500}}>{difference > 0 ? `+ ${difference.toFixed(1)} SG` : `${difference.toFixed(1)} SG`}</FontText>
                    </View>
                }
            </View>
            <FontText style={{color: colors.text.secondary, fontSize: 14, fontWeight: 400, textAlign: "center"}}>(per 18 holes, last 5 sessions)</FontText>
            <View style={{backgroundColor: colors.background.secondary, borderRadius: 12, paddingTop: 8, marginTop: 20}}>
                <View style={{
                    paddingHorizontal: 12,
                    borderBottomWidth: 1,
                    borderColor: colors.border.default,
                    paddingBottom: 6,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center"
                }}>
                    <FontText style={{
                        fontSize: 16,
                        textAlign: "left",
                        color: colors.text.primary,
                        fontWeight: "bold",
                        flex: 1
                    }}>Average Performance</FontText>
                    <FontText style={{
                        fontSize: 14,
                        textAlign: "right",
                        color: colors.text.secondary,
                        fontWeight: "normal",
                        flex: 1
                    }}>(last 5 sessions)</FontText>
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
                        <FontText style={{fontSize: 14, textAlign: "left", color: colors.text.secondary}}>1 Putts</FontText>
                        <View style={{flexDirection: "row", alignItems: "center", justifyContent: "flex-start", gap: 8}}>
                            <FontText style={{
                                fontSize: 20,
                                color: colors.text.primary,
                                fontWeight: "bold",
                            }}>{statsToUse.onePutts}</FontText>
                            <FontText style={{color: colors.text.secondary, fontWeight: 400, fontSize: 14}}>({roundTo((statsToUse.onePutts/18)*100, 0)}%)</FontText>
                        </View>
                    </View>
                    <View style={{
                        flexDirection: "column",
                        flex: 1,
                        paddingBottom: 12,
                        paddingTop: 6,
                        paddingLeft: 12
                    }}>
                        <FontText style={{fontSize: 14, textAlign: "left", color: colors.text.secondary}}>3+ Putts</FontText>
                        <View style={{flexDirection: "row", alignItems: "center", justifyContent: "flex-start", gap: 8}}>
                            <FontText style={{
                                fontSize: 20,
                                color: colors.text.primary,
                                fontWeight: "bold",
                            }}>{statsToUse.threePutts}</FontText>
                            <FontText style={{color: colors.text.secondary, fontWeight: 400, fontSize: 14}}>({roundTo((statsToUse.threePutts/18)*100,0)}%)</FontText>
                        </View>
                    </View>
                    <View style={{
                        flexDirection: "column",
                        flex: 1,
                        borderLeftWidth: 1,
                        borderColor: colors.border.default,
                        paddingBottom: 12,
                        paddingTop: 6,
                        paddingLeft: 12
                    }}>
                        <FontText style={{fontSize: 14, textAlign: "left", color: colors.text.secondary}}>Avg. Putts</FontText>
                        <FontText style={{
                            fontSize: 20,
                            color: colors.text.primary,
                            fontWeight: "bold",
                        }}>{statsToUse.avgPuttsARound}</FontText>
                    </View>
                </View>
                <View style={{flexDirection: "row", borderTopWidth: 1, borderTopColor: colors.border.default}}>
                    <View style={{
                        flexDirection: "column",
                        flex: 1,
                        borderRightWidth: 1,
                        borderColor: colors.border.default,
                        paddingBottom: 12,
                        paddingTop: 6,
                        paddingLeft: 12,
                    }}>
                        <FontText style={{fontSize: 14, textAlign: "left", color: colors.text.secondary}}>Avg. Miss</FontText>
                        <FontText style={{
                            fontSize: 20,
                            color: colors.text.primary,
                            fontWeight: "bold",
                            textAlign: "left"
                        }}>{statsToUse.avgMiss}{userData.preferences.units === 0 ? "ft" : "m"}</FontText>
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
                        <FontText style={{fontSize: 14, textAlign: "left", color: colors.text.secondary}}>Total Distance</FontText>
                        <FontText style={{
                            fontSize: 20,
                            color: colors.text.primary,
                            fontWeight: "bold",
                            textAlign: "left"
                        }}>{statsToUse.totalDistance}{userData.preferences.units === 0 ? "ft" : "m"}</FontText>
                    </View>
                    <View style={{
                        flexDirection: "column",
                        flex: 1,
                        paddingBottom: 12,
                        paddingTop: 6,
                        paddingLeft: 12
                    }}>
                        <FontText style={{fontSize: 14, textAlign: "left", color: colors.text.secondary}}>Putts Misread</FontText>
                        <View style={{flexDirection: "row", alignItems: "center", justifyContent: "flex-start", gap: 8}}>
                            <FontText style={{
                                fontSize: 20,
                                color: colors.text.primary,
                                fontWeight: "bold",
                            }}>{statsToUse.puttsMisread}</FontText>
                            <FontText style={{color: colors.text.secondary, fontWeight: 400, fontSize: 14}}>({roundTo((statsToUse.puttsMisread/18)*100,0)}%)</FontText>
                        </View>
                    </View>
                </View>
            </View>
            <FontText style={{fontSize: 18, fontWeight: 600, color: colors.text.primary, marginTop: 20, marginBottom: 8}}>Recent Sessions</FontText>
            <View style={{gap: 12}}>
                {
                    // sort it by the timestamp which is in milliseconds
                    puttSessions.sort((a, b) => b.timestamp - a.timestamp).slice(0, 3).map((session, index) => {
                        return <RecentSession key={"recent-" + index} recentSession={session}></RecentSession>
                    })
                }
            </View>
            <SeeAllSessions/>
        </ScrollView>
    )
};