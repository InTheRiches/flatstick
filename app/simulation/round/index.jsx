import {useFocusEffect, useLocalSearchParams, useRouter} from 'expo-router';
import {ActivityIndicator, BackHandler, Platform, Pressable, View} from 'react-native';
import {SvgClose} from '@/assets/svg/SvgComponents';
import React, {useEffect, useImperativeHandle, useMemo, useRef, useState} from 'react';
import Svg, {Path} from 'react-native-svg';
import DangerButton from "@/components/general/buttons/DangerButton";
import Loading from "@/components/general/popups/Loading";
import useColors from "@/hooks/useColors";
import {PrimaryButton} from "@/components/general/buttons/PrimaryButton";
import {useAppContext} from "@/contexts/AppContext";
import {
    calculateDistanceMissedFeet,
    calculateDistanceMissedMeters,
    calculateStats,
    loadPuttData
} from '../../../utils/PuttUtils';
import {PuttingGreen} from '../../../components/simulations';
import {ConfirmExit, SubmitModal, TotalPutts,} from '../../../components/simulations/popups';
import {GreenVisual} from "../../../components/simulations/round";
import {
    createDistanceProbabilities,
    createRollProbabilities,
    generateBreak,
    generateDistance,
    generateTargetedDistance,
    pickWeightedRandom
} from "../../../components/simulations/Utils";
import ElapsedTimeClock from "../../../components/simulations/ElapsedTimeClock";
import {
    AdEventType,
    BannerAd,
    BannerAdSize,
    InterstitialAd,
    TestIds,
    useForeground
} from "react-native-google-mobile-ads";
import ScreenWrapper from "../../../components/general/ScreenWrapper";
import FontText from "../../../components/general/FontText";
import {MisreadModal} from "../../../components/simulations/popups/MisreadModal";
import generatePushID from "../../../components/general/utils/GeneratePushID";
import {FullBigMissModal} from "../../../components/simulations/full/popups/FullBigMissModal";
import {SecondaryButton} from "../../../components/general/buttons/SecondaryButton";
import {SCHEMA_VERSION} from "../../../utils/constants";


// TODO add an extreme mode with like left right left breaks, as well as extreme vs slight breaks
const breaks = [
    "Left to Right",
    "Right to Left",
    "Straight",
]

const slopes = [
    "Downhill",
    "Neutral",
    "Uphill"
]

const greenMaps = {
    "0,0": require("@/assets/images/greens/rightForward.png"),
    "0,1": require("@/assets/images/greens/right.png"),
    "0,2": require("@/assets/images/greens/backRight.png"),
    "1,0": require("@/assets/images/greens/leftForward.png"),
    "1,1": require("@/assets/images/greens/left.png"),
    "1,2": require("@/assets/images/greens/backLeft.png"),
    "2,0": require("@/assets/images/greens/forward.png"),
    "2,1": require("@/assets/images/greens/neutral.png"),
    "2,2": require("@/assets/images/greens/back.png"),
}

const initialState = {
    loading: false,
    largeMiss: {
        dir: "",
        distance: -1,
    },
    width: 0,
    height: 0,
    center: false,
    point: {},
    hole: 1,
    distance: -1,
    puttBreak: generateBreak(),
    misReadLine: false,
    misReadSlope: false,
    misHit: false,
    putts: [],
    currentPutts: 2,
}

const adUnitId = __DEV__ ? TestIds.INTERSTITIAL : Platform.OS === "ios" ? "ca-app-pub-2701716227191721/6686596809" : "ca-app-pub-2701716227191721/1702380355";
const bannerAdId = __DEV__ ? TestIds.BANNER : Platform.OS === "ios" ? "ca-app-pub-2701716227191721/1687213691" : "ca-app-pub-2701716227191721/8611403632";
const interstitial = InterstitialAd.createForAdRequest(adUnitId);

