import React from "react";
import useColors from "../hooks/useColors";
import {Text, useColorScheme, View} from "react-native";
import {roundTo} from "./roundTo";
import {useAppContext} from "@/contexts/AppCtx";

export default function RecentSessionSummary({unfinished}) {
    const {puttSessions} = useAppContext();

    const colors = useColors();
    const colorScheme = useColorScheme();

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
                <Text style={{
                    textAlign: "left",
                    color: colors.text.primary,
                    fontSize: 20,
                }}>No sessions</Text>
                <Text style={{
                    textAlign: "left",
                    color: colors.text.secondary,
                    fontSize: 16,
                    marginTop: 4
                }}>You haven't practiced yet, what are you waiting for? A motivational speech from your putter?</Text>
            </View>
        )
    }

    switch(puttSessions[0].type) {
        case "real-simulation":
            return getRealSimulation(colors, colorScheme, date, puttSessions[0], unfinished);
        case "round-simulation":
            return getHoleSimulation(colors, colorScheme, date, puttSessions[0], unfinished);
    }
}

function getHoleSimulation(colors, colorScheme, date, recentSession, unfinished) {
    return (
        <View
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
                    <Text style={{textAlign: "left", color: colors.text.primary}}>{(date.getMonth() + 1) +
                        "/" + date.getDate()}</Text>
                    <Text style={{
                        textAlign: "left",
                        color: colors.text.primary,
                        fontSize: 24
                    }}>Previous</Text>
                    <Text style={{
                        textAlign: "left",
                        color: colors.text.primary,
                        fontSize: 24,
                        marginTop: -8
                    }}>Session</Text>
                </View>
                <View style={{flex: 1}}>
                    <Text style={{textAlign: "right", color: colors.text.primary}}>#132</Text>
                    <Text
                        style={{
                            textAlign: "right",
                            color: colors.text.primary,
                            fontSize: 24
                        }}>Simulation</Text>
                    <Text style={{
                        textAlign: "right",
                        color: colors.text.primary,
                        fontSize: 24,
                        marginTop: -8
                    }}>Summary</Text>
                </View>
            </View>
            <View style={{flexDirection: "row", justifyContent: "space-between"}}>
                <View>
                    <Text style={{textAlign: "left", color: colors.text.secondary}}>Difficulty</Text>
                    <Text style={{
                        textAlign: "left",
                        color: colors.text.primary,
                        fontSize: 18,
                        fontWeight: "bold"
                    }}>{recentSession.difficulty}</Text>
                </View>
                <View>
                    <Text style={{textAlign: "left", color: colors.text.secondary}}>Made</Text>
                    <Text
                        style={{
                            textAlign: "left",
                            color: colors.text.primary,
                            fontSize: 18,
                            fontWeight: "bold"
                        }}>{roundTo(recentSession.madePercent * 100, 1)}%</Text>
                </View>
                <View>
                    <Text style={{textAlign: "left", color: colors.text.secondary}}>SG</Text>
                    <Text
                        style={{
                            textAlign: "left",
                            color: colors.text.primary,
                            fontSize: 18,
                            fontWeight: "bold"
                        }}>{recentSession.strokesGained > 0 && "+"}{recentSession.strokesGained}</Text>
                </View>
                <View>
                    <Text style={{textAlign: "left", color: colors.text.secondary}}>Avg. Miss</Text>
                    <Text style={{
                        textAlign: "left",
                        color: colors.text.primary,
                        fontSize: 18,
                        fontWeight: "bold"
                    }}>{recentSession.avgMiss}ft</Text>
                </View>
            </View>
        </View>
    );
}

function getRealSimulation(colors, colorScheme, date, recentSession, unfinished) {
    return (
        <View
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
                    <Text style={{textAlign: "left", color: colors.text.primary}}>{(date.getMonth() + 1) +
                        "/" + date.getDate()}</Text>
                    <Text style={{
                        textAlign: "left",
                        color: colors.text.primary,
                        fontSize: 24,
                        fontWeight: 500
                    }}>Previous</Text>
                    <Text style={{
                        textAlign: "left",
                        color: colors.text.primary,
                        fontSize: 24,
                        marginTop: -8,
                        fontWeight: 500
                    }}>Session</Text>
                </View>
                <View style={{flex: 1}}>
                    <Text style={{textAlign: "right", color: colors.text.primary}}>#132</Text>
                    <Text style={{
                        textAlign: "right",
                        color: colors.text.primary,
                        fontSize: 24,
                        fontWeight: 500
                    }}>{recentSession.holes} Hole Round</Text>
                    <Text style={{
                        textAlign: "right",
                        color: colors.text.primary,
                        fontSize: 24,
                        marginTop: -8,
                        fontWeight: 500
                    }}>Summary</Text>
                </View>
            </View>
            <View style={{flexDirection: "row", justifyContent: "space-between"}}>
                <View>
                    <Text style={{textAlign: "left", color: colors.text.secondary}}>Holes</Text>
                    <Text style={{
                        textAlign: "left",
                        color: colors.text.primary,
                        fontSize: 18,
                        fontWeight: "bold"
                    }}>{recentSession.holes}</Text>
                </View>
                <View>
                    <Text style={{textAlign: "left", color: colors.text.secondary}}>Made</Text>
                    <Text
                        style={{
                            textAlign: "left",
                            color: colors.text.primary,
                            fontSize: 18,
                            fontWeight: "bold"
                        }}>{roundTo(recentSession.madePercent * 100, 1)}%</Text>
                </View>
                <View>
                    <Text style={{textAlign: "left", color: colors.text.secondary}}>Total Putts</Text>
                    <Text
                        style={{
                            textAlign: "left",
                            color: colors.text.primary,
                            fontSize: 18,
                            fontWeight: "bold"
                        }}>{recentSession.totalPutts}</Text>
                </View>
                <View>
                    <Text style={{textAlign: "left", color: colors.text.secondary}}>Avg. Miss</Text>
                    <Text style={{
                        textAlign: "left",
                        color: colors.text.primary,
                        fontSize: 18,
                        fontWeight: "bold"
                    }}>{recentSession.avgMiss}ft</Text>
                </View>
            </View>
        </View>
    );
}
