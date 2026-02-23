import React, {FC, useEffect, useState} from "react";
import {ActivityIndicator, View, type TextStyle, type ViewStyle, Pressable} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {useAppTheme} from "@/theme/context";
import { Screen } from "@/components/ui/Screen"
import {useRoundTimerEngine} from "@/hooks/useTimerEngine";
import {HoleState} from "@/models/session.types";
import {PuttingHeader} from "@/components/app/golf/putting/PuttingHeader";
import {Button} from "@/components/ui/Button";
import type { CourseSelectionDetails } from "@/components/app/golf/modals/SelectCourseDetailsModal";
import type {ThemedStyle} from "@/theme/types";
import {ActionRow} from "@/components/app/golf/putting/ActionRow";

interface PuttingScreenProps {
    course: CourseSelectionDetails | null;
}

export const PuttingScreen: FC<PuttingScreenProps> = function PuttingScreen({ course }) {
    const { themed, theme } = useAppTheme()

    const [loading] = useState(false)
    const [isPinEditMode, setIsPinEditMode] = useState(false)

    const [holeState, setHoleState] = useState<HoleState>({
        holeNumber: 1,
        status: "inProgress",
    } as HoleState)

    const timerEngine = useRoundTimerEngine(course?.numberOfHoles)

    useEffect(() => {
        // placeholder for any effect logic
    }, [])

    return (
        <Screen>
            <PuttingHeader holeState={holeState} timer={timerEngine} teeSet={course?.selectedTee}/>

            <View style={{aspectRatio: 1, width: "100%", backgroundColor: "green", marginTop: 24, borderRadius: 16}}>
                <Pressable
                    style={({ pressed }) => [
                        themed($pinButton),
                        isPinEditMode && themed($pinButtonActive)
                    ]}
                    onPress={() => setIsPinEditMode(!isPinEditMode)}
                    hitSlop={8}
                >
                    <Ionicons
                        name="flag"
                        size={20}
                        color={
                            isPinEditMode
                                ? theme.colors.buttons.textColor
                                : theme.colors.buttons.secondary.textColor
                        }
                    />
                </Pressable>
            </View>

            <ActionRow actionLabel={isPinEditMode ? "Edit pin location" : "Add first shot"} onAction={() => {}} onDelete={() => {}} onUndo={() => {}}/>


            {loading && <ActivityIndicator color={theme.colors.tint} style={$loadingIndicator} />}
        </Screen>
    )
}

const $pinButtonActive: ThemedStyle<ViewStyle> = (theme) => ({
    backgroundColor: theme.colors.buttons.background,
    borderColor: theme.colors.buttons.background,
})

const $pinButton: ThemedStyle<ViewStyle> = (theme) => ({
    borderRadius: 8,
    backgroundColor: theme.colors.buttons.secondary.background, // Matching search bar bg
    borderColor: theme.colors.buttons.secondary.border,
    padding: 12,
    marginTop: 8,
    marginRight: 8,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    position: "absolute",
    right: 0,
    top: 0
})

const $loadingIndicator: ViewStyle = {
    marginTop: 12,
}
