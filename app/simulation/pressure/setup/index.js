import {ThemedView} from '@/components/ThemedView';
import {useRouter} from 'expo-router';
import {Image, Text, View} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import {runOnJS} from 'react-native-reanimated';
import React, {useEffect, useRef, useState} from 'react';
import Svg, {Path} from 'react-native-svg';
import useColors from "@/hooks/useColors";
import {SecondaryButton} from "@/components/buttons/SecondaryButton";
import {canvas2Polar, normalizeRad} from "react-native-redash";

const initialState = {
    confirmLeave: false,
    confirmSubmit: false,
    loading: false,
}

export default function PressurePuttingSetup() {
    const colors = useColors();
    const router = useRouter();

    const [theta, setTheta] = useState(0);

    return (<ThemedView style={{flexGrow: 1}}>
        <View style={{paddingHorizontal: 24, gap: 24}}>
            <View style={{flexDirection: "col", alignItems: "flex-start", flex: 0, marginBottom: -12}}>
                <Text style={{color: colors.text.secondary, fontSize: 16}}>Pressure Putting</Text>
                <Text style={{fontSize: 28, fontWeight: 500, color: colors.text.primary}}>Setup</Text>
            </View>
            <View style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                backgroundColor: colors.background.secondary,
                borderRadius: 16,
            }}>
                <Text style={{color: "#D0C597", fontWeight: "500"}}>STEP 1</Text>
                <Text style={{fontSize: 20, fontWeight: "500", color: colors.text.primary}}>
                    Initial Setup
                </Text>
                <Text style={{marginTop: 2, color: colors.text.primary}}>Find a putt, 5ft long, and place 8
                    balls in a circle around the hole.
                </Text>
            </View>
            <View style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                backgroundColor: colors.background.secondary,
                borderRadius: 16,
            }}>
                <Text style={{color: "#D0C597", fontWeight: "500"}}>STEP 3</Text>
                <Text style={{fontSize: 20, fontWeight: "500", color: colors.text.primary}}>
                    Finish Setup
                </Text>
                <Text style={{marginTop: 2, color: colors.text.primary}}>Add two balls to each end, like the
                    picture. It will look like a hurricane.
                </Text>
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
                        start from this ball for the remainder of the simulation. After each putt, move
                        counter-clockwise around the circle.
                    </Text>
                </View>
                <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
                    <ArrowInput theta={theta} setTheta={setTheta}/>
                </View>
            </View>
            <SecondaryButton onPress={() => {
                router.push({
                    pathname: `/simulation/pressure`, params: {
                        firstBreak: theta,
                    }
                })
            }} style={{
                borderRadius: 50,
                flexDirection: "row",
                alignSelf: "center",
                paddingLeft: 12,
                gap: 12,
                paddingRight: 8,
                paddingVertical: 6
            }}>
                <Text style={{color: colors.button.secondary.text, fontSize: 18}}>Continue</Text>
                <View style={{
                    borderRadius: 30,
                    padding: 6,
                    backgroundColor: colors.button.secondary.text
                }}>
                    <Svg width={20} height={20} xmlns="http://www.w3.org/2000/svg" fill="none"
                         viewBox="0 0 24 24" strokeWidth={1.5}
                         stroke={colors.button.secondary.background} className="size-6">
                        <Path strokeLinecap="round" strokeLinejoin="round"
                              d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25"/>
                    </Svg>
                </View>
            </SecondaryButton>
        </View>
    </ThemedView>)
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
const ArrowInput = ({theta, setTheta}) => {
    const adjustTheta = (newTheta) => {
        setTheta(newTheta);
    }
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

            if (finalRad === 0 || finalRad === 180)
                runOnJS(adjustTheta)(finalRad)
            else
                runOnJS(adjustTheta)(360 - finalRad);
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