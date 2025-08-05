import React, {useEffect} from 'react';
import {Pressable, View} from 'react-native';
import FontText from '../../components/general/FontText';
import useColors from '../../hooks/useColors';

export default function StrokesGainedCard({ value, strokesGainedRef, yearlyStats }) {
    const colors = useColors();

    // return (
    //     <PrimaryButton style={{ flex: 0.5, flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10 }}>
    //         <View>
    //             <FontText style={{ fontSize: 20, fontWeight: 700, color: colors.button.primary.text }}>
    //                 {value > 0 ? '+' : ''}{value}
    //             </FontText>
    //             <FontText style={{ fontSize: 14, fontWeight: 700, color: colors.text.tertiary }}>SG</FontText>
    //         </View>
    //         <Svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} width={24} height={24} stroke={colors.button.primary.text}>
    //             <Path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5"/>
    //         </Svg>
    //     </PrimaryButton>
    // );

    const [showOverTime, setShowOverTime] = React.useState(false);
    // loop through yearlyStats.months and determine how many months have non -999 strokesGained
    useEffect(() => {
        if (!yearlyStats.months) return;

        console.log("finally loaded")

        let count = 0;
        for (let i = 0; i < yearlyStats.months.length; i++) {
            if (yearlyStats.months[i].strokesGained !== -999) {
                count++;
            }
        }

        if (count > 1) {
            setShowOverTime(true);
        }
    }, [yearlyStats]);

    return showOverTime ? (
        <Pressable onPress={() => strokesGainedRef.current.present()} style={({pressed}) => ({backgroundColor: pressed ? colors.button.primary.depressed : colors.button.primary.background, borderWidth: 1, borderColor: colors.border.default, flex: 0.5, flexDirection: 'col', justifyContent: 'space-between', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10 })}>
            <FontText style={{ fontSize: 20, fontWeight: 700, color: colors.button.primary.text }}>
                {value > 0 ? '+' : ''}{value}
            </FontText>
            <FontText style={{ fontSize: 14, fontWeight: 700, color: colors.text.tertiary }}>SG</FontText>
        </Pressable>
    ) : (
        <View style={{backgroundColor: colors.button.primary.background, flex: 0.5, flexDirection: 'col', justifyContent: 'space-between', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10 }}>
            <FontText style={{ fontSize: 20, fontWeight: 700, color: colors.button.primary.text }}>
                {value > 0 ? '+' : ''}{value}
            </FontText>
            <FontText style={{ fontSize: 14, fontWeight: 700, color: colors.text.tertiary }}>SG</FontText>
        </View>
    );
}
