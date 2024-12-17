import {ThemedText} from '@/components/ThemedText';
import {ThemedView} from '@/components/ThemedView';
import {useLocalSearchParams, useNavigation, useRouter} from 'expo-router';
import {BackHandler, Image, Platform, Pressable, Text, TextInput, useColorScheme, View} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import {runOnJS} from 'react-native-reanimated';
import {SvgClose} from '@/assets/svg/SvgComponents';
import React, {useEffect, useRef, useState} from 'react';
import Svg, {Path} from 'react-native-svg';
import DangerButton from '@/components/buttons/DangerButton';
import {doc, getFirestore, setDoc} from "firebase/firestore";
import {getAuth} from "firebase/auth";
import generatePushID from "@/components/utils/GeneratePushID";
import Loading from "@/components/popups/Loading";
import useColors from "@/hooks/useColors";
import {PrimaryButton} from "@/components/buttons/PrimaryButton";
import {useAppContext} from "@/contexts/AppCtx";
import GreenBreakSelector from '../../../components/utils/GreenBreakSelector';
import TotalPutts from '../../../components/popups/TotalPutts';
import {BottomSheetModalProvider} from '@gorhom/bottom-sheet';
import BigMissModal from '../../../components/popups/BigMiss';
import {
    calculateDistanceMissedFeet,
    calculateStats,
    convertThetaToBreak,
    getLargeMissPoint,
    loadPuttData,
    updatePuttsCopy
} from '../../../utils/PuttUtils';
import SubmitModal from "../../../components/popups/SubmitModal";
import ConfirmExit from "../../../components/popups/ConfirmExit";
import {roundTo} from "../../../utils/roundTo";

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

