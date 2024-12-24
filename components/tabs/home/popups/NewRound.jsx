import React, {useCallback, useState} from "react";
import {Image, Pressable, Text, View} from "react-native";
import {BottomSheetModal, BottomSheetView,} from "@gorhom/bottom-sheet";
import useColors from "@/hooks/useColors";
import {useRouter} from "expo-router";
import Svg, {Path} from "react-native-svg";
import {PrimaryButton} from "@/components/general/buttons/PrimaryButton";
import CustomBackdrop from "@/components/general/popups/CustomBackdrop";
import {useSharedValue} from "react-native-reanimated";
import {useAppContext} from "@/contexts/AppCtx";

export const NewRound = ({newSessionRef}) => {
    const colors = useColors();

    const [difficulty, setDifficulty] = useState("easy");
    const [mode, setMode] = useState("random");
    const bottomSheetPosition = useSharedValue(0);
    const {putters, userData} = useAppContext();

    const router = useRouter();

    const myBackdrop = useCallback(
        ({ animatedIndex, style }) => {
            return (
                <CustomBackdrop
                    reference={newSessionRef}
                    animatedIndex={animatedIndex}
                    style={style}
                />
            );
        },
        []
    );

    // renders
    return (<BottomSheetModal
            ref={newSessionRef}
            bottomSheetPosition={bottomSheetPosition}
            enablePanDownToClose={true}
            backdropComponent={myBackdrop}
            backgroundStyle={{backgroundColor: colors.background.secondary}}
        >
            <BottomSheetView style={{
                    paddingBottom: 12, backgroundColor: colors.background.secondary,
                }}>
                <View style={{marginHorizontal: 24, paddingBottom: 12}}>
                    <Text style={{fontSize: 20, fontWeight: 500, color: colors.text.primary,}}>
                        New 18 Hole Simulation
                    </Text>
                    <Text style={{marginTop: 12, fontSize: 18, color: colors.text.primary, marginBottom: 10,}}>
                        Difficulty
                    </Text>
                    <View style={{flexDirection: "row", gap: 12}}>
                        <Pressable
                            onPress={() => setDifficulty("easy")}
                            style={{
                                flex: 1,
                                borderWidth: 1,
                                borderColor: difficulty === "easy" ? colors.toggleable.toggled.border : colors.toggleable.border,
                                borderRadius: 12,
                                paddingHorizontal: 8,
                                paddingVertical: 8,
                                backgroundColor: difficulty === "easy" ? colors.toggleable.toggled.background : "transparent",
                            }}>
                            {difficulty === "easy" && (<View
                                    style={{
                                        position: "absolute",
                                        right: -7,
                                        top: -7,
                                        backgroundColor: "#40C2FF",
                                        padding: 3,
                                        borderRadius: 50,
                                    }}>
                                    <Svg
                                        width={18}
                                        height={18}
                                        stroke={colors.checkmark.color}
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth="3">
                                        <Path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="m4.5 12.75 6 6 9-13.5"
                                        />
                                    </Svg>
                                </View>)}
                            <Text style={{textAlign: "center", color: colors.text.primary, fontSize: 16,}}>
                                Easy
                            </Text>
                        </Pressable>
                        <Pressable
                            onPress={() => setDifficulty("medium")}
                            style={{
                                flex: 1,
                                borderWidth: 1,
                                borderColor: difficulty === "medium" ? colors.toggleable.toggled.border : colors.toggleable.border,
                                borderRadius: 12,
                                paddingHorizontal: 8,
                                paddingVertical: 8,
                                backgroundColor: difficulty === "medium" ? colors.toggleable.toggled.background : "transparent",
                            }}>
                            {difficulty === "medium" && (<View
                                    style={{
                                        position: "absolute",
                                        right: -7,
                                        top: -7,
                                        backgroundColor: "#40C2FF",
                                        padding: 3,
                                        borderRadius: 50,
                                    }}>
                                    <Svg
                                        width={18}
                                        height={18}
                                        stroke={colors.checkmark.color}
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth="3">
                                        <Path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="m4.5 12.75 6 6 9-13.5"
                                        />
                                    </Svg>
                                </View>)}
                            <Text style={{textAlign: "center", color: colors.text.primary, fontSize: 16,}}>
                                Medium
                            </Text>
                        </Pressable>
                        <Pressable
                            onPress={() => setDifficulty("hard")}
                            style={{
                                flex: 1,
                                borderWidth: 1,
                                borderColor: difficulty === "hard" ? colors.toggleable.toggled.border : colors.toggleable.border,
                                borderRadius: 12,
                                paddingHorizontal: 8,
                                paddingVertical: 8,
                                backgroundColor: difficulty === "hard" ? colors.toggleable.toggled.background : "transparent",
                            }}>
                            {difficulty === "hard" && (<View
                                    style={{
                                        position: "absolute",
                                        right: -7,
                                        top: -7,
                                        backgroundColor: "#40C2FF",
                                        padding: 3,
                                        borderRadius: 50,
                                    }}>
                                    <Svg
                                        width={18}
                                        height={18}
                                        stroke={colors.checkmark.color}
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth="3">
                                        <Path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="m4.5 12.75 6 6 9-13.5"
                                        />
                                    </Svg>
                                </View>)}
                            <Text style={{textAlign: "center", color: colors.text.primary, fontSize: 16,}}>
                                Hard
                            </Text>
                        </Pressable>
                    </View>
                    <Text style={{marginTop: 18, fontSize: 18, color: colors.text.primary, marginBottom: 10,}}>
                        Mode
                    </Text>
                    <View style={{flexDirection: "row", gap: 12, marginBottom: 8}}>
                        <Pressable
                            onPress={() => setMode("random")}
                            style={{
                                flex: 1,
                                borderWidth: 1,
                                borderColor: mode === "random" ? colors.toggleable.toggled.border : colors.toggleable.border,
                                borderRadius: 12,
                                paddingHorizontal: 8,
                                paddingVertical: 8,
                                backgroundColor: mode === "random" ? colors.toggleable.toggled.background : "transparent",
                            }}>
                            {mode === "random" && (<View
                                    style={{
                                        position: "absolute",
                                        right: -7,
                                        top: -7,
                                        backgroundColor: "#40C2FF",
                                        padding: 3,
                                        borderRadius: 50,
                                    }}>
                                    <Svg
                                        width={18}
                                        height={18}
                                        stroke={colors.checkmark.color}
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth="3">
                                        <Path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="m4.5 12.75 6 6 9-13.5"
                                        />
                                    </Svg>
                                </View>)}
                            <Text style={{textAlign: "center", color: colors.text.primary, fontSize: 16,}}>
                                Random
                            </Text>
                        </Pressable>
                        <Pressable
                            onPress={() => setMode("weaknesses")}
                            style={{
                                flex: 1,
                                borderWidth: 1,
                                borderColor: mode === "weaknesses" ? colors.toggleable.toggled.border : colors.toggleable.border,
                                borderRadius: 12,
                                paddingHorizontal: 8,
                                paddingVertical: 8,
                                backgroundColor: mode === "weaknesses" ? colors.toggleable.toggled.background : "transparent",
                            }}>
                            {mode === "weaknesses" && (<View
                                    style={{
                                        position: "absolute",
                                        right: -7,
                                        top: -7,
                                        backgroundColor: "#40C2FF",
                                        padding: 3,
                                        borderRadius: 50,
                                    }}>
                                    <Svg
                                        width={18}
                                        height={18}
                                        stroke={colors.checkmark.color}
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth="3">
                                        <Path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="m4.5 12.75 6 6 9-13.5"
                                        />
                                    </Svg>
                                </View>)}
                            <Text style={{textAlign: "center", color: colors.text.primary, fontSize: 16,}}>
                                Weaknesses
                            </Text>
                        </Pressable>
                    </View>
                    <Text style={{
                        marginTop: 12,
                        fontSize: 18,
                        color: colors.text.primary,
                        marginBottom: 4,
                    }}>Putter</Text>
                    <View style={{flexDirection: "row", borderWidth: 1, gap: 0, borderRadius: 10, borderColor: colors.toggleable.border, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 24, alignItems: "center"}}>
                        <Image source={require("@/assets/images/putterTest.png")} style={{height: 48, width: 48, aspectRatio: 1, borderRadius: 8}}></Image>
                        <View style={{flexDirection: "column", flex: 1, marginLeft: 12}}>
                            <Text style={{fontSize: 16, color: colors.text.primary, fontWeight: 500}}>{putters.length > 0 ? putters[userData.preferences.selectedPutter].name : "Default Putter"}</Text>
                            <View style={{flexDirection: "row", width: "100%", justifyContent: "flex-start", alignItems: "center"}}>
                                <Text style={{color: colors.text.secondary, width: "35%"}}>Sessions: 3</Text>
                                <Text style={{color: colors.text.secondary, width: "100%"}}>Strokes Gained: {putters.length > 0 ? putters[userData.preferences.selectedPutter].stats.strokesGained.overall : 0}</Text>
                            </View>
                        </View>
                        <PrimaryButton style={{aspectRatio: 1, borderRadius: 50, width: 32}} onPress={() => router.push({pathname: "/editputters"})}>
                            <Svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                                 stroke={colors.button.primary.text} width={24} height={24}>
                                <Path strokeLinecap="round" strokeLinejoin="round"
                                      d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.559.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.398.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.272-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z"/>
                                <Path strokeLinecap="round" strokeLinejoin="round"
                                      d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
                            </Svg>
                        </PrimaryButton>
                    </View>
                    <PrimaryButton
                        title={"Start Session"}
                        onPress={() => {
                            newSessionRef.current?.dismiss();
                            router.push({
                                pathname: `/simulation/round`, params: {
                                    localHoles: 18, difficulty: difficulty, mode: mode,
                                },
                            });
                        }}
                    ></PrimaryButton>
                </View>
            </BottomSheetView>
        </BottomSheetModal>);
};
