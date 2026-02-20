import React, { FC } from "react"
import { Pressable, type TextStyle, View, type ViewStyle } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import type { ThemedStyle } from "@/theme/types"
import { useAppTheme } from "@/theme/context"
import { Text } from "@/components/Text"
import type { ActiveSetup, EquipmentItem } from "./types"

interface ActiveEquipmentTabProps {
    activeSetup: ActiveSetup
    putters: EquipmentItem[]
    grips: EquipmentItem[]
    clubs?: EquipmentItem[]
    onSwitchTab: (tabKey: string) => void
}

export const ActiveEquipmentTab: FC<ActiveEquipmentTabProps> = ({
    activeSetup,
    putters,
    grips,
    onSwitchTab,
}) => {
    const { themed, theme } = useAppTheme()

    const activePutter = putters.find((p) => p.id === activeSetup.putterId)
    const activeGrip = grips.find((g) => g.id === activeSetup.gripId)
    // Placeholder for clubs
    const activeClubsCount = activeSetup.clubIds ? Object.keys(activeSetup.clubIds).length : 0

    const renderRow = (
        label: string,
        value: string,
        targetTab: string,
        icon: keyof typeof Ionicons.glyphMap,
        isPlaceholder = false
    ) => (
        <Pressable
            style={({ pressed }) => [themed($row), pressed && { opacity: 0.7 }]}
            onPress={() => onSwitchTab(targetTab)}
        >
            <View style={themed($iconContainer)}>
                <Ionicons name={icon} size={20} color={theme.colors.palette.primary500} />
            </View>
            <View style={themed($content)}>
                <Text style={themed($label)}>{label}</Text>
                <Text style={[themed($value), isPlaceholder && { color: theme.colors.textDim }]}>
                    {value}
                </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textDim} />
        </Pressable>
    )

    return (
        <View style={themed($container)}>
            {renderRow(
                "Putter",
                activePutter ? activePutter.name : "Not set",
                "Putters",
                "golf",
                !activePutter
            )}
            {renderRow(
                "Grip",
                activeGrip ? activeGrip.name : "Not set",
                "Grips",
                "hand-right-outline",
                !activeGrip
            )}
            {renderRow(
                "Clubs",
                activeClubsCount > 0 ? `${activeClubsCount} clubs set` : "Manage clubs",
                "Clubs",
                "briefcase-outline",
                activeClubsCount === 0
            )}
        </View>
    )
}

const $container: ThemedStyle<ViewStyle> = (theme) => ({
    padding: theme.spacing.md,
    gap: 12,
})

const $row: ThemedStyle<ViewStyle> = (theme) => ({
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.palette.neutral100, // Card-like but simple
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
})

const $iconContainer: ThemedStyle<ViewStyle> = (theme) => ({
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.palette.neutral200,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
})

const $content: ThemedStyle<ViewStyle> = () => ({
    flex: 1,
    gap: 4,
})

const $label: ThemedStyle<TextStyle> = (theme) => ({
    fontSize: 12,
    color: theme.colors.textDim,
    textTransform: "uppercase",
    letterSpacing: 0.5,
})

const $value: ThemedStyle<TextStyle> = (theme) => ({
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text,
})

