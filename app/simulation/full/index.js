import {useFocusEffect, useLocalSearchParams, useRouter} from "expo-router";
import useColors from "../../../hooks/useColors";
import ScreenWrapper from "../../../components/general/ScreenWrapper";
import {BackHandler, Platform, Pressable, View} from "react-native";
import FontText from "../../../components/general/FontText";
import ElapsedTimeClock from "../../../components/simulations/ElapsedTimeClock";
import Svg, {Path, Rect} from "react-native-svg";
import React, {useEffect, useRef, useState} from "react";
import {ConfirmExit} from "../../../components/simulations/popups";
import {PrimaryButton} from "../../../components/general/buttons/PrimaryButton";
import {useAppContext} from "../../../contexts/AppContext";
import ApproachAccuracyButton from "../../../components/simulations/full/ApproachAccuracyButton";
import {SecondaryButton} from "../../../components/general/buttons/SecondaryButton";
import generatePushID from "../../../components/general/utils/GeneratePushID";
import {PuttTrackingModal} from "../../../components/simulations/full/popups/PuttTrackingModal";
import {
    AdEventType,
    BannerAd,
    BannerAdSize,
    InterstitialAd,
    TestIds,
    useForeground
} from "react-native-google-mobile-ads";
import ScoreIncrementer from "../../../components/simulations/full/ScoreIncremeter";
import NumberIncrementer from "../../../components/simulations/full/NumberIncrementer";
import {NoPuttDataModal} from "../../../components/simulations/full/popups/NoPuttDataModal";
import {calculateFullRoundStats} from "../../../utils/PuttUtils";
import {roundTo} from "../../../utils/roundTo";
import {ScorecardModal} from "../../../components/simulations/full/popups/ScorecardModal";
import {DarkTheme} from "../../../constants/ModularColors";
import {newSession} from "../../../services/sessionService";
import {SCHEMA_VERSION} from "../../../utils/constants";
import {auth} from "../../../utils/firebase";

const adUnitId = __DEV__ ? TestIds.INTERSTITIAL : Platform.OS === "ios" ? "ca-app-pub-2701716227191721/6686596809" : "ca-app-pub-2701716227191721/1702380355";
const bannerAdId = __DEV__ ? TestIds.BANNER : Platform.OS === "ios" ? "ca-app-pub-2701716227191721/1687213691" : "ca-app-pub-2701716227191721/8611403632";
const interstitial = InterstitialAd.createForAdRequest(adUnitId);

