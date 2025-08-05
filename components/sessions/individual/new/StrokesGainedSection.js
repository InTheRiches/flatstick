import React from "react";
import {View} from "react-native";
import useColors from "../../../../hooks/useColors";
import FontText from "../../../general/FontText";

export default function StrokesGainedSection({ session, bestSession }) {
    const colors = useColors();

    return (
        <View style={{ flexDirection: "row", gap: 24, marginTop: 20, flex: 0.55 }}>
            <View style={{ alignItems: "center" }}>
                <FontText style={{ color: colors.text.secondary, fontSize: 13, fontWeight: 700, opacity: 0.8 }}>STROKES GAINED</FontText>
                <FontText style={{ color: colors.text.primary, fontSize: session.strokesGained < -10 ? 40 : 48, fontWeight: 600 }}>
                    {session.strokesGained > 0 ? "+" : ""}{session.strokesGained}
                </FontText>
                <FontText style={{ color: colors.text.secondary, opacity: 0.8, fontSize: 13, fontWeight: 700 }}>
                    (BEST: {bestSession.totalPutts && bestSession.strokesGained > 0 ? "+" : ""}{bestSession.strokesGained})
                </FontText>
            </View>
        </View>
    );
}