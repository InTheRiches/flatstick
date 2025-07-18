import React from 'react';
import { View } from 'react-native';
import FontText from '../../general/FontText';
import useColors from '../../../hooks/useColors';

export default function StrokesGainedCard({ strokesGained, bestStrokesGained }) {
    const colors = useColors();

    return (
        <View style={{ alignItems: "center", flex: 0.55 }}>
            <FontText style={{
                color: colors.text.secondary,
                fontSize: 13,
                fontWeight: 700,
                opacity: 0.8,
                textAlign: "center"
            }}>
                STROKES GAINED
            </FontText>
            <FontText style={{
                color: colors.text.primary,
                fontSize: strokesGained < -10 ? 40 : 48,
                fontWeight: 600,
                textAlign: "center"
            }}>
                {strokesGained > 0 ? "+" : ""}{strokesGained}
            </FontText>
            <FontText style={{
                color: colors.text.secondary,
                opacity: 0.8,
                fontSize: 13,
                fontWeight: 700,
                textAlign: "center"
            }}>
                (BEST: {bestStrokesGained && bestStrokesGained > 0 ? "+" : ""}{bestStrokesGained ?? "~"})
            </FontText>
        </View>
    );
}