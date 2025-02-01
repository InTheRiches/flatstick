import {Image, View} from "react-native";
import React, {useState} from "react";
import useColors from "../../../hooks/useColors";
import {convertUnits} from "../../../utils/Conversions";
import {useAppContext} from "../../../contexts/AppCtx";
import FontText from "../../general/FontText";
import {roundTo} from "../../../utils/roundTo";

export const ShortPastBias = ({bias, units}) => {
    const colors = useColors();
    const {userData} = useAppContext();
    const [verticalBiasWidth, setVerticalBiasWidth] = useState(1);

    const onVertiLayout = (event) => {
        setVerticalBiasWidth(event.nativeEvent.layout.width-25);
    };

    const shortPastBias = roundTo(Math.min(1.9, convertUnits(bias, units, userData.preferences.units)), 1);

    let left = shortPastBias / (userData.preferences.units === 0 ? 2 : 1) * (verticalBiasWidth/2 + (shortPastBias > 0 ? 25 : 0));
    left = left + (verticalBiasWidth/2);

    if (Math.abs(shortPastBias) < 0.1) {
        left = (verticalBiasWidth/2) + 2.5;
    }

    return (
        <View style={{backgroundColor: colors.background.secondary, marginTop: 20, paddingHorizontal: 8, paddingVertical: 8, borderRadius: 12}}>
            <FontText style={{fontSize: 18, fontWeight: 600, color: colors.text.primary, marginBottom: 8}}>Short-Long Bias</FontText>
            <View onLayout={onVertiLayout} style={{alignItems: "center", width: "100%", flexDirection: "row"}}>
                <View style={{width: 2.5, height: 32, backgroundColor: colors.button.danger.background}}></View>
                <View style={{flex: 1, height: 3, backgroundColor: colors.button.danger.background}}></View>
                <Image style={{width: 24, height: 24}} source={require("../../../assets/images/golf-hole.png")}></Image>
                <View style={{flex: 0.5, height: 3, backgroundColor: "#4BB543"}}></View>
                <View style={{flex: 0.5, height: 3, backgroundColor: colors.button.danger.background}}></View>
                <View style={{width: 2.5, height: 32, backgroundColor: colors.button.danger.background}}></View>
                <View style={{position: "absolute", left: left, width: 20, height: 20, borderRadius: 50, borderWidth: 1, borderColor: colors.text.primary, backgroundColor: colors.checkmark.background}}></View>
            </View>
            <View style={{width: "100%", justifyContent: "space-between", flexDirection: "row"}}>
                <FontText style={{color: colors.text.secondary, opacity: left > 40 ? 1 : 0}}>{userData.preferences.units === 0 ? "-2ft" : "-1m"}</FontText>
                <FontText style={{color: colors.text.secondary, opacity: left < ((verticalBiasWidth/2) - 40) || left > ((verticalBiasWidth/2) + 40) ? 1 : 0}}>{userData.preferences.units === 0 ? "0ft" : "0m"}</FontText>
                <FontText style={{color: colors.text.secondary, opacity: left < (verticalBiasWidth-40) ? 1 : 0}}>{userData.preferences.units === 0 ? "+2ft" : "+1m"}</FontText>
                <FontText style={{position: "absolute", left: shortPastBias === 0 ? left : left - 5, color: colors.text.primary}}>{shortPastBias > 0 ? "+" : ""}{shortPastBias}{userData.preferences.units === 0 ? "ft" : "m"}</FontText>
            </View>
            <View style={{width: "100%", justifyContent: "space-between", flexDirection: "row"}}>
                <FontText style={{color: colors.text.secondary, opacity: left > 40 ? 1 : 0}}>Short</FontText>
                <FontText style={{color: colors.text.secondary, opacity: left < (verticalBiasWidth-40) ? 1 : 0}}>Past</FontText>
            </View>
        </View>
    )
}