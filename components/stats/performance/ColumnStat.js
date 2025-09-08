import {View} from "react-native";
import FontText from "../../general/FontText";
import {roundTo} from "../../../utils/roundTo";
import React from "react";
import useColors from "../../../hooks/useColors";

export default function ColumnStat({ label, value, units = "", percent, right }) {
    const colors = useColors();

    return (
        <View style={{
            flexDirection: "column",
            flex: 1,
            borderRightWidth: right ? 0 : 1,
            borderColor: colors.border.default,
            padding: 6,
            paddingLeft: 12
        }}>
            <FontText style={{ fontSize: 12, color: colors.text.tertiary, opacity: 0.8, fontWeight: 700 }}>{label}</FontText>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <FontText style={{ fontSize: 20, color: colors.text.primary, fontWeight: "bold" }}>{value}{units}</FontText>
                {percent !== undefined && (
                    <FontText style={{ color: colors.text.secondary, fontWeight: 400, fontSize: 14 }}>
                        ({roundTo(percent, 0)}%)
                    </FontText>
                )}
            </View>
        </View>
    );
}