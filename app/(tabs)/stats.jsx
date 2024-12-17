import {Dimensions, FlatList, ScrollView, Text, useColorScheme, View} from "react-native";
import useColors from "../../hooks/useColors";
import RadarChart from "../../components/stats/graphs/SpiderGraph";
import {useAppContext} from "../../contexts/AppCtx";
import React, {useEffect, useRef, useState} from "react";
import SlopePopup from "../../components/stats/popups/SlopePopup";
import {PrimaryButton} from "../../components/buttons/PrimaryButton";
import BreakPopup from "../../components/stats/popups/BreakPopup";
import {Toggleable} from "../../components/buttons/Toggleable";
import DistancePopup from "../../components/stats/popups/DistancePopup";
import {filterMissDistribution} from "../../utils/PuttUtils";
import {roundTo} from "../../utils/roundTo";
import {createPuttsByBreak, createPuttsMadeByBreak, createStrokesGainedByBreak} from "../../utils/GraphUtils";
import {BarChart} from "../../charts";

const tabs = [
    {
        id: 1,
        title: "Overview",
        content: (
            <OverviewTab/>
        )
    },
    {
        id: 2,
        title:"Strokes Gained",
        content: (
            <StrokesGainedTab></StrokesGainedTab>
        )
    },
    {
        id: 3,
        title: "Putts / Hole",
        content: (
            <PuttsAHoleTab/>
        )
    },
    {
        id: 4,
        title: "Made Putts",
        content: (
            <MadePuttsTab/>
        )
    },
    {
        id: 5,
        title: "Misses",
        content: (
            <MissesTab/>
        )
    }
]

const slopes = [
    "Downhill",
    "Neutral",
    'Uphill'
]

const breaks = [
    "Right to Left",
    "Straight",
    "Left to Right"
]

const distances = [
    "<6 ft",
    "6-12 ft",
    "12-20 ft",
    "20+ ft"
]

export default function Stats({}) {
    const colors = useColors();
    const [tab, setTab] = useState(0);
    const listRef = useRef(null);
    const scrollViewRef = useRef(null);

    const scrollTo = (i) => {
        listRef.current.scrollToIndex({index: i});
    }

    const {width} = Dimensions.get("screen")
    const handleScroll = (event) => {
        setTab(Math.round(event.nativeEvent.contentOffset.x / width))
    }

    useEffect(() => {
        console.log(tab)
        if (scrollViewRef.current !== null && tab !== undefined)
            scrollViewRef.current.scrollToIndex({
                index: tab,
                viewPosition: 0.5,
            });
    }, [tab]);

    return (
        <View style={{
            backgroundColor: colors.background.primary,
            borderBottomWidth: 1,
            borderBottomColor: colors.border.default,
            flex: 1
        }}>
            <Text style={{color: colors.text.primary, fontSize: 24, marginLeft: 24, fontWeight: 600, marginBottom: 12}}>Stats</Text>
            <FlatList
                ref={scrollViewRef}
                contentContainerStyle={{gap: 4, paddingHorizontal: 24}}
                data={tabs}
                horizontal
                showsHorizontalScrollIndicator={false}
                renderItem={({item, index}) => <Toggleable key={item.id} title={item.title} toggled={tab === index} onPress={() => {
                    scrollTo(index);
                }}/>}
            />
            <FlatList
                contentContainerStyle={{
                    flexGrow: 1,
                    marginTop: 24
                }}
                ref={listRef}
                data={tabs}
                onScroll={handleScroll}
                horizontal={true}
                pagingEnabled={true}
                showsHorizontalScrollIndicator={false}
                renderItem={({item}) => item.content}
            />
        </View>

    )
}

