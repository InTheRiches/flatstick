import {ThemedText} from '@/components/ThemedText';
import {ThemedView} from '@/components/ThemedView';
import {useRouter, useLocalSearchParams, useNavigation} from 'expo-router';
import {Image, Pressable, Text, BackHandler, Platform, StyleSheet} from 'react-native';
import {GestureDetector, Gesture} from 'react-native-gesture-handler';
import Animated, {runOnJS, useAnimatedStyle, useSharedValue, withSpring} from 'react-native-reanimated';
import {SvgClose, SvgWarning} from '@/assets/svg/SvgComponents';
import {View} from 'react-native';
import {useEffect, useMemo, useRef, useState} from 'react';
import Svg, {Path} from 'react-native-svg';
import React from "react";
import {getFirestore, setDoc, doc, runTransaction} from "firebase/firestore";
import {getAuth} from "firebase/auth";
import generatePushID from "@/components/utils/GeneratePushID";
import Loading from "@/components/popups/Loading";
import useColors from "@/hooks/useColors";
import {PrimaryButton} from "@/components/buttons/PrimaryButton";
import {SecondaryButton} from "@/components/buttons/SecondaryButton";
import {useAppContext} from "@/contexts/AppCtx";
import FastImage from 'react-native-fast-image';
import {canvas2Polar, normalizeRad, PI} from "react-native-redash";

// TODO add an extreme mode with like left right left breaks, as well as extremem vs slight breaks
// AND THEY GO BACK, NOT SHOW BOTH DIALOGES ON TOP OF EACH OTHER, AND TO CANCEL THE OTHER ONE BENEATH IT
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

const initialState = {
    confirmLeave: false,
    confirmSubmit: false,
    loading: false,
}

// TODO WHEN SWITCHING TO THE NEXT HOLE, ADD A POPUP ASKING HOW MANY PUTTS IT TOOK TO FINISH OUT THE HOLE
// TODO ADD A BUTTON TO CHANGE THE BREAK OF THE HOLE
// ABOVE THAT, MAKE A GOAL MENU, THAT SHOWS THE GOAL THAT ALIGNS WITH THE PUTT, IF NONE, JUST SAY "make a goal if you need to work on this"

export default function Simulation() {
    const colors = useColors();
    const navigation = useNavigation();
    const {updateStats} = useAppContext();

    const db = getFirestore();
    const auth = getAuth();
    const router = useRouter();

    const {} = useLocalSearchParams();

    const [{
        loading,
        confirmLeave,
        confirmSubmit,
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
            updateField("confirmLeave", true);

            return true;
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            onBackPress
        );

        return () => backHandler.remove();
    }, []);

    const fullReset = () => {
        navigation.goBack();
    }

    return (loading ? <Loading/> :
            <ThemedView style={{flexGrow: 1}}>
                <View style={{paddingHorizontal: 24, gap: 32}}>
                    <View style={{flexDirection: "col", alignItems: "flex-start", flex: 0, marginBottom: -12}}>
                        <Text style={{color: colors.text.secondary, fontSize: 16}}>Pressure Putting</Text>
                        <Text style={{fontSize: 24, fontWeight: 500, color: colors.text.primary}}>Setup</Text>
                    </View>
                    <View>
                        <View style={{flexDirection: "row", justifyContent: "flex-start"}}>
                            <View style={{alignSelf: 'flex-start', paddingRight: 14}}>
                                <Text style={{
                                    fontSize: 20,
                                    fontWeight: 500,
                                    color: colors.text.primary,
                                }}>Initial
                                    Setup</Text>
                            </View>
                            <View style={{
                                paddingHorizontal: 10,
                                paddingVertical: 2,
                                backgroundColor: colors.stepMarker.background,
                                justifyContent: "center",
                                alignItems: "center",
                                borderRadius: 16,
                                borderWidth: 1,
                                borderColor: colors.stepMarker.text,
                            }}>
                                <Text style={{color: colors.stepMarker.text, fontWeight: 500}}>STEP 1</Text>
                            </View>
                        </View>
                        <Text style={{marginTop: 4, color: colors.text.primary}}>Find a putt, 5ft long, and place 8
                            balls in a circle around the hole.</Text>
                    </View>
                    <View>
                        <View style={{flexDirection: "row", justifyContent: "flex-start"}}>
                            <View style={{alignSelf: 'flex-start', paddingRight: 14}}>
                                <Text style={{
                                    fontSize: 20,
                                    fontWeight: 500,
                                    color: colors.text.primary,
                                }}>Finish
                                    Setup</Text>
                            </View>
                            <View style={{
                                paddingHorizontal: 10,
                                paddingVertical: 2,
                                backgroundColor: colors.stepMarker.background,
                                justifyContent: "center",
                                alignItems: "center",
                                borderRadius: 16,
                                borderWidth: 1,
                                borderColor: colors.stepMarker.text,
                            }}>
                                <Text style={{color: colors.stepMarker.text, fontWeight: 500}}>STEP 2</Text>
                            </View>
                        </View>
                        <Text style={{marginTop: 4, color: colors.text.primary}}>Add two balls to each end, like the
                            picture. It will look like a hurricane.</Text>
                    </View>
                    <View style={{
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        marginBottom: 16,
                        backgroundColor: colors.background.secondary,
                        borderRadius: 16,
                        flexDirection: "row", // Ensures horizontal alignment
                    }}>
                        <View style={{flex: 1, paddingRight: 8}}>
                            <Text style={{color: "#D0C597", fontWeight: "500"}}>STEP 4</Text>
                            <Text style={{fontSize: 20, fontWeight: "500", color: colors.text.primary}}>
                                Identify Break
                            </Text>
                            <Text style={{marginTop: 2, color: colors.text.primary}}>
                                Pick a ball in the initial circle, and rotate the green until it matches the given
                                break. You will
                                start from this ball for the remainder of the simulation.
                            </Text>
                        </View>
                        <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
                            <ArrowInput/>
                        </View>
                    </View>
                </View>

                {(confirmLeave || confirmSubmit) &&
                    <View style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 50,
                        height: '100%',
                        width: '100%',
                        backgroundColor: colors.background.tinted
                    }}>
                        {confirmLeave &&
                            <ConfirmExit cancel={() => updateField("confirmLeave", false)}
                                         end={fullReset}></ConfirmExit>}
                        {confirmSubmit &&
                            <ConfirmSubmit cancel={() => updateField("confirmSubmit", false)}
                                           submit={submit}></ConfirmSubmit>}
                    </View>}
            </ThemedView>
    );
}

