// PracticeModes.tsx
import React, { memo } from "react"
import { Pressable, TextStyle, View, ViewStyle } from "react-native"

import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import {ThemedStyle} from "@/theme/types";

type PracticeModeKey = "greenSim" | "puttingOnly" | "fullRound"

export interface PracticeModeLastResult {
    primaryStat?: string
    secondaryStat?: string
    summary?: string
    whenLabel?: string
    sessionsLabel?: string // e.g. "6 rounds"
}

export const PracticeModes = memo(function PracticeModes() {
    const { themed, theme } = useAppTheme()

    return (
        <View style={[themed($container)]}>
            {/* Header */}
            <Text style={themed($title)}>Start Practice</Text>

            {/* Pods */}
            <View style={themed($podsWrap)}>
                <Pressable
                    onPress={() => {}}
                    style={({ pressed }) => [themed($pod), pressed && themed($podPressed)]}
                    accessibilityRole="button"
                    accessibilityLabel={`Start full round mode.`}
                >
                    {/* Top row */}
                    <View style={themed($podTopRow)}>
                        <View style={[themed($accentDot), { backgroundColor: theme.colors.tint }]} />
                        <Text style={themed($podTitle)}>Full Round</Text>
                        <Text style={themed($chevron)}>›</Text>
                    </View>

                    <Text style={themed($podDescription)}>Comprehensive round with scoring and putting</Text>

                    {/* Last stats row */}
                    <View style={themed($divider)} />

                    <View style={themed($lastRow)}>
                        <View style={$lastSession}>
                            <Text style={themed($statLabel)}>Last session</Text>
                            <Text style={themed($statValue)} numberOfLines={1}>12/15/25</Text>
                        </View>
                        <View style={$stat}>
                            <Text style={themed($statLabel)}>SG</Text>
                            <Text style={themed($statValue)} numberOfLines={1}>+4.2</Text>
                        </View>
                    </View>
                    {/*<View style={themed($emptyState)}>*/}
                    {/*    <Text style={themed($emptyTitle)}>No sessions yet</Text>*/}
                    {/*</View>*/}
                </Pressable>
                <Pressable
                    onPress={() => {}}
                    style={({ pressed }) => [themed($pod), pressed && themed($podPressed)]}
                    accessibilityRole="button"
                    accessibilityLabel={`Start putting only practice mode.`}
                >
                    {/* Top row */}
                    <View style={themed($podTopRow)}>
                        <View style={[themed($accentDot), { backgroundColor: theme.colors.tint }]} />
                        <Text style={themed($podTitle)}>Putting Only</Text>
                        <Text style={themed($chevron)}>›</Text>
                    </View>

                    <Text style={themed($podDescription)}>Putting insights on the course</Text>

                    {/* Last stats row */}
                    <View style={themed($divider)} />

                    <View style={themed($lastRow)}>
                        <View style={$lastSession}>
                            <Text style={themed($statLabel)}>Last session</Text>
                            <Text style={themed($statValue)} numberOfLines={1}>12/15/25</Text>
                        </View>
                        <View style={$stat}>
                            <Text style={themed($statLabel)}>SG</Text>
                            <Text style={themed($statValue)} numberOfLines={1}>+4.2</Text>
                        </View>
                    </View>
                    <View style={themed($emptyState)}>
                        <Text style={themed($emptyTitle)}>No sessions yet</Text>
                    </View>
                </Pressable>
            </View>
            <Pressable
                onPress={() => {}}
                style={({ pressed }) => [themed($bottomPod), pressed && themed($podPressed)]}
                accessibilityRole="button"
                accessibilityLabel={`Start green simulation mode.`}
            >
                {/* Top row */}
                <View style={themed($podTopRow)}>
                    <View style={[themed($accentDot), { backgroundColor: theme.colors.tint }]} />
                    <Text style={themed($podTitle)}>Green Simulation</Text>
                    <Text style={themed($chevron)}>›</Text>
                </View>

                <Text style={themed($podDescription)}>A simulated make-or-break round on a putting green with break + slope.</Text>

                {/* Last stats row */}
                <View style={themed($divider)} />

                <View style={themed($lastRow)}>
                    <View style={$stat}>
                        <Text style={themed($statLabel)}>Last session</Text>
                        <Text style={themed($statValue)} numberOfLines={1}>12/15/25</Text>
                    </View>
                    <View style={$stat}>
                        <Text style={themed($statLabel)}>SG</Text>
                        <Text style={themed($statValue)} numberOfLines={1}>+4.2</Text>
                    </View>
                </View>
                <View style={themed($emptyState)}>
                    <Text style={themed($emptyTitle)}>No sessions yet</Text>
                </View>
            </Pressable>
        </View>
    )
})

/* -------------------- themed styles -------------------- */

const $container: ThemedStyle<ViewStyle> = (theme) => ({
    gap: 12,
})

const $title: ThemedStyle<TextStyle> = (theme) => ({
    fontSize: 18,
    textAlign: "left",
    width: "100%",
    fontWeight: "700",
})

const $podsWrap: ThemedStyle<ViewStyle> = () => ({
    gap: 12,
    flexDirection: "row",
    width: "100%",
})

const $pod: ThemedStyle<ViewStyle> = (theme) => ({
    backgroundColor: theme.colors.backgrounds.elevated,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    flex: 1,
})

const $bottomPod: ThemedStyle<ViewStyle> = (theme) => ({
    backgroundColor: theme.colors.backgrounds.elevated,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
})

const $podPressed: ThemedStyle<ViewStyle> = (theme) => ({
    opacity: 0.9,
    borderColor: theme.colors.tint,
})

const $podTopRow: ThemedStyle<ViewStyle> = () => ({
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
})

const $accentDot: ThemedStyle<ViewStyle> = () => ({
    width: 10,
    height: 10,
    borderRadius: 999,
})

const $podTitle: ThemedStyle<TextStyle> = (theme) => ({
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.text,
})

const $chevron: ThemedStyle<TextStyle> = (theme) => ({
    fontSize: 22,
    lineHeight: 22,
    fontWeight: "700",
    color: theme.colors.palette.emerald,
    marginLeft: 6,
})

const $podDescription: ThemedStyle<TextStyle> = (theme) => ({
    fontSize: 13,
    lineHeight: 18,
    color: theme.colors.textDim,
})

const $divider: ThemedStyle<ViewStyle> = (theme) => ({
    width: "100%",
    height: 1,
    backgroundColor: theme.colors.border,
    marginTop: 10,
    marginBottom: 6,
})

const $lastRow: ThemedStyle<ViewStyle> = () => ({
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
})

const $stat: ViewStyle = {
    flex: 0.5,
    flexDirection: "column",
}

const $lastSession: ViewStyle = {
    flex: 1,
    flexDirection: "column",
}

const $statLabel: ThemedStyle<TextStyle> = (theme) => ({
    fontSize: 12,
    color: theme.colors.textDim,
})

const $statValue: ThemedStyle<TextStyle> = (theme) => ({
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: "600",
    marginTop: -4
})

const $emptyState: ThemedStyle<ViewStyle> = () => ({
    flex: 1,
    gap: 2,
})

const $emptyTitle: ThemedStyle<TextStyle> = (theme) => ({
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.text,
})

const $emptyHint: ThemedStyle<TextStyle> = (theme) => ({
    fontSize: 12,
    color: theme.colors.textDim,
    marginTop: -8
})