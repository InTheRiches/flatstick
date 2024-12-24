import useColors from "../../../../hooks/useColors";
import {useAppContext} from "../../../../contexts/AppCtx";
import {Dimensions, ScrollView, Text, View} from "react-native";
import {roundTo} from "../../../../utils/roundTo";
import {RecentSession} from "./RecentSession";
import React from "react";

export const OverviewTab = ({statsToUse}) => {
    const colors = useColors();
    const {puttSessions, previousStats} = useAppContext();
    const {width} = Dimensions.get("screen")

    let difference = 0;

    if (previousStats !== undefined && previousStats.length > 0)
        difference = statsToUse.averagePerformance.strokesGained.overall - previousStats[0].averagePerformance.strokesGained.overall;

    return (
        <ScrollView contentContainerStyle={{paddingBottom: 32}} showsVerticalScrollIndicator={false} bounces={false} style={{width: width, paddingHorizontal: 24}}>
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
                    <Text style={{
                        fontSize: 16,
                        textAlign: "left",
                        color: colors.text.primary,
                        fontWeight: "bold",
                        flex: 1
                    }}>Average Performance</Text>
                    <Text style={{
                        fontSize: 14,
                        textAlign: "right",
                        color: colors.text.secondary,
                        fontWeight: "normal",
                        flex: 1
                    }}>(last 5 sessions)</Text>
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
                        <Text style={{fontSize: 14, textAlign: "left", color: colors.text.secondary}}>1 Putts</Text>
                        <View style={{flexDirection: "row", alignItems: "center", justifyContent: "flex-start", gap: 8}}>
                            <Text style={{
                                fontSize: 20,
                                color: colors.text.primary,
                                fontWeight: "bold",
                            }}>{statsToUse.averagePerformance.onePutts}</Text>
                            <Text style={{color: colors.text.secondary, fontWeight: 400, fontSize: 14}}>({roundTo((statsToUse.averagePerformance.onePutts/18)*100, 0)}%)</Text>
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
                        <Text style={{fontSize: 14, textAlign: "left", color: colors.text.secondary}}>2 Putts</Text>
                        <View style={{flexDirection: "row", alignItems: "center", justifyContent: "flex-start", gap: 8}}>
                            <Text style={{
                                fontSize: 20,
                                color: colors.text.primary,
                                fontWeight: "bold",
                            }}>{statsToUse.averagePerformance.twoPutts}</Text>
                            <Text style={{color: colors.text.secondary, fontWeight: 400, fontSize: 14}}>({roundTo((statsToUse.averagePerformance.twoPutts/18)*100,0)}%)</Text>
                        </View>
                    </View>
                    <View style={{
                        flexDirection: "column",
                        flex: 1,
                        paddingBottom: 12,
                        paddingTop: 6,
                        paddingLeft: 12
                    }}>
                        <Text style={{fontSize: 14, textAlign: "left", color: colors.text.secondary}}>3+ Putts</Text>
                        <View style={{flexDirection: "row", alignItems: "center", justifyContent: "flex-start", gap: 8}}>
                            <Text style={{
                                fontSize: 20,
                                color: colors.text.primary,
                                fontWeight: "bold",
                            }}>{statsToUse.averagePerformance.threePutts}</Text>
                            <Text style={{color: colors.text.secondary, fontWeight: 400, fontSize: 14}}>({roundTo((statsToUse.averagePerformance.threePutts/18)*100,0)}%)</Text>
                        </View>
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
                        <Text style={{fontSize: 14, textAlign: "left", color: colors.text.secondary}}>Avg. Miss</Text>
                        <Text style={{
                            fontSize: 20,
                            color: colors.text.primary,
                            fontWeight: "bold",
                            textAlign: "left"
                        }}>{statsToUse.averagePerformance.avgMiss}ft</Text>
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
                        <Text style={{fontSize: 14, textAlign: "left", color: colors.text.secondary}}>Total Distance</Text>
                        <Text style={{
                            fontSize: 20,
                            color: colors.text.primary,
                            fontWeight: "bold",
                            textAlign: "left"
                        }}>{statsToUse.averagePerformance.totalDistance}ft</Text>
                    </View>
                    <View style={{
                        flexDirection: "column",
                        flex: 1,
                        paddingBottom: 12,
                        paddingTop: 6,
                        paddingLeft: 12
                    }}>
                        <Text style={{fontSize: 14, textAlign: "left", color: colors.text.secondary}}>Putts Misread</Text>
                        <View style={{flexDirection: "row", alignItems: "center", justifyContent: "flex-start", gap: 8}}>
                            <Text style={{
                                fontSize: 20,
                                color: colors.text.primary,
                                fontWeight: "bold",
                            }}>{statsToUse.averagePerformance.puttsMisread}</Text>
                            <Text style={{color: colors.text.secondary, fontWeight: 400, fontSize: 14}}>({roundTo((statsToUse.averagePerformance.puttsMisread/18)*100,0)}%)</Text>
                        </View>
                    </View>
                </View>
            </View>
            <Text style={{fontSize: 18, fontWeight: 600, color: colors.text.primary, marginTop: 20, marginBottom: 8}}>Recent Sessions</Text>
            <View style={{gap: 12}}>
                {
                    // sort it by the timestamp which is in milliseconds
                    puttSessions.sort((a, b) => b.timestamp - a.timestamp).slice(0, 3).map((session, index) => {
                        return <RecentSession key={"recent-" + index} recentSession={session}></RecentSession>
                    })
                }
            </View>
        </ScrollView>
    )
};