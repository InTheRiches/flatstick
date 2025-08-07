import React from "react";
import {View} from "react-native";
import useColors from "../../../../hooks/useColors";
import {LeftRightBias} from "../LeftRightBias";
import {ShortPastBias} from "../ShortPastBias";
import {roundTo} from "../../../../utils/roundTo";
import FontText from "../../../general/FontText";

export default function BiasSection({ session }) {
    const colors = useColors();

    return (
        <>
            <View style={{
                backgroundColor: colors.background.secondary,
                borderRadius: 12,
                flex: 1,
                flexDirection: "row",
                marginTop: 20
            }}>
                <BiasStat label="PERCENT HIGH-SIDE" value={session.percentHigh !== undefined ? roundTo(session.percentHigh * 100, 0) + "%" : "N/A"} />
                <BiasStat label="PERCENT LONG" value={session.percentShort !== undefined ? roundTo((1 - session.percentShort) * 100, 0) + "%" : "N/A"} right />
            </View>
            <View style={{ marginTop: 20 }}>
                <LeftRightBias bias={session.leftRightBias} units={session.units} />
                <ShortPastBias bias={session.shortPastBias} units={session.units} />
            </View>
        </>
    );

    function BiasStat({ label, value, right }) {
        return (
            <View style={{
                flexDirection: "column",
                flex: 1,
                borderRightWidth: right ? 0 : 1,
                borderColor: colors.border.default,
                paddingBottom: 6,
                paddingLeft: 12,
                paddingTop: 8
            }}>
                <FontText style={{ fontSize: 12, opacity: 0.8, fontWeight: 700, color: colors.text.secondary }}>{label}</FontText>
                <FontText style={{ fontSize: 20, color: colors.text.primary, fontWeight: "bold" }}>{value}</FontText>
            </View>
        );
    }
}
