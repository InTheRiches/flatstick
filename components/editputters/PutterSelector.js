import useColors from "../../hooks/useColors";
import {Image, Text, View} from "react-native";
import {Gesture, GestureDetector} from "react-native-gesture-handler";
import {runOnJS} from "react-native-reanimated";
import Svg, {Path} from "react-native-svg";
import React from "react";

// Make sure there is a max of like 5 putters
export function PutterSelector({id, name, stats, selectedPutter, setSelectedPutter}) {
    const colors = useColors();

    return (
        <GestureDetector key={id + "_putter"} gesture={Gesture.Tap().onStart((data) => runOnJS(setSelectedPutter)(id))}>
            <View style={{
                flexDirection: "row",
                width: "100%",
                gap: 12,
                borderWidth: 1,
                borderRadius: 10,
                borderColor: colors.toggleable.border,
                backgroundColor: colors.background.secondary,
                paddingHorizontal: 12,
                paddingVertical: 10,
                marginBottom: 12,
                alignItems: "center"}}>
                <Image source={require("@/assets/images/putterTest.png")} style={{height: 48, width: 48, aspectRatio: 1, borderRadius: 8}}></Image>
                <View style={{flexDirection: "column", flex: 1}}>
                    <Text style={{fontSize: 16, color: colors.text.primary, fontWeight: 500}}>{name}</Text>
                    <View style={{flexDirection: "row", width: "100%", justifyContent: "flex-start", alignItems: "center"}}>
                        <Text style={{color: colors.text.secondary, width: "40%"}}>Sessions: 3</Text>
                        <Text style={{color: colors.text.secondary}}>Strokes Gained: {stats.strokesGained.overall}</Text>
                    </View>
                </View>
                <Svg style={{opacity: selectedPutter === id ? 1 : 0}} width={30} height={30} stroke={colors.checkmark.background} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="3">
                    <Path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5"/>
                </Svg>
            </View>
        </GestureDetector>
    )
}