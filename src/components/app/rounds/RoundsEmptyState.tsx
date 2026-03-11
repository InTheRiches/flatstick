import { Ionicons } from "@expo/vector-icons"
import { FC } from "react"
import { type TextStyle, View, type ViewStyle } from "react-native"

import { Text } from "@/components/ui/Text"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

export const RoundsEmptyState: FC = () => {
  const { themed, theme } = useAppTheme()

  return (
    <View style={$container}>
      <Ionicons name="golf-outline" size={48} color={theme.colors.textDim2} />
      <Text style={themed($title)}>No rounds found</Text>
      <Text style={themed($subtitle)}>
        Play a round to see it here, or adjust your search and filters.
      </Text>
    </View>
  )
}

const $container: ViewStyle = {
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
  paddingHorizontal: 32,
  paddingVertical: 48,
}

const $title: ThemedStyle<TextStyle> = (theme) => ({
  fontSize: 18,
  fontWeight: "700",
  color: theme.colors.text,
  marginTop: 16,
  textAlign: "center",
})

const $subtitle: ThemedStyle<TextStyle> = (theme) => ({
  fontSize: 14,
  color: theme.colors.textDim,
  marginTop: 8,
  textAlign: "center",
  lineHeight: 20,
})
