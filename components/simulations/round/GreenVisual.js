import {Pressable, View} from "react-native";
import {Image} from "expo-image";
import React from "react";
import useColors from "../../../hooks/useColors";
import {useAppContext} from "../../../contexts/AppContext";
import FontText from "../../general/FontText";
import Svg, {Path} from "react-native-svg";

export function GreenVisual({distance, puttBreak, slope, imageSource, reRoll}) {
    const colors = useColors();
    const {userData} = useAppContext();

    return (
        <View style={{
            backgroundColor: colors.background.secondary,
            flexDirection: "column",
            borderRadius: 16,
            elevation: 0,
            overflow: "hidden"
        }}>
            <View style={{width: "100%", flexDirection: "row", justifyContent: "center", alignContent: "center"}}>
                <Image source={imageSource} style={{
                    width: "90%",
                    height: "auto",
                    aspectRatio: 2
                }}></Image>
                <Pressable onPress={reRoll} style={({pressed}) => [{position: "absolute", right: 8, bottom: 8, backgroundColor: !pressed ? colors.background.primary : colors.border.default, padding: 5, borderRadius: 6, borderWidth: 1, borderColor: colors.border.default}]}>
                    <Svg width={24} height={24} fill="transparent" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeWidth={2}
                         stroke="black">
                        <Path strokeLinecap="round" strokeLinejoin="round"
                              d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"/>
                    </Svg>
                </Pressable>
            </View>
            <View
                style={{width: "100%", flexDirection: "column", borderTopWidth: 1, borderColor: colors.border.default}}>
                <View style={{flexDirection: "row"}}>
                    <View style={{
                        flexDirection: "column",
                        flex: 1,
                        borderRightWidth: 1,
                        borderColor: colors.border.default,
                        paddingBottom: 12,
                        paddingTop: 6,
                        paddingLeft: 12
                    }}>
                        <FontText style={{fontSize: 14, textAlign: "left", color: colors.text.secondary}}>Break</FontText>
                        <FontText style={{
                            fontSize: 20,
                            textAlign: "left",
                            color: colors.text.primary,
                            fontWeight: "bold"
                        }}>{puttBreak}</FontText>
                    </View>
                    <View style={{
                        flexDirection: "column",
                        flex: 0.75,
                        borderRightWidth: 1,
                        borderColor: colors.border.default,
                        paddingBottom: 12,
                        paddingTop: 6,
                        paddingLeft: 12
                    }}>
                        <FontText style={{fontSize: 14, textAlign: "left", color: colors.text.secondary}}>Slope</FontText>
                        <FontText style={{
                            fontSize: 20,
                            textAlign: "left",
                            color: colors.text.primary,
                            fontWeight: "bold"
                        }}>{slope}</FontText>
                    </View>
                    <View
                        style={{flexDirection: "column", flex: 0.5, paddingBottom: 12, paddingTop: 6, paddingLeft: 12}}>
                        <FontText style={{fontSize: 14, textAlign: "left", color: colors.text.secondary}}>Distance</FontText>
                        <FontText style={{
                            fontSize: 20,
                            textAlign: "left",
                            color: colors.text.primary,
                            fontWeight: "bold"
                        }}>{distance}{userData.preferences.units === 0 ? "ft" : "m"}</FontText>
                    </View>
                </View>
            </View>
        </View>
    )
}