import React from "react";
import {View} from "react-native";
import useColors from "../../../../hooks/useColors";
import FontText from "../../../general/FontText";

export default function StrokesGainedSection({ session, bestSession = {}, showBest= false }) {
    const colors = useColors();

    return (
        <View style={{ flexDirection: "row", gap: 24, marginTop: 20, flex: 0.55 }}>
            <View style={{ alignItems: "center" }}>
                <FontText style={{ color: colors.text.secondary, fontSize: 14, fontWeight: 700, opacity: 0.8 }}>STROKES GAINED</FontText>
                <FontText style={{ color: colors.text.primary, fontSize: session.strokesGained < -10 ? 40 : 48, fontWeight: 600 }}>
                    {session.stats.strokesGained > 0 ? "+" : ""}{session.stats.strokesGained}
                </FontText>
            </View>
        </View>
    );
}
//
//                     <FontText style={{ color: colors.text.secondary, opacity: 0.8, fontSize: 13, fontWeight: 700 }}>
//                         (BEST: {bestSession.stats.totalPutts && bestSession.stats.strokesGained > 0 ? "+" : ""}{bestSession.stats.strokesGained})
//                     </FontText>
//