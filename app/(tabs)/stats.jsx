import {Dimensions, FlatList, ScrollView, Text, View} from "react-native";
import useColors from "../../hooks/useColors";
import RadarChart from "../../components/stats/graphs/SpiderGraph";
import {useAppContext} from "../../contexts/AppCtx";
import React, {useRef, useState} from "react";
import SlopePopup from "../../components/stats/popups/SlopePopup";
import {PrimaryButton} from "../../components/buttons/PrimaryButton";
import BreakPopup from "../../components/stats/popups/BreakPopup";
import {Toggleable} from "../../components/buttons/Toggleable";
import DistancePopup from "../../components/stats/popups/DistancePopup";
import {filterMissDistribution, roundTo} from "../../utils/PuttUtils";
import {createPuttsByBreak} from "../../utils/GraphUtils";
import {StackedBarChart} from "react-native-chart-kit";

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
        title: "Putts / Hole",
        content: (
            <PuttsAHoleTab/>
        )
    },
    {
        id: 3,
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

    const scrollTo = (i) => {
        setTab(i);
        listRef.current.scrollToIndex({index: i});
    }

    const {width} = Dimensions.get("screen")
    const handleScroll = (event) => {
        setTab(Math.round(event.nativeEvent.contentOffset.x / width))
    }

    return (
        <View style={{
            backgroundColor: colors.background.primary,
            borderBottomWidth: 1,
            borderBottomColor: colors.border.default,
            flex: 1
        }}>
            <Text style={{color: colors.text.primary, fontSize: 24, marginLeft: 24, fontWeight: 600, marginBottom: 12}}>Stats</Text>
            <ScrollView showsHorizontalScrollIndicator={false} horizontal bounces={false} contentContainerStyle={{gap: 4, paddingHorizontal: 24}}>
                { // todo fix the tabs flickering when toggled
                    tabs.map((item, i) => {
                        return <Toggleable key={item.id} title={item.title} toggled={tab === i} onPress={() => scrollTo(i)}/>
                    })
                }
            </ScrollView>
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

function OverviewTab() {
    const colors = useColors();
    const {currentStats, userData} = useAppContext();

    const {width} = Dimensions.get("screen")

    // only 18 hole simulations and real simulations, no other practices
    const RecentSession = () => {
        if (currentStats === undefined || Object.keys(currentStats).length === 0) {
            return <View></View>
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
                    }}>18 Hole Simulation</Text>
                    <Text style={{
                        fontSize: 14,
                        textAlign: "right",
                        color: colors.text.secondary,
                        fontWeight: "normal",
                        flex: 1
                    }}>11/29/24</Text>
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
                        }}>3.2</Text>
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
                        }}>Hard</Text>
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
                        }}>33</Text>
                    </View>
                </View>
            </View>
        )
    }

    return (
        <View style={{width: width, paddingHorizontal: 24}}>
            <Text style={{color: colors.text.secondary, fontSize: 14, fontWeight: 400, textAlign: "center"}}>Strokes Gained</Text>
            <View style={{flexDirection: "row", justifyContent: "center", alignItems: "center", width: "100%", gap: 6}}>
                <Text style={{color: colors.text.primary, fontSize: 48, fontWeight: 600}}>{userData.strokesGained}</Text>
                <View style={{backgroundColor: "#A1ECA8", alignItems: "center", justifyContent: "center", borderRadius: 32, paddingHorizontal: 10, paddingVertical: 4}}>
                    <Text style={{color: "#275E2B", fontSize: 14, fontWeight: 500}}>+ 0.4 SG</Text>
                </View>
            </View>
            <Text style={{color: colors.text.secondary, fontSize: 14, fontWeight: 400, textAlign: "center"}}>(last 5 sessions)</Text>
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
            <View>
                <RecentSession/>
            </View>
        </View>
    )
}

function PuttsAHoleTab() {
    const colors = useColors();
    const {currentStats, userData} = useAppContext();

    const {width} = Dimensions.get("screen")

    const PuttsByBreakSlope = () => {
        if (userData === undefined || Object.keys(userData).length === 0) {
            return <View></View>
        }

        return (
            <RadarChart graphSize={Dimensions.get("screen").width}
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

    const PuttsByDistanceChart = () => {
        const data = [{
            value: userData.averagePerformance.puttsAHole.distance[0],
            label: "<6 ft",
            i: 0
        }, {
            value: userData.averagePerformance.puttsAHole.distance[1],
            label: "6-12 ft",
            i: 1
        }, {
            value: userData.averagePerformance.puttsAHole.distance[2],
            label: "12-20 ft",
            i: 2
        }, {
            value: 2.4,
            label: ">20 ft",
            i: 3
        }]

        return (
            <StackedBarChart
                data={{
                    labels: ['<6 ft', '6-12 ft', '12-20 ft', '>20 ft'],
                    legend: [],
                    data: [
                        [userData.averagePerformance.puttsAHole.distance[0], userData.averagePerformance.puttsAHole.distance[0]-1],
                        [userData.averagePerformance.puttsAHole.distance[1], userData.averagePerformance.puttsAHole.distance[1]-1],
                        [userData.averagePerformance.puttsAHole.distance[2], userData.averagePerformance.puttsAHole.distance[2]-1],
                        [2.4, 2.4-1]
                    ],
                    barColors: ["transparent", colors.checkmark.background]
                }}
                width={Dimensions.get('window').width - 16}
                height={220}
                fromZero={true}
                yAxisInterval={1}
                segments={3}
                fromNumber={3}
                chartConfig={{
                    backgroundColor: colors.background.primary,
                    backgroundGradientFrom: colors.background.primary,
                    backgroundGradientTo: colors.background.primary,
                    decimalPlaces: 0,

                    fillShadowGradientFromOpacity: 0.5,
                    fillShadowGradientToOpacity: 0.3,

                    color: (opacity = 1) => {
                        if (opacity === 1) return colors.checkmark.background
                        if (opacity === 0.6) return colors.checkmark.background
                        return `rgba(255, 255, 255, ${opacity})`
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
        <ScrollView contentContainerStyle={{alignItems: "center"}} style={{width: width, paddingHorizontal: 24}}>
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
                        }}>{userData.averagePerformance.puttsAHole.misreadPuttsAHole}</Text>
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
                        }}>?</Text>
                    </View>
                </View>
            </View>
            <Text style={{fontSize: 18, fontWeight: 600, color: colors.text.primary, marginTop: 20, marginBottom: 8, textAlign: "left", width: "100%"}}>Putts a Hole by Break/Slope</Text>
            <PuttsByBreakSlope></PuttsByBreakSlope>
            <Text style={{fontSize: 18, fontWeight: 600, color: colors.text.primary, marginTop: 20, marginBottom: 8, textAlign: "left", width: "100%"}}>Putts a Hole by Distance</Text>
            <View style={{overflow: "hidden", marginRight: 32, paddingLeft: 24}}>
                <PuttsByDistanceChart/>
            </View>
        </ScrollView>
    )
}