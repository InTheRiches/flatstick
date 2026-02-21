import React, { FC } from "react"
import { Pressable, type TextStyle, View, type ViewStyle } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import type { ThemedStyle } from "@/theme/types"
import { useAppTheme } from "@/theme/context"
import { Text } from "@/components/Text"
import type { PutterDoc, GripDoc } from "@/models/equipment"
import { getDisplayName } from "@/utils/equipmentUtils"

type Doc = PutterDoc | GripDoc

interface EquipmentRowProps {
    item: Doc
    isSelected: boolean
    onSelect: (id: string) => void
    onEdit?: (item: Doc) => void
}

export const EquipmentRow: FC<EquipmentRowProps> = ({ item, isSelected, onSelect, onEdit }) => {
    const { themed, theme } = useAppTheme()

    const getMetaText = (doc: Doc) => {
        const maybePutter = doc as PutterDoc
        if (maybePutter.brand && maybePutter.summary && (maybePutter.summary as any).totalRounds != null) {
            let metaText = `${(maybePutter.summary as any).totalRounds} rounds`
            if (maybePutter.lieDeg != null) {
                metaText += `, ${maybePutter.lieDeg}° lie`
            }
            if (maybePutter.loftDeg != null) {
                metaText += `, ${maybePutter.loftDeg}° loft`
            }
            return metaText
        }
        const maybeGrip = doc as GripDoc
        if (maybeGrip.summary && (maybeGrip.summary as any).totalRounds != null) {
            return `${(maybeGrip.summary as any).totalRounds} rounds`
        }
        return ""
    }

    return (
        <Pressable
            onPress={() => onSelect?.(item.id)}
            style={({ pressed }) => [
                themed($row),
                pressed && themed($rowPressed),
                isSelected && themed($rowSelected),
            ]}
        >
            {/* Left: icon */}
            <View style={themed($leftIcon)}>
                <View style={themed($putterBadge)}>
                    <Ionicons name="golf-outline" size={16} color={theme.colors.text} />
                </View>
            </View>

            {/* Middle: text */}
            <View style={themed($textCol)}>
                <Text style={themed($title)} numberOfLines={1}>
                    {getDisplayName(item)}
                </Text>

                <Text style={themed($subtitle)} numberOfLines={1}>
                    {getMetaText(item)}
                </Text>
            </View>

            {/* Right: actions */}
            <View style={themed($rightCol)}>
                {isSelected ? (
                    <View style={themed($selectedPill)}>
                        <Ionicons name="checkmark" size={16} color={theme.colors.backgrounds.elevated} />
                        <Text style={themed($selectedPillText)}>Current</Text>
                    </View>
                ) : (
                    <View style={themed($spacer)} />
                )}

                <Pressable
                    onPress={() => onEdit?.(item)}
                    hitSlop={10}
                    style={({ pressed }) => [themed($iconButton), pressed && themed($iconButtonPressed)]}
                >
                    <Ionicons name="pencil" size={18} color={theme.colors.buttons.textColor} />
                </Pressable>
            </View>
        </Pressable>
    )
}


const $row: ThemedStyle<ViewStyle> = (theme) => ({
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.xs,
    paddingLeft: theme.spacing.xs,
    paddingRight: theme.spacing.sm,
    // Give every row an elevated background and a subtle border when NOT selected
    backgroundColor: theme.colors.backgrounds.elevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    marginBottom: theme.spacing.xxs
})

const $rowPressed: ThemedStyle<ViewStyle> = () => ({
    opacity: 0.85,
})

const $rowSelected: ThemedStyle<ViewStyle> = (theme) => ({
    // Keep the elevated background but emphasize selection with a tint border
    backgroundColor: theme.colors.backgrounds.elevated,
    borderWidth: 2,
    borderColor: theme.colors.tint,
    borderRadius: 12,
})


const $leftIcon: ThemedStyle<ViewStyle> = () => ({
    width: 44,
    alignItems: "center",
    justifyContent: "center",
})

const $putterBadge: ThemedStyle<ViewStyle> = (theme) => ({
    width: 32,
    height: 32,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.backgrounds.elevated,
})


const $textCol: ThemedStyle<ViewStyle> = () => ({
    flex: 1,
    minWidth: 0,
})

const $title: ThemedStyle<TextStyle> = (theme) => ({
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "700",
})

const $subtitle: ThemedStyle<TextStyle> = (theme) => ({
    color: theme.colors.textDim,
    fontSize: 13,
    marginTop: -4,
})


const $rightCol: ThemedStyle<ViewStyle> = (theme) => ({
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
})

const $selectedPill: ThemedStyle<ViewStyle> = (theme) => ({
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    height: 28,
    borderRadius: 999,
    backgroundColor: theme.colors.tint, // invert pill
})

const $selectedPillText: ThemedStyle<TextStyle> = (theme) => ({
    color: theme.colors.backgrounds.elevated,
    fontSize: 12,
    fontWeight: "700",
})

const $spacer: ThemedStyle<ViewStyle> = () => ({
    width: 1,
})

const $iconButton: ThemedStyle<ViewStyle> = (theme) => ({
    width: 34,
    height: 34,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.buttons.background
})

const $iconButtonPressed: ThemedStyle<ViewStyle> = (theme) => ({
    backgroundColor: theme.colors.buttons.pressed.background
})