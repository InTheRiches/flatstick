import {ThemedView} from "@/components/ThemedView";
import {ThemedText} from "@/components/ThemedText";
import {Image, Text, View} from "react-native";
import {useLocalSearchParams, useNavigation} from "expo-router";
import {useEffect, useState} from "react";
import useColors from "@/hooks/useColors";
import {PrimaryButton} from "@/components/buttons/PrimaryButton";
import {roundTo} from "../../../../utils/roundTo";

const initialMisses = {
    farLeft: 0,
    left: 0,
    center: 0,
    right: 0,
    farRight: 0,
    long: 0,
    short: 0,
}

export default function SimulationRecap() {
    const {current, holes, madePercent, totalPutts, difficulty, mode, avgMiss, serializedPutts, date} = useLocalSearchParams();
    const putts = JSON.parse(serializedPutts);

    const parsedDate = new Date(date);

    const colors = useColors();
    const navigation = useNavigation();

    const [{farLeft, left, center, right, farRight, long, short}, setMisses] = useState(initialMisses);

    useEffect(() => {
        let farLeft = 0
        let left = 0;
        let center = 0;
        let right = 0;
        let farRight = 0;
        let long = 0;
        let short = 0;

        putts.forEach((putt) => {
            const angle = Math.atan2(putt.yDistance, putt.xDistance); // atan2 handles dx = 0 cases
            const degrees = (angle * 180) / Math.PI; // Convert radians to degrees

            // Check the quadrant based on the rotated ranges
            if (putt.distanceMissed <= 0.5 && !putt.largeMiss) {
                center++
            } else if (degrees > -45 && degrees <= 45) {
                if (putt.distanceMissed <= 2 && !putt.largeMiss) right++;
                else farRight++;
            } else if (degrees > 45 && degrees <= 135) {
                long++;
            } else if (degrees > -135 && degrees <= -45) {
                short++;
            } else {
                if (putt.distanceMissed <= 2 && !putt.largeMiss) left++;
                else farLeft++;
            }
        });

        setMisses({farLeft, left, center, right, farRight, long: long, short});
    }, []);

    return (
        <ThemedView style={{flex: 1, alignItems: "center", flexDirection: "column", justifyContent: "space-between"}}>
            <View style={{width: "100%"}}>
                <View style={{
                    borderColor: colors.border.default,
                    justifyContent: "center",
                    alignContent: "center",
                    width: "100%",
                    borderBottomWidth: 1,
                    paddingTop: 6,
                    paddingBottom: 10,
                }}>
                    <Text style={{
                        textAlign: "center",
                        fontSize: 16,
                        fontWeight: "medium",
                        color: colors.text.primary
                    }}>Session Recap</Text>
                    <Image source={require('@/assets/images/PuttLabLogo.png')}
                           style={{position: "absolute", left: 12, top: -2, width: 35, height: 35}}/>
                </View>
                <View style={{paddingHorizontal: 24, width: "100%", paddingTop: 32}}>
                    <ThemedText style={{textAlign: "center"}} type={"header"}>Good Job!</ThemedText>
                    <ThemedText style={{textAlign: "center", marginBottom: 24}}
                                type={"default"}>This {current === "true" ? "is" : "was"} your nth
                        session.</ThemedText>
                    <RecapVisual makePercent={madePercent} holes={holes} totalPutts={totalPutts} avgDistance={avgMiss}
                                 makeData={{farLeft, left, center, right, farRight, long, short}}
                                 date={parsedDate}></RecapVisual>
                </View>
            </View>
            <View style={{width: "100%", paddingBottom: 24, paddingHorizontal: 32}}>
                <PrimaryButton onPress={() => current !== "true" ? navigation.goBack() : navigation.navigate("(tabs)")}
                               title={current === "true" ? "Continue" : "Back"}
                               style={{paddingVertical: 10, borderRadius: 10}}></PrimaryButton>
            </View>
        </ThemedView>
    )
}

