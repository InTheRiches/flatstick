import {Pressable, View} from "react-native";
import Svg, {Line} from "react-native-svg";
import {PrimaryButton} from "../../general/buttons/PrimaryButton";
import React, {useState} from "react";
import useColors from "@/hooks/useColors";
import {Easing, useAnimatedStyle, useSharedValue, withTiming,} from "react-native-reanimated";
import {SecondaryButton} from "../../general/buttons/SecondaryButton";
import FontText from "../../general/FontText";

export function PracticeMode({name, description, onPress, onInfo, time, distance, focus}) {
    const [expanded, setExpanded] = useState(true);
    const colors = useColors();
    const colorScheme = "light";

    const animatedHeight = useSharedValue(0);

    const config = {
        duration: 200,
        easing: Easing.bezier(0.5, 0.01, 0, 1),
    };

    const chevronStyle = useAnimatedStyle(() => {
        animatedHeight.value = expanded ? withTiming(0, config) : withTiming(-90, config);

        return {
            transform: [{rotate: animatedHeight.value + "deg"}],
        };
    }, [expanded]);

    return (
        <View style={{
            flexDirection: "row",
            backgroundColor: colors.background.secondary,
            borderRadius: 16,
        }}>
            <View style={{flexDirection: "column", justifyContent: "space-between", flex: 1, paddingLeft: 12, paddingBottom: 8, paddingTop: 8}}>
                <View style={{flexDirection: "row", gap: 8, alignItems: "center"}}>
                    {onInfo && (
                        colorScheme === "light" ? (
                            <PrimaryButton onPress={onInfo} style={{
                                borderRadius: 30,
                                width: 32,
                                aspectRatio: 1,
                                justifyContent: "center",
                                alignItems: "center"
                            }}>
                                <FontText style={{fontSize: 20, lineHeight: 22, fontWeight: 500, color: colors.button.primary.text}}>?</FontText>
                            </PrimaryButton>
                        ) : (
                            <SecondaryButton onPress={onInfo} style={{
                                borderRadius: 30,
                                width: 32,
                                aspectRatio: 1,
                                justifyContent: "center",
                                alignItems: "center"
                            }}>
                                <FontText style={{fontSize: 20, lineHeight: 22, fontWeight: 500, color: colors.button.secondary.text}}>?</FontText>
                            </SecondaryButton>
                        )
                    )}
                    <FontText style={{ fontSize: 17, textAlign: "left", fontWeight: 700, color: colors.button.primary.text }}>{name}</FontText>
                </View>
                <View>
                    <View style={{
                        paddingBottom: 12,
                        borderBottomWidth: 1,
                        borderColor: colors.border.default,
                        marginBottom: 12,
                        marginTop: 8,
                    }}>
                        <FontText style={{color: colors.text.secondary, paddingRight: 4}}>{description}</FontText>
                    </View>
                    <View
                        style={{flexDirection: "row", justifyContent: "space-between", marginBottom: 4, paddingRight: 12}}>
                        <View>
                            <FontText style={{textAlign: "left", color: colors.text.tertiary, fontSize: 13, fontWeight: 600}}>TIME</FontText>
                            <FontText style={{textAlign: "left", color: colors.text.primary, fontSize: 18, fontWeight: 500}}>{time}</FontText>
                        </View>
                        {distance && (
                            <View>
                                <FontText style={{textAlign: "left", color: colors.text.tertiary, fontSize: 13, fontWeight: 600}}>DISTANCE</FontText>
                                <FontText style={{textAlign: "left", color: colors.text.primary, fontSize: 18, fontWeight: 500}}>{distance}</FontText>
                            </View>
                        )}
                        <View>
                            <FontText style={{textAlign: "left", color: colors.text.tertiary, fontSize: 13, fontWeight: 600}}>FOCUS</FontText>
                            <FontText style={{textAlign: "left", color: colors.text.primary, fontSize: 18, fontWeight: 500}}>{focus}</FontText>
                        </View>
                    </View>
                </View>
            </View>
            <Pressable onPress={onPress} style={({pressed}) => ({paddingHorizontal: 8, alignItems: "center", justifyContent: "center", borderLeftWidth: 1, borderTopRightRadius: 16, borderBottomRightRadius: 16, borderColor: colors.border.default, backgroundColor: pressed ? colors.button.primary.depressed : "transparent"})}>
                <Svg width={32} height={32} viewBox="0 0 24 24">
                    <Line x1="12" y1="5" x2="12" y2="19" stroke={colors.button.primary.text} strokeWidth="2" />
                    <Line x1="5" y1="12" x2="19" y2="12" stroke={colors.button.primary.text} strokeWidth="2" />
                </Svg>
            </Pressable>
        </View>
    )
}