import React from "react";
import useColors from "../../../hooks/useColors";
import {Pressable, View} from "react-native";
import {roundTo} from "../../../utils/roundTo";
import {useAppContext} from "@/contexts/AppCtx";
import {useRouter} from "expo-router";
import FontText from "../../general/FontText";
import {convertUnits} from "../../../utils/Conversions";

export function RecentSessionSummary({unfinished}) {
    const {puttSessions, userData} = useAppContext();

    const colors = useColors();
    const colorScheme = "light";
    const router = useRouter();

    let date;
    if (puttSessions[0] !== null && puttSessions[0] !== undefined)
        date = new Date(puttSessions[0].date);
    else
        date = new Date();

    if (puttSessions[0] === null || puttSessions[0] === undefined) {
        return (
            <View
                style={{
                    backgroundColor: colors.background.secondary,
                    paddingHorizontal: 16,
                    paddingTop: 12,
                    paddingBottom: 14,
                    borderTopLeftRadius: 16,
                    borderTopRightRadius: 16,
                    borderBottomLeftRadius: unfinished ? 8 : 16,
                    borderBottomRightRadius: unfinished ? 8 : 16,
                    marginBottom: unfinished ? 4 : 0
                }}>
                <FontText style={{textAlign: "left", color: colors.text.primary, fontSize: 20}}>No sessions</FontText>
                <FontText style={{textAlign: "left", color: colors.text.secondary, fontSize: 16, marginTop: 4}}>You haven't practiced yet, what are you waiting for? A motivational speech from your putter?</FontText>
            </View>
        )
    }

    switch(puttSessions[0].type) {
        case "real-simulation":
            return getRealSimulation(userData, colors, colorScheme, date, puttSessions[0], puttSessions.length, unfinished, router);
        case "round-simulation":
            return getHoleSimulation(userData, colors, colorScheme, date, puttSessions[0], puttSessions.length, unfinished, router);
    }
}

function getHoleSimulation(userData, colors, colorScheme, date, recentSession, puttSessionsLength, unfinished, router) {
    return (
        <Pressable onPress={() => router.push({pathname: "sessions/individual", params: {jsonSession: JSON.stringify(recentSession), recap: false}})} style={{
                backgroundColor: colors.background.secondary,
                paddingHorizontal: 16,
                paddingTop: 8,
                paddingBottom: 14,
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
                borderBottomLeftRadius: unfinished ? 8 : 16,
                borderBottomRightRadius: unfinished ? 8 : 16,
                marginBottom: unfinished ? 4 : 0
            }}>
            <View style={{
                flexDirection: "row",
                paddingBottom: 12,
                borderBottomWidth: colorScheme === "light" ? 1 : 2,
                borderColor: colors.border.default,
                marginBottom: 14
            }}>
                <View style={{flex: 1}}>
                    <FontText style={{textAlign: "left", color: colors.text.primary}}>{(date.getMonth() + 1) +
                        "/" + date.getDate() + "/" + date.getFullYear()}</FontText>
                    <FontText style={{
                        textAlign: "left",
                        color: colors.text.primary,
                        fontSize: 24,
                        fontWeight: 500,
                    }}>Previous</FontText>
                    <FontText style={{
                        textAlign: "left",
                        color: colors.text.primary,
                        fontSize: 24,
                        marginTop: -8,
                        fontWeight: 500,
                    }}>Session</FontText>
                </View>
                <View style={{flex: 1}}>
                    <FontText style={{textAlign: "right", color: colors.text.primary}}>#{puttSessionsLength}</FontText>
                    <FontText style={{textAlign: "right", color: colors.text.primary, fontSize: 24, fontWeight: 500,}}>Simulation</FontText>
                    <FontText style={{textAlign: "right", color: colors.text.primary, fontSize: 24, marginTop: -8, fontWeight: 500,}}>Summary</FontText>
                </View>
            </View>
            <View style={{flexDirection: "row", justifyContent: "space-between"}}>
                <View>
                    <FontText style={{textAlign: "left", color: colors.text.secondary}}>Difficulty</FontText>
                    <FontText style={{
                        textAlign: "left",
                        color: colors.text.primary,
                        fontSize: 18,
                        fontWeight: "bold"
                    }}>{recentSession.difficulty[0].toUpperCase() + recentSession.difficulty.slice(1)}</FontText>
                </View>
                <View>
                    <FontText style={{textAlign: "left", color: colors.text.secondary}}>Made</FontText>
                    <FontText style={{textAlign: "left", color: colors.text.primary, fontSize: 18, fontWeight: "bold"}}>{roundTo(recentSession.madePercent * 100, 1)}%</FontText>
                </View>
                <View>
                    <FontText style={{textAlign: "left", color: colors.text.secondary}}>SG</FontText>
                    <FontText
                        style={{
                            textAlign: "left",
                            color: colors.text.primary,
                            fontSize: 18,
                            fontWeight: "bold"
                        }}>{recentSession.strokesGained > 0 && "+"}{recentSession.strokesGained}</FontText>
                </View>
                <View>
                    <FontText style={{textAlign: "left", color: colors.text.secondary}}>Avg. Miss</FontText>
                    <FontText style={{
                        textAlign: "left",
                        color: colors.text.primary,
                        fontSize: 18,
                        fontWeight: "bold"
                    }}>{convertUnits(recentSession.avgMiss, recentSession.units, userData.preferences.units)}{userData.preferences.units === 0 ? "ft" : "m"}</FontText>
                </View>
            </View>
        </Pressable>
    );
}

