import {Dimensions, FlatList, Pressable, View} from "react-native";
import React, {useEffect, useMemo, useRef, useState} from "react";
import Svg, {Path} from "react-native-svg";
import {useLocalSearchParams, useNavigation, useRouter} from "expo-router";
import useColors from "../../../hooks/useColors";
import {Toggleable} from "../../../components/general/buttons/Toggleable";
import FontText from "../../../components/general/FontText";
import ScreenWrapper from "../../../components/general/ScreenWrapper";
import Loading from "../../../components/general/popups/Loading";
import MissBiasTab from "../../../components/tabs/stats/missbias/MissBiasTab";
import {MisreadTab} from "../../../components/tabs/stats/misreads/MisreadTab";
import {MadePuttsTab} from "../../../components/tabs/stats/made";
import {PuttsAHoleTab} from "../../../components/tabs/stats/putts";
import {StrokesGainedTab} from "../../../components/tabs/stats/sg";
import {OverviewTab} from "../../../components/tabs/stats/overview";
import {fetchGrips} from "../../../services/gripService";
import {fetchPutters} from "../../../services/putterService";
import {getUserSessionsByID} from "../../../services/userService";
import {getAllStats, getPreviousStats} from "../../../services/statsService";

// todo make sure that on the user's profile it doesnt allow them to go here if the sessions are less than 2
export default function UserStats({}) {
    const colors = useColors();
    const router = useRouter();
    const navigation = useNavigation();

    // reuse anything we can to reduce db calls
    const {uid, userDataString} = useLocalSearchParams();

    const userData = JSON.parse(userDataString);

    const [currentStats, setCurrentStats] = useState({});
    const [previousStats, setPreviousStats] = useState({});
    const [yearlyStats, setYearlyStats] = useState({});
    const [puttSessions, setPuttSessions] = useState([]);
    const [fullRoundSessions, setFullRoundSessions] = useState([]);
    const [putters, setPutters] = useState(null);
    const [grips, setGrips] = useState(null);

    useEffect(() => {
        Promise.all([
            fetchGrips(uid).then(setGrips),
            fetchPutters(uid).then(setPutters),
            getAllStats(uid, {}).then((stats) => {
                setCurrentStats(stats.currentStats);
                setYearlyStats(stats.yearlyStats);
            }).catch((err) => {
                console.log(err);
            }),
            getPreviousStats(uid).then(setPreviousStats),
            getUserSessionsByID(uid).then((newSessions) => {
                setPuttSessions(newSessions.sessions);
                setFullRoundSessions(newSessions.fullRoundSessions);
            }).catch((error) => {
                console.error("Error fetching user sessions:", error);
            })
        ]).then(() => {
            setIsReady(true);
        })
    }, []);

    const {width} = Dimensions.get("screen")

    const [tab, setTab] = useState(0);
    const [isUserScrolling, setIsUserScrolling] = useState(false);
    const [isReady, setIsReady] = useState(false)

    const listRef = useRef(null);
    const scrollViewRef = useRef(null);

    const tabs  = [
        {
            id: 1,
            title: "Overview",
            content: useMemo(() => {
                return <OverviewTab statsToUse={currentStats} userData={userData} previousStats={previousStats}/>
                // KEEP CURRENT STATS IN THE DEPS, OR ELSE WHEN UNITS CHANGE IT WILL NOT UPDATE
            }, [currentStats, previousStats])
        },
        {
            id: 2,
            title:"Strokes Gained",
            content: useMemo(() => {
                return <StrokesGainedTab statsToUse={currentStats} showDifference={false} previousStats={previousStats} yearlyStats={yearlyStats}/>
            }, [currentStats])
        },
        {
            id: 3,
            title: "Putts / Hole",
            content: useMemo(() => {
                return <PuttsAHoleTab statsToUse={currentStats}/>
            }, [currentStats])
        },
        {
            id: 4,
            title: "Made Putts",
            content: useMemo(() => {
                return <MadePuttsTab statsToUse={currentStats} showDifference={false} previousStats={previousStats}/>
            }, [currentStats, previousStats])
        },
        {
            id: 5,
            title: "Misreads",
            content: useMemo(() => {
                return <MisreadTab statsToUse={currentStats}/>
            }, [currentStats])
        },
        {
            id: 6,
            title: "Miss Bias",
            content: useMemo(() => {
                return <MissBiasTab statsToUse={currentStats} showDifference={false} previousStats={previousStats} userData={userData}/>
            }, [currentStats])
        }
    ]

    const scrollTo = async (i) => {
        listRef.current.scrollToIndex({index: i});
        setTab(i);
    }
    const handleScroll = (event) => {
        if (isUserScrolling) {
            setTab(Math.round(event.nativeEvent.contentOffset.x / width));
        }

        scrollViewRef.current.scrollToIndex({
            index: Math.round(event.nativeEvent.contentOffset.x / width),
            viewPosition: 0.5,
        });
    }

    if (!isReady)
        return <Loading />

    return (
        <ScreenWrapper style={{borderBottomColor: colors.border.default, borderBottomWidth: 1}}>
            <View style={{flexDirection: "row", paddingHorizontal: 16}}>
                <Pressable onPress={() => navigation.goBack()} style={{marginLeft: -10, marginTop: 3, paddingHorizontal: 10}}>
                    <Svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3.5}
                         stroke={colors.text.primary} width={24} height={24}>
                        <Path strokeLinecap="round" strokeLinejoin="round"
                              d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"/>
                    </Svg>
                </Pressable>
                <View style={{flexDirection: "col", alignItems: "flex-start", flex: 0, paddingBottom: 10,}}>
                    <FontText style={{
                        fontSize: 24,
                        fontWeight: 600,
                        color: colors.text.primary
                    }}>{userData.displayName}'s Stats</FontText>
                </View>
            </View>
            {
                currentStats.rounds < 1 ? (
                    <View style={{
                        borderBottomWidth: 1,
                        borderBottomColor: colors.border.default,
                        flex: 1,
                        justifyContent: "center",
                        alignItems: "center",
                        paddingHorizontal: 32
                    }}>
                        <FontText style={{color: colors.text.primary, fontSize: 24, fontWeight: 600, textAlign: "center"}}>Not enough data</FontText>
                        <FontText style={{color: colors.text.secondary, fontSize: 18, marginTop: 12, textAlign: "center"}}>Come back when you have some sessions logged!</FontText>
                    </View>
                ) : (
                    <>
                        <FlatList
                            ref={scrollViewRef}
                            contentContainerStyle={{gap: 4, paddingHorizontal: 20}}
                            data={tabs}
                            horizontal={true}
                            showsHorizontalScrollIndicator={false}
                            renderItem={({item, index}) =>
                                <Toggleable top={true} key={item.id} title={item.title} toggled={tab === index}
                                            onPress={() => {
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
                    </>
                )
            }
        </ScreenWrapper>
    )
}