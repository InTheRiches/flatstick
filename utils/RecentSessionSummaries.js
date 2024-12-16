import {getAuth} from "firebase/auth";
import {collection, getDocs, getFirestore, limit, orderBy, query} from "firebase/firestore";
import React, {useEffect, useState} from "react";
import useColors from "../hooks/useColors";
import {Text, useColorScheme, View} from "react-native";
import {roundTo} from "./roundTo";

export default function RecentSessionSummary({unfinished}) {
    const auth = getAuth();
    const db = getFirestore();

    const [recentSession, setRecentSession] = useState(null);
    const [loaded, setLoaded] = useState(false);

    const colors = useColors();
    const colorScheme = useColorScheme();

    useEffect(() => {
        console.log("getting data")
        const q = query(collection(db, "users/" + auth.currentUser.uid + "/sessions"), orderBy("timestamp", "desc"), limit(1));
        getDocs(q).then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                // doc.data() is never undefined for query doc snapshots
                setRecentSession(doc.data());
                console.log("found data")
            });
            setLoaded(true);
        }).catch((error) => {
            console.log("couldnt find the documents: " + error)
        });
    }, []);

    let date;
    if (recentSession !== null)
        date = new Date(recentSession.date);
    else
        date = new Date();

    if (!loaded) {
        return <View></View>
    }

    if (recentSession === null) {
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

    switch(recentSession.type) {
        case "real-simulation":
            return getRealSimulation(colors, colorScheme, date, recentSession, unfinished);
        case "round-simulation":
            return getHoleSimulation(colors, colorScheme, date, recentSession, unfinished);
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