// TODO add partial rounds
// TODO when a person marks a holed out putt, it forces putts = 1, but when a person puts putts=1, it doesnt force the hole to be holed out
// TODO When a person marks that they holed out from off the green, it should also disable the distance field, as that is not needed
export default function FullRound() {
    const colors = useColors();
    const router = useRouter();
    const {stringHoles, stringTee, stringFront, stringCourse} = useLocalSearchParams();
    const {userData, newFullRound, grips, putters} = useAppContext();
    const confirmExitRef = useRef(null);
    const puttTrackingRef = useRef(null);
    const noPuttDataModalRef = useRef(null);
    const scorecardRef = useRef(null);

    const tee = JSON.parse(stringTee);

    const holes = parseInt(stringHoles);
    const course = JSON.parse(stringCourse);
    const frontNine = stringFront === "true";

    const [hole, setHole] = useState((holes === 9 && !frontNine) ? 10 : 1); // Start at hole 10 if it's the back nine, otherwise start at hole 1
    const [startTime, setStartTime] = useState(new Date());
    const [holeStartTime, setHoleStartTime] = useState(new Date().getTime());

    const [holeScore, setHoleScore] = useState(tee.holes[hole-1].par);
    const [totalStrokes, setTotalStrokes] = useState(tee.holes[hole-1].par);
    const [netScore, setNetScore] = useState(tee.holes[hole-1].par);
    const [totalParStrokes, setTotalParStrokes] = useState(tee.holes[hole-1].par);
    const [putts, setPutts] = useState(2);
    const [penalties, setPenalties] = useState(0);
    const [approachAccuracy, setApproachAccuracy] = useState("green");
    const [fairwayAccuracy, setFairwayAccuracy] = useState("green");
    const [puttData, setPuttData] = useState({
        theta: 999,
        distance: -1,
        distanceInvalid: true,
        misHit: false,
        misReadLine: false,
        misReadSlope: false,
        center: false,
        point: {},
        largeMiss: {
            distance: -1,
            dir: "",
        }
    });
    const [roundData, setRoundData] = useState([]);

    const [puttsLocked, setPuttsLocked] = useState(false);

    const [adLoaded, setAdLoaded] = useState(false);
    const bannerRef = useRef(null);

    useForeground(() => {
        bannerRef.current?.load();
    })

    const ScorecardIcon = ({ width = 40, height = 40, stroke = "black" }) => (
        <Svg width={width} height={height} viewBox="0 0 60 40" fill="none">
            {/* 3 long horizontal boxes (like header rows) */}
            {[0, 1, 2].map(i => (
                <Rect
                    key={`header-${i}`}
                    x={2}
                    y={2 + i * 14}
                    width={16}
                    height={10}
                    rx={2}
                    strokeWidth={0}
                    fill={DarkTheme.text.secondary}
                />
            ))}

            {/* 2 columns of squares under the headers */}
            {[0, 1, 2].map(col =>
                Array.from({ length: 3 }).map((_, row) => (
                    <Rect
                        key={`cell-${col}-${row}`}
                        x={22 + col * 12}
                        y={2 + row * 14}
                        width={8}
                        height={10}
                        rx={2}
                        fill={colors.text.secondary}
                        strokeWidth={0}
                    />
                ))
            )}
        </Svg>
    );

    useEffect(() => {
        const isNineHoleCourse = tee.number_of_holes === 9;

        let initialRoundData = {};

        if (holes === 9) {
            initialRoundData = isNineHoleCourse
                ? tee.holes.map((teeHole) => ({
                    par: teeHole.par,
                    score: teeHole.par, // Default score is the par value
                    yardage: teeHole.yardage,
                    handicap: teeHole.handicap,
                }))
                : tee.holes
                    .slice(frontNine ? 0 : 9, frontNine ? 9 : 18) // Select front or back nine based on frontNine flag
                    .map((teeHole) => ({
                        par: teeHole.par,
                        score: teeHole.par, // Default score is the par value
                        yardage: teeHole.yardage,
                        handicap: teeHole.handicap,
                    }));
        } else {
            initialRoundData = tee.holes.map((teeHole) => ({
                par: teeHole.par,
                score: teeHole.par, // Default score is the par value
                yardage: teeHole.yardage,
                handicap: teeHole.handicap,
            }));
        }

        setRoundData(initialRoundData);
        //updateTotalScores(initialRoundData);
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            const onBackPress = () => {
                confirmExitRef.current.present();
                console.log("still running")
                return true;
            };

            const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);

            return () => subscription.remove(); // clean up when unfocused
        }, [])
    );

    useEffect(() => {
        const unsubscribeLoaded = interstitial.addAdEventListener(AdEventType.LOADED, () => {
            setAdLoaded(true);
        });

        interstitial.load();

        return () => {
            unsubscribeLoaded();
        }
    }, []);

    const saveHole = (scoreOfHole = holeScore) => {
        const timeElapsed = new Date().getTime() - holeStartTime;

        const updatedRoundData = [...roundData];
        updatedRoundData[hole - 1] = {
            ...updatedRoundData[hole - 1],
            score: scoreOfHole,
            putts,
            approachAccuracy,
            fairwayAccuracy,
            penalties,
            timeElapsed,
            puttData
        };
        setRoundData(updatedRoundData);

        updateTotalScores(updatedRoundData);
    }

    const updateTotalScores = (data) => {
        const totalScore = data.reduce((acc, hole) => acc + (hole.score === 0 ? 4 : hole.score), 0);
        const totalPar = data.reduce((acc, hole) => acc + (hole.par === 0 ? 4 : hole.par), 0);
        const netScore = data.reduce((acc, hole, index) => {
            if (hole.puttData === undefined && hole !== index+1) return acc;
            return acc + hole.score;
        }, 0);

        setNetScore(netScore);
        setTotalStrokes(totalScore);
        setTotalParStrokes(totalPar);
    };

    const nextHole = () => {
        if ((holes === 9 && hole === 9 && frontNine) || hole === 18) {
            submit();
            return;
        }

        saveHole();

        if (roundData[hole].putts !== undefined) {
            // load the hole
            if (roundData[hole-2].puttData.distance === 0) {// holed out
                setPutts(0);
                setPuttsLocked(true);
            }
            else if (roundData[hole-2].puttData.center) {
                setPutts(1);
                setPuttsLocked(true);
            } else {
                setPutts(roundData[hole-2].putts);
                setPuttsLocked(false);
            }
            setHoleScore(roundData[hole].score);
            setApproachAccuracy(roundData[hole].approachAccuracy);
            setFairwayAccuracy(roundData[hole].fairwayAccuracy);
            setPenalties(roundData[hole].penalties);
            setHoleStartTime(new Date().getTime() - roundData[hole].timeElapsed);
            setPuttData(roundData[hole].puttData);

            puttTrackingRef.current.setData(roundData[hole].puttData);
        } else {
            //reset data
            setHoleScore(tee.holes[hole].par)
            setPutts(2);
            setPuttsLocked(false);
            setApproachAccuracy("green");
            setFairwayAccuracy("green");
            setPenalties(0);
            setHoleStartTime(new Date().getTime());
            setPuttData({
                theta: 999,
                distance: -1,
                distanceInvalid: true,
                misHit: false,
                misReadLine: false,
                misReadSlope: false,
                center: false,
                point: {},
                largeMiss: {
                    distance: -1,
                    dir: "",
                }
            });

            puttTrackingRef.current.resetData();
        }

        setHole(hole + 1);
    }

    const lastHole = () => {
        if (hole === 1 || (holes === 9 && !frontNine && hole === 10)) return;

        // save current hole
        saveHole();

        setHoleScore(roundData[hole-2].score);
        setApproachAccuracy(roundData[hole-2].approachAccuracy);
        setFairwayAccuracy(roundData[hole-2].fairwayAccuracy);
        setPenalties(roundData[hole-2].penalties);
        setHoleStartTime(new Date().getTime() - roundData[hole-2].timeElapsed);
        setPuttData(roundData[hole-2].puttData);
        if (roundData[hole-2].puttData.distance === 0) {// holed out
            setPutts(0);
            setPuttsLocked(true);
        }
        else if (roundData[hole-2].puttData.center) {
            setPutts(1);
            setPuttsLocked(true);
        } else {
            setPutts(roundData[hole-2].putts);
            setPuttsLocked(false);
        }
        puttTrackingRef.current.setData(roundData[hole-2].puttData);

        setHole(hole - 1);
    }

    const setHoleNumber = (h) => {
        if (hole === h) return;
        if (h < 1 || h > holes || (holes === 9 && !frontNine && h < 10)) return;

        // Save current hole before switching
        saveHole();

        const data = roundData[h-1];

        if (data?.putts !== undefined) {
            // Previously played hole
            if (data.puttData?.distance === 0) {
                setPutts(0);
                setPuttsLocked(true);
            } else if (data.puttData?.center) {
                setPutts(1);
                setPuttsLocked(true);
            } else {
                setPutts(data.putts);
                setPuttsLocked(false);
            }

            setHoleScore(data.score);
            setApproachAccuracy(data.approachAccuracy);
            setFairwayAccuracy(data.fairwayAccuracy);
            setPenalties(data.penalties);
            setHoleStartTime(new Date().getTime() - data.timeElapsed);
            setPuttData(data.puttData);
            puttTrackingRef.current.setData(data.puttData);
        } else {
            // New hole setup
            setHoleScore(tee.holes[h-1].par);
            setPutts(2);
            setPuttsLocked(false);
            setApproachAccuracy("green");
            setFairwayAccuracy("green");
            setPenalties(0);
            setHoleStartTime(new Date().getTime());
            const newPuttData = {
                theta: 999,
                distance: -1,
                distanceInvalid: true,
                misHit: false,
                misReadLine: false,
                misReadSlope: false,
                center: false,
                point: {},
                largeMiss: {
                    distance: -1,
                    dir: "",
                }
            };
            setPuttData(newPuttData);
            puttTrackingRef.current.resetData();
        }

        setHole(h);
    };

    const adjustScore = (adjustment) => {
        setHoleScore((prev) => {
            let newScore = prev + adjustment;
            if (newScore > 9) return prev;
            if (newScore < 1) return prev;

            roundData[hole - 1] = { ...roundData[hole - 1], score: newScore };
            saveHole(newScore);
            return newScore;
        });
    };

    // improve the stats for full rounds, like approach accuracy
    // TODO do we do all around strokes gained, along with putting strokes gained for this
    const submit = () => {
        saveHole();
        console.log("submitting")

        const timeElapsed = new Date().getTime() - holeStartTime;

        const updatedRoundData = [...roundData];
        updatedRoundData[hole - 1] = {
            ...updatedRoundData[hole - 1],
            score: holeScore,
            putts,
            approachAccuracy,
            fairwayAccuracy,
            penalties,
            timeElapsed,
            puttData
        };

        const totalScore = updatedRoundData.reduce((acc, hole) => acc + (hole.score === 0 ? 4 : hole.score), 0);

        const {totalPutts, birdies, eagles, pars, avgMiss, shotPlacementData, madePercent, trimmedHoles, strokesGained, puttCounts, leftRightBias, shortPastBias, missData, totalDistance, percentShort, percentHigh} = calculateFullRoundStats(updatedRoundData, puttTrackingRef.current.getWidth(), puttTrackingRef.current.getHeight());
        const { name, par, rating, slope, yards } = tee;

        const scorecard = updatedRoundData.map((hole, index) => ({score: hole.puttData ? hole.score : -1, par: hole.par}));

        const newData = {
            id: generatePushID(),
            meta: {
                schemaVersion: SCHEMA_VERSION,
                type: "full",
                date: startTime.toISOString(),
                durationMs: new Date().getTime() - startTime.getTime(),
                units: userData.preferences.units,
                synced: true, // TODO set this to false if not synced (if offline mode is ever added)
                tee: { name, par, rating, slope, yards, number_of_holes: holes },
                courseID: course.id,
                clubName: course.club_name,
                courseName: course.course_name,
                frontNine: frontNine
            },
            "player": {
                "putter": putters[userData.preferences.selectedPutter].type,
                "grip": grips[userData.preferences.selectedGrip].type
            },
            "stats": {
                "holes": holes,
                "holesPlayed": trimmedHoles.length,
                "totalPutts": totalPutts,
                "puttCounts": puttCounts,
                "madePercent": madePercent,
                "avgMiss": avgMiss,
                "strokesGained": roundTo(strokesGained, 1),
                "missData": missData,
                "leftRightBias": leftRightBias, // TODO consider moving this stuff to a separate "tendencies" object
                "shortPastBias": shortPastBias,
                "totalDistance": totalDistance,
                "percentShort": percentShort,
                "percentHigh": percentHigh,
                birdies: birdies,
                eagles: eagles,
                pars: pars,
                score: totalScore,
                shotPlacementData
            },
            holeHistory: trimmedHoles,
            scorecard,
        }

        // const data = {
        //     id: generatePushID(),
        //     date: new Date().toISOString(),
        //     tee: { name, par, rating, slope, yards, number_of_holes: holes },
        //     type: "full",
        //     units: userData.preferences.units,
        //     timestamp: startTime,
        //     putter: putters[userData.preferences.selectedPutter].type,
        //     grip: grips[userData.preferences.selectedGrip].type,
        //     holes: trimmedHoles,
        //     score: totalScore,
        //     puttStats: {
        //         totalPutts: totalPutts,
        //         avgMiss: avgMiss,
        //         strokesGained: roundTo(strokesGained, 1),
        //         madePercent: madePercent,
        //         puttCounts: puttCounts,
        //         leftRightBias: leftRightBias,
        //         shortPastBias: shortPastBias,
        //         missData: missData,
        //         totalDistance: totalDistance,
        //         units: userData.preferences.units,
        //         duration: new Date().getTime() - startTime,
        //         percentShort: percentShort,
        //         percentHigh: percentHigh,
        //     },
        // }

        newSession(auth.currentUser.uid, newData).then(() => {
            // router.push({
            //     pathname: `/sessions/individual`,
            //     params: {
            //         jsonSession: JSON.stringify(data),
            //         recap: "true"
            //     }
            // });
            router.replace({
                pathname: `/(tabs)/practice`
            });
        }).catch(error => {
            console.error("Error saving session:", error);
            alert("Failed to save session. Please try again later.");
        });
    };

    const fullReset = () => {
        router.replace("/(tabs)/practice");
    };

    const updatePuttData = (data) => {
        if (data.distance === 0) {// holed out
            setPutts(0);
            setPuttsLocked(true);
        }
        else if (data.center) {
            setPutts(1);
            setPuttsLocked(true);
        }
        else {
            if (puttsLocked) {
                setPutts(2);
            }
            setPuttsLocked(false);
        }

        setPuttData(data)
    }

    return (
        <>
            <ScreenWrapper style={{
                width: "100%",
                flex: 1,
                paddingHorizontal: 20,
                flexDirection: "column",
                marginBottom: 18,
                justifyContent: "space-between"
            }}>
                <View>
                    <View style={{flexDirection: "row", justifyContent: "space-between"}}>
                        <View style={{flexDirection: "row", marginBottom: 6}}>
                            <FontText style={{fontSize: 40, color: colors.text.primary, fontWeight: 800}} type="title">{hole}</FontText>
                            <FontText style={{fontSize: 18, fontWeight: 700, marginTop: 6}}>{hole === 1 ? "ST" : hole === 2 ? "ND" : hole === 3 ? "RD" : "TH"}</FontText>
                        </View>
                        <View style={{flexDirection: "row", gap: 10, alignItems: "center"}}>
                            <FontText style={{fontSize: 16}}>Par {tee.holes[hole-1].par === 0 ? "?" : tee.holes[hole-1].par}</FontText>
                            <View style={{width: 4, height: 4, borderRadius: "50%", backgroundColor: "black"}}></View>
                            <FontText style={{fontSize: 16}}>{tee.holes[hole-1].yardage === 0 ? "?" : tee.holes[hole-1].yardage} yds</FontText>
                            <View style={{width: 4, height: 4, borderRadius: "50%", backgroundColor: "black"}}></View>
                            <FontText style={{fontSize: 16}}>{tee.holes[hole-1].handicap === 0 ? "?" : tee.holes[hole-1].handicap}</FontText>
                        </View>
                        <Pressable onPress={() => confirmExitRef.current.present()}>
                            <Svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                 strokeWidth={1.5}
                                 stroke={colors.text.primary} width={32} height={32}>
                                <Path strokeLinecap="round" strokeLinejoin="round"
                                      d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15M12 9l3 3m0 0-3 3m3-3H2.25"/>
                            </Svg>
                        </Pressable>
                    </View>
                    <View style={{width: "100%", paddingBottom: 12, flexDirection: "row"}}>
                        <View style={{flexDirection: "row", width: 150}}>
                            <FontText style={{fontVariant: ["tabular-nums"], fontWeight: 600, fontSize: 16}}>Round: </FontText>
                            <ElapsedTimeClock startTime={startTime} styles={{fontSize: 16}}></ElapsedTimeClock>
                        </View>
                        <View style={{flexDirection: "row"}}>
                            <FontText style={{marginLeft: 12, fontSize: 16, fontWeight: 600, fontVariant: ["tabular-nums"]}}>Hole: </FontText>
                            <ElapsedTimeClock startTime={holeStartTime} styles={{fontSize: 16}}></ElapsedTimeClock>
                        </View>
                    </View>
                    <View style={{backgroundColor: colors.background.secondary, borderRadius: 16, paddingHorizontal: 16, width: "100%", paddingVertical: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between"}}>
                        <View>
                            <FontText style={{fontSize: 18, fontWeight: 600}}>{userData.firstName} {userData.lastName === "Unknown" ? "" : userData.lastName}</FontText>
                            <FontText style={{fontSize: 15, color: colors.text.secondary, fontWeight: 500}}>Net score: {netScore}</FontText>
                        </View>
                        <View style={{backgroundColor: colors.button.secondary.background, width: 48, height: 48, borderRadius: 32, justifyContent: "center", alignItems: "center"}}>
                            <FontText style={{fontSize: (totalStrokes-totalParStrokes) === 0 ? 24 : (totalStrokes-totalParStrokes) > 9 || (totalStrokes-totalParStrokes) < -9 ? 20 : 22, fontWeight: 600, color: colors.button.secondary.text, textAlign: "center"}}>{totalStrokes-totalParStrokes > 0 ? "+" : ""}{totalStrokes - totalParStrokes === 0 ? "E" : (totalStrokes - totalParStrokes)}</FontText>
                        </View>
                    </View>
                    <View style={{flexDirection: "row", gap: 12}}>
                        <View style={{flex: 1}}>
                            <FontText style={{fontSize: 18, fontWeight: 500, marginTop: 12, textAlign: "center"}}>Tee Shot</FontText>
                            <ApproachAccuracyButton activeButton={fairwayAccuracy} colors={colors} onPress={(type) => setFairwayAccuracy(type)}/>
                        </View>
                        { tee.holes[hole-1].par > 3 && (
                            <View style={{flex: 1}}>
                                <FontText style={{fontSize: 18, fontWeight: 500, marginTop: 12, textAlign: "center"}}>Approach Shot</FontText>
                                <ApproachAccuracyButton activeButton={approachAccuracy} colors={colors} onPress={(type) => setApproachAccuracy(type)}/>
                            </View>
                        )}
                    </View>
                    <View style={{flexDirection: "row", gap: 32, marginTop: -10}}>
                        <ScoreIncrementer adjustScore={adjustScore} holeScore={holeScore} hole={hole} tee={tee}></ScoreIncrementer>

                        <NumberIncrementer min={0} locked={puttsLocked} title={"Putts"} setNumber={setPutts} number={putts}/>
                        <NumberIncrementer title={"Penalties"} setNumber={setPenalties} number={penalties}/>
                    </View>
                </View>

                <View style={{width: "100%", alignItems: "center"}}>
                    <SecondaryButton style={{borderRadius: 12, flexDirection: "row", gap: 12, paddingVertical: 12, width: "100%", maxWidth: 196}} children={
                        <>
                            <Svg xmlns="http://www.w3.org/2000/svg" fill={colors.button.secondary.text} viewBox="0 0 24 24" strokeWidth={1.5}
                                 stroke={colors.button.secondary.text} width={18} height={18}>
                                <Path strokeLinecap="round" strokeLinejoin="round"
                                      d="M3 3v1.5M3 21v-6m0 0 2.77-.693a9 9 0 0 1 6.208.682l.108.054a9 9 0 0 0 6.086.71l3.114-.732a48.524 48.524 0 0 1-.005-10.499l-3.11.732a9 9 0 0 1-6.085-.711l-.108-.054a9 9 0 0 0-6.208-.682L3 4.5M3 15V4.5"/>
                            </Svg>
                            <FontText style={{fontSize: 14, color: colors.button.secondary.text}}>Track Putting</FontText>
                        </>
                    } onPress={() => puttTrackingRef.current.open()}></SecondaryButton>
                </View>
                <View style={{marginLeft: -20}}>
                    <BannerAd ref={bannerRef} unitId={bannerAdId} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}/>
                </View>
                <View style={{flexDirection: "row", justifyContent: "space-between", gap: 4, paddingHorizontal: 16}}>
                    <PrimaryButton style={{borderRadius: 12, paddingVertical: 12, flex: 1, maxWidth: 128}}
                                   title="Back"
                                   disabled={hole === 1 || (holes === 9 && !frontNine && hole === 10)} onPress={lastHole}></PrimaryButton>
                    <Pressable onPress={() => scorecardRef.current.present()} style={({pressed}) => [{
                        paddingVertical: 8,
                        borderRadius: "50%",
                        backgroundColor: pressed ? colors.button.primary.depressed : colors.button.primary.background,
                        aspectRatio: 1,
                        borderWidth: 1,
                        borderColor: colors.border.default,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center"
                    }]}>
                        <ScorecardIcon width={30} height={30}></ScorecardIcon>
                        {/*<Svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1}*/}
                        {/*     stroke={"black"} width={29} height={29}>*/}
                        {/*    <Path strokeLinecap="round" strokeLinejoin="round"*/}
                        {/*          d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"/>*/}
                        {/*</Svg>*/}
                    </Pressable>
                    <PrimaryButton style={{borderRadius: 12, paddingVertical: 12, flex: 1, maxWidth: 128}}
                                   title={hole === holes ? "Submit" : "Next"}
                                   disabled={false}
                                   onPress={() => {
                                       // if (puttData.distance === -1) {
                                       //     noPuttDataModalRef.current.present();
                                       // } else if (Object.keys(puttData.point).length < 1 && !puttData.center) {
                                       //     if (puttData.largeMiss && puttData.largeMiss.distance !== 0) {
                                       //         nextHole();
                                       //     } else {
                                        //         noPuttDataModalRef.current.present();
                                        //     }
                                        // } else {
                                        //     nextHole();
                                        // }
                                        if (puttData.distance === -1 ||
                                            (Object.keys(puttData.point).length < 1 && puttData.distance !== 0 && !puttData.center && puttData.largeMiss.distance === -1)) {
                                            // TODO this says next hole even when the last (should say "submit")
                                            noPuttDataModalRef.current.present();
                                        } else {
                                            nextHole();
                                        }
                                    }}></PrimaryButton>
                </View>
            </ScreenWrapper>
            <NoPuttDataModal nextHole={nextHole} isLastHole={(holes === 9 && hole === 9 && frontNine) || hole === 18} puttTrackingRef={puttTrackingRef} noPuttDataModalRef={noPuttDataModalRef}/>
            <ConfirmExit confirmExitRef={confirmExitRef} cancel={() => confirmExitRef.current.dismiss()} canPartial={hole > 1} partial={() => submit()} end={fullReset}></ConfirmExit>
            <PuttTrackingModal puttTrackingRef={puttTrackingRef} updatePuttData={updatePuttData}/>
            <ScorecardModal setHoleNumber={setHoleNumber} roundData={roundData} front={frontNine} scorecardRef={scorecardRef}/>
        </>
    )
}