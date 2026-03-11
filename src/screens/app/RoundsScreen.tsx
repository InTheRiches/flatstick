import { FC } from "react"
import { ActivityIndicator, FlatList, RefreshControl, type ViewStyle } from "react-native"

import { RoundListItem } from "@/components/app/rounds/RoundListItem"
import { RoundsEmptyState } from "@/components/app/rounds/RoundsEmptyState"
import { RoundsFilterBar } from "@/components/app/rounds/RoundsFilterBar"
import { RoundsSearchBar } from "@/components/app/rounds/RoundsSearchBar"
import { FlatstickHeader } from "@/components/ui/FlatstickHeader"
import { Screen } from "@/components/ui/Screen"
import { useRoundsFilter } from "@/hooks/useRoundsFilter"
import type { RoundSession } from "@/models/round.session.types"
import { useAppTheme } from "@/theme/context"
import { $styles } from "@/theme/styles"
import { useSafeAreaInsetsStyle } from "@/utils/useSafeAreaInsetsStyle"

export const RoundsScreen: FC = function RoundsScreen() {
    const $containerInsets = useSafeAreaInsetsStyle(["top"])
    const { theme } = useAppTheme()

    const {
        filteredRounds,
        searchQuery,
        setSearchQuery,
        scoreFilter,
        setScoreFilter,
        sort,
        setSort,
        isLoading,
        refreshRounds,
    } = useRoundsFilter()

    return (
        <Screen contentContainerStyle={[$styles.screen, $containerInsets]}>
            <FlatstickHeader />

            <RoundsSearchBar value={searchQuery} onChangeText={setSearchQuery} />

            <RoundsFilterBar
                scoreFilter={scoreFilter}
                onScoreFilterChange={setScoreFilter}
                sort={sort}
                onSortChange={setSort}
            />

            {isLoading && filteredRounds.length === 0 ? (
                <ActivityIndicator style={$loader} size="large" color={theme.colors.tint} />
            ) : (
                <FlatList<RoundSession>
                    style={$list}
                    data={filteredRounds}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => <RoundListItem round={item} />}
                    ListEmptyComponent={<RoundsEmptyState />}
                    refreshControl={
                        <RefreshControl
                            refreshing={isLoading}
                            onRefresh={refreshRounds}
                            tintColor={theme.colors.tint}
                        />
                    }
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={filteredRounds.length === 0 ? $listContentEmpty : undefined}
                />
            )}
        </Screen>
    )
}

const $list: ViewStyle = {
    flex: 1,
}

const $listContentEmpty: ViewStyle = {
    flex: 1,
}

const $loader: ViewStyle = {
    flex: 1,
}