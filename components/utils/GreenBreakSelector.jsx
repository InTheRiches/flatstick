import React, {useEffect, useRef, useState} from "react";
import {Image, View} from "react-native";
import {Gesture, GestureDetector} from "react-native-gesture-handler";
import {runOnJS} from "react-native-reanimated";
import {canvas2Polar, normalizeRad} from "react-native-redash";

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
export default function GreenBreakSelector({theta, setTheta}) {
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

    const gesture = Gesture.Pan().onUpdate((event) => {
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

    const [visibleImageSource, setVisibleImageSource] = useState(null);

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