// TODO allow filtering by time as well
function MissesTab() {
    const colors = useColors();
    const {currentStats} = useAppContext();
    const [slope, setSlope] = useState(-1);
    const [brek, setBrek] = useState(-1);
    const [distance, setDistance] = useState(-1);

    const slopeRef = useRef(null);
    const breakRef = useRef(null);
    const distanceRef = useRef(null);

    const {width} = Dimensions.get("screen")

    const MissDistribution = () => {
        if (currentStats === undefined || Object.keys(currentStats).length === 0) {
            return <View></View>
        }

        return (
            <RadarChart graphSize={400}
                        scaleCount={4}
                        numberInterval={0}
                        data={[filterMissDistribution(currentStats, distance, slope, brek)]}
                        options={{
                            graphShape: 1,
                            showAxis: true,
                            showIndicator: true,
                            colorList: ["#24b2ff", "red"],
                            dotList: [false, true],
                        }}></RadarChart>
        )
    }

    const MissDistanceChart = () => {
        const data = [{
            value: currentStats.lessThanSix.avgMiss*12,
            label: "<6 ft",
            labelTextStyle: {color: colors.text.primary},
        }, {
            value: currentStats.sixToTwelve.avgMiss*12,
            label: "6-12 ft",
            labelTextStyle: {color: colors.text.primary},
        }, {
            value: currentStats.twelveToTwenty.avgMiss*12,
            label: "12-20 ft",
            labelTextStyle: {color: colors.text.primary},
        }, {
            value: currentStats.twentyPlus.avgMiss*12,
            label: ">20 ft",
            labelTextStyle: {color: colors.text.primary},
        }]

        // biggest avgMiss:
        const max = Math.max(...data.map((item) => item.value)) * 1.1;

        return (
            <View/>
        )
    }

    return (
        <ScrollView bounces={false} contentContainerStyle={{
            width: width,
            paddingHorizontal: 24,
            alignItems: "center",
            flexDirection: "column",
        }}>
            <Text style={{color: colors.text.primary, fontSize: 24, fontWeight: 600, textAlign: "center"}}>Miss
                Distribution</Text>
            <View style={{flexDirection: "row", width: "100%", gap: 15, marginTop: 18}}>
                <PrimaryButton style={{flex: 1, borderRadius: 8, paddingVertical: 8}}
                               title={slope === -1 ? "Filter Slopes" : "Slope: " + slopes[slope]}
                               onPress={() => slopeRef.current.present()}/>
                <PrimaryButton style={{flex: 1, borderRadius: 8, paddingVertical: 8}}
                               title={brek === -1 ? "Filter Breaks" : "Break: " + breaks[brek]}
                               onPress={() => breakRef.current.present()}/>
            </View>
            <View style={{flexDirection: "row", width: "100%", marginTop: 6}}>
                <PrimaryButton style={{flex: 1, borderRadius: 8, paddingVertical: 8}}
                               title={distance === -1 ? "Filter Distances" : "Distances: " + distances[distance]}
                               onPress={() => {
                                   distanceRef.current.present();
                               }}/>
            </View>
            <MissDistribution currentStats={currentStats}/>

            <Text style={{color: colors.text.primary, fontSize: 24, fontWeight: 600, textAlign: "center", marginBottom: 12}}>Miss
                by Distance</Text>
            <MissDistanceChart></MissDistanceChart>

            <SlopePopup slopeRef={slopeRef} slope={slope} setSlope={setSlope}></SlopePopup>
            <BreakPopup breakRef={breakRef} brek={brek} setBrek={setBrek}></BreakPopup>
            <DistancePopup distanceRef={distanceRef} distance={distance} setDistance={setDistance}></DistancePopup>
        </ScrollView>
    )
}

