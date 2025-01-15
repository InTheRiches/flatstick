import {Image, Text, View} from "react-native";
import React, {useState} from "react";
import useColors from "../../../hooks/useColors";
import {useAppContext} from "../../../contexts/AppCtx";
import {convertUnits} from "../../../utils/Conversions";

export const LeftRightBias = ({session}) => {
    const colors = useColors();
    const {userData} = useAppContext();
    const [horizontalBiasWidth, setHorizontalBiasWidth] = useState(1);

    const onHorizLayout = (event) => {
        setHorizontalBiasWidth(event.nativeEvent.layout.width-25);
    };

    const leftRightBias = convertUnits(session.leftRightBias, session.units, userData.preferences.units);

    let left = leftRightBias / (userData.preferences.units === 0 ? 2 : 1) * (horizontalBiasWidth/2 + (leftRightBias > 0 ? 25 : 0));
    left = left + (horizontalBiasWidth/2);

    if (Math.abs(leftRightBias) < 0.1) {
        left = (horizontalBiasWidth/2) + 2.5;
    }
    return (
        <>
            <Text style={{fontSize: 18, fontWeight: 600, color: colors.text.primary, marginTop: 20, marginBottom: 8}}>Left to Right Bias</Text>
            <View onLayout={onHorizLayout} style={{alignItems: "center", width: "100%", flexDirection: "row"}}>
                <View style={{width: 2.5, height: 32, backgroundColor: colors.button.danger.background}}></View>
                <View style={{flex: 1, height: 3, backgroundColor: colors.button.danger.background}}></View>
                <View style={{flex: 1, height: 3, backgroundColor: "#4BB543"}}></View>
                <Image style={{width: 24, height: 24}} source={require("../../../assets/images/golf-hole.png")}></Image>
                <View style={{flex: 1, height: 3, backgroundColor: "#4BB543"}}></View>
                <View style={{flex: 1, height: 3, backgroundColor: colors.button.danger.background}}></View>
                <View style={{width: 2.5, height: 32, backgroundColor: colors.button.danger.background}}></View>
                <View style={{position: "absolute", left: left, width: 20, height: 20, borderRadius: 50, borderWidth: 1, borderColor: colors.text.primary, backgroundColor: colors.checkmark.background}}></View>
            </View>
            <View style={{width: "100%", justifyContent: "space-between", flexDirection: "row"}}>
                <Text style={{color: colors.text.secondary, opacity: left > 40 ? 1 : 0}}>{userData.preferences.units === 0 ? "-2ft" : "-1m"}</Text>
                <Text style={{color: colors.text.secondary, opacity: left < ((horizontalBiasWidth/2) - 40) || left > ((horizontalBiasWidth/2) + 40) ? 1 : 0}}>{userData.preferences.units === 0 ? "0ft" : "0m"}</Text>
                <Text style={{color: colors.text.secondary, opacity: left < (horizontalBiasWidth-40) ? 1 : 0}}>{userData.preferences.units === 0 ? "+2ft" : "+1m"}</Text>
                <Text style={{position: "absolute", left: left - 5, color: colors.text.primary}}>{leftRightBias > 0 ? "+" : ""}{leftRightBias}{userData.preferences.units === 0 ? "ft" : "m"}</Text>
            </View>
            <View style={{width: "100%", justifyContent: "space-between", flexDirection: "row"}}>
                <Text style={{color: colors.text.secondary, opacity: left > 40 ? 1 : 0}}>Left</Text>
                <Text style={{color: colors.text.secondary, opacity: left < (horizontalBiasWidth-40) ? 1 : 0}}>Right</Text>
            </View>
        </>
    )
}