import React, {useCallback, useState} from "react";
import {Pressable, View} from "react-native";
import {BottomSheetModal, BottomSheetView,} from "@gorhom/bottom-sheet";
import useColors from "@/hooks/useColors";
import {useRouter} from "expo-router";
import Svg, {Path} from "react-native-svg";
import {PrimaryButton} from "@/components/general/buttons/PrimaryButton";
import CustomBackdrop from "@/components/general/popups/CustomBackdrop";
import {useSharedValue} from "react-native-reanimated";
import {useAppContext} from "@/contexts/AppCtx";
import {SecondaryButton} from "../../../general/buttons/SecondaryButton";
import FontText from "../../../general/FontText";

export const NewRound = ({newSessionRef}) => {
    const colors = useColors();

    const [difficulty, setDifficulty] = useState("easy");
    const [mode, setMode] = useState("random");
    const bottomSheetPosition = useSharedValue(0);
    const {putters, grips, userData, updateData} = useAppContext();

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
        }, []
    );

    // console.log(userData.preferences, putters, grips);

    // renders
    return (<BottomSheetModal ref={newSessionRef} bottomSheetPosition={bottomSheetPosition} enablePanDownToClose={true} backdropComponent={myBackdrop} handleIndicatorStyle={{backgroundColor: colors.text.primary}} backgroundStyle={{backgroundColor: colors.background.primary}}>
            <BottomSheetView style={{paddingBottom: 12, backgroundColor: colors.background.primary,}}>
                <View style={{marginHorizontal: 24, paddingBottom: 12}}>
                    <FontText style={{fontSize: 20, fontWeight: 500, color: colors.text.primary,}}>New 18 Hole Simulation</FontText>
                    <FontText style={{marginTop: 18, fontSize: 18, color: colors.text.primary, marginBottom: 10,}}>Mode</FontText>
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
                                backgroundColor: mode === "random" ? colors.toggleable.toggled.background : colors.toggleable.background,
                            }}>
                            {mode === "random" && (<View style={{
                                position: "absolute",
                                right: -7,
                                top: -7,
                                backgroundColor: "#40C2FF",
                                padding: 3,
                                borderRadius: 50,
                            }}>
                                <Svg width={18}
                                     height={18}
                                     stroke={colors.checkmark.color}
                                     xmlns="http://www.w3.org/2000/svg"
                                     fill="none"
                                     viewBox="0 0 24 24"
                                     strokeWidth="3">
                                    <Path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5"/>
                                </Svg>
                            </View>)}
                            <FontText style={{textAlign: "center", color: colors.text.primary, fontSize: 16,}}>Random</FontText>
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
                                backgroundColor: mode === "weaknesses" ? colors.toggleable.toggled.background : colors.toggleable.background,
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
                                <Svg width={18}
                                     height={18}
                                     stroke={colors.checkmark.color}
                                     xmlns="http://www.w3.org/2000/svg"
                                     fill="none"
                                     viewBox="0 0 24 24"
                                     strokeWidth="3">
                                    <Path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5"/>
                                </Svg>
                            </View>)}
                            <FontText style={{textAlign: "center", color: colors.text.primary, fontSize: 16,}}>Weaknesses</FontText>
                        </Pressable>
                    </View>
                    {   mode === "random" &&
                        <>
                            <FontText style={{marginTop: 12, fontSize: 18, color: colors.text.primary, marginBottom: 10,}}>Difficulty</FontText>
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
                                        backgroundColor: difficulty === "easy" ? colors.toggleable.toggled.background : colors.toggleable.background,
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
                                    <FontText style={{textAlign: "center", color: colors.text.primary, fontSize: 16,}}>{userData.preferences.units === 0 ? "3-15ft" : "1-5m"}</FontText>
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
                                        backgroundColor: difficulty === "medium" ? colors.toggleable.toggled.background : colors.toggleable.background,
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
                                    <FontText style={{textAlign: "center", color: colors.text.primary, fontSize: 16,}}>{userData.preferences.units === 0 ? "8-25ft" : "3-8m"}</FontText>
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
                                        backgroundColor: difficulty === "hard" ? colors.toggleable.toggled.background : colors.toggleable.background,
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
                                    <FontText style={{textAlign: "center", color: colors.text.primary, fontSize: 16,}}>{userData.preferences.units === 0 ? "10-40ft" : "3-13m"}</FontText>
                                </Pressable>
                            </View>
                        </>
                    }
                    <FontText style={{
                        marginTop: 12,
                        fontSize: 18,
                        color: colors.text.primary,
                        marginBottom: 4,
                    }}>Grip Method</FontText>
                    <Pressable onPress={() => router.push({pathname: "/editgrips"})} style={{flexDirection: "row", borderRadius: 10, backgroundColor: colors.background.secondary, paddingHorizontal: 12, paddingVertical: 10, alignItems: "center"}}>
                        <View style={{flexDirection: "column", flex: 1}}>
                            <FontText style={{fontSize: 18, color: colors.text.primary, fontWeight: 500}}>{grips[userData.preferences.selectedGrip].name}</FontText>
                        </View>
                        <SecondaryButton style={{aspectRatio: 1, borderRadius: 50, width: 32}} onPress={() => router.push({pathname: "/editgrips"})}>
                            <Svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                                 stroke={colors.button.secondary.text} width={24} height={24}>
                                <Path strokeLinecap="round" strokeLinejoin="round"
                                      d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.559.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.398.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.272-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z"/>
                                <Path strokeLinecap="round" strokeLinejoin="round"
                                      d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
                            </Svg>
                        </SecondaryButton>
                    </Pressable>
                    <FontText style={{
                        marginTop: 12,
                        fontSize: 18,
                        color: colors.text.primary,
                        marginBottom: 4,
                    }}>Putter</FontText>
                    <Pressable onPress={() => router.push({pathname: "/editputters"})} style={{flexDirection: "row", gap: 0, borderRadius: 10, backgroundColor: colors.background.secondary, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 24, alignItems: "center"}}>
                        {   userData.preferences.selectedPutter === 0 ? (
                            <FontText style={{fontSize: 18, color: colors.text.primary, fontWeight: 500, flex: 1}}>{putters[userData.preferences.selectedPutter].name}</FontText>
                        ) : (
                            <FontText style={{fontSize: 18, color: colors.text.primary, fontWeight: 500, flex: 1}}>{putters[userData.preferences.selectedPutter].name}</FontText>
                        )}
                        <SecondaryButton style={{aspectRatio: 1, borderRadius: 50, width: 32}} onPress={() => router.push({pathname: "/editputters"})}>
                            <Svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                                 stroke={colors.button.secondary.text} width={24} height={24}>
                                <Path strokeLinecap="round" strokeLinejoin="round"
                                      d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.559.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.398.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.272-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z"/>
                                <Path strokeLinecap="round" strokeLinejoin="round"
                                      d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
                            </Svg>
                        </SecondaryButton>
                    </Pressable>
                    <PrimaryButton
                        title={"Start Session"}
                        onPress={() => {
                            newSessionRef.current?.dismiss();
                            if (userData.hasSeenRoundTutorial) {
                                router.push({
                                    pathname: `/simulation/round`, params: {
                                        localHoles: 18, difficulty: difficulty, mode: mode,
                                    },
                                });
                            } else {
                                router.push({
                                    pathname: `/simulation/round/demo`, params: {
                                        justInfo: false, localHoles: 18, difficulty: difficulty, mode: mode,
                                    },
                                });
                                updateData({hasSeenRoundTutorial: true});
                            }
                        }}
                    ></PrimaryButton>
                </View>
            </BottomSheetView>
        </BottomSheetModal>);
};
