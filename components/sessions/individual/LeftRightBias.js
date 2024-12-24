import {Text, View} from "react-native";
import React, {useState} from "react";
import useColors from "../../../hooks/useColors";

export const LeftRightBias = ({session}) => {
    const colors = useColors();
    const [horizontalBiasWidth, setHorizontalBiasWidth] = useState(1);

    const onHorizLayout = (event) => {
        setHorizontalBiasWidth(event.nativeEvent.layout.width-25);
    };

    let left = session.leftRightBias / 2 * (horizontalBiasWidth/2);
    left = left + (horizontalBiasWidth/2);

    if (Math.abs(session.leftRightBias) < 0.2) {
        left = (horizontalBiasWidth/2) + 2.5;
    }
    return (
        <>
            <Text style={{fontSize: 18, fontWeight: 600, color: colors.text.primary, marginTop: 20, marginBottom: 8}}>Left to Right Bias</Text>
            <View onLayout={onHorizLayout} style={{alignItems: "center", width: "100%", flexDirection: "row"}}>
                <View style={{width: 2, height: 32, backgroundColor: colors.text.primary}}></View>
                <View style={{flex: 1, height: 2, backgroundColor: colors.text.primary}}></View>
                <View style={{width: 24, height: 24, borderRadius: 50, borderWidth: 1, borderColor: colors.text.primary, backgroundColor: "white"}}></View>
                <View style={{flex: 1, height: 2, backgroundColor: colors.text.primary}}></View>
                <View style={{width: 2, height: 32, backgroundColor: colors.text.primary}}></View>
                <View style={{position: "absolute", left: left, width: 20, height: 20, borderRadius: 50, borderWidth: 1, borderColor: colors.text.primary, backgroundColor: colors.checkmark.background}}></View>
            </View>
            <View style={{width: "100%", justifyContent: "space-between", flexDirection: "row"}}>
                <Text style={{color: colors.text.secondary, opacity: left > 40 ? 1 : 0}}>-2ft</Text>
                <Text style={{color: colors.text.secondary, opacity: left < ((horizontalBiasWidth/2) - 30) || left > ((horizontalBiasWidth/2) + 30) ? 1 : 0}}>0ft</Text>
                <Text style={{color: colors.text.secondary, opacity: left < (horizontalBiasWidth-40) ? 1 : 0}}>+2ft</Text>
                <Text style={{position: "absolute", left: left-10, color: colors.text.primary}}>{session.leftRightBias > 0 ? "+" : ""}{session.leftRightBias}ft</Text>
            </View>
            <View style={{width: "100%", justifyContent: "space-between", flexDirection: "row"}}>
                <Text style={{color: colors.text.secondary, opacity: left > 40 ? 1 : 0}}>Left</Text>
                <Text style={{color: colors.text.secondary, opacity: left < (horizontalBiasWidth-40) ? 1 : 0}}>Right</Text>
            </View>
        </>
    )
}