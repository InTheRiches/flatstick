import {ThemedText} from '@/components/ThemedText';
import {ThemedView} from '@/components/ThemedView';
import {useRouter, useLocalSearchParams, useNavigation} from 'expo-router';
import {Image, Pressable, Text, BackHandler, Platform, StyleSheet} from 'react-native';
import {GestureDetector, Gesture} from 'react-native-gesture-handler';
import Animated, {runOnJS, useAnimatedStyle, useSharedValue, withSpring} from 'react-native-reanimated';
import {SvgClose, SvgWarning} from '@/assets/svg/SvgComponents';
import {View} from 'react-native';
import {useEffect, useMemo, useState} from 'react';
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
                <ArrowInput/>

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
    45: require("@/assets/images/greens/rightForward.png"),
    90: require("@/assets/images/greens/right.png"),
    135: require("@/assets/images/greens/backRight.png"),
    315: require("@/assets/images/greens/leftForward.png"),
    270: require("@/assets/images/greens/left.png"),
    225: require("@/assets/images/greens/backLeft.png"),
    0: require("@/assets/images/greens/forward.png"),
    360: require("@/assets/images/greens/forward.png"),
    180: require("@/assets/images/greens/back.png"),
}

const blockValue = (oldVal, newVal) => {
    "worklet";
    if ((oldVal > 1.5 * PI && newVal < PI / 2) || oldVal === 0) {
        return 2 * PI;
    }
    if (oldVal < PI / 2 && newVal > 1.5 * PI) {
        return 0.01;
    }
    return newVal;
};

export const DELTA = PI / 6.5;

const ArrowInput = () => {
    const rotation = useSharedValue(0); // Rotation in degrees

    const [theta, setTheta] = useState(0);
    const [baseX, setBaseX] = useState(0);
    const [baseY, setBaseY] = useState(0)

    const onLayout = (event) => {
        const {x, y} = event.nativeEvent.layout;

        setBaseX(x);
        setBaseY(y);
    };

    // Gesture definition for rotation
    const gesture = Gesture.Pan()
        .onUpdate((event) => {
            let x = event.absoluteX - baseX;
            let y = event.absoluteY - baseY;

            const newVal = normalizeRad(
                canvas2Polar({x, y}, {x: 200, y: 200}).theta
            ) * 57.2958;

            console.log(x + ":" + y)

            const finalRad = Math.round(newVal / 45) * 45;

            if (finalRad === 0 || finalRad === 180)
                runOnJS(setTheta)(finalRad)
            else
                runOnJS(setTheta)(360 - finalRad);
        });

    const [visibleImageSource, setVisibleImageSource] = useState();

    return (
        <View style={{justifyContent: "center", alignItems: "center"}}>
            <GestureDetector gesture={gesture}>
                <View onLayout={onLayout}>
                    <Image
                        source={angleImages[theta]}
                        style={{
                            height: 1,
                            width: 1,
                            opacity: 0
                        }} // height and width must be non-zero or else onLoad does not fire on Android
                        onLoad={() => {
                            setVisibleImageSource(angleImages[theta]);
                        }}
                    />
                    <Image
                        source={visibleImageSource}
                        style={{
                            width: "400",
                            height: "auto",
                            aspectRatio: 2,
                        }}
                    />
                </View>
            </GestureDetector>
        </View>
    );
};