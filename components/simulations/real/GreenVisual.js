import {Platform, TextInput, View} from "react-native";
import {GreenBreakSelector} from "./GreenBreakSelector";
import Svg, {Path} from "react-native-svg";
import React from "react";
import useColors from "../../../hooks/useColors";
import {PrimaryButton} from "../../general/buttons/PrimaryButton";
import {useAppContext} from "../../../contexts/AppCtx";
import FontText from "../../general/FontText";

export function GreenVisual({theta, setTheta, updateField, distance, distanceInvalid, slope, puttBreak}) {
    const colors = useColors();
    const colorScheme = "light";
    const {userData} = useAppContext();

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
                <View style={{
                    flexDirection: "column",
                    borderBottomWidth: 1,
                    borderColor: colors.border.default,
                    paddingLeft: 8,
                    flex: 1,
                    justifyContent: "center"
                }}>
                    <FontText style={{fontSize: 14, textAlign: "left", color: colors.text.secondary}}>Break</FontText>
                    <FontText style={{fontSize: 20, textAlign: "left", color: colors.text.primary, fontWeight: "bold"}}>{puttBreak}</FontText>
                </View>
                <View style={{
                    flexDirection: "column",
                    borderBottomWidth: 1,
                    borderColor: colors.border.default,
                    paddingLeft: 8,
                    flex: 1,
                    justifyContent: "center"
                }}>
                    <FontText style={{fontSize: 14, textAlign: "left", color: colors.text.secondary}}>Slope</FontText>
                    <FontText style={{fontSize: 20, textAlign: "left", color: colors.text.primary, fontWeight: "bold"}}>{slope}</FontText>
                </View>
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