import useColors from "../../../../hooks/useColors";
import {roundTo} from "../../../../utils/roundTo";
import {Dimensions, ScrollView, View} from "react-native";
import {RecentSession} from "./RecentSession";
import FontText from "../../../general/FontText";
import ColumnStat from "../../../stats/performance/ColumnStat";
import React from "react";
import {useAppContext} from "../../../../contexts/AppContext";
import {convertUnits} from "../../../../utils/Conversions";
import {SeeAllSessions} from "../../practice";

export const OverviewTab = ({
                                statsToUse,
                                previousStats,
                                sessions = [],
                                userData: personsData
                            }) => {
    const colors = useColors();
    const { width } = Dimensions.get("screen");

    if (statsToUse === 0) {
        return <></>;
    }

    const {userData} = useAppContext();

    let difference = 0;
    // if (
    //     previousStats !== undefined &&
    //     previousStats.length > 0
    // ) {
    //     difference = ((statsToUse.expectedPutts - statsToUse.totalPutts) / (statsToUse.holesPlayed / 18)) - ((previousStats[0].expectedPutts - statsToUse.totalPutts) / (statsToUse.holesPlayed / 18))
    // }

    return (
        <ScrollView
            contentContainerStyle={{ paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}
            bounces={false}
            style={{ width, paddingHorizontal: 20 }}
        >
            <FontText style={{ color: colors.text.secondary, fontSize: 14, fontWeight: 400, textAlign: "center" }}>Strokes Gained</FontText>
            <FontText style={{ color: colors.text.secondary, fontSize: 12, fontWeight: 800, marginTop: 2, textAlign: "center" }}>VS</FontText>
            <FontText style={{ color: colors.text.secondary, fontSize: 14, fontWeight: 400, textAlign: "center" }}>PGA Tour Pro</FontText>

            <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", width: "100%", gap: 6 }}>
                <FontText style={{ color: colors.text.primary, fontSize: 48, fontWeight: 600 }}>
                    {((statsToUse.strokesGained.expectedStrokes - statsToUse.totalPutts) / (statsToUse.holesPlayed / 18)) > 0 ? "+" : ""}
                    {roundTo((statsToUse.strokesGained.expectedStrokes - statsToUse.totalPutts) / (statsToUse.holesPlayed / 18), 1)}
                </FontText>

                {previousStats && previousStats.length > 0 && difference !== 0 && (
                    <View style={{
                        backgroundColor: difference > 0 ? "#A1ECA8" : "#ffc3c3",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 32,
                        paddingHorizontal: 10,
                        paddingVertical: 4
                    }}>
                        <FontText style={{
                            color: difference > 0 ? "#275E2B" : "#a60303",
                            fontSize: 14,
                            fontWeight: 500
                        }}>
                            {difference > 0 ? `+ ${difference.toFixed(1)} SG` : `${difference.toFixed(1)} SG`}
                        </FontText>
                    </View>
                )}
            </View>

            <FontText style={{ color: colors.text.secondary, fontSize: 14, fontWeight: 400, textAlign: "center" }}>
                (per 18 holes)
            </FontText>

            <View style={{ backgroundColor: colors.background.secondary, borderRadius: 12, paddingTop: 8, marginTop: 20 }}>
                <View style={{
                    paddingHorizontal: 12,
                    borderBottomWidth: 1,
                    borderColor: colors.border.default,
                    paddingBottom: 6,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center"
                }}>
                    <FontText style={{ fontSize: 16, textAlign: "left", color: colors.text.primary, fontWeight: "bold", flex: 1 }}>
                        Average Performance
                    </FontText>
                    {/*<FontText style={{ fontSize: 14, textAlign: "right", color: colors.text.secondary, fontWeight: "normal", flex: 1 }}>*/}
                    {/*    (last 5 sessions)*/}
                    {/*</FontText>*/}
                </View>

                <View style={{ flexDirection: "row" }}>
                    <ColumnStat label={"1 PUTTS"} value={roundTo(statsToUse.averageRound.onePutts / (statsToUse.holesPlayed / 18), 1)} percent={roundTo(((statsToUse.averageRound.onePutts / (statsToUse.holesPlayed / 18)) / 18) * 100, 0)} />
                    <ColumnStat label={"3+ PUTTS"} value={roundTo(statsToUse.averageRound.threePlusPutts / (statsToUse.holesPlayed / 18), 1)} percent={roundTo(((statsToUse.averageRound.threePlusPutts / (statsToUse.holesPlayed / 18)) / 18) * 100, 0)} />
                    <ColumnStat label={"AVG PUTTS"} value={roundTo(statsToUse.totalPutts/(statsToUse.holesPlayed/18), 1)} right />
                </View>

                <View style={{ flexDirection: "row", borderTopWidth: 1, borderTopColor: colors.border.default }}>
                    <ColumnStat label={"AVG MISS"} value={convertUnits(roundTo(statsToUse.missData.totalMissDistance/statsToUse.missData.totalMissedPutts, 1), 0, userData.preferences.units)} units={userData.preferences.units === 0 ? "ft" : "m"} />
                    <ColumnStat label={"DISTANCE"} value={convertUnits(roundTo(statsToUse.averageRound.totalDistance/(statsToUse.holesPlayed / 18), 1), 0, userData.preferences.units)} units={userData.preferences.units === 0 ? "ft" : "m"} />
                    <ColumnStat label={"MISREADS"} value={statsToUse.misreadData.totalMisreads/(statsToUse.holesPlayed/18)} percent={roundTo(((statsToUse.misreadData.totalMisreads/(statsToUse.holesPlayed/18)) / 18) * 100, 0)} right />
                </View>
            </View>

            {sessions.length > 0 &&
                <>
                    <FontText style={{ fontSize: 18, fontWeight: 600, color: colors.text.primary, marginTop: 20, marginBottom: 8 }}>
                        Recent Sessions
                    </FontText>
                    <View style={{gap: 12}}>
                        {sessions.slice(0, 3).map((session, index) => (
                            <RecentSession key={"recent-" + index} recentSession={session}/>
                        ))}
                    </View>
                    <SeeAllSessions />
                </>
            }
        </ScrollView>
    );
};