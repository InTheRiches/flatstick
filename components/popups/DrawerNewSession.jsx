import React, {useCallback, useState} from "react";
import {Pressable, Text, View} from "react-native";
import {BottomSheetModal, BottomSheetView,} from "@gorhom/bottom-sheet";
import useColors from "@/hooks/useColors";
import {useRouter} from "expo-router";
import Svg, {Path} from "react-native-svg";
import {PrimaryButton} from "@/components/buttons/PrimaryButton";
import CustomBackdrop from "@/components/popups/CustomBackdrop";
import {useSharedValue} from "react-native-reanimated";

const DrawerNewSession = ({newSessionRef}) => {
    const colors = useColors();

    const [difficulty, setDifficulty] = useState("easy");
    const [mode, setMode] = useState("random");
    const bottomSheetPosition = useSharedValue(0);

    const router = useRouter();

    const [open, setOpen] = useState(true);

    const myBackdrop = useCallback(
        ({ animatedIndex, style }) => {
            return (
                <CustomBackdrop
                    open={open}
                    reference={newSessionRef}
                    animatedIndex={animatedIndex}
                    style={style}
                />
            );
        },
        [open]
    );

    // renders
    return (<BottomSheetModal
            ref={newSessionRef}
            bottomSheetPosition={bottomSheetPosition}
            enablePanDownToClose={true}
            backdropComponent={myBackdrop}
            backgroundStyle={{backgroundColor: colors.background.secondary}}
        >
            <BottomSheetView
                style={{
                    paddingBottom: 12, backgroundColor: colors.background.secondary,
                }}
            >
                <View style={{marginHorizontal: 24, paddingBottom: 12}}>
                    <Text
                        style={{
                            fontSize: 20, fontWeight: 500, color: colors.text.primary,
                        }}
                    >
                        New 18 Hole Simulation
                    </Text>
                    <Text
                        style={{
                            marginTop: 12, fontSize: 18, color: colors.text.primary, marginBottom: 10,
                        }}
                    >
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
                            }}
                        >
                            {difficulty === "easy" && (<View
                                    style={{
                                        position: "absolute",
                                        right: -7,
                                        top: -7,
                                        backgroundColor: "#40C2FF",
                                        padding: 3,
                                        borderRadius: 50,
                                    }}
                                >
                                    <Svg
                                        width={18}
                                        height={18}
                                        stroke={colors.checkmark.color}
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth="3"
                                    >
                                        <Path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="m4.5 12.75 6 6 9-13.5"
                                        />
                                    </Svg>
                                </View>)}
                            <Text
                                style={{
                                    textAlign: "center", color: colors.text.primary, fontSize: 16,
                                }}
                            >
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
                            }}
                        >
                            {difficulty === "medium" && (<View
                                    style={{
                                        position: "absolute",
                                        right: -7,
                                        top: -7,
                                        backgroundColor: "#40C2FF",
                                        padding: 3,
                                        borderRadius: 50,
                                    }}
                                >
                                    <Svg
                                        width={18}
                                        height={18}
                                        stroke={colors.checkmark.color}
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth="3"
                                    >
                                        <Path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="m4.5 12.75 6 6 9-13.5"
                                        />
                                    </Svg>
                                </View>)}
                            <Text
                                style={{
                                    textAlign: "center", color: colors.text.primary, fontSize: 16,
                                }}
                            >
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
                            }}
                        >
                            {difficulty === "hard" && (<View
                                    style={{
                                        position: "absolute",
                                        right: -7,
                                        top: -7,
                                        backgroundColor: "#40C2FF",
                                        padding: 3,
                                        borderRadius: 50,
                                    }}
                                >
                                    <Svg
                                        width={18}
                                        height={18}
                                        stroke={colors.checkmark.color}
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth="3"
                                    >
                                        <Path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="m4.5 12.75 6 6 9-13.5"
                                        />
                                    </Svg>
                                </View>)}
                            <Text
                                style={{
                                    textAlign: "center", color: colors.text.primary, fontSize: 16,
                                }}
                            >
                                Hard
                            </Text>
                        </Pressable>
                    </View>
                    <Text
                        style={{
                            marginTop: 18, fontSize: 18, color: colors.text.primary, marginBottom: 10,
                        }}
                    >
                        Mode
                    </Text>
                    <View style={{flexDirection: "row", gap: 12, marginBottom: 24}}>
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
                            }}
                        >
                            {mode === "random" && (<View
                                    style={{
                                        position: "absolute",
                                        right: -7,
                                        top: -7,
                                        backgroundColor: "#40C2FF",
                                        padding: 3,
                                        borderRadius: 50,
                                    }}
                                >
                                    <Svg
                                        width={18}
                                        height={18}
                                        stroke={colors.checkmark.color}
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth="3"
                                    >
                                        <Path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="m4.5 12.75 6 6 9-13.5"
                                        />
                                    </Svg>
                                </View>)}
                            <Text
                                style={{
                                    textAlign: "center", color: colors.text.primary, fontSize: 16,
                                }}
                            >
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
                            }}
                        >
                            {mode === "weaknesses" && (<View
                                    style={{
                                        position: "absolute",
                                        right: -7,
                                        top: -7,
                                        backgroundColor: "#40C2FF",
                                        padding: 3,
                                        borderRadius: 50,
                                    }}
                                >
                                    <Svg
                                        width={18}
                                        height={18}
                                        stroke={colors.checkmark.color}
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth="3"
                                    >
                                        <Path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="m4.5 12.75 6 6 9-13.5"
                                        />
                                    </Svg>
                                </View>)}
                            <Text
                                style={{
                                    textAlign: "center", color: colors.text.primary, fontSize: 16,
                                }}
                            >
                                Weaknesses
                            </Text>
                        </Pressable>
                    </View>
                    <PrimaryButton
                        title={"Start Session"}
                        onPress={() => {
                            newSessionRef.current?.dismiss();
                            router.push({
                                pathname: `/simulation/round`, params: {
                                    localHoles: 18, difficulty: difficulty, mode: mode, selectedPutterId: "default"
                                },
                            });
                        }}
                    ></PrimaryButton>
                </View>
            </BottomSheetView>
        </BottomSheetModal>);
};

export default DrawerNewSession;
