import {useLocalSearchParams, useNavigation, useRouter} from 'expo-router';
import {BackHandler, Platform, Pressable, Text, View} from 'react-native';
import {SvgClose} from '@/assets/svg/SvgComponents';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import Svg, {Path} from 'react-native-svg';
import DangerButton from "@/components/general/buttons/DangerButton";
import {getAuth} from "firebase/auth";
import Loading from "@/components/general/popups/Loading";
import useColors from "@/hooks/useColors";
import {PrimaryButton} from "@/components/general/buttons/PrimaryButton";
import {useAppContext} from "@/contexts/AppCtx";
import {
    calculateDistanceMissedFeet,
    calculateDistanceMissedMeters,
    calculateStats,
    getLargeMissPoint,
    loadPuttData
} from '../../../utils/PuttUtils';
import {roundTo} from "../../../utils/roundTo";
import {PuttingGreen} from '../../../components/simulations';
import {BigMissModal, ConfirmExit, SubmitModal, TotalPutts,} from '../../../components/simulations/popups';
import {GreenVisual} from "../../../components/simulations/round";
import {
    createDistanceProbabilities,
    createRollProbabilities,
    generateBreak,
    generateDistance,
    generateTargetedDistance,
    pickWeightedRandom
} from "../../../components/simulations/Utils";
import {SafeAreaView} from "react-native-safe-area-context";
import ElapsedTimeClock from "../../../components/simulations/ElapsedTimeClock";
import {AdEventType, InterstitialAd, TestIds} from "react-native-google-mobile-ads";

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
    largeMiss: false,
    largeMissBy: [0, 0],
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

const adUnitId = __DEV__ ? TestIds.INTERSTITIAL : TestIds.INTERSTITIAL;
const interstitial = InterstitialAd.createForAdRequest(adUnitId);

