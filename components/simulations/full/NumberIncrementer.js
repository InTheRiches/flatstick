import FontText from "../../general/FontText";
import {Pressable, View} from "react-native";
import Svg, {Line, Path} from "react-native-svg";
import React from "react";
import useColors from "../../../hooks/useColors";

export default function NumberIncrementer({locked = false, min=0, title, setNumber, number}) {
    const colors = useColors();

    return (
        <View style={{alignItems: "center", flex: 1}}>
            <FontText style={{fontSize: 18, fontWeight: 500, marginTop: 12, marginBottom: 8, textAlign: "center"}}>
                {title}
            </FontText>
            <View style={{
                borderWidth: 1,
                borderColor: colors.border.default,
                padding: 10,
                borderRadius: 64,
                backgroundColor: colors.background.secondary,
                flexDirection: "column",
                alignItems: "center",
                gap: 16
            }}>
                <Pressable
                    onPress={() => !locked && number !== 9 && setNumber(number + 1)}
                    style={({pressed}) => [{
                        width: 48,
                        height: 48,
                        borderRadius: 32,
                        borderWidth: number > 8 || locked ? 1 : 0,
                        borderColor: colors.border.default,
                        backgroundColor: number > 8 || locked ? colors.background.secondary :
                            pressed
                                ? colors.border.default
                                : colors.background.primary,
                        alignItems: "center",
                        justifyContent: "center"
                    }]}>
                    <Svg width={32} height={32} viewBox="0 0 24 24">
                        <Line x1="12" y1="5" x2="12" y2="19" stroke={colors.button.primary.text} strokeWidth="2" />
                        <Line x1="5" y1="12" x2="19" y2="12" stroke={colors.button.primary.text} strokeWidth="2" />
                    </Svg>
                </Pressable>

                {/* Number + Lock Overlay */}
                <View style={{position: "relative", alignItems: "center", justifyContent: "center", minHeight: 40}}>
                    <FontText style={{
                        fontSize: 32,
                        fontWeight: 600,
                        textAlign: "center",
                        opacity: locked ? 0.4 : 1
                    }}>
                        {number}
                    </FontText>
                    {locked && (
                        <Svg xmlns="http://www.w3.org/2000/svg" strokeWidth={1.5} stroke={"black"} viewBox="0 0 24 24" fill={colors.text.primary} width={24} height={24} style={{
                            position: "absolute",
                            top: -4,
                            right: -12
                        }}>
                            <Path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z" clipRule="evenodd" />
                        </Svg>
                        )}
                </View>

                <Pressable
                    onPress={() => !locked && number !== min && setNumber(number - 1)}
                    style={({pressed}) => [{
                        width: 40,
                        height: 40,
                        borderRadius: 32,
                        borderWidth: number <= min || locked ? 1 : 0,
                        borderColor: colors.border.default,
                        backgroundColor: number <= min || locked ? colors.background.secondary :
                            pressed
                                ? colors.border.default
                                : colors.background.primary,
                        alignItems: "center",
                        justifyContent: "center"
                    }]}>
                    <Svg width={32} height={32} viewBox="0 0 24 24">
                        <Line x1="5" y1="12" x2="19" y2="12" stroke={colors.button.primary.text} strokeWidth="3" />
                    </Svg>
                </Pressable>
            </View>
        </View>
    )
}