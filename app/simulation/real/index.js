import {useLocalSearchParams, useNavigation, useRouter} from 'expo-router';
import {BackHandler, Platform, Pressable, Text, View} from 'react-native';
import {SvgClose} from '@/assets/svg/SvgComponents';
import React, {useEffect, useRef, useState} from 'react';
import Svg, {Path} from 'react-native-svg';
import DangerButton from '@/components/general/buttons/DangerButton';
import {getAuth} from "../../../utils/firebase";
import Loading from "@/components/general/popups/Loading";
import useColors from "@/hooks/useColors";
import {PrimaryButton} from "@/components/general/buttons/PrimaryButton";
import {useAppContext} from "@/contexts/AppCtx";
import {roundTo} from "../../../utils/roundTo";
import {PuttingGreen} from '../../../components/simulations';
import {BigMissModal, ConfirmExit, SubmitModal, TotalPutts,} from '../../../components/simulations/popups';
import {
    calculateDistanceMissedFeet,
    calculateStats,
    convertThetaToBreak,
    getLargeMissPoint,
    loadPuttData,
    updatePuttsCopy
} from '../../../utils/PuttUtils';
import {GreenVisual} from "../../../components/simulations/real";
import {SafeAreaView} from "react-native-safe-area-context";
import {AdEventType, InterstitialAd, TestIds} from "react-native-google-mobile-ads";

const initialState = {
    confirmLeave: false,
    confirmSubmit: false,
    loading: false,
    largeMiss: false,
    largeMissBy: [0, 0],
    width: 0,
    height: 0,
    center: false,
    point: {},
    hole: 1,
    distance: -1,
    distanceInvalid: true,
    puttBreak: [0, 0],
    misReadLine: false,
    misReadSlope: false,
    misHit: false,
    theta: 999,
    putts: [],
    currentPutts: 2,
}

const breaks = {
    45: "Left to Right",
    90: "Left to Right",
    135: "Left to Right",
    315: "Right to Left",
    270: "Right to Left",
    225: "Right to Left",
    0: "Straight",
    360: "Straight",
    180: "Straight",
    999: "Straight",
}

const slopes = {
    45: "Downhill",
    90: "Neutral",
    135: "Uphill",
    315: "Downhill",
    270: "Neutral",
    225: "Uphill",
    0: "Downhill",
    360: "Downhill",
    180: "Uphill",
    999: "Neutral",
}

const adUnitId = __DEV__ ? TestIds.INTERSTITIAL : TestIds.INTERSTITIAL;
const interstitial = InterstitialAd.createForAdRequest(adUnitId);