// TODO ADD A BUTTON TO CHANGE THE BREAK OF THE HOLE
export default function RoundSimulation() {
    const colors = useColors();
    const navigation = useNavigation();
    const {newSession, putters, userData, currentStats, grips} = useAppContext();

    const auth = getAuth();
    const router = useRouter();

    const {localHoles, difficulty, mode} = useLocalSearchParams();
    const holes = parseInt(localHoles);
    const totalPuttsRef = useRef(null);
    const bigMissRef = useRef(null);
    const submitRef = useRef(null);
    const confirmExitRef = useRef(null);

    const [adLoaded, setAdLoaded] = useState(false);

    const [startTime, setStartTime] = useState(new Date().getTime());

    const rollProbabilities = useMemo(() => createRollProbabilities(currentStats), [currentStats]);
    const distanceProbabilities = useMemo(() => createDistanceProbabilities(currentStats), [currentStats]);

    const [{
        loading,
        largeMiss,
        largeMissBy,
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

    const updateField = (field, value) => {
        setState(prevState => ({
            ...prevState,
            [field]: value,
        }));
    };

    useEffect(() => {
        updateField("distance", generateDistance(difficulty, userData.preferences.units));
    }, []);

    useEffect(() => {
        const unsubscribeLoaded = interstitial.addAdEventListener(AdEventType.LOADED, () => {
            setAdLoaded(true);
            console.log("Ad loaded");
        });

        interstitial.load();

        const onBackPress = () => {
            confirmExitRef.current.present();

            return true;
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            onBackPress
        );

        return () => {
            unsubscribeLoaded();
            backHandler.remove();
        }
    }, []);

    const pushHole = (totalPutts, largeMissDistance) => {
        let distanceMissed = 0;

        if (!largeMiss)
            distanceMissed = userData.preferences.units === 0 ? calculateDistanceMissedFeet(center, point, width, height) : calculateDistanceMissedMeters(center, point, width, height);

        if (putts[hole - 1] !== undefined) {
            if (totalPutts === -1)
                totalPutts = putts[hole - 1].totalPutts
            if (largeMissDistance === -1)
                largeMissDistance = putts[hole - 1].distanceMissed;
        }

        const puttsCopy = [...putts];
        puttsCopy[hole - 1] = {
            distance: distance,
            break: puttBreak,
            misReadLine: misReadLine,
            misReadSlope: misReadSlope,
            misHit: misHit,
            largeMiss: largeMiss,
            totalPutts: totalPutts,
            distanceMissed: largeMiss ? largeMissDistance : distanceMissed,
            point: largeMiss ? getLargeMissPoint(largeMissBy, largeMissDistance) : point
        };
        updateField("putts", puttsCopy);
        return puttsCopy;
    }

    const nextHole = (totalPutts, largeMissDistance = -1) => {
        if (hole === holes) {
            pushHole(totalPutts, largeMissDistance);

            submitRef.current.present();
            return;
        }

        if (!largeMiss && point.x === undefined) return;

        if (hole === 8 && adLoaded) {
            interstitial.show();
            setAdLoaded(false);
        }

        const puttsCopy = pushHole(totalPutts, largeMissDistance);

        if (putts[hole] === undefined) {
            updateField("currentPutts", 2);
            updateField("point", {});
            updateField("misReadLine", false);
            updateField("misReadSlope", false);
            updateField("misHit", false);
            updateField("center", false);
            updateField("largeMissBy", [0, 0]);
            if (mode === "weaknesses") {
                const target = pickWeightedRandom(rollProbabilities);
                updateField("puttBreak", [target.break, target.slope]);
                const distanceTarget = pickWeightedRandom(distanceProbabilities);
                // this is a number 0-3, which is the ranges of distances
                updateField("distance", generateTargetedDistance(distanceTarget.distance, userData.preferences.units));
            } else {
                updateField("puttBreak", generateBreak());
                updateField("distance", generateDistance(difficulty, userData.preferences.units));
            }
            updateField("hole", hole + 1);
            updateField("largeMiss", false);
            return;
        }

        loadPuttData(puttsCopy[hole], updateField);
        updateField("hole", hole + 1);
    };

    const lastHole = () => {
        if (hole === 1) return;

        const puttsCopy = pushHole(2, -1);
        loadPuttData(puttsCopy[hole - 2], updateField);
        updateField("hole", hole - 1);
    };

    const fullReset = () => {
        navigation.goBack();
    }

    const submit = (partial = false) => {
        const puttsCopy = [...putts];

        const {totalPutts, avgMiss, madePercent, trimmedPutts, strokesGained, puttCounts, leftRightBias, shortPastBias, missData, totalDistance} = calculateStats(puttsCopy, width, height);

        updateField("loading", true);

        const data = {
            date: new Date().toISOString(),
            startedAtTimestamp: startTime,
            timestamp: new Date().getTime(),
            difficulty: difficulty,
            holes: partial ? puttsCopy.length : holes,
            mode: mode,
            putts: trimmedPutts,
            totalPutts: totalPutts,
            avgMiss: avgMiss,
            strokesGained: roundTo(strokesGained, 1),
            madePercent: madePercent,
            type: "round-simulation",
            putter: putters[userData.preferences.selectedPutter].type,
            grip: grips[userData.preferences.selectedGrip].type,
            puttCounts: puttCounts,
            leftRightBias: leftRightBias,
            shortPastBias: shortPastBias,
            missData: missData,
            totalDistance: totalDistance,
            units: userData.preferences.units,
            duration: new Date().getTime() - startTime,
        }

        newSession(`users/${auth.currentUser.uid}/sessions`, data).then(() => {
            router.push({
                pathname: `/sessions/individual`,
                params: {
                    jsonSession: JSON.stringify(data),
                    recap: "true"
                }
            });
        });
    }

    return (loading ? <Loading/> :
        <View style={{flex: 1}}>
            <SafeAreaView style={{
                width: "100%",
                flex: 1,
                paddingHorizontal: Platform.OS === "ios" ? 32 : 24,
                flexDirection: "column",
                justifyContent: "space-between",
                marginBottom: 20
            }}>
                <View>
                    <View style={{flexDirection: "row", justifyContent: "space-between"}}>
                        <Text style={{marginBottom: 6, fontSize: 24, color: colors.text.primary, fontWeight: 600}} type="title">Hole {hole}<Text style={{fontSize: 18}}>/{holes}</Text></Text>
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
                                 puttBreak={breaks[puttBreak[0]]} slope={slopes[puttBreak[1]]}></GreenVisual>
                </View>
                <View style={{flexDirection: "column", gap: 4}}>
                    <Pressable onPress={() => updateField("misHit", !misHit)} style={{
                        marginTop: 12,
                        marginBottom: 4,
                        paddingRight: 20,
                        paddingLeft: 10,
                        paddingVertical: 8,
                        borderRadius: 8,
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
                            <SvgClose width={20} height={20} stroke={colors.button.danger.text}></SvgClose>
                        }
                        <Text style={{color: 'white', marginLeft: 8}}>Mishit</Text>
                    </Pressable>
                    <View style={{flexDirection: "row", justifyContent: "center", gap: 12}}>
                        <Pressable onPress={() => updateField("misReadSlope", !misReadSlope)} style={{
                            marginBottom: 4,
                            paddingRight: 20,
                            paddingLeft: 10,
                            paddingVertical: 8,
                            borderRadius: 8,
                            backgroundColor: misReadSlope ? colors.button.danger.background : colors.button.danger.disabled.background,
                            alignSelf: "center",
                            flexDirection: "row",
                            justifyContent: "center",
                            alignItems: 'center',
                        }}>
                            {misReadSlope ?
                                <Svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                     strokeWidth={2}
                                     width={20}
                                     height={20} stroke={colors.button.danger.text}>
                                    <Path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5"/>
                                </Svg> :
                                <SvgClose width={20} height={20} stroke={colors.button.danger.text}></SvgClose>
                            }
                            <Text style={{color: 'white', marginLeft: 8}}>Misread Slope</Text>
                        </Pressable>
                        <Pressable onPress={() => updateField("misReadLine", !misReadLine)} style={{
                            marginBottom: 4,
                            paddingRight: 20,
                            paddingLeft: 10,
                            paddingVertical: 8,
                            borderRadius: 8,
                            backgroundColor: misReadLine ? colors.button.danger.background : colors.button.danger.disabled.background,
                            alignSelf: "center",
                            flexDirection: "row",
                            justifyContent: "center",
                            alignItems: 'center',
                        }}>
                            {misReadLine ?
                                <Svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                     strokeWidth={2}
                                     width={20}
                                     height={20} stroke={colors.button.danger.text}>
                                    <Path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5"/>
                                </Svg> :
                                <SvgClose width={20} height={20} stroke={colors.button.danger.text}></SvgClose>
                            }
                            <Text style={{color: 'white', marginLeft: 8}}>Misread Line</Text>
                        </Pressable>
                    </View>
                </View>
                <PuttingGreen center={center} updateField={updateField} height={height} width={width} point={point}></PuttingGreen>
                <View style={{flexDirection: "row", justifyContent: "space-between", marginTop: 14, gap: 4}}>
                    <PrimaryButton style={{borderRadius: 8, paddingVertical: 9, flex: 1, maxWidth: 96}}
                                   title="Back"
                                   disabled={hole === 1} onPress={() => lastHole()}></PrimaryButton>
                    <DangerButton onPress={() => {
                        updateField("largeMiss", true);
                        bigMissRef.current.present();
                    }}
                                  title={`Miss > ${userData.preferences.units === 0 ? "3ft" : "1m"}?`}></DangerButton>
                    {<PrimaryButton style={{borderRadius: 8, paddingVertical: 9, flex: 1, maxWidth: 96}}
                                    title={hole === holes ? "Submit" : "Next"}
                                    disabled={point.x === undefined}
                                    onPress={() => {
                                        if (point.x === undefined) return;

                                        if (center) nextHole(1);
                                        else totalPuttsRef.current.present()
                                    }}></PrimaryButton>}
                </View>
            </SafeAreaView>
            <TotalPutts setCurrentPutts={(newCurrentPutts) => updateField("currentPutts", newCurrentPutts)} currentPutts={currentPutts}
                        totalPuttsRef={totalPuttsRef} nextHole={nextHole}/>
            <BigMissModal updateField={updateField} hole={hole} bigMissRef={bigMissRef} allPutts={putts}
                          rawLargeMissBy={largeMissBy} nextHole={nextHole} lastHole={lastHole}/>
            <SubmitModal submitRef={submitRef} submit={submit} cancel={() => submitRef.current.dismiss()}/>
            <ConfirmExit confirmExitRef={confirmExitRef} cancel={() => confirmExitRef.current.dismiss()} partial={() => submit(true)} end={fullReset}></ConfirmExit>
        </View>
    );
}

