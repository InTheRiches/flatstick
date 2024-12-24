import useColors from "../../hooks/useColors";
import {Image, Text, useColorScheme, View} from "react-native";
import {Gesture, GestureDetector} from "react-native-gesture-handler";
import {runOnJS} from "react-native-reanimated";
import Svg, {Path} from "react-native-svg";
import React from "react";

export function PutterSelector({id, setSelectedPutter, selectedPutter, name, stats}) {
    const colors = useColors();
    const colorScheme = useColorScheme();

    return (
        <GestureDetector key={id + "_putter"} gesture={Gesture.Tap().onStart((data) => runOnJS(setSelectedPutter)(id))}>
            <View style={{
                flexDirection: "row",
                width: "100%",
                gap: 12,
                borderWidth: 1,
                borderRadius: 10,
                borderColor: selectedPutter === id ? colors.toggleable.toggled.border : colors.toggleable.border,
                backgroundColor: selectedPutter === id ? colors.toggleable.toggled.background : colorScheme === "light" ? colors.background.secondary : "transparent",
                paddingHorizontal: 12,
                paddingVertical: 10,
                marginBottom: 12,
                alignItems: "center"}}>
                <Image source={require("@/assets/images/putterTest.png")} style={{height: 48, width: 48, aspectRatio: 1, borderRadius: 8}}></Image>
                <View style={{flexDirection: "column", flex: 1}}>
                    <Text style={{fontSize: 16, color: colors.text.primary, fontWeight: 500}}>{name}</Text>
                    <View style={{flexDirection: "row", width: "100%", justifyContent: "flex-start", alignItems: "center"}}>
                        <Text style={{color: colors.text.secondary, width: "40%"}}>Sessions: 3</Text>
                        <Text style={{color: colors.text.secondary, width: "50%"}}>Strokes Gained: {stats.strokesGained.overall}</Text>
                    </View>
                </View>
                {selectedPutter === id && (
                    <View style={{
                        position: "absolute",
                        right: -7,
                        top: -7,
                        backgroundColor: "#40C2FF",
                        padding: 3,
                        borderRadius: 50,
                    }}>
                        <Svg width={18}
                             height={18}
                             stroke={colors.checkmark.color}
                             xmlns="http://www.w3.org/2000/svg"
                             fill="none"
                             viewBox="0 0 24 24"
                             strokeWidth="3">
                            <Path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5"/>
                        </Svg>
                    </View>
                )}
            </View>
        </GestureDetector>
    )
}