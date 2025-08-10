import {Image, View} from "react-native";
import React from "react";
import useColors from "../../../hooks/useColors";

export function Header({bottomBorder = false}) {
    const colors = useColors();
    return (
        <View style={{
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "row",
            width: "100%",
            paddingTop: 2,
            paddingBottom: 10,
            borderBottomColor: colors.border.default,
            borderBottomWidth: bottomBorder ? 1 : 0,
            marginBottom: bottomBorder ? 12 : 0
        }}>
            <Image source={require('@/assets/branding/FlatstickWithMallet.png')} style={{aspectRatio: 2458/614, width: 180}}/>
        </View>
    )
}