// TODO ADD DATE + # OF HOLES
function RecapVisual({holes, totalPutts, avgDistance, makeData, makePercent}) {
    const gridData = Array.from({length: 15}, (_, index) => index + 1);

    const colors = useColors();

    return (
        <View style={{
            backgroundColor: colors.background.secondary,
            flexDirection: "column",
            paddingTop: 12,
            borderRadius: 16,
            elevation: 4
        }}>
            <View style={{
                width: "100%",
                paddingBottom: 12,
                borderBottomWidth: 1,
                borderColor: colors.border.default
            }}>
                <Text style={{fontSize: 16, textAlign: "center", color: colors.text.primary}}>Session Recap</Text>
                <View style={{position: "absolute", left: 12, flexDirection: "row", gap: 8}}>
                    <Image source={require('@/assets/images/PuttLabLogo.png')}
                           style={{width: 30, height: 30, top: -4}}/>
                    <Text style={{fontSize: 16, fontWeight: "bold", color: colors.text.primary}}>PuttLab</Text>
                </View>
            </View>
            <View style={{width: "100%", flexDirection: "row", justifyContent: "center", alignContent: "center"}}>
                <Image source={require("@/assets/images/recapBackground.png")} style={{
                    width: "100%",
                    height: "auto",
                    aspectRatio: 4096 / 1835,
                    position: "absolute",
                    top: 0,
                    left: 0
                }}></Image>

                <View style={{
                    width: "75%",
                    height: "auto",
                    aspectRatio: 3072 / 1835,
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    alignItems: 'center',
                    columnGap: 9,
                    rowGap: 4,
                    paddingTop: 12
                }}>
                    {gridData.map((item, index) => {
                        let text = "";

                        if (index === 2) {
                            text = Math.floor((makeData.long / holes) * 100) + "%";
                        }
                        if (index === 5) {
                            text = Math.floor((makeData.farLeft / holes) * 100) + "%";
                        }
                        if (index === 6) {
                            text = Math.floor((makeData.left / holes) * 100) + "%";
                        }
                        if (index === 7) {
                            text = Math.floor((makeData.center / holes) * 100) + "%";
                        }
                        if (index === 8) {
                            text = Math.floor((makeData.right / holes) * 100) + "%";
                        }
                        if (index === 9) {
                            text = Math.floor((makeData.farRight / holes) * 100) + "%";
                        }
                        if (index === 12) {
                            text = Math.floor((makeData.short / holes) * 100) + "%";
                        }

                        return (
                            <View key={index} style={{
                                paddingTop: index > 4 && index !== 7 ? index === 12 ? 14 : 6 : 0,
                                width: '16%',
                                aspectRatio: 1,
                                justifyContent: 'center',
                                alignItems: 'center',
                                borderRadius: 5
                            }}>
                                <Text style={{
                                    fontSize: 16,
                                    fontWeight: "bold",
                                    color: [5, 9].includes(index) ? "white" : "#0e450b"
                                }}>{text}</Text>
                            </View>
                        )
                    })}
                </View>
            </View>
            <View style={{
                width: "100%",
                flexDirection: "column",
                borderTopWidth: 1,
                borderColor: colors.border.default
            }}>
                <Text style={{
                    fontSize: 16,
                    textAlign: "center",
                    color: colors.text.primary,
                    borderBottomWidth: 1,
                    borderColor: colors.border.default,
                    paddingVertical: 6
                }}>Stats</Text>
                <View style={{flexDirection: "row"}}>
                    <View style={{
                        flexDirection: "column",
                        flex: 0.7,
                        borderRightWidth: 1,
                        borderColor: colors.border.default,
                        paddingBottom: 12,
                        paddingTop: 6,
                        paddingLeft: 12
                    }}>
                        <Text style={{
                            fontSize: 14,
                            textAlign: "left",
                            color: colors.text.secondary
                        }}>Make %</Text>
                        <Text style={{
                            fontSize: 20,
                            textAlign: "left",
                            color: colors.text.primary,
                            fontWeight: "bold"
                        }}>{roundTo(makePercent*100, 0)}%</Text>
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
                        <Text style={{
                            fontSize: 14,
                            textAlign: "left",
                            color: colors.text.secondary
                        }}>Avg. Miss Distance</Text>
                        <Text style={{
                            fontSize: 20,
                            textAlign: "left",
                            color: colors.text.primary,
                            fontWeight: "bold"
                        }}>{avgDistance}ft</Text>
                    </View>
                    <View style={{
                        flexDirection: "column",
                        flex: 0.7,
                        paddingBottom: 12,
                        paddingTop: 6,
                        paddingLeft: 12
                    }}>
                        <Text style={{
                            fontSize: 14,
                            textAlign: "left",
                            color: colors.text.secondary
                        }}>Putts</Text>
                        <Text style={{
                            fontSize: 20,
                            textAlign: "left",
                            color: colors.text.primary,
                            fontWeight: "bold"
                        }}>{totalPutts}</Text>
                    </View>
                </View>
            </View>
        </View>
    )
}