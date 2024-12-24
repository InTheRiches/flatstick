import {Image, Text, View} from "react-native";
import {Gesture, GestureDetector} from "react-native-gesture-handler";
import Svg, {Path} from "react-native-svg";
import React from "react";
import useColors from "../../hooks/useColors";
import {runOnJS} from "react-native-reanimated";

export function PuttingGreen({updateField, width, height, point, center}) {
    const colors = useColors();

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

    return (
        <View>
            <View style={{
                alignSelf: "center",
                flexDirection: "row",
                justifyContent: "space-between",
                width: "100%"
            }}>
                <Text></Text>
                <Text style={{fontSize: 14, fontWeight: 500, color: colors.putting.grid.text}}>2
                    ft</Text>
                <Text></Text>
                <Text style={{fontSize: 14, fontWeight: 500, color: colors.putting.grid.text}}>1
                    ft</Text>
                <Text></Text>
                <Text style={{fontSize: 14, fontWeight: 500, color: colors.putting.grid.text}}>0
                    ft</Text>
                <Text></Text>
                <Text style={{fontSize: 14, fontWeight: 500, color: colors.putting.grid.text}}>1
                    ft</Text>
                <Text></Text>
                <Text style={{fontSize: 14, fontWeight: 500, color: colors.putting.grid.text}}>2
                    ft</Text>
                <Text></Text>
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
    );
}