function StrokesGainedTab() {
    const colors = useColors();
    const colorScheme = useColorScheme();

    const {currentStats, userData, puttSessions} = useAppContext();

    const {width} = Dimensions.get("screen")

    const SGByDistanceChart = () => {
        return (
            <BarChart
                minNumber={-2}
                maxNumber={2}
                segments={4}
                data={{
                    labels: ['<6 ft', '6-12 ft', '12-20 ft', '>20 ft'],
                    datasets: [
                        {
                            data: [
                                userData.averagePerformance.strokesGained.distance[0], userData.averagePerformance.strokesGained.distance[1], userData.averagePerformance.strokesGained.distance[2], userData.averagePerformance.strokesGained.distance[3]
                            ]
                        }
                    ],
                }}
                width={Dimensions.get('window').width - 16}
                height={220}
                autoShiftLabels
                showValuesOnTopOfBars={true}
                chartConfig={{
                    backgroundColor: colors.background.primary,
                    backgroundGradientFrom: colors.background.primary,
                    backgroundGradientTo: colors.background.primary,
                    decimalPlaces: 0,

                    fillShadowGradientFromOpacity: colorScheme === "light" ? 0.4 : 0.5,
                    fillShadowGradientToOpacity: colorScheme === "light" ? 0.1 : 0.2,

                    textColor: colors.text.primary,

                    capColor: colors.checkmark.background,

                    color: (opacity = 1) => {
                        if (opacity === 1) return colors.checkmark.background
                        return colorScheme === "light" ? `rgba(0, 0, 0, ${opacity})` : `rgba(255, 255, 255, ${opacity})`
                    },
                    style: {
                        borderRadius: 16,
                    },
                }}
                style={{
                    marginVertical: 8,
                    borderRadius: 16,
                }}
                yAxisSuffix={" strokes"}
                hideLegend={true}
            />
        )
    }

    // TODO make the text red when negative
    const SGByBreakSlope = () => {
        if (userData === undefined || Object.keys(userData).length === 0) {
            return <View></View>
        }

        return (
            <RadarChart graphSize={Dimensions.get("screen").width-36}
                        scaleCount={4}
                        numberInterval={0}
                        data={[createStrokesGainedByBreak(userData)]}
                        options={{
                            graphShape: 1,
                            showAxis: true,
                            showIndicator: true,
                            colorList: ["#24b2ff", "red"],
                            dotList: [false, true],
                        }}></RadarChart>
        )
    }

    return (
        <ScrollView contentContainerStyle={{paddingBottom: 0, alignItems: "center"}} showsVerticalScrollIndicator={false} bounces={false} style={{width: width, paddingHorizontal: 24}}>
            <Text style={{color: colors.text.secondary, fontSize: 14, fontWeight: 400, textAlign: "center"}}>Strokes Gained</Text>
            <View style={{flexDirection: "row", justifyContent: "center", alignItems: "center", width: "100%", gap: 6}}>
                <Text style={{color: colors.text.primary, fontSize: 48, fontWeight: 600}}>{userData.averagePerformance.strokesGained.overall}</Text>
                <View style={{backgroundColor: "#A1ECA8", alignItems: "center", justifyContent: "center", borderRadius: 32, paddingHorizontal: 10, paddingVertical: 4}}>
                    <Text style={{color: "#275E2B", fontSize: 14, fontWeight: 500}}>+ 0.4 SG</Text>
                </View>
            </View>
            <Text style={{color: colors.text.secondary, fontSize: 14, fontWeight: 400, textAlign: "center"}}>(over 18 holes, last 5 sessions)</Text>
            <Text style={{fontSize: 18, fontWeight: 600, color: colors.text.primary, marginTop: 20, marginBottom: 8, textAlign: "left", width: "100%"}}>Strokes Gained by Distance</Text>
            <View style={{alignItems: "center"}}>
                <SGByDistanceChart/>
            </View>
            <View style={{flexDirection: "row", width: "100%", alignItems: "center", justifyContent: "center", gap: 6}}>
                <View style={{backgroundColor: "#40C2FF", aspectRatio: 1, width: 14, borderRadius: 12}}></View>
                <Text style={{color: colors.text.primary}}>Your Averages</Text>
            </View>
            <Text style={{fontSize: 18, fontWeight: 600, color: colors.text.primary, marginTop: 20, marginBottom: 8, textAlign: "left", width: "100%"}}>Strokes Gained by Break/Slope</Text>
            <SGByBreakSlope></SGByBreakSlope>
        </ScrollView>
    )
}