export default function RealSimulation() {
    const colors = useColors();
    const navigation = useNavigation();
    const {updateStats} = useAppContext();

    const db = getFirestore();
    const auth = getAuth();
    const router = useRouter();

    const {stringHoles, selectedPutterId} = useLocalSearchParams();
    const holes = parseInt(stringHoles);
    const totalPuttsRef = useRef(null);
    const bigMissRef = useRef(null);
    const submitRef = useRef(null);
    const confirmExitRef = useRef(null);

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

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            onBackPress
        );

        return () => backHandler.remove();
    }, []);

    const pushHole = (totalPutts, largeMissDistance) => {
        let distanceMissedFeet = 0;

        if (!largeMiss) {
            distanceMissedFeet = calculateDistanceMissedFeet(center, point, width, height);
        }

        if (putts[hole - 1] !== undefined) {
            if (totalPutts === -1)
                totalPutts = putts[hole - 1].totalPutts
            if (largeMissDistance === -1)
                largeMissDistance = putts[hole - 1].distanceMissed
        }

        console.log(theta);

        const puttsCopy = updatePuttsCopy(putts, hole, distance, theta, misReadLine, misReadSlope, misHit, largeMiss, totalPutts, distanceMissedFeet, largeMissDistance, point, getLargeMissPoint, largeMissBy);
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

        const puttsCopy = pushHole(totalPutts, largeMissDistance);

        if (putts[hole] === undefined) {
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

        const puttsCopy = pushHole(-1, -1);
        loadPuttData(puttsCopy[hole - 2], updateField);
        updateField("hole", hole - 1);
    };

    const onLayout = (event) => {
        const {width, height} = event.nativeEvent.layout;

        updateField("width", width);
        updateField("height", height);
    };

    const singleTap = Gesture.Tap()
        .onStart((data) => {
            runOnJS(updateField)("center", data.x > width / 2 - 25 && data.x < width / 2 + 25 && data.y > height / 2 - 25 && data.y < height / 2 + 25);

            const boxWidth = width / 10;
            const boxHeight = height / 10;

            // Assuming tap data comes in as `data.x` and `data.y`
            const snappedX = Math.round(data.x / boxWidth) * boxWidth;
            const snappedY = Math.round(data.y / boxHeight) * boxHeight;

            runOnJS(updateField)("point", {x: snappedX, y: snappedY});
        });

    const fullReset = () => {
        navigation.goBack();
    }

    const submit = (partial = false) => {
        const puttsCopy = [...putts];

        const {totalPutts, avgMiss, madePercent, trimmedPutts, strokesGained} = calculateStats(puttsCopy, width, height);

        updateField("loading", true)

        const data = {
            date: new Date().toISOString(),
            timestamp: new Date().getTime(),
            holes: partial ? puttsCopy.length : holes,
            putts: trimmedPutts,
            totalPutts: totalPutts,
            strokesGained: roundTo(strokesGained, 1),
            avgMiss: avgMiss,
            madePercent: madePercent,
            type: "real-simulation",
            putter: selectedPutterId
        }

        // Add a new document in collection "cities"
        setDoc(doc(db, `users/${auth.currentUser.uid}/sessions`, generatePushID()), data).then(() => {
            updateStats().then(() => {
                router.push({
                    pathname: `/`,
                });
            }).catch((error) => {
                console.log("updateStats " + error);
            });
        }).catch((error) => {
            console.log("setDocs " + error);
        });
    }

    return (loading ? <Loading/> :
            <BottomSheetModalProvider>
                <ThemedView style={{flexGrow: 1}}>
                    <View style={{
                        width: "100%",
                        flexGrow: 1,
                        paddingHorizontal: Platform.OS === "ios" ? 32 : 24,
                        flexDirection: "column",
                        justifyContent: "space-between",
                        marginBottom: 20
                    }}>
                        <View>
                            <View style={{flexDirection: "row", justifyContent: "space-between"}}>
                                <ThemedText style={{marginBottom: 6}} type="title">Hole {hole}<Text
                                    style={{fontSize: 14}}>/{holes}</Text></ThemedText>
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
                        <View>
                            <View style={{
                                alignSelf: "center",
                                flexDirection: "row",
                                justifyContent: "space-between",
                                width: "100%"
                            }}>
                                <ThemedText></ThemedText>
                                <ThemedText type="defaultSemiBold" style={{color: colors.putting.grid.text}}>2
                                    ft</ThemedText>
                                <ThemedText></ThemedText>
                                <ThemedText type="defaultSemiBold" style={{color: colors.putting.grid.text}}>1
                                    ft</ThemedText>
                                <ThemedText></ThemedText>
                                <ThemedText type="defaultSemiBold" style={{color: colors.putting.grid.text}}>0
                                    ft</ThemedText>
                                <ThemedText></ThemedText>
                                <ThemedText type="defaultSemiBold" style={{color: colors.putting.grid.text}}>1
                                    ft</ThemedText>
                                <ThemedText></ThemedText>
                                <ThemedText type="defaultSemiBold" style={{color: colors.putting.grid.text}}>2
                                    ft</ThemedText>
                                <ThemedText></ThemedText>
                            </View>
                            <GestureDetector gesture={singleTap}>
                                <View onLayout={onLayout}
                                      style={{
                                          alignSelf: "center",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          width: "100%"
                                      }}>
                                    <Image
                                        source={require('@/assets/images/putting-grid.png')}
                                        style={{
                                            borderWidth: 1,
                                            borderRadius: 12,
                                            borderColor: colors.putting.grid.border,
                                            width: "100%",
                                            aspectRatio: "1",
                                            height: undefined
                                        }}/>
                                    <View style={{
                                        justifyContent: "center",
                                        alignItems: "center",
                                        position: "absolute",
                                        left: width / 2 - (width / 20),
                                        top: height / 2 - (width / 20),
                                        width: width / 10 + 1,
                                        height: width / 10 + 1,
                                        borderRadius: 24,
                                        backgroundColor: center ? colors.checkmark.background : colors.checkmark.bare.background
                                    }}>
                                        <Svg width={24} height={24}
                                             stroke={center ? colors.checkmark.color : colors.checkmark.bare.color}
                                             xmlns="http://www.w3.org/2000/svg" fill="none"
                                             viewBox="0 0 24 24" strokeWidth="3">
                                            <Path strokeLinecap="round" strokeLinejoin="round"
                                                  d="m4.5 12.75 6 6 9-13.5"/>
                                        </Svg>
                                    </View>
                                    {point.x !== undefined && center !== true ? (
                                        <Image source={require('@/assets/images/golf-ball.png')} style={{
                                            position: "absolute",
                                            left: point.x - 12,
                                            top: point.y - 12,
                                            width: 24,
                                            height: 24,
                                            borderRadius: 12,
                                            backgroundColor: "#fff"
                                        }}></Image>
                                    ) : null}
                                </View>
                            </GestureDetector>
                        </View>
                        <View style={{flexDirection: "row", justifyContent: "space-between", marginTop: 14, gap: 4}}>
                            <PrimaryButton style={{borderRadius: 8, paddingVertical: 9, flex: 1, maxWidth: 96}}
                                           title="Back"
                                           disabled={hole === 1} onPress={() => lastHole()}></PrimaryButton>
                            <DangerButton onPress={() => {
                                if (distance === -1) return;
                                updateField("largeMiss", true);
                                bigMissRef.current.present();
                            }}
                                          disabled={distance === -1}
                                          title={"Miss > 3ft?"}></DangerButton>
                            {<PrimaryButton style={{borderRadius: 8, paddingVertical: 9, flex: 1, maxWidth: 96}}
                                            title={hole === holes ? "Submit" : "Next"}
                                            disabled={point.x === undefined || distance === -1}
                                            onPress={() => {
                                                if (point.x === undefined || distance === -1) return

                                                if (center) nextHole(1);
                                                else totalPuttsRef.current.present()
                                            }}></PrimaryButton>}
                        </View>
                    </View>
                    <TotalPutts currentPutts={putts[hole - 1] ? putts[hole - 1].totalPutts : 2}
                                totalPuttsRef={totalPuttsRef} nextHole={nextHole}/>
                    <BigMissModal updateField={updateField} hole={hole} bigMissRef={bigMissRef} allPutts={putts}
                                  rawLargeMissBy={largeMissBy} nextHole={nextHole} lastHole={lastHole}/>
                    <SubmitModal submitRef={submitRef} submit={submit} cancel={() => submitRef.current.dismiss()}/>
                    <ConfirmExit confirmExitRef={confirmExitRef} cancel={() => confirmExitRef.current.dismiss()} partial={() => submit(true)} end={fullReset}></ConfirmExit>
                </ThemedView>
            </BottomSheetModalProvider>
    );
}

