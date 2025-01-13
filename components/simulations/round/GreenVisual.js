import {Image, Platform, Text, View} from "react-native";
import React from "react";
import useColors from "../../../hooks/useColors";
import {useAppContext} from "../../../contexts/AppCtx";

export function GreenVisual({distance, puttBreak, slope, imageSource}) {
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
                    width: Platform.OS === "ios" ? "90%" : "100%",
                    height: "auto",
                    aspectRatio: 2
                }}></Image>
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
                        <Text style={{fontSize: 14, textAlign: "left", color: colors.text.secondary}}>Break</Text>
                        <Text style={{
                            fontSize: 20,
                            textAlign: "left",
                            color: colors.text.primary,
                            fontWeight: "bold"
                        }}>{puttBreak}</Text>
                    </View>
                    <View style={{
                        flexDirection: "column",
                        flex: 0.7,
                        borderRightWidth: 1,
                        borderColor: colors.border.default,
                        paddingBottom: 12,
                        paddingTop: 6,
                        paddingLeft: 12
                    }}>
                        <Text style={{fontSize: 14, textAlign: "left", color: colors.text.secondary}}>Slope</Text>
                        <Text style={{
                            fontSize: 20,
                            textAlign: "left",
                            color: colors.text.primary,
                            fontWeight: "bold"
                        }}>{slope}</Text>
                    </View>
                    <View
                        style={{flexDirection: "column", flex: 0.7, paddingBottom: 12, paddingTop: 6, paddingLeft: 12}}>
                        <Text style={{fontSize: 14, textAlign: "left", color: colors.text.secondary}}>Distance</Text>
                        <Text style={{
                            fontSize: 20,
                            textAlign: "left",
                            color: colors.text.primary,
                            fontWeight: "bold"
                        }}>{distance}{userData.preferences.units === 0 ? "ft" : "m"}</Text>
                    </View>
                </View>
            </View>
        </View>
    )
}