function OverviewTab() {
    const colors = useColors();

    const {currentStats, userData, puttSessions} = useAppContext();

    const {width} = Dimensions.get("screen")

    // only 18 hole simulations and real simulations, no other practices
    const RecentSession = ({recentSession}) => {
        if (currentStats === undefined || Object.keys(currentStats).length === 0) {
            return <View></View>
        }

        const formattedName = () => {
            if (recentSession.type === "real-simulation") {
                return recentSession.holes + " Hole Round";
            } else if (recentSession.type === "round-simulation") {
                return recentSession.holes + " Hole Simulation";
            }
            return "huggidy buggidy"
        }

        return (
            <View style={{backgroundColor: colors.background.secondary, borderRadius: 12, paddingTop: 8}}>
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
                    }}>{formattedName()}</Text>
                    <Text style={{
                        fontSize: 14,
                        textAlign: "right",
                        color: colors.text.secondary,
                        fontWeight: "normal",
                        flex: 1
                    }}>
                        {new Date(recentSession.timestamp).toLocaleDateString('en-US', {
                            year: '2-digit',
                            month: '2-digit',
                            day: '2-digit'
                        })}
                    </Text>
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
                        <Text style={{fontSize: 14, textAlign: "left", color: colors.text.secondary}}>Strokes Gained</Text>
                        <Text style={{
                            fontSize: 20,
                            color: colors.text.primary,
                            fontWeight: "bold",
                        }}>{recentSession.strokesGained}</Text>
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
                        <Text style={{fontSize: 14, textAlign: "left", color: colors.text.secondary}}>Difficulty</Text>
                        <Text style={{
                            fontSize: 20,
                            color: colors.text.primary,
                            fontWeight: "bold",
                        }}>{recentSession.type === "round-simulation" ? recentSession.difficulty : "your mom"}</Text>
                    </View>
                    <View style={{
                        flexDirection: "column",
                        flex: 1,
                        paddingBottom: 12,
                        paddingTop: 6,
                        paddingLeft: 12
                    }}>
                        <Text style={{fontSize: 14, textAlign: "left", color: colors.text.secondary}}>Total Putts</Text>
                        <Text style={{
                            fontSize: 20,
                            color: colors.text.primary,
                            fontWeight: "bold",
                        }}>{recentSession.totalPutts}</Text>
                    </View>
                </View>
            </View>
        )
    }

    return (
        <ScrollView contentContainerStyle={{paddingBottom: 32}} showsVerticalScrollIndicator={false} bounces={false} style={{width: width, paddingHorizontal: 24}}>
            <Text style={{color: colors.text.secondary, fontSize: 14, fontWeight: 400, textAlign: "center"}}>Strokes Gained</Text>
            <View style={{flexDirection: "row", justifyContent: "center", alignItems: "center", width: "100%", gap: 6}}>
                <Text style={{color: colors.text.primary, fontSize: 48, fontWeight: 600}}>{userData.averagePerformance.strokesGained.overall}</Text>
                <View style={{backgroundColor: "#A1ECA8", alignItems: "center", justifyContent: "center", borderRadius: 32, paddingHorizontal: 10, paddingVertical: 4}}>
                    <Text style={{color: "#275E2B", fontSize: 14, fontWeight: 500}}>+ 0.4 SG</Text>
                </View>
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
                            }}>{userData.averagePerformance.onePutts}</Text>
                            <Text style={{color: colors.text.secondary, fontWeight: 400, fontSize: 14}}>({roundTo((userData.averagePerformance.onePutts/18)*100, 0)}%)</Text>
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
                            }}>{userData.averagePerformance.twoPutts}</Text>
                            <Text style={{color: colors.text.secondary, fontWeight: 400, fontSize: 14}}>({roundTo((userData.averagePerformance.twoPutts/18)*100,0)}%)</Text>
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
                            }}>{userData.averagePerformance.threePutts}</Text>
                            <Text style={{color: colors.text.secondary, fontWeight: 400, fontSize: 14}}>({roundTo((userData.averagePerformance.threePutts/18)*100,0)}%)</Text>
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
                        }}>{userData.averagePerformance.avgMiss}ft</Text>
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
                        }}>{userData.averagePerformance.totalDistance}ft</Text>
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
                            }}>{userData.averagePerformance.puttsMisread}</Text>
                            <Text style={{color: colors.text.secondary, fontWeight: 400, fontSize: 14}}>({roundTo((userData.averagePerformance.puttsMisread/18)*100,0)}%)</Text>
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
}

