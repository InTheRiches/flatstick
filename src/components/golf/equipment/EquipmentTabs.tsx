import React, { FC, useState } from "react"
import { View, type ViewStyle, Pressable, Text, type TextStyle } from "react-native"
import type { ThemedStyle } from "@/theme/types"
import { useAppTheme } from "@/theme/context"
import { EquipmentListTab } from "./EquipmentListTab"
import * as ActiveTabModule from "./ActiveEquipmentTab"
import type { ActiveSetup } from "./types"
import type { PutterDoc, GripDoc } from "@/models/equipment"

type TabKey = "Active" | "Putters" | "Grips" | "Clubs"

interface EquipmentTabsProps {
    putters: PutterDoc[]
    grips: GripDoc[]
    clubs: any[]
    activeSetup: ActiveSetup
    onUpdateActive: (type: "putter" | "grip" | "clubs", id: string) => void
    onEdit: (item: PutterDoc | GripDoc) => void
    onAdd: (type: "putter" | "grip" | "club") => void
}

export const EquipmentTabs: FC<EquipmentTabsProps> = ({
    putters,
    grips,
    clubs,
    activeSetup,
    onUpdateActive,
    onEdit,
    onAdd,
}) => {
    const { themed } = useAppTheme()
    const [activeTab, setActiveTab] = useState<TabKey>("Putters")

    const TABS: TabKey[] = ["Putters", "Grips", "Clubs"]

    const handleTabPress = (tab: TabKey) => {
        setActiveTab(tab)
    }

    const renderContent = () => {
        switch (activeTab) {
            case "Putters":
                return (
                    <EquipmentListTab
                        title="Putters"
                        type="putter"
                        items={putters}
                        selectedId={activeSetup.putterId}
                        onSelect={(id) => onUpdateActive("putter", id)}
                        onEdit={onEdit}
                        onAdd={() => onAdd("putter")}
                    />
                )
            case "Grips":
                return (
                    <EquipmentListTab
                        title="Grips"
                        type="grip"
                        items={grips}
                        selectedId={activeSetup.gripId}
                        onSelect={(id) => onUpdateActive("grip", id)}
                        onEdit={onEdit}
                        onAdd={() => onAdd("grip")}
                    />
                )
            case "Clubs":
                return (
                    <EquipmentListTab
                        title="Clubs"
                        type="club"
                        items={clubs}
                        selectedId={null} // Placeholder
                        onSelect={(id) => onUpdateActive("clubs", id)}
                        onEdit={onEdit}
                        onAdd={() => onAdd("club")}
                    />
                )
            default:
                return null
        }
    }

    return (
        <View style={themed($container)}>
            {/* Tab Bar */}
            <View style={themed($tabBar)}>
                {TABS.map((tab) => {
                    const isActive = activeTab === tab
                    // Add count badges?
                    let count = 0
                    if (tab === "Putters") count = putters.length
                    if (tab === "Grips") count = grips.length
                    if (tab === "Clubs") count = clubs.length

                    return (
                        <Pressable
                            key={tab}
                            style={[themed($tabItem), isActive && themed($tabItemActive)]}
                            onPress={() => handleTabPress(tab)}
                        >
                            <Text style={[themed($tabText), isActive && themed($tabTextActive)]}>
                                {tab}
                            </Text>
                            {/* Optional Badge */}
                            {count > 0 && (
                                <View style={isActive ? themed($badgeActive) : themed($badge)}>
                                    <Text style={isActive ? themed($badgeTextActive) : themed($badgeText)}>{count}</Text>
                                </View>
                            )}
                        </Pressable>
                    )
                })}
            </View>

            {/* Content Area */}
            <View style={themed($contentArea)}>
                {renderContent()}
            </View>
        </View>
    )
}

const $container: ThemedStyle<ViewStyle> = () => ({
    flex: 1,
})

const $tabBar: ThemedStyle<ViewStyle> = (theme) => ({
    flexDirection: "row",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    justifyContent: "center",
    gap: 8,
})

const $tabItem: ThemedStyle<ViewStyle> = (theme) => ({
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: theme.colors.transparent,
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
})

const $tabItemActive: ThemedStyle<ViewStyle> = (theme) => ({
    backgroundColor: theme.colors.buttons.background, // Light emerald or brand color bg
})

const $tabText: ThemedStyle<TextStyle> = (theme) => ({
    fontSize: 13,
    fontWeight: "500",
    color: theme.colors.textDim,
})

const $tabTextActive: ThemedStyle<TextStyle> = (theme) => ({
    color: theme.colors.buttons.textColor, // Emerald text
    fontWeight: "600",
})

const $badge: ThemedStyle<ViewStyle> = (theme) => ({
    backgroundColor: theme.colors.palette.neutral300,
    borderRadius: 6,
    paddingHorizontal: 4,
    height: 14,
    justifyContent: "center",
    alignItems: "center",
})

const $badgeActive: ThemedStyle<ViewStyle> = (theme) => ({
    backgroundColor: theme.colors.buttons.textColor,
    borderRadius: 6,
    paddingHorizontal: 4,
    height: 14,
    justifyContent: "center",
    alignItems: "center",
})

const $badgeText: ThemedStyle<TextStyle> = (theme) => ({
    fontSize: 9,
    fontWeight: "700",
    color: theme.colors.palette.neutral100,
})

const $badgeTextActive: ThemedStyle<TextStyle> = (theme) => ({
    fontSize: 9,
    fontWeight: "700",
    color: theme.colors.buttons.background,
})

const $contentArea: ThemedStyle<ViewStyle> = () => ({
    flex: 1,
})
