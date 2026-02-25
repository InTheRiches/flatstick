import {Pressable, type TextStyle, View, type ViewStyle} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {Button} from "@/components/ui/Button";
import React, {FC} from "react";
import type {ThemedStyle} from "@/theme/types";
import {useAppTheme} from "@/theme/context";

interface ActionRowProps {
    onUndo: () => void
    onAction: () => void
    onDelete: () => void
    actionLabel: string
}

export const ActionRow: FC<ActionRowProps> = ({ onUndo, onAction, onDelete, actionLabel }) => {
    const { themed, theme } = useAppTheme()

    return (
        <View style={$actionRow}>
            <Pressable
                style={({ pressed }) => [themed($undoButton), pressed && { opacity: 0.6 }]}
                onPress={() => onUndo()}
                hitSlop={8}
            >
                <Ionicons name="arrow-undo" size={24} color={theme.colors.buttons.secondary.textColor} />
            </Pressable>

            <Button
                text={actionLabel}
                onPress={() => onAction()}
                style={[$actionButton, $centerButton, {backgroundColor: theme.colors.buttons.background}]}
                textStyle={[$actionButtonText, {color: theme.colors.buttons.textColor}]}
            />

            <Pressable
                style={({ pressed }) => [themed($trashButton), pressed && { opacity: 0.6 }]}
                onPress={() => onDelete()}
                hitSlop={8}
            >
                <Ionicons name="trash" size={24} color={theme.colors.buttons.danger.textColor} />
            </Pressable>
        </View>
    )
}

const $undoButton: ThemedStyle<ViewStyle> = (theme) => ({
    borderRadius: 8,
    backgroundColor: theme.colors.buttons.secondary.background, // Matching search bar bg
    borderColor: theme.colors.buttons.secondary.border,
    padding: 12,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
})

const $trashButton: ThemedStyle<ViewStyle> = (theme) => ({
    borderRadius: 8,
    backgroundColor: theme.colors.buttons.danger.background, // Matching search bar bg
    padding: 12,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center"
})

const $actionRow: ViewStyle = {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
}

const $actionButton: ViewStyle = {
    flex: 1,
    marginHorizontal: 6,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
}

const $centerButton: ViewStyle = {
    // Emphasize center button
    backgroundColor: "#0A84FF",
}

const $iconButton: ViewStyle = {
    width: 56,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
}

const $actionButtonText: TextStyle = {
    fontSize: 16,
}