function PuttsAHoleTab() {
    const colors = useColors();
    const colorScheme = useColorScheme();

    const {currentStats, userData} = useAppContext();

    const {width} = Dimensions.get("screen")

    const PuttsByBreakSlope = () => {
        if (userData === undefined || Object.keys(userData).length === 0) {
            return <View></View>
        }

        return (
            <RadarChart graphSize={Dimensions.get("screen").width - 36}
                        scaleCount={4}
                        numberInterval={0}
                        data={[createPuttsByBreak(userData)]}
                        options={{
                            graphShape: 1,
                            showAxis: true,
                            showIndicator: true,
                            colorList: ["#24b2ff", "red"],
                            dotList: [false, true],
                        }}></RadarChart>
        )
    }

    // TODO mayeb make this a graph that shows the difference, where it starts in the middle and goes up /down
    const PuttsByDistanceChart = () => {
        return (
            <BarChart
                data={{
                    labels: ['<6 ft', '6-12 ft', '12-20 ft', '>20 ft'],
                    datasets: [
                        {
                            data: [
                                userData.averagePerformance.puttsAHole.distance[0], userData.averagePerformance.puttsAHole.distance[1], userData.averagePerformance.puttsAHole.distance[2], userData.averagePerformance.puttsAHole.distance[3]
                            ]
                        },
                        {
                            data: [
                                1.34, 1.50, 1.70, 2
                            ]
                        }
                    ],
                }}
                width={Dimensions.get('window').width - 16}
                height={220}
                fromZero={true}
                yAxisInterval={1}
                segments={3}
                showValuesOnTopOfBars={true}

                fromNumber={3}
                chartConfig={{
                    backgroundColor: colors.background.primary,
                    backgroundGradientFrom: colors.background.primary,
                    backgroundGradientTo: colors.background.primary,
                    decimalPlaces: 0,

                    fillShadowGradientFromOpacity: 0.5,
                    fillShadowGradientToOpacity: 0.3,
                    textColor: colors.text.primary,
                    secondaryCapColor: colorScheme === "light" ? "#0e4e75" : "white",
                    capColor: colors.checkmark.background,
                    color: (opacity = 1) => {
                        if (opacity === 1) return colors.checkmark.background
                        return colorScheme === "light" ? `rgba(0, 0, 0, ${opacity})` : `rgba(255, 255, 255, ${opacity})`
                    },
                    style: {
                        borderRadius: 16,
                    },
                }}
                style={{
                    marginVertical: 8,
                    borderRadius: 16,
                }}
                yAxisSuffix={" putts"}
                hideLegend={true}
            />
        )
    }

    return (
        <ScrollView contentContainerStyle={{alignItems: "center", paddingBottom: 12}} style={{width: width, paddingHorizontal: 24}}>
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
                        <Text style={{fontSize: 14, textAlign: "left", color: colors.text.secondary}}>Putts per Hole</Text>
                        <Text style={{
                            fontSize: 20,
                            color: colors.text.primary,
                            fontWeight: "bold",
                        }}>{userData.averagePerformance.puttsAHole.puttsAHole}</Text>
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
                        <Text style={{fontSize: 14, textAlign: "left", color: colors.text.secondary}}>Putts When Misread</Text>
                        <Text style={{
                            fontSize: 20,
                            color: colors.text.primary,
                            fontWeight: "bold",
                        }}>{userData.averagePerformance.puttsAHole.puttsAHoleWhenMisread}</Text>
                    </View>
                    <View style={{
                        flexDirection: "column",
                        flex: 1,
                        paddingBottom: 12,
                        paddingTop: 6,
                        paddingLeft: 12
                    }}>
                        <Text style={{fontSize: 14, textAlign: "left", color: colors.text.secondary}}>Putts When Misshit</Text>
                        <Text style={{
                            fontSize: 20,
                            color: colors.text.primary,
                            fontWeight: "bold",
                        }}>{userData.averagePerformance.puttsAHole.puttsAHoleWhenMishit}</Text>
                    </View>
                </View>
            </View>
            <Text style={{fontSize: 18, fontWeight: 600, color: colors.text.primary, marginTop: 20, marginBottom: 8, textAlign: "left", width: "100%"}}>Putts a Hole by Break/Slope</Text>
            <PuttsByBreakSlope></PuttsByBreakSlope>
            <Text style={{fontSize: 18, fontWeight: 600, color: colors.text.primary, marginTop: 20, marginBottom: 8, textAlign: "left", width: "100%"}}>Putts a Hole by Distance</Text>
            <View style={{overflow: "hidden", marginRight: 32, paddingLeft: 24}}>
                <PuttsByDistanceChart/>
            </View>
            <View style={{flexDirection: "row", width: "100%", alignItems: "center", justifyContent: "center", gap: 12}}>
                <View style={{flexDirection: "row", alignItems: "center", gap: 6}}>
                    <View style={{backgroundColor: "#40C2FF", aspectRatio: 1, width: 14, borderRadius: 12}}></View>
                    <Text style={{color: colors.text.primary}}>Your Averages</Text>
                </View>
                <View style={{flexDirection: "row", alignItems: "center", gap: 6}}>
                    <View style={{backgroundColor: colorScheme === "light" ? "#0e4e75" : "white", aspectRatio: 1, width: 14, borderRadius: 12}}></View>
                    <Text style={{color: colors.text.primary}}>Tour Pro</Text>
                </View>
            </View>
        </ScrollView>
    )
}

