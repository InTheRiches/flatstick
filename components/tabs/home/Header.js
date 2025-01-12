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
            <Image source={require('@/assets/branding/Flatstick.png')} style={{height: 30, width: 130}}/>
        </View>
    )
}