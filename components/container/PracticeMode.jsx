import {Pressable, ScrollView, Text, View} from "react-native";
import Svg, {Path} from "react-native-svg";
import {PrimaryButton} from "../buttons/PrimaryButton";
import {CollapsableContainer} from "./CollapsableContainer";
import {useState} from "react";
import useColors from "@/hooks/useColors";
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";

export default function PracticeMode({name, link, description, onPress, time, distance, focus}) {
    const [expanded, setExpanded] = useState(false);
    const colors = useColors();

    const [rotation, setHeight] = useState(0);
    const animatedHeight = useSharedValue(-90);

    const config = {
        duration: 200,
        easing: Easing.bezier(0.5, 0.01, 0, 1),
    };

    const chevronStyle = useAnimatedStyle(() => {
        animatedHeight.value = expanded ? withTiming(rotation, config) : withTiming(-90, config);

        return {
            transform: [{rotate: animatedHeight.value + "deg"}],
        };
    }, [expanded, rotation]);

    return (
        <View style={{
            flexDirection: "column",
            backgroundColor: colors.background.secondary,
            borderRadius: 16,
            paddingHorizontal: 12,
            paddingBottom: 8,
            paddingTop: 8,
        }}>
            <Pressable onPress={() => setExpanded(!expanded)} style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
            }}>
                <View style={{flexDirection: "row", gap: 8, alignItems: "center"}}>
                    <Animated.View style={chevronStyle}>
                        <Svg width={24} height={24}
                             xmlns="http://www.w3.org/2000/svg" fill="none"
                             viewBox="0 0 24 24" strokeWidth={1.5}
                             stroke={colors.text.primary}>
                            <Path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5"/>
                        </Svg>
                    </Animated.View>
                    <Text style={{fontSize: 18, color: colors.text.primary}}>{name}</Text>
                </View>
                <PrimaryButton onPress={onPress} style={{
                    borderRadius: 30,
                    paddingHorizontal: 10,
                    paddingVertical: 2,
                    justifyContent: "center",
                    alignItems: "center"
                }}>
                    <Text style={{fontSize: 20}}>+</Text>
                </PrimaryButton>
            </Pressable>
            <CollapsableContainer expanded={expanded}>
                <View style={{
                    paddingBottom: 12,
                    borderBottomWidth: 1,
                    borderColor: colors.border.default,
                    marginBottom: 12,
                    marginTop: 8,
                }}>
                    <Text style={{color: colors.text.secondary}}>{description}</Text>
                </View>
                <View
                    style={{flexDirection: "row", justifyContent: "space-between", marginBottom: 4, paddingRight: 12}}>
                    <View>
                        <Text style={{textAlign: "left", color: colors.text.secondary}}>Time</Text>
                        <Text style={{textAlign: "left", color: colors.text.primary, fontSize: 18}}>{time}</Text>
                    </View>
                    <View>
                        <Text style={{textAlign: "left", color: colors.text.secondary}}>Distance</Text>
                        <Text style={{textAlign: "left", color: colors.text.primary, fontSize: 18}}>{distance}</Text>
                    </View>
                    <View>
                        <Text style={{textAlign: "left", color: colors.text.secondary}}>Focus</Text>
                        <Text style={{textAlign: "left", color: colors.text.primary, fontSize: 18}}>{focus}</Text>
                    </View>
                </View>
            </CollapsableContainer>
        </View>
    )
}