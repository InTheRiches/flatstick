import React from 'react';
import { View } from 'react-native';
import { PrimaryButton } from '../../components/general/buttons/PrimaryButton';
import FontText from '../../components/general/FontText';
import { Svg, Path } from 'react-native-svg';
import useColors from '../../hooks/useColors';

export default function StrokesGainedCard({ value }) {
    const colors = useColors();

    return (
        <PrimaryButton style={{ flex: 0.5, flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10 }}>
            <View>
                <FontText style={{ fontSize: 20, fontWeight: 700, color: colors.button.primary.text }}>
                    {value > 0 ? '+' : ''}{value}
                </FontText>
                <FontText style={{ fontSize: 14, fontWeight: 700, color: colors.text.tertiary }}>SG</FontText>
            </View>
            <Svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} width={24} height={24} stroke={colors.button.primary.text}>
                <Path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5"/>
            </Svg>
        </PrimaryButton>
    );
}