function MadePuttsTab() {
    const colors = useColors();
    const colorScheme = useColorScheme();

    const {currentStats, userData, puttSessions} = useAppContext();

    const {width} = Dimensions.get("screen")

    const MakeByDistanceChart = () => {
        return (
            <BarChart
                minNumber={0}
                maxNumber={100}
                data={{
                    labels: ['<6 ft', '6-12 ft', '12-20 ft', '>20 ft'],
                    datasets: [
                        {
                            data: [
                                userData.averagePerformance.madePutts.distance[0]*100, userData.averagePerformance.madePutts.distance[1]*100, userData.averagePerformance.madePutts.distance[2]*100, userData.averagePerformance.madePutts.distance[3]*100
                            ]
                        },
                        {
                            data: [
                                75, 50, 20, 10
                            ]
                        },
                    ],
                }}
                width={Dimensions.get('window').width - 16}
                height={220}
                autoShiftLabels
                showValuesOnTopOfBars={true}
                chartConfig={{
                    backgroundColor: colors.background.primary,
                    backgroundGradientFrom: colors.background.primary,
                    backgroundGradientTo: colors.background.primary,
                    decimalPlaces: 0,

                    fillShadowGradientFromOpacity: colorScheme === "light" ? 0.4 : 0.5,
                    fillShadowGradientToOpacity: colorScheme === "light" ? 0.1 : 0.2,

                    formatTopBarValue: (value) => value + "%",

                    textColor: colors.text.primary,
                    capColor: colors.checkmark.background,
                    secondaryCapColor: colorScheme === "light" ? "#0e4e75" : "white",

                    color: (opacity = 1) => {
                        if (opacity === 1) return colors.checkmark.background
                        return colorScheme === "light" ? `rgba(0, 0, 0, ${opacity})` : `rgba(255, 255, 255, ${opacity})`
                    },
                    style: {
                        borderRadius: 16,
                    },
                }}
                style={{
                    marginVertical: 8,
                    borderRadius: 16,
                }}
                yAxisSuffix={"%"}
                hideLegend={true}
            />
        )
    }

    const MakeByBreakSlope = () => {
        if (userData === undefined || Object.keys(userData).length === 0) {
            return <View></View>
        }

        return (
            <RadarChart graphSize={Dimensions.get("screen").width-36}
                        scaleCount={4}
                        numberInterval={0}
                        data={[createPuttsMadeByBreak(userData)]}
                        options={{
                            graphShape: 1,
                            showAxis: true,
                            showIndicator: true,
                            colorList: ["#24b2ff", "red"],
                            dotList: [false, true],
                        }}></RadarChart>
        )
    }

    return (
        <ScrollView contentContainerStyle={{paddingBottom: 0, alignItems: "center"}} showsVerticalScrollIndicator={false} bounces={false} style={{width: width, paddingHorizontal: 24}}>
            <Text style={{fontSize: 18, fontWeight: 600, color: colors.text.primary, marginTop: 20, marginBottom: 8, textAlign: "left", width: "100%"}}>Make Percent by Distance</Text>
            <View style={{alignItems: "center"}}>
                <MakeByDistanceChart/>
            </View>
            <View style={{flexDirection: "row", width: "100%", alignItems: "center", justifyContent: "center", gap: 12}}>
                <View style={{flexDirection: "row", alignItems: "center", gap: 6}}>
                    <View style={{backgroundColor: "#40C2FF", aspectRatio: 1, width: 14, borderRadius: 12}}></View>
                    <Text style={{color: colors.text.primary}}>Your Averages</Text>
                </View>
                <View style={{flexDirection: "row", alignItems: "center", gap: 6}}>
                    <View style={{backgroundColor: colorScheme === "light" ? "#0e4e75" : "white", aspectRatio: 1, width: 14, borderRadius: 12}}></View>
                    <Text style={{color: colors.text.primary}}>Tour Pro</Text>
                </View>
            </View>
            <Text style={{fontSize: 18, fontWeight: 600, color: colors.text.primary, marginTop: 20, marginBottom: 8, textAlign: "left", width: "100%"}}>Make Percent by Break/Slope</Text>
            <MakeByBreakSlope></MakeByBreakSlope>
        </ScrollView>
    )
}