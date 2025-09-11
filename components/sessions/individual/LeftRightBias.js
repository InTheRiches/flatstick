import {Image, View} from "react-native";
import React, {useState} from "react";
import useColors from "../../../hooks/useColors";
import {useAppContext} from "../../../contexts/AppContext";
import {convertUnits} from "../../../utils/Conversions";
import FontText from "../../general/FontText";
import {roundTo} from "../../../utils/roundTo";

export const LeftRightBias = ({bias, units}) => {
    const colors = useColors();
    const {userData} = useAppContext();
    const [horizontalBiasWidth, setHorizontalBiasWidth] = useState(1);

    const onHorizLayout = (event) => {
        setHorizontalBiasWidth(event.nativeEvent.layout.width-25);
    };

    const leftRightBias = roundTo(convertUnits(bias, units, userData.preferences.units), 1);

    let left = leftRightBias / (userData.preferences.units === 0 ? 4 : 1) * (horizontalBiasWidth/2 + (leftRightBias > 0 ? 25 : 0));
    left = left + (horizontalBiasWidth/2);
    if (left < 10) left = 10;
    if (left > (horizontalBiasWidth-10)) left = horizontalBiasWidth-5;

    if (Math.abs(leftRightBias) < 0.1) {
        left = (horizontalBiasWidth/2) + 2.5;
    }
    return (
        <View style={{backgroundColor: colors.background.secondary, paddingVertical: 8, borderRadius: 12}}>
            <View style={{
                paddingHorizontal: 12,
                borderBottomWidth: 1,
                borderColor: colors.border.default,
                paddingBottom: 4,
                marginBottom: 6,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center"
            }}>
                <FontText style={{fontSize: 16, textAlign: "left", color: colors.text.primary, fontWeight: 800, flex: 1}}>LEFT-RIGHT BIAS</FontText>
            </View>
            <View onLayout={onHorizLayout} style={{paddingHorizontal: 8, alignItems: "center", width: "100%", flexDirection: "row"}}>
                <View style={{width: 2.5, height: 32, backgroundColor: colors.button.danger.background}}></View>
                <View style={{flex: 1, height: 3, backgroundColor: colors.button.danger.background}}></View>
                <View style={{flex: 1, height: 3, backgroundColor: "#4BB543"}}></View>
                <Image style={{width: 24, height: 24}} source={require("../../../assets/images/golf-hole.png")}></Image>
                <View style={{flex: 1, height: 3, backgroundColor: "#4BB543"}}></View>
                <View style={{flex: 1, height: 3, backgroundColor: colors.button.danger.background}}></View>
                <View style={{width: 2.5, height: 32, backgroundColor: colors.button.danger.background}}></View>
                <View style={{position: "absolute", left: left, width: 20, height: 20, borderRadius: 50, borderWidth: 1, borderColor: colors.text.primary, backgroundColor: colors.checkmark.background}}></View>
            </View>
            <View style={{paddingHorizontal: 8, width: "100%", justifyContent: "space-between", flexDirection: "row"}}>
                <FontText style={{color: colors.text.secondary, fontSize: 12, fontWeight: 500, opacity: left > 40 ? 1 : 0}}>{userData.preferences.units === 0 ? "-4FT" : "-1m"}</FontText>
                <FontText style={{color: colors.text.secondary, fontSize: 12, fontWeight: 500, paddingLeft: 4, opacity: left < ((horizontalBiasWidth/2) - 40) || left > ((horizontalBiasWidth/2) + 40) ? 1 : 0}}>{userData.preferences.units === 0 ? "0FT" : "0m"}</FontText>
                <FontText style={{color: colors.text.secondary, fontSize: 12, fontWeight: 500, opacity: left < (horizontalBiasWidth-40) ? 1 : 0}}>{userData.preferences.units === 0 ? "+4FT" : "+1m"}</FontText>
                <FontText style={{position: "absolute", fontSize: 12, fontWeight: 500, left: left >= horizontalBiasWidth-20 ? left - 20 : leftRightBias === 0 ? left : left - 10, color: colors.text.primary}}>{leftRightBias > 0 ? "+" : ""}{leftRightBias}{userData.preferences.units === 0 ? "FT" : "m"}</FontText>
            </View>
            <View style={{paddingHorizontal: 8, width: "100%", justifyContent: "space-between", flexDirection: "row"}}>
                <FontText style={{color: colors.text.secondary, fontSize: 12, fontWeight: 700}}>LEFT</FontText>
                <FontText style={{color: colors.text.secondary, fontSize: 12, fontWeight: 700}}>RIGHT</FontText>
            </View>
        </View>
    )
}