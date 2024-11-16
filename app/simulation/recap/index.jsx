import {ThemedView} from "../../../components/ThemedView";
import {Colors} from "../../../constants/Colors";
import {ThemedText} from "../../../components/ThemedText";
import {useColorScheme} from "../../../hooks/useColorScheme";
import {View, Image, Text, Pressable} from "react-native";
import {useLocalSearchParams, useRouter} from "expo-router";
import {useEffect, useState} from "react";

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
    const { current, holes, difficulty, mode, serializedPutts, date} = useLocalSearchParams();
    const putts = JSON.parse(serializedPutts);

    const colorScheme = useColorScheme();
    const router = useRouter();

    const [{farLeft, left, center, right, farRight, long, short}, setMisses] = useState(initialMisses);
    const [totalPutts, setTotalPutts] = useState(0);
    const [averageDistance, setAverageDistance] = useState(0);

    const updateMisses = (field, value) => {
        setMisses(prevState => ({
            ...prevState,
            [field]: value,
        }));
    };

    const roundTo = (num, decimalPlaces) => {
        const factor = Math.pow(10, decimalPlaces);
        return Math.round(num * factor) / factor;
    };

    useEffect(() => {
        let totalPutts = 0;
        let averageDistance = 0;

        let farLeft = 0
        let left = 0;
        let center = 0;
        let right = 0;
        let farRight = 0;
        let long = 0;
        let short = 0;

        putts.forEach((putt) => {
            if (putt.distanceMissed === 0) totalPutts++;
            else {
                totalPutts += 2; // TODO THIS ASSUMES THEY MAKE THE SECOND PUTT, MAYBE WE TWEAK THAT LATER
            }

            if (averageDistance === 0) averageDistance = putt.distanceMissed;
            else averageDistance = (averageDistance + putt.distanceMissed) / 2;

            const angle = Math.atan2(putt.yDistance, putt.xDistance); // atan2 handles dx = 0 cases
            const degrees = (angle * 180) / Math.PI; // Convert radians to degrees

            // Check the quadrant based on the rotated ranges
            if (putt.distanceMissed < 2) center++
            else if (degrees > -45 && degrees <= 45) {
                if (putt.distanceMissed < 5)
                    right++;
                else
                    farRight++;
            } else if (degrees > 45 && degrees <= 135) {
                long++;
            } else if (degrees > -135 && degrees <= -45) {
                if (putt.distanceMissed < 5)
                    left++;
                else
                    farLeft++;
            } else {
                console.log(degrees + "short")
                short++;
            }
        });

        setMisses({farLeft, left, center, right, farRight, long: long, short});

        setTotalPutts(totalPutts);
        setAverageDistance(roundTo(averageDistance, 1))
    }, []);

    return (
        <ThemedView className="flex-1 items-center flex-col" style={{justifyContent: "space-between"}}>
            <View>
                <ThemedView style={{
                    borderColor: Colors[colorScheme ?? 'light'].border,
                    justifyContent: "center",
                    alignContent: "center",
                    width: "100%",
                    borderBottomWidth: 1,
                    paddingTop: 6,
                    paddingBottom: 10
                }}>
                    <Text style={{
                        textAlign: "center",
                        fontSize: 16,
                        fontWeight: "medium",
                        color: Colors[colorScheme ?? 'light'].text
                    }}>Simulation Recap</Text>
                    <Image source={require('@/assets/images/PuttLabLogo.png')}
                           style={{position: "absolute", left: 12, top: -2, width: 35, height: 35}}/>
                </ThemedView>
                <ThemedView className={"px-6"} style={{width: "100%", paddingTop: 32}}>
                    <ThemedText style={{textAlign: "center"}} type={"header"}>Good Job!</ThemedText>
                    <ThemedText style={{textAlign: "center", marginBottom: 24}} type={"default"}>This {current === "true" ? "is" : "was"} your nth
                        session.</ThemedText>
                    <RecapVisual holes={holes} totalPutts={totalPutts} avgDistance={averageDistance}
                                 makeData={{farLeft, left, center, right, farRight, long, short}} date={date}
                                 colorScheme={colorScheme}></RecapVisual>
                </ThemedView>
            </View>
            <View style={{width: "100%", paddingBottom: 24, paddingHorizontal: 32}}>
                <Pressable onPress={() => router.push({ pathname: `/` })} style={({pressed}) => [{backgroundColor: pressed ? '#282d1d' : '#333D20'}, {
                    paddingVertical: 10,
                    borderRadius: 10,
                    width: "100%"
                }]}>
                    <Text style={{textAlign: "center", color: "white", fontSize: 18, fontWeight: 400}}>
                        {current === "true" ? "Continue" : "Back"}
                    </Text>
                </Pressable>
            </View>
        </ThemedView>
    )
}

