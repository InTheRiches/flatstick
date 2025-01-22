import {Image, Text, View} from "react-native";
import {Gesture, GestureDetector} from "react-native-gesture-handler";
import Svg, {Path} from "react-native-svg";
import React from "react";
import useColors from "../../hooks/useColors";
import {runOnJS} from "react-native-reanimated";
import {useAppContext} from "../../contexts/AppCtx";
import FontText from "../general/FontText";

export function PuttingGreen({updateField, width, height, point, center}) {
    const colors = useColors();
    const {userData} = useAppContext();
    const [puttingGreenWidth, setPuttingGreenWidth] = React.useState(0);

    const onLayout = (event) => {
        const {width, height} = event.nativeEvent.layout;

        updateField("width", width);
        updateField("height", height);

        if (userData.preferences.units === 0)
            setPuttingGreenWidth(width);
        else {
            // find the number closest to width (less than) that is dividisble by 8
            let closest = 0;
            for (let i = Math.round(width); i > 0; i--) {
                if (i % 8 === 0) {
                    closest = i;
                    break;
                }
            }
            setPuttingGreenWidth(closest);
        }
    };

    const singleTap = userData.preferences.units === 0 ? Gesture.Tap()
        .onStart((data) => {
            runOnJS(updateField)("center", data.x > width / 2 - 25 && data.x < width / 2 + 25 && data.y > height / 2 - 25 && data.y < height / 2 + 25);

            const boxWidth = width / 10;
            const boxHeight = height / 10;

            // Assuming tap data comes in as `data.x` and `data.y`
            const snappedX = Math.round(data.x / boxWidth) * boxWidth;
            const snappedY = Math.round(data.y / boxHeight) * boxHeight;

            runOnJS(updateField)("point", {x: snappedX, y: snappedY});
        }) : Gesture.Tap()
        .onStart((data) => {
            runOnJS(updateField)("center", data.x > width / 2 - 25 && data.x < width / 2 + 25 && data.y > height / 2 - 25 && data.y < height / 2 + 25);

            const boxWidth = width / 8;
            const boxHeight = width / 8; // this works, DO NOT TOUCH IT, I HAVE NO CLUE WHY THIS WORKS

            // Assuming tap data comes in as `data.x` and `data.y`
            const snappedX = Math.round(data.x / boxWidth) * boxWidth;
            const snappedY = Math.round(data.y / boxHeight) * boxHeight;

            runOnJS(updateField)("point", {x: snappedX * 1.005, y: snappedY}); // again, this works, DO NOT TOUCH IT, I HAVE NO CLUE WHY THIS WORKS
        });

    const displayValue = (valueInFeet, valueInMetric) => {
        return userData.preferences.units === 1 ? valueInMetric + " m" : valueInFeet + " ft";
    };

    return (
        <View>
            <View style={{
                alignSelf: "center",
                flexDirection: "row",
                justifyContent: "space-between",
                width: "100%"
            }}>
                {userData.preferences.units === 0 ? (
                    <>
                        <Text></Text>
                        <FontText style={{fontSize: 14, fontWeight: 500, color: colors.putting.grid.text}}>2ft</FontText>
                        <Text></Text>
                        <FontText style={{fontSize: 14, fontWeight: 500, color: colors.putting.grid.text}}>1ft</FontText>
                        <Text></Text>
                        <FontText style={{fontSize: 14, fontWeight: 500, color: colors.putting.grid.text}}>0ft</FontText>
                        <Text></Text>
                        <FontText style={{fontSize: 14, fontWeight: 500, color: colors.putting.grid.text}}>1ft</FontText>
                        <Text></Text>
                        <FontText style={{fontSize: 14, fontWeight: 500, color: colors.putting.grid.text}}>2ft</FontText>
                        <Text></Text>
                    </>
                ) : (
                    <>
                        <FontText style={{fontSize: 14, fontWeight: 500, color: colors.putting.grid.text}}>1m</FontText>
                        <FontText style={{fontSize: 14, fontWeight: 500, color: colors.putting.grid.text}}>1/2m</FontText>
                        <FontText style={{fontSize: 14, fontWeight: 500, color: colors.putting.grid.text}}>0m</FontText>
                        <FontText style={{fontSize: 14, fontWeight: 500, color: colors.putting.grid.text}}>1/2m</FontText>
                        <FontText style={{fontSize: 14, fontWeight: 500, color: colors.putting.grid.text}}>1m</FontText>
                    </>
                )}
            </View>
            <GestureDetector gesture={singleTap}>
                <View onLayout={onLayout}
                      style={{
                          alignSelf: "center",
                          alignItems: "center",
                          justifyContent: "center",
                          aspectRatio: "1",
                          flexDirection: "col",
                          width: "100%",
                      }}>
                    <Image
                        source={userData.preferences.units === 0 ? require('@/assets/images/putting-grid.png') : require('@/assets/images/putting-grid-metric.png')}
                        style={{
                            borderWidth: 1,
                            borderRadius: 12,
                            borderColor: colors.putting.grid.border,
                            width: 12,
                            aspectRatio: "1",
                            flex: 1,
                        }}/>
                    <Image style={{position: "absolute", height: width / 10 + 1, width: width / 10 + 1,}} source={require("../../assets/images/golf-hole-borderless.png")}></Image>
                    { center &&
                        <View style={{
                            justifyContent: "center",
                            alignItems: "center",
                            position: "absolute",
                            left: width / 2 - (width / 20),
                            top: height / 2 - (width / 20),
                            width: width / 10 + 1,
                            height: width / 10 + 1,
                            borderRadius: 24,
                            backgroundColor: colors.checkmark.background
                        }}>
                            <Svg width={24} height={24}
                                 stroke={colors.checkmark.color}
                                 xmlns="http://www.w3.org/2000/svg" fill="none"
                                 viewBox="0 0 24 24" strokeWidth="3">
                                <Path strokeLinecap="round" strokeLinejoin="round"
                                      d="m4.5 12.75 6 6 9-13.5"/>
                            </Svg>
                        </View>
                    }
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