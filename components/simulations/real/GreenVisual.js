import {Platform, Pressable, TextInput, View} from "react-native";
import {GreenBreakSelector} from "./GreenBreakSelector";
import Svg, {Circle, Path} from "react-native-svg";
import React from "react";
import useColors from "../../../hooks/useColors";
import {PrimaryButton} from "../../general/buttons/PrimaryButton";
import {useAppContext} from "../../../contexts/AppCtx";
import FontText from "../../general/FontText";

const breaks = {
    45: "Left to Right",
    90: "Left to Right",
    135: "Left to Right",
    315: "Right to Left",
    270: "Right to Left",
    225: "Right to Left",
    0: "Straight",
    360: "Straight",
    180: "Straight",
    999: "Straight",
}

const slopes = {
    45: "Downhill",
    90: "Neutral",
    135: "Uphill",
    315: "Downhill",
    270: "Neutral",
    225: "Uphill",
    0: "Downhill",
    360: "Downhill",
    180: "Uphill",
    999: "Neutral",
}

export function GreenVisual({theta, setTheta, updateField, distance, distanceInvalid}) {
    const colors = useColors();
    const colorScheme = "light";
    const {userData} = useAppContext();

    const slope = slopes[theta];
    const puttBreak = breaks[theta];

    const validateDistance = (text) => {
        // if it's not a number, make it invalid
        if (text === "") {
            updateField("distance", -1);
            updateField("distanceInvalid", true);
            return;
        }
        if (text.match(/[^0-9]/g)) {
            updateField("distanceInvalid", true);
            return;
        }

        const num = parseInt(text);
        updateField("distance", num);
        updateField("distanceInvalid", num < 1 || num > 99);
    }

    const BreakDots = ({}) => {
        const colors = useColors();
        const dots = [0, 1, 2]; // Assuming there are three breaks
        const breaks = ["Right to Left", "Straight", "Left to Right"];

        return (
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 2, marginRight: 8 }}>
                {dots.map((dot, index) => (
                    <Svg key={index} height="6" width="6" style={{ marginHorizontal: 4 }}>
                        <Circle cx="3" cy="3" r="3" fill={breaks[index] === puttBreak ? colors.text.primary : colors.text.secondary} opacity={breaks[index] === puttBreak ? 0.7 : 0.2}/>
                    </Svg>
                ))}
            </View>
        );
    };

    const SlopeDots = ({}) => {
        const colors = useColors();
        const dots = [0, 1, 2]; // Assuming there are three breaks
        const slopes = ["Downhill", "Neutral", "Uphill"];

        return (
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 2, marginRight: 8 }}>
                {dots.map((dot, index) => (
                    <Svg key={index} height="6" width="6" style={{ marginHorizontal: 4 }}>
                        <Circle cx="3" cy="3" r="3" fill={slopes[index] === slope ? colors.text.primary : colors.text.secondary} opacity={slopes[index] === slope ? 0.7 : 0.2}/>
                    </Svg>
                ))}
            </View>
        );
    };

    const cycleBreak = () => {
        const breakMapping = {
            "Downhill": [315, 0, 45],
            "Neutral": [90, 270, 999],
            "Uphill": [225, 180, 135]
        };

        const currentSlope = slopes[theta];
        const currentBreakArray = breakMapping[currentSlope];
        const currentIndex = currentBreakArray.indexOf(theta);

        // Cycle to the next break in the array
        const nextIndex = (currentIndex + 1) % currentBreakArray.length;
        const newTheta = currentBreakArray[nextIndex];

        setTheta(newTheta);
        updateField("theta", newTheta);
    };

    const cycleSlopes = () => {
        const slopeMapping = {
            "Right to Left": [315, 270, 225],
            "Straight": [999, 180, 360],
            "Left to Right": [45, 90, 135]
        };

        const currentBreak = breaks[theta];
        const currentBreakArray = slopeMapping[currentBreak];
        const currentIndex = currentBreakArray.indexOf(theta);

        // Cycle to the next break in the array
        const nextIndex = (currentIndex + 1) % currentBreakArray.length;
        const newTheta = currentBreakArray[nextIndex];

        setTheta(newTheta);
        updateField("theta", newTheta);
    };

    return (
        <View style={{
            backgroundColor: colors.background.secondary,
            flexDirection: "row",
            borderRadius: 16,
            elevation: 0,
            overflow: "hidden",
            gap: 8
        }}>
            <View style={{flex: 1, padding: 8, paddingRight: 0}}>
                <GreenBreakSelector theta={theta} setTheta={setTheta}/>
            </View>
            <View style={{flex: 0.9, flexDirection: "column", borderLeftWidth: 1, borderColor: colors.border.default}}>
                <Pressable onPress={cycleBreak} style={{
                    flexDirection: "column",
                    borderBottomWidth: 1,
                    borderColor: colors.border.default,
                    paddingLeft: 8,
                    flex: 1,
                    justifyContent: "center"
                }}>
                    <FontText style={{fontSize: 14, textAlign: "left", color: colors.text.secondary}}>Break</FontText>
                    <FontText style={{fontSize: 20, textAlign: "left", color: colors.text.primary, fontWeight: "bold"}}>{puttBreak}</FontText>
                    <BreakDots/>
                </Pressable>
                <Pressable onPress={cycleSlopes} style={{
                    flexDirection: "column",
                    borderBottomWidth: 1,
                    borderColor: colors.border.default,
                    paddingLeft: 8,
                    flex: 1,
                    justifyContent: "center"
                }}>
                    <FontText style={{fontSize: 14, textAlign: "left", color: colors.text.secondary}}>Slope</FontText>
                    <FontText style={{fontSize: 20, textAlign: "left", color: colors.text.primary, fontWeight: "bold"}}>{slope}</FontText>
                    <SlopeDots/>
                </Pressable>
                <View style={{ flex: 1, flexDirection: "column", justifyContent: "center"}}>
                    <FontText style={{ paddingLeft: 8, marginTop: 4, fontSize: 14, textAlign: "left", color: colors.text.secondary}}>Distance</FontText>
                    <View style={{
                        flexDirection: "row",
                        gap: 6,
                        alignItems: "center",
                        justifyContent: "space-between",
                        alignSelf: "center",
                        paddingHorizontal: 12
                    }}>
                        <PrimaryButton style={{
                            aspectRatio: 1,
                            paddingHorizontal: 3,
                            paddingVertical: 3,
                            borderRadius: 16,
                            flex: 0
                        }} onPress={() => {
                            if (distance === -1) validateDistance((99).toString());
                            else if (distance === 1) validateDistance((99).toString());
                            else validateDistance((distance - 1).toString());
                        }}>
                            <Svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={3}
                                stroke={colors.button.primary.text}
                                width={18}
                                height={18}>
                                <Path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14"/>
                            </Svg>
                        </PrimaryButton>
                        <View style={{
                            alignSelf: "center",
                            flexDirection: "row",
                            justifyContent: "space-between",
                            borderWidth: 1.5,
                            borderColor: distanceInvalid ? colors.input.invalid.border : colors.border.default,
                            borderRadius: 8,
                            marginTop: 4,
                            flex: 1,
                            overflow: "hidden"
                        }}>
                            <TextInput style={{
                                flex: 1,
                                fontSize: 16,
                                paddingVertical: 0,
                                fontWeight: "bold",
                                color: colors.text.primary,
                                backgroundColor: colorScheme === "light" ? "transparent" : distanceInvalid ? "#6D3232" : colors.background.primary,
                            }}
                               placeholder="?"
                               placeholderTextColor={colors.text.secondary}
                               textAlign='center'
                               value={distance !== -1 ? "" + distance : ""}
                               onChangeText={validateDistance}
                               keyboardType={Platform.OS === 'android' ? "numeric" : "number-pad"}/>
                            <View style={{
                                    borderLeftWidth: 1.5,
                                    borderColor: distanceInvalid ? colors.input.invalid.border : colors.border.default,
                                    backgroundColor:
                                        distanceInvalid ?
                                            colorScheme === "light" ?
                                                "#FFBCBC" :
                                                colors.input.invalid.text :
                                            colorScheme === "light" ?
                                                colors.background.primary :
                                                colors.border.default,
                                    flex: 1}}>
                                <FontText style={{fontSize: 16, paddingVertical: 2, fontWeight: "bold", textAlign: "center", color: colors.text.primary,}}>{userData.preferences.units === 0 ? "ft" : "m"}</FontText>
                            </View>
                        </View>
                        <PrimaryButton
                            style={{
                                aspectRatio: 1,
                                paddingHorizontal: 3,
                                paddingVertical: 3,
                                borderRadius: 16,
                                flex: 0
                            }}
                            onPress={() => {
                                if (distance === -1) validateDistance((1).toString());
                                else if (distance === 99) validateDistance((1).toString());
                                else validateDistance((distance + 1).toString());
                            }}>
                            <Svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={3}
                                stroke={colors.button.primary.text}
                                width={18}
                                height={18}>
                                <Path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 4.5v15m7.5-7.5h-15"
                                />
                            </Svg>
                        </PrimaryButton>
                    </View>
                </View>
            </View>
        </View>
    )
}