export default function RealSimulation() {
    const colors = useColors();
    const navigation = useNavigation();
    const {newSession, putters, userData, grips} = useAppContext();

    const auth = getAuth();
    const router = useRouter();

    const {stringHoles} = useLocalSearchParams();
    const holes = parseInt(stringHoles);
    const totalPuttsRef = useRef(null);
    const bigMissRef = useRef(null);
    const submitRef = useRef(null);
    const confirmExitRef = useRef(null);
    const [adLoaded, setAdLoaded] = useState(false);

    // keep track of the time this session started at
    const [startTime, setStartTime] = useState(new Date().getTime());

    const [{
        loading,
        largeMiss,
        largeMissBy,
        width,
        height,
        center,
        point,
        hole,
        theta,
        distance,
        distanceInvalid,
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

    const pushHole = (totalPutts, largeMissDistance) => {
        let distanceMissed = 0;

        if (!largeMiss)
            distanceMissed = userData.preferences.units === 0 ? calculateDistanceMissedFeet(center, point, width, height) : calculateDistanceMissedMeters(center, point, width, height);

        if (putts[hole - 1] !== undefined) {
            if (totalPutts === -1)
                totalPutts = putts[hole - 1].totalPutts
            if (largeMissDistance === -1)
                largeMissDistance = putts[hole - 1].distanceMissed
        }

        const puttsCopy = updatePuttsCopy(putts, hole, distance, theta, misReadLine, misReadSlope, misHit, largeMiss, totalPutts, distanceMissed, largeMissDistance, point, getLargeMissPoint, largeMissBy);
        updateField("putts", puttsCopy);
        return puttsCopy;
    };

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
            updateField("distanceInvalid", true);
            updateField("largeMissBy", [0, 0]);
            updateField("theta", 999);
            updateField("puttBreak", convertThetaToBreak(0));
            updateField("distance", -1);
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

        const {totalPutts, avgMiss, madePercent, trimmedPutts, strokesGained, puttCounts, shortPastBias, leftRightBias, missData, totalDistance} = calculateStats(puttsCopy, width, height);

        updateField("loading", true)

        const data = {
            date: new Date().toISOString(),
            startedAtTimestamp: startTime,
            timestamp: new Date().getTime(),
            holes: partial ? puttsCopy.length : holes,
            putts: trimmedPutts,
            totalPutts: totalPutts,
            strokesGained: roundTo(strokesGained, 1),
            avgMiss: avgMiss,
            madePercent: madePercent,
            type: "real-simulation",
            putter: putters[userData.preferences.selectedPutter].type,
            grip: grips[userData.preferences.selectedGrip].type,
            puttCounts: puttCounts,
            shortPastBias: shortPastBias,
            leftRightBias: leftRightBias,
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
                        <Pressable onPress={() => confirmExitRef.current.present()}>
                            <Svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                 strokeWidth={1.5}
                                 stroke={colors.text.primary} width={32} height={32}>
                                <Path strokeLinecap="round" strokeLinejoin="round"
                                      d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15M12 9l3 3m0 0-3 3m3-3H2.25"/>
                            </Svg>
                        </Pressable>
                    </View>
                    <GreenVisual slope={slopes[theta]} puttBreak={breaks[theta]} theta={theta}
                                 setTheta={(newTheta) => updateField("theta", newTheta)} distance={distance}
                                 distanceInvalid={distanceInvalid}
                                 updateField={updateField}/>
                </View>
                <View style={{flexDirection: "column", gap: 4}}>
                    <Pressable onPress={() => updateField("misHit", !misHit)} style={{
                        marginTop: 12,
                        marginBottom: 4,
                        paddingRight: 20,
                        paddingLeft: 10,
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
                        <Text style={{color: misHit ? colors.button.danger.text : colors.button.danger.disabled.text, marginLeft: 8}}>Mishit</Text>
                    </Pressable>
                    <View style={{flexDirection: "row", justifyContent: "center", gap: 12}}>
                        <Pressable onPress={() => updateField("misReadSlope", !misReadSlope)} style={{
                            marginBottom: 4,
                            paddingRight: 20,
                            paddingLeft: 10,
                            paddingVertical: 8,
                            borderRadius: 8,
                            borderWidth: 1,
                            borderColor: misReadSlope ? colors.button.danger.border : colors.button.danger.disabled.border,
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
                                <SvgClose width={20} height={20} stroke={misReadSlope ? colors.button.danger.text : colors.button.danger.disabled.text}></SvgClose>
                            }
                            <Text style={{color: misReadSlope ? colors.button.danger.text : colors.button.danger.disabled.text, marginLeft: 8}}>Misread Slope</Text>
                        </Pressable>
                        <Pressable onPress={() => updateField("misReadLine", !misReadLine)} style={{
                            marginBottom: 4,
                            paddingRight: 20,
                            paddingLeft: 10,
                            paddingVertical: 8,
                            borderRadius: 8,
                            borderWidth: 1,
                            borderColor: misReadLine ? colors.button.danger.border : colors.button.danger.disabled.border,
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
                                <SvgClose width={20} height={20} stroke={misReadLine ? colors.button.danger.text : colors.button.danger.disabled.text}></SvgClose>
                            }
                            <Text style={{color: misReadLine ? colors.button.danger.text : colors.button.danger.disabled.text, marginLeft: 8}}>Misread Line</Text>
                        </Pressable>
                    </View>
                </View>
                <PuttingGreen center={center} updateField={updateField} height={height} width={width} point={point}></PuttingGreen>
                <View style={{flexDirection: "row", justifyContent: "space-between", gap: 4}}>
                    <PrimaryButton style={{borderRadius: 8, paddingVertical: 9, flex: 1, maxWidth: 96}}
                                   title="Back"
                                   disabled={hole === 1} onPress={() => lastHole()}></PrimaryButton>
                    <DangerButton onPress={() => {
                        if (distance === -1) return;
                        updateField("largeMiss", true);
                        bigMissRef.current.present();
                    }}
                                  disabled={distance === -1}
                                  title={`Miss > ${userData.preferences.units === 0 ? "3ft" : "1m"}?`}></DangerButton>
                    {<PrimaryButton style={{borderRadius: 8, paddingVertical: 9, flex: 1, maxWidth: 96}}
                                    title={hole === holes ? "Submit" : "Next"}
                                    disabled={point.x === undefined || distance === -1}
                                    onPress={() => {
                                        if (point.x === undefined || distance === -1) return

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
            <ConfirmExit confirmExitRef={confirmExitRef} cancel={() => confirmExitRef.current.dismiss()} canPartial={hole > 1} partial={() => submit(true)} end={fullReset}></ConfirmExit>
        </View>
    );
}