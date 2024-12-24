import {Dimensions, FlatList, ScrollView, Text, useColorScheme, View} from "react-native";
import useColors from "../../hooks/useColors";
import {RadarChart} from "../../components/tabs/stats";
import {useAppContext} from "../../contexts/AppCtx";
import React, {useMemo, useRef, useState} from "react";
import SlopePopup from "../../components/tabs/stats/misses/popups/SlopePopup";
import {PrimaryButton} from "../../components/general/buttons/PrimaryButton";
import BreakPopup from "../../components/tabs/stats/misses/popups/BreakPopup";
import {Toggleable} from "../../components/general/buttons/Toggleable";
import DistancePopup from "../../components/tabs/stats/misses/popups/DistancePopup";
import {filterMissDistribution} from "../../utils/PuttUtils";
import {StrokesGainedTab} from "../../components/tabs/stats/sg";
import {OverviewTab} from "../../components/tabs/stats/overview";
import {PuttsAHoleTab} from "../../components/tabs/stats/putts";
import {MadePuttsTab} from "../../components/tabs/stats/made";

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
    const {previousStats, puttSessions} = useAppContext();
    const [isUserScrolling, setIsUserScrolling] = useState(false);

    const tabs = [
        {
            id: 1,
            title: "Overview",
            content: useMemo(() => {
                return <OverviewTab/>
            }, [])
        },
        {
            id: 2,
            title:"Strokes Gained",
            content: useMemo(() => {
                return <StrokesGainedTab/>
            }, [])
        },
        {
            id: 3,
            title: "Putts / Hole",
            content: useMemo(() => {
                return <PuttsAHoleTab/>
            }, [])
        },
        {
            id: 4,
            title: "Made Putts",
            content: useMemo(() => {
                return <MadePuttsTab previousStats={previousStats}/>
            }, [previousStats])
        },
        {
            id: 5,
            title: "Misses",
            content: useMemo(() => {
                return <MissesTab previousStats={previousStats}/>
            }, [previousStats])
        }
    ]

    const scrollTo = async (i) => {
        setTab(i);
        listRef.current.scrollToIndex({index: i});
    }

    const {width} = Dimensions.get("screen")
    const handleScroll = (event) => {
        if (isUserScrolling) {
            setTab(Math.round(event.nativeEvent.contentOffset.x / width));
        }

        scrollViewRef.current.scrollToIndex({
            index: Math.round(event.nativeEvent.contentOffset.x / width),
            viewPosition: 0.5,
        });
    }

    return puttSessions.length === 0 ? (
        <View style={{
            backgroundColor: colors.background.primary,
            borderBottomWidth: 1,
            borderBottomColor: colors.border.default,
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 32
        }}>
            <Text style={{color: colors.text.primary, fontSize: 24, fontWeight: 600, textAlign: "center"}}>No Sessions</Text>
            <Text style={{color: colors.text.secondary, fontSize: 18, textAlign: "center"}}>Come back when you have some sessions logged!</Text>
        </View>
    ) : (
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
                onMomentumScrollEnd={() => setIsUserScrolling(false)}
                onScroll={handleScroll}
                horizontal={true}
                onScrollBeginDrag={() => setIsUserScrolling(true)}
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

            <SlopePopup slopeRef={slopeRef} slope={slope} setSlope={setSlope}></SlopePopup>
            <BreakPopup breakRef={breakRef} brek={brek} setBrek={setBrek}></BreakPopup>
            <DistancePopup distanceRef={distanceRef} distance={distance} setDistance={setDistance}></DistancePopup>
        </ScrollView>
    )
}