import React from 'react';
import {View} from 'react-native';
import {PrimaryButton} from '../../components/general/buttons/PrimaryButton';
import FontText from '../../components/general/FontText';
import {Path, Svg} from 'react-native-svg';
import useColors from '../../hooks/useColors';

export default function StatsCard({ title, stats, onPress = () => {} }) {
    const colors = useColors();

    return (
        <PrimaryButton style={{ marginTop: 12, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 14, flexDirection: 'row' }} onPress={onPress}>
            <View style={{flexDirection: "column", flex: 1, alignItems: "center"}}>
                <FontText style={{ fontSize: 16, alignSelf: "flex-start", textAlign: "left", fontWeight: 800, color: colors.button.primary.text }}>{title}</FontText>
                {stats.length > 0  && (
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
                        {stats.map(({ label, value }, index) => (
                            <View key={index} style={{ flex: 1 }}>
                                <FontText style={{ fontSize: 13, fontWeight: 600, color: colors.text.tertiary }}>{label}</FontText>
                                <FontText style={{ fontSize: 20, fontWeight: 600 }}>{value}</FontText>
                            </View>
                        ))}
                    </View>
                )}
            </View>
            <View key={"2"} style={{borderRadius: 30, padding: 6, backgroundColor: colors.button.primary.text}}>
                <Svg width={20} height={20} xmlns="http://www.w3.org/2000/svg" fill="none"
                     viewBox="0 0 24 24" strokeWidth={1.5}
                     stroke={colors.button.primary.background} className="size-6">
                    <Path strokeLinecap="round" strokeLinejoin="round"
                          d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25"/>
                </Svg>
            </View>
        </PrimaryButton>
    );
}
