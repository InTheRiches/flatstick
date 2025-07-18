import React from 'react';
import { View, Pressable } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import FontText from '../../general/FontText';
import useColors from '../../../hooks/useColors';
import { useNavigation } from 'expo-router';

export default function HeaderSection({ session, isRecap, onInfoPress }) {
    const colors = useColors();
    const navigation = useNavigation();

    const formatTimestamp = () => {
        const date = new Date(session.startedAtTimestamp);
        const options = { month: '2-digit', day: '2-digit', hour: 'numeric', minute: '2-digit', hour12: true };
        return date.toLocaleString('en-US', options);
    };

    return (
        <View style={{ marginRight: 12, justifyContent: "space-between", flexDirection: "row", alignItems: "center" }}>
            <View>
                <Pressable onPress={() => {
                    if (isRecap) {
                        navigation.navigate("(tabs)");
                    } else {
                        navigation.goBack();
                    }
                }} style={{ position: "absolute", left: 0, top: 0, marginTop: -10, marginLeft: -10, padding: 10 }}>
                    <Svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3.5}
                         stroke={colors.text.primary} width={24} height={24}>
                        <Path strokeLinecap="round" strokeLinejoin="round"
                              d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"/>
                    </Svg>
                </Pressable>
                <FontText style={{ marginLeft: 32, fontSize: 20, textAlign: "left", color: colors.text.primary, fontWeight: 800, flex: 1 }}>
                    {session.type === "round-simulation" ? "18 HOLE SIMULATION" : session.holes + " HOLE ROUND"}
                </FontText>
                <FontText style={{ marginLeft: 32, color: colors.text.secondary, fontSize: 16, fontWeight: 600, textAlign: "left" }}>
                    {formatTimestamp()}
                </FontText>
            </View>
            <Pressable onPress={onInfoPress} style={({ pressed }) => [{
                width: 40,
                height: 40,
                borderRadius: 20,
                justifyContent: "center",
                alignItems: "center",
                opacity: pressed ? 0.7 : 1
            }]}>
                <Svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                     strokeWidth={1.5} stroke="currentColor" width={40} height={40}>
                    <Path strokeLinecap="round" strokeLinejoin="round"
                          d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"/>
                </Svg>
            </Pressable>
        </View>
    );
}