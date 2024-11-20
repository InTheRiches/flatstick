import {ThemedText} from '@/components/ThemedText';
import {ThemedView} from '@/components/ThemedView';
import {Pressable, Text, View} from 'react-native';
import {HorizRadioButton} from '@/components/popups/HorizRadioButton';
import React, {useState} from 'react';
import {ThemedButton} from "@/components/ThemedButton";
import {SvgClose} from '@/assets/svg/SvgComponents';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';
import {useRouter} from 'expo-router';
import useColors from "@/hooks/useColors";

export function NewSession({setNewSession}) {
    const colors = useColors();

    const [holes, setHoles] = useState("9 Holes");
    const [difficulty, setDifficulty] = useState("Easy");
    const [mode, setMode] = useState("Random");

    const router = useRouter();

    // TODO CHANGE ALL THE CLOSE BUTTONS COLORS, THEY ARE CURRENTLY PLAIN GRAY, make them contrast more
    return (
        <ThemedView style={{
            borderColor: colors.popupBorder,
            borderWidth: 1,
            width: "auto",
            maxWidth: "80%",
            maxHeight: "70%",
            borderRadius: 16,
            paddingTop: 5
        }}>
            <View style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                paddingLeft: 24,
                paddingRight: 16,
                paddingTop: 6,
                paddingBottom: 8,
                borderBottomWidth: 1,
                borderColor: colors.border
            }}>
                <ThemedText type="header">New Session</ThemedText>
                <Pressable onPress={() => setNewSession(false)} style={({pressed}) => [{
                    backgroundColor: pressed ? colors.buttonPrimaryDepressed : colors.buttonPrimaryBackground,
                    borderColor: colors.buttonPrimaryBorder,
                    borderRadius: 8,
                    justifyContent: 'center',
                    alignItems: "center",
                    marginTop: -3,
                    marginRight: -2,
                    borderWidth: 1,
                    padding: 3,
                }]}>
                    <SvgClose stroke={colors.buttonPrimaryText} width={24} height={24}></SvgClose>
                </Pressable>
            </View>
            <View style={{flexDirection: "column", alignItems: "center"}}>
                <View style={{paddingHorizontal: 24, marginTop: 12}}>
                    <ThemedText type="subtitle">Holes</ThemedText>
                    <HorizRadioButton options={["9 Holes", "18 Holes"]} selectedOption={holes}
                                      setSelectedOption={setHoles}></HorizRadioButton>
                </View>
                <View style={{paddingHorizontal: 24, marginTop: 10}}>
                    <ThemedText type="subtitle">Difficulty</ThemedText>
                    <HorizRadioButton options={["Easy", "Medium", "Hard"]} selectedOption={difficulty}
                                      setSelectedOption={setDifficulty}></HorizRadioButton>
                </View>
                <View style={{paddingHorizontal: 24, marginTop: 10}}>
                    <ThemedText type="subtitle">Mode</ThemedText>
                    <HorizRadioButton options={["Random", "Mistakes"]} selectedOption={mode}
                                      setSelectedOption={setMode}></HorizRadioButton>
                </View>
                <View style={{
                    width: "100%",
                    alignContent: "center",
                    justifyContent: "center",
                    marginTop: 20,
                    marginBottom: 24
                }}>
                    <Pressable onPress={() => {
                        if (holes === undefined || difficulty === undefined || mode === undefined) return;
                        router.push({
                            pathname: `/simulation`,
                            params: {localHoles: holes === "9 Holes" ? 9 : 18, difficulty: difficulty, mode: mode}
                        });
                        setNewSession(false);
                    }}
                               style={({pressed}) => [{backgroundColor: holes === undefined || difficulty === undefined || mode === undefined ? colors.buttonSecondaryBackground : pressed ? colors.buttonPrimaryDepressed : colors.buttonPrimaryBackground}, {
                                   paddingVertical: 12,
                                   paddingHorizontal: 24,
                                   borderRadius: 8,
                                   flexDirection: "row",
                                   justifyContent: "center",
                                   alignItems: "center",
                                   overflow: "hidden",
                                   alignSelf: "center",
                                   borderColor: holes === undefined || difficulty === undefined || mode === undefined ? colors.buttonSecondaryBorder : "transparent",
                                   borderWidth: 1
                               }]}>
                        <Text style={{
                            textAlign: "center",
                            color: holes === undefined || difficulty === undefined || mode === undefined ? colors.textSecondary : colors.buttonPrimaryText,
                            fontSize: 14,
                            fontWeight: "bold"
                        }}>Start</Text>
                    </Pressable>
                </View>
            </View>
        </ThemedView>
    )
}