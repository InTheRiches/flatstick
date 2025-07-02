import {useLocalSearchParams, useNavigation, useRouter} from "expo-router";
import useColors from "../../../hooks/useColors";
import ScreenWrapper from "../../../components/general/ScreenWrapper";
import {BackHandler, Keyboard, Platform, Pressable, View} from "react-native";
import FontText from "../../../components/general/FontText";
import ElapsedTimeClock from "../../../components/simulations/ElapsedTimeClock";
import Svg, {Line, Path} from "react-native-svg";
import React, {useEffect, useRef, useState} from "react";
import {ConfirmExit} from "../../../components/simulations/popups";
import {PrimaryButton} from "../../../components/general/buttons/PrimaryButton";
import {useAppContext} from "../../../contexts/AppCtx";
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

const adUnitId = __DEV__ ? TestIds.INTERSTITIAL : Platform.OS === "ios" ? "ca-app-pub-2701716227191721/6686596809" : "ca-app-pub-2701716227191721/1702380355";
const bannerAdId = __DEV__ ? TestIds.BANNER : Platform.OS === "ios" ? "ca-app-pub-2701716227191721/1687213691" : "ca-app-pub-2701716227191721/8611403632";
const interstitial = InterstitialAd.createForAdRequest(adUnitId);

export default function FullRound() {
    const colors = useColors();
    const router = useRouter();
    const {stringHoles, stringTee, stringFront, stringCourse} = useLocalSearchParams();
    const {userData, newFullRound} = useAppContext();
    const confirmExitRef = useRef(null);
    const puttTrackingRef = useRef(null);

    const tee = JSON.parse(stringTee);
    const holes = parseInt(stringHoles);
    const course = JSON.parse(stringCourse);
    const frontNine = stringFront === "true";

    const [hole, setHole] = useState((holes === 9 && !frontNine) ? 10 : 1); // Start at hole 10 if it's the back nine, otherwise start at hole 1
    const [startTime, setStartTime] = useState(new Date().getTime());
    const [holeStartTime, setHoleStartTime] = useState(new Date().getTime());

    const [holeScore, setHoleScore] = useState(tee.holes[hole-1].par);
    const [totalStrokes, setTotalStrokes] = useState(tee.holes[hole-1].par);
    const [totalParStrokes, setTotalParStrokes] = useState(tee.holes[hole-1].par);
    const [putts, setPutts] = useState(2);
    const [penalties, setPenalties] = useState(0);
    const [approachAccuracy, setApproachAccuracy] = useState("green");
    const [fairwayAccuracy, setFairwayAccuracy] = useState("green");
    const [puttData, setPuttData] = useState({
        theta: 999,
        distance: 0,
        distanceInvalid: true
    });
    const [roundData, setRoundData] = useState([]);

    const [adLoaded, setAdLoaded] = useState(false);
    const bannerRef = useRef(null);

    useForeground(() => {
        bannerRef.current?.load();
    })

    useEffect(() => {
        const isNineHoleCourse = tee.number_of_holes === 9;

        const initialRoundData = isNineHoleCourse
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

        setRoundData(initialRoundData);
        updateTotalScores(initialRoundData);
    }, []);

    useEffect(() => {
        const onBackPress = () => {
            confirmExitRef.current.present();

            return true;
        };

        const unsubscribeLoaded = interstitial.addAdEventListener(AdEventType.LOADED, () => {
            setAdLoaded(true);
        });

        interstitial.load();

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            onBackPress
        );

        return () => {
            unsubscribeLoaded();
            backHandler.remove();
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
        const totalScore = data.reduce((acc, hole) => acc + hole.score, 0);
        const totalPar = data.reduce((acc, hole) => acc + hole.par, 0);
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
            setPutts(roundData[hole].putts);
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
            setApproachAccuracy("green");
            setFairwayAccuracy("green");
            setPenalties(0);
            setHoleStartTime(new Date().getTime());
            setPuttData({
                theta: 999,
                distance: 0,
                distanceInvalid: true
            });

            puttTrackingRef.current.resetData();
        }

        setHole(hole + 1);
    }

    const lastHole = () => {
        if (hole === 1 || (holes === 9 && !frontNine && hole === 10)) return;

        // save current hole
        saveHole();

        console.log("before: " + hole);

        setPutts(roundData[hole-2].putts);
        setHoleScore(roundData[hole-2].score);
        setApproachAccuracy(roundData[hole-2].approachAccuracy);
        setFairwayAccuracy(roundData[hole-2].fairwayAccuracy);
        setPenalties(roundData[hole-2].penalties);
        setHoleStartTime(new Date().getTime() - roundData[hole-2].timeElapsed);

        puttTrackingRef.current.setData(roundData[hole-2].puttData);

        setHole(hole - 1);
    }

    const adjustScore = (adjustment) => {
        setHoleScore((prev) => {
            let newScore = prev + adjustment;
            if (newScore > 10) newScore = 1;
            if (newScore < 1) newScore = 10;

            roundData[hole - 1] = { ...roundData[hole - 1], score: newScore };
            saveHole(newScore);
            return newScore;
        });
    };

    const submit = () => {
        const data = {
            id: generatePushID(),
            date: new Date().toISOString(),
            tee: tee,
            courseID: course.id,
            clubName: course.club_name,
            courseName: course.course_name,
            timestamp: startTime,
            roundData,
        }

        newFullRound(data).then(() => {
            // router.push({
            //     pathname: `/sessions/individual`,
            //     params: {
            //         jsonSession: JSON.stringify(data),
            //         recap: "true"
            //     }
            // });
        });
    };

    const fullReset = () => {
        router.replace("/");
    };

    const updatePuttData = (data) => {
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
                            <FontText style={{fontSize: 32, color: colors.text.primary, fontWeight: 700}} type="title">{hole}</FontText>
                            <FontText style={{fontSize: 16, fontWeight: 700, marginTop: 3}}>{hole === 1 ? "ST" : hole === 2 ? "ND" : hole === 3 ? "RD" : "TH"}</FontText>
                        </View>
                        <View style={{flexDirection: "row", gap: 10, alignItems: "center"}}>
                            <FontText style={{fontSize: 16}}>Par {tee.holes[hole-1].par}</FontText>
                            <View style={{width: 4, height: 4, borderRadius: "50%", backgroundColor: "black"}}></View>
                            <FontText style={{fontSize: 16}}>{tee.holes[hole-1].yardage} yds</FontText>
                            <View style={{width: 4, height: 4, borderRadius: "50%", backgroundColor: "black"}}></View>
                            <FontText style={{fontSize: 16}}>{tee.holes[hole-1].handicap}</FontText>
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
                            <FontText style={{fontSize: 15, color: colors.text.secondary, fontWeight: 500}}>Handicap: {userData.strokesGained}</FontText>
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
                        <View style={{flex: 1}}>
                            <FontText style={{fontSize: 18, fontWeight: 500, marginTop: 12, textAlign: "center"}}>Approach Shot</FontText>
                            <ApproachAccuracyButton activeButton={approachAccuracy} colors={colors} onPress={(type) => setApproachAccuracy(type)}/>
                        </View>
                    </View>
                    <View style={{flexDirection: "row", gap: 32, marginTop: -10}}>
                        <View style={{alignItems: "center", flex: 1}}>
                            <FontText style={{fontSize: 18, fontWeight: 500, marginTop: 12, marginBottom: 8, textAlign: "center"}}>Score</FontText>
                            <View style={{borderWidth: 1, borderColor: colors.border.default, padding: 10, borderRadius: 64, backgroundColor: colors.background.secondary, flexDirection: "col", gap: 16}}>
                                <Pressable onPress={() => {
                                    adjustScore(1);
                                }} style={({pressed}) => [{width: 48, height: 48, borderRadius: 32, backgroundColor: pressed ? colors.border.default : colors.background.primary, alignItems: "center", justifyContent: "center"}]}>
                                    <Svg width={32} height={32} viewBox="0 0 24 24">
                                        <Line x1="12" y1="5" x2="12" y2="19" stroke={colors.button.primary.text} strokeWidth="2" />
                                        <Line x1="5" y1="12" x2="19" y2="12" stroke={colors.button.primary.text} strokeWidth="2" />
                                    </Svg>
                                </Pressable>
                                <FontText style={{fontSize: 32, fontWeight: 600, textAlign: "center"}}>{holeScore}</FontText>
                                <Pressable onPress={() => {
                                    adjustScore(-1);
                                }} style={({pressed}) => [{width: 48, height: 48, borderRadius: 32, backgroundColor: pressed ? colors.border.default : colors.background.primary, alignItems: "center", justifyContent: "center"}]}>
                                    <Svg width={32} height={32} viewBox="0 0 24 24">
                                        <Line x1="5" y1="12" x2="19" y2="12" stroke={colors.button.primary.text} strokeWidth="3" />
                                    </Svg>
                                </Pressable>
                            </View>
                        </View>
                        <View style={{alignItems: "center", flex: 1}}>
                            <FontText style={{fontSize: 18, fontWeight: 500, marginTop: 12, marginBottom: 8, textAlign: "center"}}>Putts</FontText>
                            <View style={{borderWidth: 1, borderColor: colors.border.default, padding: 10, borderRadius: 64, backgroundColor: colors.background.secondary, flexDirection: "col", gap: 16}}>
                                <Pressable onPress={() => setPutts(putts >= 9 ? 0 : putts+1)} style={({pressed}) => [{width: 48, height: 48, borderRadius: 32, backgroundColor: pressed ? colors.border.default : colors.background.primary, alignItems: "center", justifyContent: "center"}]}>
                                    <Svg width={32} height={32} viewBox="0 0 24 24">
                                        <Line x1="12" y1="5" x2="12" y2="19" stroke={colors.button.primary.text} strokeWidth="2" />
                                        <Line x1="5" y1="12" x2="19" y2="12" stroke={colors.button.primary.text} strokeWidth="2" />
                                    </Svg>
                                </Pressable>
                                <FontText style={{fontSize: 32, fontWeight: 600, textAlign: "center"}}>{putts}</FontText>
                                <Pressable onPress={() => setPutts(putts <= 0 ? 9 : putts-1)} style={({pressed}) => [{width: 48, height: 48, borderRadius: 32, backgroundColor: pressed ? colors.border.default : colors.background.primary, alignItems: "center", justifyContent: "center"}]}>
                                    <Svg width={32} height={32} viewBox="0 0 24 24">
                                        <Line x1="5" y1="12" x2="19" y2="12" stroke={colors.button.primary.text} strokeWidth="3" />
                                    </Svg>
                                </Pressable>
                            </View>
                        </View>
                        <View style={{alignItems: "center", flex: 1, justifyContent: "center"}}>
                            <FontText style={{fontSize: 18, fontWeight: 500, marginTop: 12, marginBottom: 8, textAlign: "center"}}>Penalties</FontText>
                            <View style={{borderWidth: 1, borderColor: colors.border.default, padding: 10, borderRadius: 64, backgroundColor: colors.background.secondary, flexDirection: "col", gap: 16}}>
                                <Pressable onPress={() => setPenalties(penalties >= 9 ? 0 : penalties+1)} style={({pressed}) => [{width: 48, height: 48, borderRadius: 32, backgroundColor: pressed ? colors.border.default : colors.background.primary, alignItems: "center", justifyContent: "center"}]}>
                                    <Svg width={32} height={32} viewBox="0 0 24 24">
                                        <Line x1="12" y1="5" x2="12" y2="19" stroke={colors.button.primary.text} strokeWidth="2" />
                                        <Line x1="5" y1="12" x2="19" y2="12" stroke={colors.button.primary.text} strokeWidth="2" />
                                    </Svg>
                                </Pressable>
                                <FontText style={{fontSize: 32, fontWeight: 600, textAlign: "center"}}>{penalties}</FontText>
                                <Pressable onPress={() => setPenalties(penalties <= 0 ? 9 : penalties-1)} style={({pressed}) => [{width: 48, height: 48, borderRadius: 32, backgroundColor: pressed ? colors.border.default : colors.background.primary, alignItems: "center", justifyContent: "center"}]}>
                                    <Svg width={32} height={32} viewBox="0 0 24 24">
                                        <Line x1="5" y1="12" x2="19" y2="12" stroke={colors.button.primary.text} strokeWidth="3" />
                                    </Svg>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={{width: "100%", alignItems: "center"}}>
                    <SecondaryButton style={{borderRadius: 12, flexDirection: "row", gap: 6, paddingVertical: 12, width: "100%", maxWidth: 196}} children={
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
                <View style={{marginLeft: -24}}>
                    <BannerAd ref={bannerRef} unitId={bannerAdId} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}/>
                </View>
                <View style={{flexDirection: "row", justifyContent: "space-between", gap: 4, paddingHorizontal: 16}}>
                    <PrimaryButton style={{borderRadius: 12, paddingVertical: 12, flex: 1, maxWidth: 128}}
                                   title="Back"
                                   disabled={hole === 1 || (holes === 9 && !frontNine && hole === 10)} onPress={lastHole}></PrimaryButton>

                    <PrimaryButton style={{borderRadius: 12, paddingVertical: 12, flex: 1, maxWidth: 128}}
                                    title={hole === holes ? "Submit" : "Next"}
                                    disabled={false}
                                    onPress={nextHole}></PrimaryButton>
                </View>
            </ScreenWrapper>
            <ConfirmExit confirmExitRef={confirmExitRef} cancel={() => confirmExitRef.current.dismiss()} canPartial={hole > 1} partial={() => submit()} end={fullReset}></ConfirmExit>
            <PuttTrackingModal puttTrackingRef={puttTrackingRef} updatePuttData={updatePuttData}/>
        </>
    )
}