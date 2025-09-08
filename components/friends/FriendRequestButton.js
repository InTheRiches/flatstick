import FontText from "../general/FontText";
import {View} from "react-native";
import Svg, {Path} from "react-native-svg";
import {PrimaryButton} from "../general/buttons/PrimaryButton";
import React from "react";
import useColors from "../../hooks/useColors";
import {Exclamation} from "../../assets/svg/SvgComponents";

export const FriendRequestButton = ({router, alert = true}) => {
    const colors = useColors();

    return (
        <PrimaryButton style={{
            paddingVertical: 8,
            paddingHorizontal: 12,
            borderRadius: 14,
            alignItems: "center",
            justifyContent: "space-between",
            flexDirection: "row"
        }} onPress={() => router.push("/friends/requests")}>
            {alert && (
                <View style={{position: "absolute", zIndex: 100, right: -12, top: -12}}>
                    <Exclamation width={32} height={32}></Exclamation>
                </View>
            )}
            <FontText key={"1"} style={{color: colors.button.primary.text, fontWeight: 700, fontSize: 16}}>FRIEND
                REQUESTS</FontText>
            <View style={{borderRadius: 30, padding: 6, backgroundColor: colors.button.primary.text}}>
                <Svg width={20} height={20} xmlns="http://www.w3.org/2000/svg" fill="none"
                     viewBox="0 0 24 24" strokeWidth={2}
                     stroke={colors.button.primary.background} className="size-6">
                    <Path strokeLinecap="round" strokeLinejoin="round"
                          d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25"/>
                </Svg>
            </View>
        </PrimaryButton>
    )
}