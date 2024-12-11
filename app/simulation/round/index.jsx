import {ThemedText} from '@/components/ThemedText';
import {ThemedView} from '@/components/ThemedView';
import {useLocalSearchParams, useNavigation, useRouter} from 'expo-router';
import {BackHandler, Image, Platform, Pressable, Text, useColorScheme, View} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import {runOnJS} from 'react-native-reanimated';
import {SvgClose, SvgWarning} from '@/assets/svg/SvgComponents';
import React, {useEffect, useRef, useState} from 'react';
import Svg, {Path} from 'react-native-svg';
import DangerButton from "@/components/buttons/DangerButton";
import ArrowComponent from "@/components/icons/ArrowComponent";
import {doc, getFirestore, setDoc} from "firebase/firestore";
import {getAuth} from "firebase/auth";
import generatePushID from "@/components/utils/GeneratePushID";
import Loading from "@/components/popups/Loading";
import useColors from "@/hooks/useColors";
import {PrimaryButton} from "@/components/buttons/PrimaryButton";
import {SecondaryButton} from "@/components/buttons/SecondaryButton";
import {useAppContext} from "@/contexts/AppCtx";
import {BottomSheetModalProvider} from '@gorhom/bottom-sheet';
import TotalPutts from '../../../components/popups/TotalPutts';
import BigMissModal from '../../../components/popups/BigMiss';
import {calculateStats, getLargeMissPoint, loadPuttData} from '../../../utils/PuttUtils';
import SubmitModal from "../../../components/popups/SubmitModal";
import ConfirmExit from "../../../components/popups/ConfirmExit";

// TODO add an extreme mode with like left right left breaks, as well as extremem vs slight breaks
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

function generateBreak() {
    // Generate a random break
    return [Math.floor(Math.random() * breaks.length), Math.floor(Math.random() * slopes.length)];
}

function generateDistance(difficulty) {
    let minDistance, maxDistance;

    if (difficulty === "easy") {
        minDistance = 3; // Easy: Minimum 3 ft
        maxDistance = 10; // Easy: Maximum 10 ft
    } else if (difficulty === "medium") {
        minDistance = 5; // Medium: Minimum 5 ft
        maxDistance = 20; // Medium: Maximum 20 ft
    } else if (difficulty === "hard") {
        minDistance = 8; // Hard: Minimum 8 ft
        maxDistance = 40; // Hard: Maximum 40 ft
    }

    // Generate random distance between minDistance and maxDistance
    return Math.floor(Math.random() * (maxDistance - minDistance + 1)) + minDistance;
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
    missRead: false,
    putts: []
}