function GreenVisual({theta, setTheta, updateField, distance, distanceInvalid, slope, puttBreak}) {
    const colors = useColors();
    const colorScheme = useColorScheme();

    const validateDistance = (text) => {
        // if it's not a number, make it invalid
        if (text === "") {
            updateField("distance", -1);
            updateField("distanceInvalid", true);
            return;
        }
        if (text.match(/[^0-9]/g)) {
            updateField("distanceInvalid", true);
            return;
        }

        const num = parseInt(text);
        updateField("distance", num);
        updateField("distanceInvalid", num < 1 || num > 99);
    }

    return (
        <View style={{
            backgroundColor: colors.background.secondary,
            flexDirection: "row",
            borderRadius: 16,
            elevation: 4,
            overflow: "hidden",
            gap: 8
        }}>
            <View style={{flex: 1, padding: 8, paddingRight: 0}}>
                <GreenBreakSelector theta={theta} setTheta={setTheta}/>
            </View>
            <View style={{flex: 0.9, flexDirection: "column", borderLeftWidth: 1, borderColor: colors.border.default}}>
                <View style={{
                    flexDirection: "column",
                    borderBottomWidth: 1,
                    borderColor: colors.border.default,
                    paddingLeft: 8,
                    flex: 1,
                    justifyContent: "center"
                }}>
                    <Text style={{fontSize: 14, textAlign: "left", color: colors.text.secondary}}>Break</Text>
                    <Text style={{
                        fontSize: 20,
                        textAlign: "left",
                        color: colors.text.primary,
                        fontWeight: "bold"
                    }}>{puttBreak}</Text>
                </View>
                <View style={{
                    flexDirection: "column",
                    borderBottomWidth: 1,
                    borderColor: colors.border.default,
                    paddingLeft: 8,
                    flex: 1,
                    justifyContent: "center"
                }}>
                    <Text style={{fontSize: 14, textAlign: "left", color: colors.text.secondary}}>Slope</Text>
                    <Text style={{
                        fontSize: 20,
                        textAlign: "left",
                        color: colors.text.primary,
                        fontWeight: "bold"
                    }}>{slope}</Text>
                </View>
                <View style={{ flex: 1, flexDirection: "column"}}>
                    <Text style={{ paddingLeft: 8, marginTop: 4, fontSize: 14, textAlign: "left", color: colors.text.secondary}}>Distance</Text>
                    <View style={{
                        flexDirection: "row",
                        gap: 12,
                        alignItems: "center",
                        alignSelf: "center",
                        paddingHorizontal: 12
                    }}>
                        <PrimaryButton style={{
                            aspectRatio: 1,
                            paddingHorizontal: 4,
                            paddingVertical: 4,
                            borderRadius: 16,
                            flex: 0
                        }} onPress={() => {
                            if (distance === -1) validateDistance((99).toString());
                            else if (distance === 1) validateDistance((99).toString());
                            else validateDistance((distance - 1).toString());
                        }}>
                            <Svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={3}
                                stroke={colors.button.primary.text}
                                width={18}
                                height={18}
                            >
                                <Path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14"/>
                            </Svg>
                        </PrimaryButton>
                        <View style={{
                            alignSelf: "center",
                            flexDirection: "row",
                            justifyContent: "space-between",
                            borderWidth: 1.5,
                            borderColor: distanceInvalid ? colors.input.invalid.border : colors.border.default,
                            borderRadius: 8,
                            flex: 1,
                            overflow: "hidden"
                        }}>
                            <TextInput style={{
                                flex: 1,
                                fontSize: 20,
                                fontWeight: "bold",
                                color: colors.text.primary,
                                backgroundColor: colorScheme === "light" ? "transparent" : distanceInvalid ? "#6D3232" : colors.background.primary,
                            }}
                                       placeholder="?"
                                       placeholderTextColor={colors.text.secondary}
                                       textAlign='center'
                                       value={distance !== -1 ? "" + distance : ""}
                                       onChangeText={validateDistance}
                                       keyboardType={Platform.OS === 'android' ? "numeric" : "number-pad"}/>
                            <View
                                style={{
                                    borderLeftWidth: 1.5,
                                    borderColor: distanceInvalid ? colors.input.invalid.border : colors.border.default,
                                    backgroundColor:
                                        distanceInvalid ?
                                            colorScheme === "light" ?
                                                "#FFBCBC" :
                                                colors.input.invalid.text :
                                            colorScheme === "light" ?
                                                colors.background.primary :
                                                colors.border.default,
                                    flex: 1
                                }}>
                                <Text style={{
                                    fontSize: 20,
                                    paddingVertical: 2,
                                    fontWeight: "bold",
                                    textAlign: "center",
                                    color: colors.text.primary,
                                }}>ft</Text>
                            </View>
                        </View>
                        <PrimaryButton
                            style={{
                                aspectRatio: 1,
                                paddingHorizontal: 4,
                                paddingVertical: 4,
                                borderRadius: 16,
                                flex: 0
                            }}
                            onPress={() => {
                                if (distance === -1) validateDistance((1).toString());
                                else if (distance === 99) validateDistance((1).toString());
                                else validateDistance((distance + 1).toString());
                            }}>
                            <Svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={3}
                                stroke={colors.button.primary.text}
                                width={18}
                                height={18}
                            >
                                <Path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 4.5v15m7.5-7.5h-15"
                                />
                            </Svg>
                        </PrimaryButton>
                    </View>
                </View>
                </View>
        </View>
    )
}