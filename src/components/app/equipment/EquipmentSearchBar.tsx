import React, { FC } from "react"
import { TextInput, type TextStyle, View, type ViewStyle } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import type { ThemedStyle } from "@/theme/types"
import { useAppTheme } from "@/theme/context"

interface EquipmentSearchBarProps {
    value: string
    onChangeText: (text: string) => void
    placeholder?: string
}

export const EquipmentSearchBar: FC<EquipmentSearchBarProps> = ({ value, onChangeText, placeholder = "Search equipment..." }) => {
    const { themed, theme } = useAppTheme()

    return (
        <View style={themed($container)}>
            <Ionicons name="search" size={16} color={theme.colors.textDim} style={themed($icon)} />
            <TextInput
                style={themed($input)}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={theme.colors.textDim}
                returnKeyType="search"
                autoCapitalize="none"
                autoCorrect={false}
            />
        </View>
    )
}

const $container: ThemedStyle<ViewStyle> = (theme) => ({
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: theme.colors.backgrounds.elevated,
    marginRight: theme.spacing.md,
})

const $icon: ThemedStyle<TextStyle> = () => ({
    marginRight: 8,
})

const $input: ThemedStyle<TextStyle> = (theme) => ({
    flex: 1,
    color: theme.colors.text,
    fontSize: 16
})


