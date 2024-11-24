import React, {useState} from 'react';
import {View, Text, Pressable} from 'react-native';
import {
    BottomSheetModal,
    BottomSheetView,
} from '@gorhom/bottom-sheet';
import useColors from "@/hooks/useColors";
import {useRouter} from "expo-router";
import Svg, {Path} from "react-native-svg";
import {PrimaryButton} from "@/components/buttons/PrimaryButton";

const DrawerNewSession = ({newSessionRef}) => {
    const colors = useColors();

    const [difficulty, setDifficulty] = useState("easy");
    const [mode, setMode] = useState("random");

    const router = useRouter();

    // renders
    return (
        <BottomSheetModal ref={newSessionRef}
                          backgroundStyle={{backgroundColor: colors.background.secondary}}>
            <BottomSheetView style={{paddingBottom: 12, backgroundColor: colors.background.secondary}}>
                <View style={{marginHorizontal: 24, paddingBottom: 12}}>
                    <Text style={{fontSize: 20, fontWeight: 500, color: colors.text.primary}}>New 18 Hole
                        Simulation</Text>
                    <Text style={{
                        marginTop: 12,
                        fontSize: 18,
                        color: colors.text.primary,
                        marginBottom: 10
                    }}>Difficulty</Text>
                    <View style={{flexDirection: "row", gap: 12}}>
                        <Pressable onPress={() => setDifficulty("easy")} style={{
                            flex: 1,
                            borderWidth: 1,
                            borderColor: difficulty === "easy" ? "#40C2FF" : "#4D4D4D",
                            borderRadius: 12,
                            paddingHorizontal: 8,
                            paddingVertical: 8,
                            backgroundColor: difficulty === "easy" ? "#194064" : "transparent"
                        }}>
                            {difficulty === "easy" && <View style={{
                                position: "absolute",
                                right: -7,
                                top: -7,
                                backgroundColor: "#40C2FF",
                                padding: 3,
                                borderRadius: 50
                            }}>
                                <Svg width={18} height={18} stroke={colors.checkmark.color}
                                     xmlns="http://www.w3.org/2000/svg"
                                     fill="none"
                                     viewBox="0 0 24 24" strokeWidth="3">
                                    <Path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5"/>
                                </Svg>
                            </View>}
                            <Text style={{textAlign: "center", color: colors.text.primary, fontSize: 16}}>Easy</Text>
                        </Pressable>
                        <Pressable onPress={() => setDifficulty("medium")} style={{
                            flex: 1,
                            borderWidth: 1,
                            borderColor: difficulty === "medium" ? "#40C2FF" : "#4D4D4D",
                            borderRadius: 12,
                            paddingHorizontal: 8,
                            paddingVertical: 8,
                            backgroundColor: difficulty === "medium" ? "#194064" : "transparent"
                        }}>
                            {difficulty === "medium" && <View style={{
                                position: "absolute",
                                right: -7,
                                top: -7,
                                backgroundColor: "#40C2FF",
                                padding: 3,
                                borderRadius: 50
                            }}>
                                <Svg width={18} height={18} stroke={colors.checkmark.color}
                                     xmlns="http://www.w3.org/2000/svg"
                                     fill="none"
                                     viewBox="0 0 24 24" strokeWidth="3">
                                    <Path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5"/>
                                </Svg>
                            </View>}
                            <Text style={{textAlign: "center", color: colors.text.primary, fontSize: 16}}>Medium</Text>
                        </Pressable>
                        <Pressable onPress={() => setDifficulty("hard")} style={{
                            flex: 1,
                            borderWidth: 1,
                            borderColor: difficulty === "hard" ? "#40C2FF" : "#4D4D4D",
                            borderRadius: 12,
                            paddingHorizontal: 8,
                            paddingVertical: 8,
                            backgroundColor: difficulty === "hard" ? "#194064" : "transparent"
                        }}>
                            {difficulty === "hard" && <View style={{
                                position: "absolute",
                                right: -7,
                                top: -7,
                                backgroundColor: "#40C2FF",
                                padding: 3,
                                borderRadius: 50
                            }}>
                                <Svg width={18} height={18} stroke={colors.checkmark.color}
                                     xmlns="http://www.w3.org/2000/svg"
                                     fill="none"
                                     viewBox="0 0 24 24" strokeWidth="3">
                                    <Path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5"/>
                                </Svg>
                            </View>}
                            <Text style={{textAlign: "center", color: colors.text.primary, fontSize: 16}}>Hard</Text>
                        </Pressable>
                    </View>
                    <Text style={{
                        marginTop: 18,
                        fontSize: 18,
                        color: colors.text.primary,
                        marginBottom: 10
                    }}>Mode</Text>
                    <View style={{flexDirection: "row", gap: 12, marginBottom: 24}}>
                        <Pressable onPress={() => setMode("random")} style={{
                            flex: 1,
                            borderWidth: 1,
                            borderColor: mode === "random" ? "#40C2FF" : "#4D4D4D",
                            borderRadius: 12,
                            paddingHorizontal: 8,
                            paddingVertical: 8,
                            backgroundColor: mode === "random" ? "#194064" : "transparent"
                        }}>
                            {mode === "random" && <View style={{
                                position: "absolute",
                                right: -7,
                                top: -7,
                                backgroundColor: "#40C2FF",
                                padding: 3,
                                borderRadius: 50
                            }}>
                                <Svg width={18} height={18} stroke={colors.checkmark.color}
                                     xmlns="http://www.w3.org/2000/svg"
                                     fill="none"
                                     viewBox="0 0 24 24" strokeWidth="3">
                                    <Path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5"/>
                                </Svg>
                            </View>}
                            <Text style={{textAlign: "center", color: colors.text.primary, fontSize: 16}}>Random</Text>
                        </Pressable>
                        <Pressable onPress={() => setMode("weaknesses")} style={{
                            flex: 1,
                            borderWidth: 1,
                            borderColor: mode === "weaknesses" ? "#40C2FF" : "#4D4D4D",
                            borderRadius: 12,
                            paddingHorizontal: 8,
                            paddingVertical: 8,
                            backgroundColor: mode === "weaknesses" ? "#194064" : "transparent"
                        }}>
                            {mode === "weaknesses" && <View style={{
                                position: "absolute",
                                right: -7,
                                top: -7,
                                backgroundColor: "#40C2FF",
                                padding: 3,
                                borderRadius: 50
                            }}>
                                <Svg width={18} height={18} stroke={colors.checkmark.color}
                                     xmlns="http://www.w3.org/2000/svg"
                                     fill="none"
                                     viewBox="0 0 24 24" strokeWidth="3">
                                    <Path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5"/>
                                </Svg>
                            </View>}
                            <Text style={{
                                textAlign: "center",
                                color: colors.text.primary,
                                fontSize: 16
                            }}>Weaknesses</Text>
                        </Pressable>
                    </View>
                    <PrimaryButton title={"Start Session"} onPress={() => {
                        newSessionRef.current?.dismiss();
                        router.push({
                            pathname: `/simulation`,
                            params: {
                                localHoles: 18,
                                difficulty: difficulty,
                                mode: mode
                            }
                        });
                    }}></PrimaryButton>
                </View>
            </BottomSheetView>
        </BottomSheetModal>
    );
};

export default DrawerNewSession;