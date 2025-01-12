import useColors from "../../../hooks/useColors";
import {getAuth} from "firebase/auth";
import {Image, View} from "react-native";
import React from "react";

export function Header() {
    const colors = useColors();

    const auth = getAuth();

    return (
        <View style={{
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "row",
            width: "100%",
            paddingTop: 2,
            paddingBottom: 10,
        }}>
            <Image source={require('@/assets/branding/19thGreen.png')} style={{height: 30, width: 130}}/>
            {/*<PrimaryButton onPress={() => {*/}

            {/*}} style={{borderRadius: 30, aspectRatio: 1, height: 42}}>*/}
            {/*    <Svg width={28} height={28} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"*/}
            {/*         strokeWidth={1.5}*/}
            {/*         stroke={colors.button.primary.text}>*/}
            {/*        <Path strokeLinecap="round" strokeLinejoin="round"*/}
            {/*              d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"/>*/}
            {/*    </Svg>*/}
            {/*</PrimaryButton>*/}
        </View>
    )
}