// TODO ADD A BUTTON TO CHANGE THE BREAK OF THE HOLE
// ABOVE THAT, MAKE A GOAL MENU, THAT SHOWS THE GOAL THAT ALIGNS WITH THE PUTT, IF NONE, JUST SAY "make a goal if you need to work on this"
export default function RoundSimulation() {
    const colors = useColors();
    const navigation = useNavigation();
    const {updateStats} = useAppContext();

    const db = getFirestore();
    const auth = getAuth();
    const router = useRouter();

    const {localHoles, difficulty, mode} = useLocalSearchParams();
    const holes = parseInt(localHoles);
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
        puttBreak,
        distance,
        missRead,
        putts
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
        updateField("distance", generateDistance(difficulty));
    }, []);

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
            // find the distance to center of the point in x and y
            const distanceX = width / 2 - point.x;
            const distanceY = height / 2 - point.y;
            const distanceMissed = center ? 0 : Math.sqrt((distanceX * distanceX) + (distanceY * distanceY));

            const conversionFactor = 5 / width;
            distanceMissedFeet = distanceMissed * conversionFactor;
        }

        // if the hole exists already, and totalPutts is -1, then we are going to use the existing value, and not the -1
        if (totalPutts === -1) {
            if (putts[hole - 1] !== undefined)
                totalPutts = putts[hole - 1].totalPutts;
            else totalPutts = 2;
        }

        if (putts[hole - 1] !== undefined && largeMissDistance === 0) {
            largeMissDistance = putts[hole - 1].distanceMissed;
        }

        const puttsCopy = [...putts];
        puttsCopy[hole - 1] = {
            distance: distance,
            break: puttBreak,
            missRead: missRead,
            largeMiss: largeMiss,
            totalPutts: totalPutts,
            distanceMissed: largeMiss ? largeMissDistance : distanceMissedFeet,
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

        const puttsCopy = pushHole(totalPutts, largeMissDistance);

        if (putts[hole] === undefined) {
            updateField("point", {});
            updateField("missRead", false);
            updateField("center", false);
            updateField("largeMissBy", [0, 0]);
            updateField("puttBreak", generateBreak());
            updateField("distance", generateDistance(difficulty));
            updateField("hole", hole + 1);
            updateField("largeMiss", false);
            return;
        }

        loadPuttData(puttsCopy[hole], updateField);
        updateField("hole", hole + 1);
    };

    const lastHole = () => {
        if (hole === 1) return;

        const puttsCopy = pushHole(-1, 0);
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

    // TODO investigate error where setDoc is being set with invalid data (undefined?)
    const submit = (partial = false) => {
        const puttsCopy = [...putts];

        const {totalPutts, avgMiss, madePercent, trimmedPutts} = calculateStats(puttsCopy, width, height);

        updateField("loading", true)

        setDoc(doc(db, `users/${auth.currentUser.uid}/sessions`, generatePushID()), {
            date: new Date().toISOString(),
            timestamp: new Date().getTime(),
            difficulty: difficulty,
            holes: partial ? puttsCopy.length : holes,
            mode: mode,
            putts: trimmedPutts,
            totalPutts: totalPutts,
            avgMiss: avgMiss,
            madePercent: madePercent,
            type: "round-simulation"
        }).then(() => {
            updateStats().then(() => {
                router.push({
                    pathname: `/simulation/round/recap`,
                    params: {
                        current: true,
                        holes: partial ? puttsCopy.length : holes,
                        difficulty: difficulty,
                        mode: mode,
                        totalPutts: totalPutts,
                        avgMiss: avgMiss,
                        serializedPutts: JSON.stringify(trimmedPutts),
                        madePercent: madePercent,
                        date: new Date().toISOString()
                    }
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
                                <ThemedText style={{marginBottom: 6}} type="title">Hole {hole}</ThemedText>
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
                        <View>
                            <Pressable onPress={() => updateField("missRead", !missRead)} style={{
                                marginTop: 12,
                                marginBottom: 4,
                                paddingRight: 20,
                                paddingLeft: 10,
                                paddingVertical: 8,
                                borderRadius: 8,
                                backgroundColor: missRead ? colors.button.danger.background : colors.button.danger.disabled.background,
                                alignSelf: "center",
                                flexDirection: "row",
                                justifyContent: "center",
                                alignItems: 'center',
                            }}>
                                {missRead ?
                                    <Svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                         strokeWidth={2}
                                         width={20}
                                         height={20} stroke={colors.button.danger.text}>
                                        <Path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5"/>
                                    </Svg> :
                                    <SvgClose width={20} height={20} stroke={colors.button.danger.text}></SvgClose>
                                }
                                <Text style={{color: 'white', marginLeft: 8}}>Misread</Text>
                            </Pressable>
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
                                updateField("largeMiss", true);
                                bigMissRef.current.present();
                            }}
                                          title={"Miss > 5ft?"}></DangerButton>
                            {<PrimaryButton style={{borderRadius: 8, paddingVertical: 9, flex: 1, maxWidth: 96}}
                                            title={hole === holes ? "Submit" : "Next"}
                                            disabled={point.x === undefined}
                                            onPress={() => {
                                                if (point.x === undefined) return;

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

function GreenVisual({distance, puttBreak, slope, imageSource}) {
    const colors = useColors();

    return (
        <View style={{
            backgroundColor: colors.background.secondary,
            flexDirection: "column",
            borderRadius: 16,
            elevation: 4,
            overflow: "hidden"
        }}>
            <View style={{width: "100%", flexDirection: "row", justifyContent: "center", alignContent: "center"}}>
                <Image source={imageSource} style={{
                    width: Platform.OS === "ios" ? "90%" : "100%",
                    height: "auto",
                    aspectRatio: 2
                }}></Image>
            </View>
            <View
                style={{width: "100%", flexDirection: "column", borderTopWidth: 1, borderColor: colors.border.default}}>
                <View style={{flexDirection: "row"}}>
                    <View style={{
                        flexDirection: "column",
                        flex: 1,
                        borderRightWidth: 1,
                        borderColor: colors.border.default,
                        paddingBottom: 12,
                        paddingTop: 6,
                        paddingLeft: 12
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
                        flex: 0.7,
                        borderRightWidth: 1,
                        borderColor: colors.border.default,
                        paddingBottom: 12,
                        paddingTop: 6,
                        paddingLeft: 12
                    }}>
                        <Text style={{fontSize: 14, textAlign: "left", color: colors.text.secondary}}>Slope</Text>
                        <Text style={{
                            fontSize: 20,
                            textAlign: "left",
                            color: colors.text.primary,
                            fontWeight: "bold"
                        }}>{slope}</Text>
                    </View>
                    <View
                        style={{flexDirection: "column", flex: 0.7, paddingBottom: 12, paddingTop: 6, paddingLeft: 12}}>
                        <Text style={{fontSize: 14, textAlign: "left", color: colors.text.secondary}}>Distance</Text>
                        <Text style={{
                            fontSize: 20,
                            textAlign: "left",
                            color: colors.text.primary,
                            fontWeight: "bold"
                        }}>{distance}ft</Text>
                    </View>
                </View>
            </View>
        </View>
    )
}
