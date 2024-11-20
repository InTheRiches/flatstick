import {ThemedText} from '@/components/ThemedText';
import {ThemedView} from '@/components/ThemedView';
import {View} from 'react-native';
import {HorizRadioButton} from '@/components/buttons/HorizRadioButton';
import React, {useState} from 'react';
import {SvgClose} from '@/assets/svg/SvgComponents';
import {useRouter} from 'expo-router';
import useColors from "@/hooks/useColors";
import {PrimaryButton} from "@/components/buttons/PrimaryButton";
import {SecondaryButton} from "@/components/buttons/SecondaryButton";

export function NewSession({setNewSession}) {
    const colors = useColors();

    const [holes, setHoles] = useState("9 Holes");
    const [difficulty, setDifficulty] = useState("Easy");
    const [mode, setMode] = useState("Random");

    const router = useRouter();

    // TODO CHANGE ALL THE CLOSE BUTTONS COLORS, THEY ARE CURRENTLY PLAIN GRAY, make them contrast more
    return (
        <ThemedView style={{
            borderColor: colors.border.popup,
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
                borderColor: colors.border.default
            }}>
                <ThemedText type="header">New Session</ThemedText>
                <SecondaryButton onPress={() => setNewSession(false)}
                               style={{marginTop: -3, marginRight: -2, borderWidth: 1, padding: 3, borderRadius: 8}}>
                    <SvgClose stroke={colors.button.secondary.text} width={24} height={24}></SvgClose>
                </SecondaryButton>
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
                    <PrimaryButton title={"Start"}
                                   disabled={holes === undefined || difficulty === undefined || mode === undefined}
                                   onPress={() => {
                                       if (holes === undefined || difficulty === undefined || mode === undefined) return;
                                       router.push({
                                           pathname: `/simulation`,
                                           params: {
                                               localHoles: holes === "9 Holes" ? 9 : 18,
                                               difficulty: difficulty,
                                               mode: mode
                                           }
                                       });
                                       setNewSession(false);
                                   }}></PrimaryButton>
                </View>
            </View>
        </ThemedView>
    )
}