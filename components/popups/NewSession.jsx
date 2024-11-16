import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import {Pressable, Text, View} from 'react-native';
import { HorizRadioButton } from '@/components/popups/HorizRadioButton';
import React, { useState } from 'react';
import { ThemedButton } from "@/components/ThemedButton";
import { SvgClose } from '@/assets/svg/SvgComponents';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { useRouter } from 'expo-router';

export function NewSession({setNewSession}) {
    const colorScheme = useColorScheme();

    const [holes, setHoles] = useState("9 Holes");
    const [difficulty, setDifficulty] = useState("Easy");
    const [mode, setMode] = useState("Random");

    const router = useRouter();

    return (
        <ThemedView style={{ borderColor: colorScheme == 'light' ? "white" : Colors['dark'].border, borderWidth: 1, width: "auto", maxWidth: "80%", maxHeight: "70%", borderRadius: 16, paddingTop: 5 }}>
            <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignContent: 'center', width: "100%", paddingHorizontal: 24, paddingTop: 8, paddingBottom: 8, borderBottomWidth: 1, borderColor: Colors[colorScheme ?? 'light'].border }}>
                <ThemedText type="header">New Session</ThemedText>
                <TouchableWithoutFeedback onPress={() => setNewSession(false)}>
                    <View style={{ justifyContent: 'center' }}>
                        <SvgClose></SvgClose>
                    </View>
                </TouchableWithoutFeedback>
            </View>
            <View style={{ flexDirection: "column", alignContent: "center" }}>
                <View style={{ paddingHorizontal: 24, marginTop: 12 }}>
                    <ThemedText type="subtitle">Holes</ThemedText>
                    <HorizRadioButton options={["9 Holes", "18 Holes"]} selectedOption={holes} setSelectedOption={setHoles}></HorizRadioButton>
                </View>
                <View style={{ paddingHorizontal: 24, marginTop: 10 }}>
                    <ThemedText type="subtitle">Difficulty</ThemedText>
                    <HorizRadioButton options={["Easy", "Medium", "Hard"]} selectedOption={difficulty} setSelectedOption={setDifficulty}></HorizRadioButton>
                </View>
                <View style={{ paddingHorizontal: 24, marginTop: 10 }}>
                    <ThemedText type="subtitle">Mode</ThemedText>
                    <HorizRadioButton options={["Random", "Mistakes"]} selectedOption={mode} setSelectedOption={setMode}></HorizRadioButton>
                </View>
                <View style={{ width: "100%", alignContent: "center", justifyContent: "center", marginTop: 20, marginBottom: 24 }}>
                    <Pressable onPress={() => {
                                   if (holes === undefined || difficulty === undefined || mode === undefined) return;
                                   router.push({ pathname: `/simulation`, params: { localHoles: holes === "9 Holes" ? 9 : 18, difficulty: difficulty, mode: mode }});
                                   setNewSession(false);
                               }} style={({pressed}) => [{backgroundColor: holes === undefined || difficulty === undefined || mode === undefined ? Colors[colorScheme ?? 'light'].buttonSecondaryBackground : pressed ? Colors[colorScheme ?? 'light'].buttonPrimaryDepressed : Colors[colorScheme ?? 'light'].buttonPrimaryBackground}, {
                                   paddingVertical: 12,
                                   paddingHorizontal: 24,
                                   borderRadius: 8,
                                   flexDirection: "row",
                                   justifyContent: "center",
                                   alignItems: "center",
                                   overflow: "hidden",
                                   alignSelf: "center",
                                   borderColor: holes === undefined || difficulty === undefined || mode === undefined ? Colors[colorScheme ?? 'light'].buttonSecondaryBorder : "transparent",
                                   borderWidth: 1
                               }]}>
                        <Text style={{ textAlign: "center", color: holes === undefined || difficulty === undefined || mode === undefined ? Colors[colorScheme ?? 'light'].textSecondary : "white", fontSize: 14, fontWeight: "bold" }}>Start</Text>
                    </Pressable>
                </View>
            </View>
        </ThemedView>
    )
}