function ConfirmExit({end, cancel}) {
    const colors = useColors();

    return (
        <View style={{
            borderColor: colors.border.popup,
            backgroundColor: colors.background.primary,
            borderWidth: 1,
            width: "auto",
            maxWidth: "70%",
            maxHeight: "70%",
            borderRadius: 16,
            paddingTop: 20,
            paddingBottom: 20,
            paddingHorizontal: 20,
            flexDirection: "col"
        }}>
            <View style={{justifyContent: "center", flexDirection: "row", width: "100%"}}>
                <View style={{
                    padding: 12,
                    alignContent: "center",
                    flexDirection: "row",
                    justifyContent: "center",
                    borderRadius: 50,
                    backgroundColor: colors.button.danger.background
                }}>
                    <SvgWarning width={26} height={26}
                                stroke={colors.button.danger.text}></SvgWarning>
                </View>
            </View>
            <ThemedText type={"header"} style={{fontWeight: 500, textAlign: "center", marginTop: 14}}>End
                Session</ThemedText>
            <ThemedText type={"default"} secondary={true} style={{textAlign: "center", lineHeight: 18, marginTop: 10}}>Are
                you
                sure you want to end this session? You can always upload the partial round, otherwise all data will be
                lost.
                This action cannot be undone.</ThemedText>
            <Pressable onPress={end} style={({pressed}) => [{
                backgroundColor: pressed ? colors.buttonDangerDepressedBackground : colors.button.danger.background,
                paddingVertical: 10,
                borderRadius: 10,
                marginTop: 16
            }]}>
                <Text style={{textAlign: "center", color: colors.button.danger.text, fontWeight: 500}}>End
                    Session</Text>
            </Pressable>
            <SecondaryButton onPress={cancel} title={"Cancel"}
                             style={{marginTop: 10, paddingVertical: 10, borderRadius: 10}}></SecondaryButton>
        </View>
    )
}

