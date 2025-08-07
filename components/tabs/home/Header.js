import {Image, View} from "react-native";
import React from "react";

export function Header() {
    return (
        <View style={{
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "row",
            width: "100%",
            paddingTop: 2,
            paddingBottom: 10,
        }}>
            <Image source={require('@/assets/branding/FlatstickWithMallet.png')} style={{aspectRatio: 2458/614, width: 180}}/>
        </View>
    )
}