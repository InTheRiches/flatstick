import { Ionicons } from "@expo/vector-icons"
import { FC } from "react"
import { Pressable, ScrollView, type TextStyle, View, type ViewStyle } from "react-native"

import { Text } from "@/components/ui/Text"
import type { ScoreFilter, SortOrder } from "@/hooks/useRoundsFilter"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

interface RoundsFilterBarProps {
  scoreFilter: ScoreFilter
  onScoreFilterChange: (f: ScoreFilter) => void
  sort: SortOrder
  onSortChange: (s: SortOrder) => void
}

const SCORE_CHIPS: { label: string; value: ScoreFilter }[] = [
  { label: "All", value: "all" },
  { label: "Under Par", value: "under" },
  { label: "Even", value: "even" },
  { label: "Over Par", value: "over" },
]

export const RoundsFilterBar: FC<RoundsFilterBarProps> = ({
  scoreFilter,
  onScoreFilterChange,
  sort,
  onSortChange,
}) => {
  const { themed, theme } = useAppTheme()

  const toggleSort = () => onSortChange(sort === "newest" ? "oldest" : "newest")

  return (
    <View style={$row}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={$chipScroll}
        style={$chipScrollView}
      >
        {SCORE_CHIPS.map((chip) => {
          const active = scoreFilter === chip.value
          return (
            <Pressable
              key={chip.value}
              onPress={() => onScoreFilterChange(chip.value)}
              style={themed(active ? $chipActive : $chip)}
            >
              <Text style={themed(active ? $chipTextActive : $chipText)}>{chip.label}</Text>
            </Pressable>
          )
        })}
      </ScrollView>

      <Pressable onPress={toggleSort} style={themed($sortButton)}>
        <Ionicons
          name={sort === "newest" ? "arrow-down" : "arrow-up"}
          size={13}
          color={theme.colors.tint}
        />
        <Text style={themed($sortText)}>{sort === "newest" ? "Newest" : "Oldest"}</Text>
      </Pressable>
    </View>
  )
}

const $row: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 12,
}

const $chipScrollView: ViewStyle = {
  flex: 1,
}

const $chipScroll: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
  paddingRight: 8,
}

const $chip: ThemedStyle<ViewStyle> = (theme) => ({
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 20,
  borderWidth: 1,
  borderColor: theme.colors.border,
  backgroundColor: theme.colors.backgrounds.elevated,
})

const $chipActive: ThemedStyle<ViewStyle> = (theme) => ({
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 20,
  borderWidth: 1,
  borderColor: theme.colors.tint,
  backgroundColor: theme.colors.tint,
})

const $chipText: ThemedStyle<TextStyle> = (theme) => ({
  fontSize: 13,
  fontWeight: "500",
  color: theme.colors.textDim,
})

const $chipTextActive: ThemedStyle<TextStyle> = () => ({
  fontSize: 13,
  fontWeight: "600",
  color: "#FFFFFF",
})

const $sortButton: ThemedStyle<ViewStyle> = (theme) => ({
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: 10,
  paddingVertical: 6,
  borderRadius: 20,
  borderWidth: 1,
  borderColor: theme.colors.tint,
  backgroundColor: theme.colors.backgrounds.elevated,
  gap: 4,
  marginLeft: 8,
})

const $sortText: ThemedStyle<TextStyle> = (theme) => ({
  fontSize: 13,
  fontWeight: "600",
  color: theme.colors.tint,
})