// TODO add 9 or 18 holes, dont lock it down to 18
export default function RoundSimulation() {
    const colors = useColors();
    const {newSession, putters, userData, currentStats, grips} = useAppContext();
    const roundSimulationRef = useRef(null);

    useImperativeHandle(roundSimulationRef, () => ({
        largeMiss: () => {
            updateField("point", {});
            updateField("center", false);
        },
    }));

    const [transitioning, setTransitioning] = useState(false);

    const router = useRouter();

    const {localHoles, difficulty, mode} = useLocalSearchParams();
    const holes = parseInt(localHoles);
    const totalPuttsRef = useRef(null);
    const bigMissRef = useRef(null);
    const submitRef = useRef(null);
    const confirmExitRef = useRef(null);
    const misreadRef = useRef(null);

    const [adLoaded, setAdLoaded] = useState(false);

    const [startTime, setStartTime] = useState(new Date());

    const rollProbabilities = useMemo(() => createRollProbabilities(currentStats), [currentStats]);
    const distanceProbabilities = useMemo(() => createDistanceProbabilities(currentStats), [currentStats]);

    const [{
        loading,
        largeMiss,
        width,
        height,
        center,
        point,
        hole,
        puttBreak,
        distance,
        misReadLine,
        misReadSlope,
        misHit,
        putts,
        currentPutts
    },
        setState
    ] = useState(initialState);

    const bannerRef = useRef(null);

    useForeground(() => {
        bannerRef.current?.load();
    })

    const updateField = (field, value) => {
        setState(prevState => ({
            ...prevState,
            [field]: value,
        }));
    };

    useEffect(() => {
        updateField("distance", generateDistance(difficulty, userData.preferences.units));
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
            console.log("Ad loaded");
        });

        interstitial.load();

        return () => unsubscribeLoaded();
    }, []);

    const pushHole = (totalPutts) => {
        let distanceMissed = 0;

        if (largeMiss.distance === -1)
            distanceMissed = userData.preferences.units === 0 ? calculateDistanceMissedFeet(center, point, width, height) : calculateDistanceMissedMeters(center, point, width, height);

        if (putts[hole - 1] !== undefined) {
            if (totalPutts === -1)
                totalPutts = putts[hole - 1].totalPutts
        }

        const puttsCopy = [...putts];
        puttsCopy[hole - 1] = {
            distance,
            break: puttBreak,
            misReadLine,
            misReadSlope,
            misHit,
            largeMiss,
            distanceMissed,
            totalPutts,
            point,
        };

        updateField("putts", puttsCopy);
        return puttsCopy;
    }

    const reRoll = () => {
        let newBreak = generateBreak();
        while (newBreak[0] === puttBreak[0] && newBreak[1] === puttBreak[1]) {
            newBreak = generateBreak();
        }
        updateField("puttBreak", newBreak);
        updateField("distance", generateDistance(difficulty, userData.preferences.units));

        // reset the putts for the hole
        resetData();
    }

    const resetData = () => {
        updateField("currentPutts", 2);
        updateField("point", {});
        updateField("misReadLine", false);
        updateField("misReadSlope", false);
        updateField("misHit", false);
        updateField("center", false);
        updateField("largeMiss", {dir: "", distance: -1});
    }

    const nextHole = (totalPutts) => {
        if (hole === holes) {
            pushHole(totalPutts);

            submitRef.current.present();
            return;
        }

        if (largeMiss.distance === -1 && point.x === undefined) return;

        if (hole === 9 && adLoaded) {
            interstitial.show();
            setAdLoaded(false);
        }

        const puttsCopy = pushHole(totalPutts);

        setTransitioning(true);

        setTimeout(() => {
            setTransitioning(false);
            // your code here
        }, 350);

        if (putts[hole] === undefined) {
            resetData();
            if (mode === "weaknesses") {
                const target = pickWeightedRandom(rollProbabilities);
                updateField("puttBreak", [target.break, target.slope]);
                const distanceTarget = pickWeightedRandom(distanceProbabilities);
                // this is a number 0-3, which is the ranges of distances
                updateField("distance", generateTargetedDistance(distanceTarget.distance, userData.preferences.units));
            } else {
                let generatedBreak = generateBreak();
                while (generatedBreak[0] === puttBreak[0] && generatedBreak[1] === puttBreak[1]) {
                    generatedBreak = generateBreak();
                }
                updateField("puttBreak", generatedBreak);
                updateField("distance", generateDistance(difficulty, userData.preferences.units));
            }
            updateField("hole", hole + 1);
            return;
        }
        loadPuttData(puttsCopy[hole], updateField);
        updateField("hole", hole + 1);
    };

    const lastHole = () => {
        if (hole === 1) return;

        setTransitioning(true);

        setTimeout(() => {
            setTransitioning(false);
            // your code here
        }, 350);

        const puttsCopy = pushHole(2);
        loadPuttData(puttsCopy[hole - 2], updateField);
        updateField("hole", hole - 1);
    };

    const fullReset = () => {
        router.replace("/(tabs)/practice");
    }

    const submit = (partial = false) => {
        const puttsCopy = [...putts];

        const {totalPutts, avgMiss, madePercent, trimmedPutts, filteredHoles, strokesGained, puttCounts, leftRightBias, shortPastBias, missData, totalDistance, percentShort, percentHigh} = calculateStats(puttsCopy, width, height);

        updateField("loading", true);

        const scorecard = puttsCopy.map((hole, index) => (hole.totalPutts));

        const newData = {
            id: generatePushID(),
            meta: {
                schemaVersion: SCHEMA_VERSION,
                type: "sim",
                mode: mode,
                difficulty: difficulty,
                date: startTime.toISOString(),
                durationMs: new Date().getTime() - startTime.getTime(),
                units: userData.preferences.units,
                synced: true // TODO set this to false if not synced (if offline mode is ever added)
            },
            "player": {
                "putter": putters[userData.preferences.selectedPutter].type,
                "grip": grips[userData.preferences.selectedGrip].type
            },
            "stats": {
                "holes": partial ? puttsCopy.length : holes,
                "holesPlayed": filteredHoles,
                "totalPutts": totalPutts,
                "puttCounts": puttCounts,
                "madePercent": madePercent,
                "avgMiss": avgMiss,
                "strokesGained": strokesGained,
                "missData": missData,
                "leftRightBias": leftRightBias,
                "shortPastBias": shortPastBias,
                "totalDistance": totalDistance,
                "percentShort": percentShort,
                "percentHigh": percentHigh,
            },
            puttHistory: trimmedPutts,
            scorecard
        }

        // const data = {
        //     id: generatePushID(),
        //     date: new Date().toISOString(),
        //     startedAtTimestamp: startTime,
        //     timestamp: new Date().getTime(),
        //     difficulty: difficulty,
        //     holes: partial ? puttsCopy.length : holes,
        //     filteredHoles: partial ? puttsCopy.length : holes,
        //     mode: mode,
        //     putts: trimmedPutts,
        //     totalPutts: totalPutts,
        //     avgMiss: avgMiss,
        //     strokesGained: roundTo(strokesGained, 1),
        //     madePercent: madePercent,
        //     type: "sim",
        //     putter: putters[userData.preferences.selectedPutter].type,
        //     grip: grips[userData.preferences.selectedGrip].type,
        //     puttCounts: puttCounts,
        //     leftRightBias: leftRightBias,
        //     shortPastBias: shortPastBias,
        //     missData: missData,
        //     totalDistance: totalDistance,
        //     units: userData.preferences.units,
        //     duration: new Date().getTime() - startTime,
        //     percentShort: percentShort,
        //     percentHigh: percentHigh,
        // }

        submitRef.current.dismiss();

        newSession(newData).then(() => {
            router.push({
                pathname: `/sessions/individual`,
                params: {
                    jsonSession: JSON.stringify(newData),
                    recap: "true"
                }
            });
        });
    }

    return (loading ? <Loading/> :
        <View style={{flex: 1}}>
            { transitioning &&
                <View style={{
                    zIndex: 200,
                    position: "absolute",
                    width: "100%",
                    top: 0,
                    left: 0,
                    height: "100%",
                    flexDirection: "flow",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "black",
                    opacity: 0.5
                }}>
                    <ActivityIndicator size="large"/>
                </View>
            }
            <ScreenWrapper style={{
                width: "100%",
                flex: 1,
                paddingHorizontal: 20,
                flexDirection: "column",
                justifyContent: "space-between",
                marginBottom: 18,
                gap: 8
            }}>
                <View>
                    <View style={{flexDirection: "row", justifyContent: "space-between"}}>
                        <FontText style={{marginBottom: 6, fontSize: 24, color: colors.text.primary, fontWeight: 600}} type="title">Hole {hole}<FontText style={{fontSize: 18}}>/{holes}</FontText></FontText>
                        <View style={{position: "absolute", left: 0, right: 0, bottom: 0, top: 0, alignItems: "center", justifyContent: "center", marginVertical: "auto"}}>
                            <ElapsedTimeClock startTime={startTime}></ElapsedTimeClock>
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
                    <GreenVisual imageSource={greenMaps[puttBreak[0] + "," + puttBreak[1]]} distance={distance}
                                 puttBreak={breaks[puttBreak[0]]} slope={slopes[puttBreak[1]]} reRoll={reRoll}></GreenVisual>
                </View>
                <View style={{flexDirection: "row", justifyContent: "space-around", gap: 4}}>
                    <Pressable onPress={() => updateField("misHit", !misHit)} style={{
                        paddingRight: 30,
                        paddingLeft: 20,
                        paddingVertical: 8,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: misHit ? colors.button.danger.border : colors.button.danger.disabled.border,
                        backgroundColor: misHit ? colors.button.danger.background : colors.button.danger.disabled.background,
                        alignSelf: "center",
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: 'center',
                    }}>
                        {misHit ?
                            <Svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                 strokeWidth={2}
                                 width={20}
                                 height={20} stroke={colors.button.danger.text}>
                                <Path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5"/>
                            </Svg> :
                            <SvgClose width={20} height={20} stroke={misHit ? colors.button.danger.text : colors.button.danger.disabled.text}></SvgClose>
                        }
                        <FontText style={{color: misHit ? colors.button.danger.text : colors.button.danger.disabled.text, marginLeft: 8}}>Mishit</FontText>
                    </Pressable>
                    <Pressable onPress={() => misreadRef.current.present()} style={({pressed}) => [{
                        paddingHorizontal: 30,
                        paddingVertical: 8,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: misReadSlope || misReadLine ? colors.button.danger.border : colors.button.danger.disabled.border,
                        backgroundColor: misReadSlope || misReadLine ? colors.button.danger.background : pressed ? colors.button.primary.depressed : colors.button.danger.disabled.background,
                        alignSelf: "center",
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: 'center',
                    }]}>
                        <FontText style={{color: misReadSlope || misReadLine ? colors.button.danger.text : colors.button.danger.disabled.text}}>Misread{misReadSlope && misReadLine ? ": Both" : misReadSlope ? ": Speed" : misReadLine ? ": Break" : ""}</FontText>
                    </Pressable>
                </View>
                <PuttingGreen largeMiss={largeMiss} setLargeMiss={(data) => updateField("largeMiss", data)} center={center} updateField={updateField} height={height} width={width} point={point}></PuttingGreen>
                <View style={{marginLeft: -24}}>
                    <BannerAd ref={bannerRef} unitId={bannerAdId} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}/>
                </View>
                <View style={{flexDirection: "row", justifyContent: "space-between", gap: 4}}>
                    <PrimaryButton style={{borderRadius: 8, paddingVertical: 9, flex: 1, maxWidth: 96}}
                                   title="Back"
                                   disabled={hole === 1} onPress={() => lastHole()}></PrimaryButton>
                    { largeMiss.distance !== -1 ? (
                        <DangerButton onPress={() => {
                            bigMissRef.current.open();
                        }} style={{paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8, opacity: distance < 1 ? 0.5 : 1}} children={<View style={{flexDirection: "row"}}>
                            <Svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                 strokeWidth={2}
                                 width={20}
                                 height={20} stroke={colors.button.danger.text}>
                                <Path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5"/>
                            </Svg>
                            <FontText style={{color: colors.button.danger.text, marginLeft: 4}}>Miss > {userData.preferences.units === 0 ? "3ft" : "1m"}</FontText>
                        </View>}></DangerButton>
                        ) : (
                        <SecondaryButton onPress={() => {
                            bigMissRef.current.open();
                        }} title={`Miss > ${userData.preferences.units === 0 ? "3ft" : "1m"}?`} style={{paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8, opacity: distance < 1 ? 0.5 : 1}}></SecondaryButton>
                        )
                    }
                    <PrimaryButton style={{borderRadius: 8, paddingVertical: 9, flex: 1, maxWidth: 96}}
                                    title={hole === holes ? "Submit" : "Next"}
                                    disabled={point.x === undefined && largeMiss.distance === -1}
                                    onPress={() => {
                                        if (point.x === undefined && largeMiss.distance === -1) return;

                                        if (center) nextHole(1);
                                        else totalPuttsRef.current.present()
                                    }}></PrimaryButton>
                </View>
            </ScreenWrapper>
            <TotalPutts setCurrentPutts={(newCurrentPutts) => updateField("currentPutts", newCurrentPutts)} currentPutts={currentPutts}
                        totalPuttsRef={totalPuttsRef} nextHole={nextHole}/>
            <FullBigMissModal setLargeMiss={(data) => updateField("largeMiss", data)} bigMissRef={bigMissRef} puttTrackingModalRef={roundSimulationRef} largeMiss={largeMiss}/>
            <SubmitModal submitRef={submitRef} submit={submit} cancel={() => submitRef.current.dismiss()}/>
            <ConfirmExit confirmExitRef={confirmExitRef} cancel={() => confirmExitRef.current.dismiss()} canPartial={hole > 1} partial={() => submit(true)} end={fullReset}></ConfirmExit>
            <MisreadModal misreadRef={misreadRef} setMisreadSlope={(val) => updateField("misReadSlope", val)} setMisreadLine={(val) => updateField("misReadLine", val)} misreadLine={misReadLine} misreadSlope={misReadSlope}></MisreadModal>
        </View>
    );
}

