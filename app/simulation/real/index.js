import {useLocalSearchParams, useNavigation, useRouter} from 'expo-router';
import {
    ActivityIndicator,
    BackHandler,
    Keyboard,
    Platform,
    Pressable,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import {SvgClose} from '@/assets/svg/SvgComponents';
import React, {useEffect, useImperativeHandle, useRef, useState} from 'react';
import Svg, {Path} from 'react-native-svg';
import DangerButton from '@/components/general/buttons/DangerButton';
import Loading from "@/components/general/popups/Loading";
import useColors from "@/hooks/useColors";
import {PrimaryButton} from "@/components/general/buttons/PrimaryButton";
import {useAppContext} from "@/contexts/AppContext";
import {roundTo} from "../../../utils/roundTo";
import {PuttingGreen} from '../../../components/simulations';
import {ConfirmExit, SubmitModal, TotalPutts,} from '../../../components/simulations/popups';
import {
    calculateDistanceMissedFeet,
    calculateDistanceMissedMeters,
    calculateStats,
    convertThetaToBreak,
    loadPuttData,
    updatePuttsCopy
} from '../../../utils/PuttUtils';
import {GreenVisual} from "../../../components/simulations/real";
import {
    AdEventType,
    BannerAd,
    BannerAdSize,
    InterstitialAd,
    TestIds,
    useForeground
} from "react-native-google-mobile-ads";
import FontText from "../../../components/general/FontText";
import {MisreadModal} from "../../../components/simulations/popups/MisreadModal";
import ScreenWrapper from "../../../components/general/ScreenWrapper";
import {FullBigMissModal} from "../../../components/simulations/full/popups/FullBigMissModal";

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
    distanceInvalid: true,
    puttBreak: [0, 0],
    misReadLine: false,
    misReadSlope: false,
    holedOut: false,
    misHit: false,
    theta: 999,
    putts: [],
    currentPutts: 2,
}

const adUnitId = __DEV__ ? TestIds.INTERSTITIAL : Platform.OS === "ios" ? "ca-app-pub-2701716227191721/6686596809" : "ca-app-pub-2701716227191721/1702380355";
const bannerAdId = __DEV__ ? TestIds.BANNER : Platform.OS === "ios" ? "ca-app-pub-2701716227191721/1687213691" : "ca-app-pub-2701716227191721/8611403632";
const interstitial = InterstitialAd.createForAdRequest(adUnitId);

