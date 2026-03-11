import { Ionicons } from "@expo/vector-icons"
import { FC } from "react"
import { TextInput, type TextStyle, View, type ViewStyle } from "react-native"

import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

interface RoundsSearchBarProps {
  value: string
  onChangeText: (text: string) => void
}

export const RoundsSearchBar: FC<RoundsSearchBarProps> = ({ value, onChangeText }) => {
  const { themed, theme } = useAppTheme()

  return (
    <View style={themed($container)}>
      <Ionicons name="search" size={16} color={theme.colors.textDim} style={$icon} />
      <TextInput
        style={themed($input)}
        value={value}
        onChangeText={onChangeText}
        placeholder="Search by course or club..."
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
  paddingHorizontal: 12,
  paddingVertical: 10,
  borderRadius: 10,
  backgroundColor: theme.colors.backgrounds.elevated,
  borderWidth: 1,
  borderColor: theme.colors.border,
  marginBottom: theme.spacing.sm,
})

const $icon: TextStyle = {
  marginRight: 8,
}

const $input: ThemedStyle<TextStyle> = (theme) => ({
  flex: 1,
  color: theme.colors.text,
  fontSize: 15,
})
