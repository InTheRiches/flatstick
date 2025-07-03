import FontText from "../../general/FontText";
import {Pressable, View} from "react-native";
import Svg, {Line} from "react-native-svg";
import React from "react";
import useColors from "../../../hooks/useColors";

export default function NumberIncrementer({title, setNumber, number}) {
    const colors = useColors();

    return (
        <View style={{alignItems: "center", flex: 1}}>
            <FontText style={{fontSize: 18, fontWeight: 500, marginTop: 12, marginBottom: 8, textAlign: "center"}}>{title}</FontText>
            <View style={{borderWidth: 1, borderColor: colors.border.default, padding: 10, borderRadius: 64, backgroundColor: colors.background.secondary, flexDirection: "col", gap: 16}}>
                <Pressable onPress={() => setNumber(number >= 9 ? 0 : number+1)} style={({pressed}) => [{width: 48, height: 48, borderRadius: 32, backgroundColor: pressed ? colors.border.default : colors.background.primary, alignItems: "center", justifyContent: "center"}]}>
                    <Svg width={32} height={32} viewBox="0 0 24 24">
                        <Line x1="12" y1="5" x2="12" y2="19" stroke={colors.button.primary.text} strokeWidth="2" />
                        <Line x1="5" y1="12" x2="19" y2="12" stroke={colors.button.primary.text} strokeWidth="2" />
                    </Svg>
                </Pressable>
                <FontText style={{fontSize: 32, fontWeight: 600, textAlign: "center"}}>{number}</FontText>
                <Pressable onPress={() => setNumber(number <= 0 ? 9 : number-1)} style={({pressed}) => [{width: 48, height: 48, borderRadius: 32, backgroundColor: pressed ? colors.border.default : colors.background.primary, alignItems: "center", justifyContent: "center"}]}>
                    <Svg width={32} height={32} viewBox="0 0 24 24">
                        <Line x1="5" y1="12" x2="19" y2="12" stroke={colors.button.primary.text} strokeWidth="3" />
                    </Svg>
                </Pressable>
            </View>
        </View>
    )
}