export default function RealSimulation() {
    const colors = useColors();
    const navigation = useNavigation();
    const {newSession, putters, userData, grips} = useAppContext();

    const router = useRouter();

    const {stringHoles} = useLocalSearchParams();
    const holes = parseInt(stringHoles);
    const totalPuttsRef = useRef(null);
    const bigMissRef = useRef(null);
    const submitRef = useRef(null);
    const confirmExitRef = useRef(null);
    const [adLoaded, setAdLoaded] = useState(false);
    const misreadRef = useRef(null);
    const bannerRef = useRef(null);
    const realSimulationRef = useRef(null);

    const [keyboardIsVisible, setKeyboardIsVisible] = useState(false);

    const CheckIcon = React.memo(() => (
        <View style={{
            position: "absolute",
            right: -7,
            top: -7,
            backgroundColor: "#40C2FF",
            padding: 3,
            borderRadius: 50,
        }}>
            <Svg
                width={18}
                height={18}
                stroke={colors.checkmark.color}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="3">
                <Path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5"/>
            </Svg>
        </View>
    ));

    useForeground(() => {
        bannerRef.current?.load();
    })

    useImperativeHandle(realSimulationRef, () => ({
        largeMiss: () => {
            updateField("point", {});
            updateField("center", false);
            updateField("holedOut", false);
        },
    }));

    // keep track of the time this session started at
    const [startTime, setStartTime] = useState(new Date().getTime());

    const [transitioning, setTransitioning] = useState(false);

    const [{
        loading,
        largeMiss,
        width,
        height,
        center,
        point,
        hole,
        theta,
        distance,
        holedOut,
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

        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
            setKeyboardIsVisible(true);
        });

        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
            setKeyboardIsVisible(false);
        });

        return () => {
            unsubscribeLoaded();
            backHandler.remove();
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        }
    }, []);

    const pushHole = (totalPutts) => {
        let distanceMissed = 0;

        if (largeMiss.distance === -1)
            distanceMissed = userData.preferences.units === 0 ? calculateDistanceMissedFeet(center, point, width, height) : calculateDistanceMissedMeters(center, point, width, height);

        if (putts[hole - 1] !== undefined) {
            if (totalPutts === -1)
                totalPutts = putts[hole - 1].totalPutts
        }

        const puttsCopy = updatePuttsCopy(putts, hole, holedOut ? 0 : distance === 0 ? -1 : distance, theta, misReadLine, misReadSlope, misHit, largeMiss, totalPutts, distanceMissed, point);
        updateField("putts", puttsCopy);
        return puttsCopy;
    };

    const nextHole = (totalPutts) => {
        if (!largeMiss && point.x === undefined) return;

        if (hole === holes) {
            pushHole(totalPutts);

            submitRef.current.present();
            return;
        }

        if (hole === 8 && adLoaded) {
            interstitial.show();
            setAdLoaded(false);
        }

        setTransitioning(true);

        setTimeout(() => {
            setTransitioning(false);
            // your code here
        }, 350);

        const puttsCopy = pushHole(totalPutts);

        if (putts[hole] === undefined) {
            updateField("currentPutts", 2);
            updateField("point", {});
            updateField("misReadLine", false);
            updateField("misReadSlope", false);
            updateField("holedOut", false);
            updateField("misHit", false);
            updateField("center", false);
            updateField("distanceInvalid", true);
            updateField("largeMissBy", [0, 0]);
            updateField("theta", 999);
            updateField("puttBreak", convertThetaToBreak(0));
            updateField("distance", -1);
            updateField("hole", hole + 1);
            updateField("largeMiss", {
                dir: "",
                distance: -1,
            });
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

        const puttsCopy = pushHole(2, -1);
        loadPuttData(puttsCopy[hole - 2], updateField);
        updateField("hole", hole - 1);
    };

    const fullReset = () => {
        navigation.goBack();
    }

    const submit = (partial = false) => {
        const puttsCopy = [...putts];

        const {totalPutts, avgMiss, madePercent, trimmedPutts, strokesGained, puttCounts, shortPastBias, leftRightBias, missData, totalDistance, filteredHoles, percentShort, percentHigh} = calculateStats(puttsCopy, width, height);

        updateField("loading", true)

        const data = {
            date: new Date().toISOString(),
            startedAtTimestamp: startTime,
            timestamp: new Date().getTime(),
            holes: partial ? puttsCopy.length : holes,
            filteredHoles: filteredHoles,
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
            percentShort,
            percentHigh
        }

        newSession(data).then(() => {
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
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={{flex: 1}}>
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
                    opacity: transitioning ? 0.5  : 0
                }}>
                    <ActivityIndicator size="large"/>
                </View>
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
                            <Pressable onPress={() => confirmExitRef.current.present()}>
                                <Svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                     strokeWidth={1.5}
                                     stroke={colors.text.primary} width={32} height={32}>
                                    <Path strokeLinecap="round" strokeLinejoin="round"
                                          d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15M12 9l3 3m0 0-3 3m3-3H2.25"/>
                                </Svg>
                            </Pressable>
                        </View>
                        <GreenVisual theta={theta}
                                     setTheta={(newTheta) => updateField("theta", newTheta)} distance={distance}
                                     distanceInvalid={distanceInvalid}
                                     updateField={updateField}/>
                    </View>
                    <View style={{flexDirection: "row", justifyContent: "space-around", gap: 8}}>
                        <Pressable onPress={() => updateField("misHit", !misHit)} style={{
                            paddingRight: 5,
                            paddingLeft: 0,
                            paddingVertical: 10,
                            borderRadius: 8,
                            borderWidth: 1,
                            flex: 1,
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
                            <FontText style={{color: misHit ? colors.button.danger.text : colors.button.danger.disabled.text, marginLeft: 4, fontWeight: 400}}>Mishit</FontText>
                        </Pressable>
                        <Pressable onPress={() => {
                            if (holedOut) {
                                updateField("point", {});
                                updateField("center", false);
                                updateField("largeMiss", {
                                    dir: "",
                                    distance: -1,
                                })
                            }
                            updateField("holedOut", !holedOut)
                        }} style={{
                            paddingRight: 5,
                            paddingLeft: 0,
                            paddingVertical: 10,
                            borderRadius: 10,
                            borderWidth: 1,
                            flex: 1,
                            borderColor: holedOut ? colors.button.radio.selected.border : colors.button.danger.disabled.border,
                            backgroundColor: holedOut ? colors.button.radio.selected.background : colors.button.danger.disabled.background,
                            alignSelf: "center",
                            flexDirection: "row",
                            justifyContent: "center",
                            alignItems: 'center',
                        }}>
                            {holedOut && <CheckIcon></CheckIcon>}
                            <FontText style={{color: colors.button.radio.text, marginLeft: 4, fontWeight: 400, textAlign: "center"}}>Holed Out</FontText>
                        </Pressable>
                        <Pressable onPress={() => misreadRef.current.present()} style={({pressed}) => [{
                            paddingHorizontal: 5,
                            flex: 1,
                            paddingVertical: 10,
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
                    {!keyboardIsVisible && (
                        <PuttingGreen holedOut={holedOut} largeMiss={largeMiss} setLargeMiss={(data) => updateField("largeMiss", data)} center={center} updateField={updateField} height={height} width={width} point={point}></PuttingGreen>
                    )}
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
                            <PrimaryButton onPress={() => {
                                bigMissRef.current.open();
                            }} title={`Miss > ${userData.preferences.units === 0 ? "3ft" : "1m"}?`} style={{paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8, opacity: distance < 1 ? 0.5 : 1}}></PrimaryButton>
                        )
                        }
                        {<PrimaryButton style={{borderRadius: 8, paddingVertical: 9, flex: 1, maxWidth: 96}}
                                        title={hole === holes ? "Submit" : "Next"}
                                        disabled={((point.x === undefined && largeMiss.distance === -1) || distance === -1) && !holedOut}
                                        onPress={() => {
                                            if (((point.x === undefined && largeMiss.distance === -1) || distance === -1) && !holedOut) return

                                            if (center) nextHole(1);
                                            else if (holedOut) {
                                                // updateField("currentPutts", 0);
                                                nextHole(0);
                                            }
                                            else totalPuttsRef.current.present()
                                        }}></PrimaryButton>}
                    </View>
                </ScreenWrapper>
                <TotalPutts setCurrentPutts={(newCurrentPutts) => updateField("currentPutts", newCurrentPutts)} currentPutts={currentPutts}
                            totalPuttsRef={totalPuttsRef} nextHole={nextHole}/>
                <FullBigMissModal setLargeMiss={(data) => updateField("largeMiss", data)} bigMissRef={bigMissRef} puttTrackingModalRef={realSimulationRef} largeMiss={largeMiss}/>
                <SubmitModal submitRef={submitRef} submit={submit} cancel={() => submitRef.current.dismiss()}/>
                <ConfirmExit confirmExitRef={confirmExitRef} cancel={() => confirmExitRef.current.dismiss()} canPartial={hole > 1} partial={() => submit(true)} end={fullReset}></ConfirmExit>
                <MisreadModal misreadRef={misreadRef} setMisreadSlope={(val) => updateField("misReadSlope", val)} setMisreadLine={(val) => updateField("misReadLine", val)} misreadLine={misReadLine} misreadSlope={misReadSlope}></MisreadModal>
            </View>
        </TouchableWithoutFeedback>
    );
}