function RecapVisual({holes, totalPutts, avgDistance, makeData, date, colorScheme}) {
    const gridData = Array.from({length: 15}, (_, index) => index + 1);

    return (
        <View style={{backgroundColor: "#333D20", flexDirection: "column", paddingTop: 12, borderRadius: 16, elevation: 4}}>
            <View style={{width: "100%", paddingBottom: 12, borderBottomWidth: 1, borderColor: "#677943"}}>
                <Text style={{fontSize: 16, textAlign: "center", color: "white"}}>Session Recap</Text>
                <View style={{position: "absolute", left: 12, flexDirection: "row", gap: 8}}>
                    <Image source={require('@/assets/images/PuttLabLogo.png')} style={{width: 25, height: 25}}/>
                    <Text style={{fontSize: 16, fontWeight: "bold", color: "white"}}>PuttLab</Text>
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
                            text = makeData.long + "%";
                        }
                        if (index === 5) {
                            text = Math.floor((makeData.farLeft / holes)*100) + "%";
                        }
                        if (index === 6) {
                            text = Math.floor((makeData.left / holes)*100) + "%";
                        }
                        if (index === 7) {
                            text = Math.floor((makeData.center / holes)*100) + "%";
                        }
                        if (index === 8) {
                            text = Math.floor((makeData.right / holes)*100) + "%";
                        }
                        if (index === 9) {
                            text = Math.floor((makeData.farRight / holes)*100) + "%";
                        }
                        if (index === 12) {
                            text = Math.floor((makeData.short / holes)*100) + "%";
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
            <View style={{width: "100%", flexDirection: "column", borderTopWidth: 1, borderColor: "#677943"}}>
                <Text style={{
                    fontSize: 16,
                    textAlign: "center",
                    color: "white",
                    borderBottomWidth: 1,
                    borderColor: "#677943",
                    paddingVertical: 6
                }}>Session Recap</Text>
                <View style={{flexDirection: "row"}}>
                    <View style={{
                        flexDirection: "column",
                        flex: 1,
                        borderRightWidth: 1,
                        borderColor: "#677943",
                        paddingBottom: 12,
                        paddingTop: 6,
                        paddingLeft: 12
                    }}>
                        <Text style={{fontSize: 14, textAlign: "left", color: "#B2C490"}}>Make %</Text>
                        <Text style={{
                            fontSize: 20,
                            textAlign: "left",
                            color: "white",
                            fontWeight: "bold"
                        }}>{Math.floor((makeData.center / holes)*100)}%</Text>
                    </View>
                    <View style={{
                        flexDirection: "column",
                        flex: 1,
                        borderRightWidth: 1,
                        borderColor: "#677943",
                        paddingBottom: 12,
                        paddingTop: 6,
                        paddingLeft: 12
                    }}>
                        <Text style={{fontSize: 14, textAlign: "left", color: "#B2C490"}}>Avg. Distance</Text>
                        <Text style={{
                            fontSize: 20,
                            textAlign: "left",
                            color: "white",
                            fontWeight: "bold"
                        }}>{avgDistance}ft</Text>
                    </View>
                    <View style={{flexDirection: "column", flex: 1, paddingBottom: 12, paddingTop: 6, paddingLeft: 12}}>
                        <Text style={{fontSize: 14, textAlign: "left", color: "#B2C490"}}>Putts</Text>
                        <Text style={{
                            fontSize: 20,
                            textAlign: "left",
                            color: "white",
                            fontWeight: "bold"
                        }}>{totalPutts}</Text>
                    </View>
                </View>
            </View>
        </View>
    )
}