function getRealSimulation(userData, colors, colorScheme, date, recentSession, puttSessionsLength, unfinished, router) {
    return (
        <Pressable onPress={() => router.push({pathname: "sessions/individual", params: {jsonSession: JSON.stringify(recentSession), recap: false}})}
            style={{
                backgroundColor: colors.background.secondary,
                paddingHorizontal: 16,
                paddingTop: 8,
                paddingBottom: 14,
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
                borderBottomLeftRadius: unfinished ? 8 : 16,
                borderBottomRightRadius: unfinished ? 8 : 16,
                marginBottom: unfinished ? 4 : 0
            }}>
            <View style={{
                flexDirection: "row",
                paddingBottom: 12,
                borderBottomWidth: colorScheme === "light" ? 1 : 2,
                borderColor: colors.border.default,
                marginBottom: 14
            }}>
                <View style={{flex: 1}}>
                    <FontText style={{textAlign: "left", color: colors.text.primary}}>{(date.getMonth() + 1) +
                        "/" + date.getDate() + "/" + date.getFullYear()}</FontText>
                    <FontText style={{
                        textAlign: "left",
                        color: colors.text.primary,
                        fontSize: 24,
                        fontWeight: 500
                    }}>Previous</FontText>
                    <FontText style={{
                        textAlign: "left",
                        color: colors.text.primary,
                        fontSize: 24,
                        marginTop: -8,
                        fontWeight: 500
                    }}>Session</FontText>
                </View>
                <View style={{flex: 1}}>
                    <FontText style={{textAlign: "right", color: colors.text.primary}}>#{puttSessionsLength}</FontText>
                    <FontText style={{
                        textAlign: "right",
                        color: colors.text.primary,
                        fontSize: 24,
                        fontWeight: 500
                    }}>Round</FontText>
                    <FontText style={{
                        textAlign: "right",
                        color: colors.text.primary,
                        fontSize: 24,
                        marginTop: -8,
                        fontWeight: 500
                    }}>Summary</FontText>
                </View>
            </View>
            <View style={{flexDirection: "row", justifyContent: "space-between"}}>
                <View>
                    <FontText style={{textAlign: "left", color: colors.text.secondary}}>Holes</FontText>
                    <FontText style={{
                        textAlign: "left",
                        color: colors.text.primary,
                        fontSize: 18,
                        fontWeight: "bold"
                    }}>{recentSession.holes}</FontText>
                </View>
                <View>
                    <FontText style={{textAlign: "left", color: colors.text.secondary}}>Made</FontText>
                    <FontText
                        style={{
                            textAlign: "left",
                            color: colors.text.primary,
                            fontSize: 18,
                            fontWeight: "bold"
                        }}>{roundTo(recentSession.madePercent * 100, 1)}%</FontText>
                </View>
                <View>
                    <FontText style={{textAlign: "left", color: colors.text.secondary}}>SG</FontText>
                    <FontText
                        style={{
                            textAlign: "left",
                            color: colors.text.primary,
                            fontSize: 18,
                            fontWeight: "bold"
                        }}>{recentSession.strokesGained > 0 && "+"}{recentSession.strokesGained}</FontText>
                </View>
                <View>
                    <FontText style={{textAlign: "left", color: colors.text.secondary}}>Avg. Miss</FontText>
                    <FontText style={{
                        textAlign: "left",
                        color: colors.text.primary,
                        fontSize: 18,
                        fontWeight: "bold"
                    }}>{convertUnits(recentSession.avgMiss, recentSession.units, userData.preferences.units)}{userData.preferences.units === 0 ? "ft" : "m"}</FontText>
                </View>
            </View>
        </Pressable>
    );
}