function ConfirmSubmit({submit, cancel}) {
    const colors = useColors();

    return (
        <ThemedView style={{
            borderColor: colors.border.popup,
            borderWidth: 1,
            width: "auto",
            maxWidth: "70%",
            maxHeight: "70%",
            borderRadius: 16,
            paddingTop: 20,
            paddingBottom: 20,
            paddingHorizontal: 20,
            flexDirection: "col"
        }}>
            <View style={{justifyContent: "center", flexDirection: "row", width: "100%"}}>
                <View style={{
                    padding: 12,
                    alignContent: "center",
                    flexDirection: "row",
                    justifyContent: "center",
                    borderRadius: 50,
                    backgroundColor: colors.checkmark.background
                }}>
                    <Svg width={24} height={24} stroke={colors.checkmark.color} xmlns="http://www.w3.org/2000/svg"
                         fill="none"
                         viewBox="0 0 24 24" strokeWidth="3">
                        <Path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5"/>
                    </Svg>
                </View>
            </View>
            <ThemedText type={"header"} style={{fontWeight: 500, textAlign: "center", marginTop: 14}}>Submit
                Session</ThemedText>
            <ThemedText type={"default"} secondary={true} style={{textAlign: "center", lineHeight: 18, marginTop: 8}}>Done
                putting? Submit to find out if you should celebrate—or blame the slope, the wind, and your
                shoes.</ThemedText>
            <PrimaryButton onPress={submit} title={"Submit"}
                           style={{paddingVertical: 10, borderRadius: 10, marginTop: 32}}></PrimaryButton>
            <SecondaryButton onPress={cancel} title={"Cancel"}
                             style={{paddingVertical: 10, borderRadius: 10, marginTop: 10}}></SecondaryButton>
        </ThemedView>
    )
}

const angleImages = {
    45: require("@/assets/images/breakSelector/forwardRight.png"),
    90: require("@/assets/images/breakSelector/right.png"),
    135: require("@/assets/images/breakSelector/backRight.png"),
    315: require("@/assets/images/breakSelector/forwardLeft.png"),
    270: require("@/assets/images/breakSelector/left.png"),
    225: require("@/assets/images/breakSelector/backLeft.png"),
    0: require("@/assets/images/breakSelector/forward.png"),
    360: require("@/assets/images/breakSelector/forward.png"),
    180: require("@/assets/images/breakSelector/back.png"),
}

// TODO MAKE THE ARROW GREEN IMAGE, MAKE THE ARROWS CENTERED, AS THEY RIGHT KNOW MOVE AROUND A LITTLE WHEN THEY ROTATE
const ArrowInput = () => {
    const [theta, setTheta] = useState(0);
    const [baseX, setBaseX] = useState(0);
    const [baseY, setBaseY] = useState(0);
    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);
    const [imageAbsoluteX, setImageAbsoluteX] = useState(0);
    const [imageAbsoluteY, setImageAbsoluteY] = useState(0);

    const imageRef = useRef(null);

    const onLayout = (event) => {
        const {x, y} = event.nativeEvent.layout;

        setBaseX(x);
        setBaseY(y);
    };

    const measurePosition = () => {
        if (imageRef.current) {
            imageRef.current.measure((fx, fy, width, height, px, py) => {
                setImageAbsoluteX(px);
                setImageAbsoluteY(py);
                setWidth(width);
                setHeight(height);
            });
        }
    };

    useEffect(() => {
        measurePosition();
    });

    // Gesture definition for rotation
    const gesture = Gesture.Pan()
        .onUpdate((event) => {
            let x = event.absoluteX - baseX;
            let y = event.absoluteY - baseY;

            const newVal = normalizeRad(
                canvas2Polar({x, y}, {x: imageAbsoluteX + (width / 2), y: imageAbsoluteY + (height / 2)}).theta
            ) * 57.2958;

            const finalRad = Math.round(newVal / 45) * 45;

            console.log("center x: " + (imageAbsoluteX + (width)));
            console.log(x + ":" + y)

            if (finalRad === 0 || finalRad === 180)
                runOnJS(setTheta)(finalRad)
            else
                runOnJS(setTheta)(360 - finalRad);
        });

    const [visibleImageSource, setVisibleImageSource] = useState();

    return (
        <View style={{justifyContent: "center", alignItems: "center"}}>
            <GestureDetector gesture={gesture}>
                <View onLayout={onLayout} ref={imageRef}>
                    <Image
                        source={angleImages[theta]}
                        style={{
                            height: 1,
                            width: 1,
                            opacity: 0,
                        }} // height and width must be non-zero or else onLoad does not fire on Android
                        onLoad={() => {
                            setVisibleImageSource(angleImages[theta]);
                        }}
                    />
                    <Image
                        source={visibleImageSource}
                        style={{
                            width: "100%", // Set a fixed width
                            height: "auto",
                            aspectRatio: 1 // Ensure it doesn't stretch
                        }}
                    />
                </View>
            </GestureDetector>
        </View>
    );
};