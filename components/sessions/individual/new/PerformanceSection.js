import React from "react";
import {View} from "react-native";
import useColors from "../../../../hooks/useColors";
import FontText from "../../../general/FontText";
import {convertUnits} from "../../../../utils/Conversions";
import {roundTo} from "../../../../utils/roundTo";
import ColumnStat from "../../../stats/performance/ColumnStat";

export default function PerformanceSection({ session, numOfHoles, preferences }) {
    const colors = useColors();
    const units = preferences.units;

    return (
        <View style={{ backgroundColor: colors.background.secondary, borderRadius: 12, paddingTop: 8, flex: 1, marginTop: 12 }}>
            <View style={{
                paddingHorizontal: 12, borderBottomWidth: 1, borderColor: colors.border.default,
                paddingBottom: 6, flexDirection: "row", justifyContent: "space-between", alignItems: "center"
            }}>
                <FontText style={{ fontSize: 14, color: colors.text.primary, fontWeight: 800, flex: 1 }}>PERFORMANCE</FontText>
            </View>

            <View style={{ flexDirection: "row" }}>
                <ColumnStat label="1 PUTTS" value={session.puttCounts[0]} percent={(session.puttCounts[0] / numOfHoles) * 100} />
                <ColumnStat label="3+ PUTTS" value={session.puttCounts[2]} percent={(session.puttCounts[2] / numOfHoles) * 100} right />
            </View>

            <View style={{ flexDirection: "row", borderTopWidth: 1, borderColor: colors.border.default }}>
                <ColumnStat label="TOTAL PUTTS" value={session.totalPutts} />
                <ColumnStat
                    label="AVG. MISS"
                    value={`${convertUnits(session.avgMiss, session.units, units)}${units === 0 ? "ft" : "m"}`}
                    right
                />
            </View>
        </View>
    );
}