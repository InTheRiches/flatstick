import {Dimensions, FlatList, ScrollView, Text, View} from "react-native";
import useColors from "../../hooks/useColors";
import RadarChart from "../../components/stats/graphs/SpiderGraph";
import {useAppContext} from "../../contexts/AppCtx";
import {useRef, useState} from "react";
import {BarChart} from "react-native-gifted-charts";
import SlopePopup from "../../components/stats/popups/SlopePopup";
import {PrimaryButton} from "../../components/buttons/PrimaryButton";
import BreakPopup from "../../components/stats/popups/BreakPopup";
import {Toggleable} from "../../components/buttons/Toggleable";
import DistancePopup from "../../components/stats/popups/DistancePopup";
import {filterMissDistribution} from "../../utils/PuttUtils";

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
            <Text style={{color: colors.text.primary, fontSize: 24, marginLeft: 24, fontWeight: 600}}>Stats</Text>
            <View style={{flexDirection: "row", gap: 18, marginBottom: 24, marginTop: 12, paddingHorizontal: 24}}>
                <Toggleable toggled={tab === 0} onToggle={() => scrollTo(0)} title={"Overview"}></Toggleable>
                <Toggleable toggled={tab === 1} onToggle={() => scrollTo(1)} title={"Misses"}></Toggleable>
            </View>
            <FlatList
                contentContainerStyle={{
                    flexGrow: 1,
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
            <BarChart barWidth={22}
                      maxValue={max}
                      noOfSections={3}
                      stepValue={max/3}
                      barBorderRadius={4}
                      barBorderBottomLeftRadius={0}
                      barBorderBottomRightRadius={0}
                      frontColor="#24b2ff"
                      roundedBottom={false}
                      xAxisThickness={1}
                      xAxisColor={"#928481"}
                      formatYLabel={(label) => label + " in"}
                      yAxisTextStyle={{color: colors.text.primary}}
                      yAxisColor={"#928481"}
                      yAxisThickness={1}
                      width={264}
                      disablePress={true}
                      initialSpacing={24}
                      spacing={48}
                      data={data}/>
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
    const {currentStats} = useAppContext();

    const {width} = Dimensions.get("screen")

    const MissDistribution = () => {
        if (currentStats === undefined || Object.keys(currentStats).length === 0)
            return <View></View>

        return (
            <RadarChart graphSize={400}
                        scaleCount={4}
                        numberInterval={0}
                        data={[
                            (() => {
                                const arrays = [
                                    currentStats.lessThanSix.missDistribution,
                                    currentStats.sixToTwelve.missDistribution,
                                    currentStats.twelveToTwenty.missDistribution,
                                    currentStats.twentyPlus.missDistribution
                                ];

                                // Initialize an array of zeros with the same length as the arrays
                                const combinedMissDistribution = Array(arrays[0].length).fill(0);

                                // Iterate through each array and sum up their corresponding indices
                                arrays.forEach(array => {
                                    array.forEach((value, index) => {
                                        combinedMissDistribution[index] += value;
                                    });
                                });

                                let totalPutts = 0;
                                combinedMissDistribution.forEach(value => totalPutts += value);

                                // Calculate missDistribution
                                const missDistribution = combinedMissDistribution.map((value) => value / totalPutts);

                                const maxPercentage = Math.max(...missDistribution) + 0.01;

                                return {
                                    "Long": missDistribution[0] / maxPercentage,
                                    "Long Right": missDistribution[1] / maxPercentage,
                                    "Right": missDistribution[2] / maxPercentage,
                                    "Short Right": missDistribution[3] / maxPercentage,
                                    "Short": missDistribution[4] / maxPercentage,
                                    "Short Left": missDistribution[5] / maxPercentage,
                                    "Left": missDistribution[6] / maxPercentage,
                                    "Long Left": missDistribution[7] / maxPercentage,
                                };
                            })()
                        ]}
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
        <View style={{width: width}}>
            <Text style={{color: colors.text.primary, fontSize: 24, fontWeight: 600, textAlign: "center"}}>Avg.
                Miss</Text>
            <MissDistribution/>
        </View>
    )
}