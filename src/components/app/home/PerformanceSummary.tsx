// PerformanceSummary.tsx
import React, { memo, useMemo } from "react"
import { TextStyle, View, ViewStyle } from "react-native"

import { Text } from "@/components/Text"
import { ThemedStyle } from "@/theme/types"
import { useAppTheme } from "@/theme/context"
import {$styles} from "@/theme/styles";

type DayKey = string // e.g. "2026-02-19"

export interface DailySummary {
    day: DayKey
    sgPutting: number // strokes gained putting vs baseline
    makePct6ft: number // 0..1
    threePuttRate: number // 0..1
    avgMissIn: number // inches
    rounds?: number
}

/**
 * Shows last-7-day averages + improvement vs previous 7 days.
 * Generates fake data internally for demonstration.
 */
export const PerformanceSummary = memo(function PerformanceSummary() {
    const { themed, theme } = useAppTheme()

    const series = useMemo(() => {
        return normalizeAndSort(generateFake14Days())
    }, [])

    const hasEnoughFor7 = series.length >= 7
    const hasEnoughForCompare = series.length >= 14

    const current7 = hasEnoughFor7 ? series.slice(-7) : []
    const prev7 = hasEnoughForCompare ? series.slice(-14, -7) : []

    const currentAgg = hasEnoughFor7 ? aggregate7(current7) : null
    const prevAgg = hasEnoughForCompare ? aggregate7(prev7) : null

    const delta = currentAgg && prevAgg ? computeDelta(currentAgg, prevAgg) : null

    const improvements = useMemo(() => {
        if (!delta) return null
        return {
            sgPutting: classify(delta.sgPutting, "higher"),
            makePct6ft: classify(delta.makePct6ft, "higher"),
            threePuttRate: classify(delta.threePuttRate, "lower"),
            avgMissIn: classify(delta.avgMissIn, "lower"),
        }
    }, [delta])

    return (
        <View style={[themed($container)]}>
            <Text style={$styles.sectionHeader}>Last 7 Days</Text>

            {!hasEnoughFor7 || !currentAgg ? (
                <View style={themed($placeholderCard)}>
                    <Text style={themed($placeholderTitle)}>No summary yet</Text>
                    <Text style={themed($placeholderBody)}>
                        Complete a few sessions and your weekly trends will show up here.
                    </Text>
                </View>
            ) : (
                <View style={themed($card)}>
                    {/* Big SG row */}
                    <View style={themed($sgRow)}>
                        <View>
                            <Text style={themed($sgLabel)}>Strokes Gained (Putting)</Text>
                            <Text style={themed($sgValue)}>{fmtSigned(currentAgg.sgPutting, 2)}</Text>
                        </View>

                        {delta ? (
                            <View>
                                <Text style={themed($comparisonLabel)}>vs last week</Text>
                                <Text style={getDeltaTextStyle(delta.sgPutting, "higher", theme)}>
                                    {fmtSigned(delta.sgPutting, 2)}
                                </Text>
                            </View>
                        ) : (
                            <Text style={themed($comparisonMuted)}>Need 14 days</Text>
                        )}
                    </View>

                    {/* Other metrics grid */}
                    <View style={themed($grid)}>
                        <MetricTile
                            title="Make % (≤ 6 ft)"
                            value={`${Math.round(currentAgg.makePct6ft * 100)}%`}
                            delta={delta?.makePct6ft}
                            betterWhen="higher"
                        />

                        <MetricTile
                            title="3-putt rate"
                            value={`${Math.round(currentAgg.threePuttRate * 100)}%`}
                            delta={delta?.threePuttRate}
                            betterWhen="lower"
                        />

                        <MetricTile
                            title="Avg miss"
                            value={`${currentAgg.avgMissIn.toFixed(1)} in`}
                            delta={delta?.avgMissIn}
                            betterWhen="lower"
                        />

                        <MetricTile
                            title="Sessions"
                            value={`${currentAgg.sessions}`}
                            delta={delta ? currentAgg.sessions - prevAgg!.sessions : undefined}
                            betterWhen="higher"
                            isCount
                        />
                    </View>

                    {/* Improvement hint */}
                    {improvements && (
                        <View style={themed($hintRow)}>
                            <Text style={themed($hintText)}>
                                {buildImprovementSentence(currentAgg, delta!, improvements)}
                            </Text>
                        </View>
                    )}
                </View>
            )}
        </View>
    )

    function MetricTile(props: {
        title: string
        value: string
        delta?: number
        betterWhen: "higher" | "lower"
        isCount?: boolean
    }) {
        const { title, value, delta, betterWhen, isCount } = props

        return (
            <View style={themed($tile)}>
                <Text style={themed($tileTitle)}>{title}</Text>
                <View style={themed($tileValueRow)}>
                    <Text style={themed($tileValue)}>{value}</Text>
                    {delta === undefined ? (
                        <Text style={themed($comparisonMuted)}>—</Text>
                    ) : (
                        <Text style={getDeltaTextStyle(delta, betterWhen, theme)}>
                            {isCount
                                ? `${delta > 0 ? "+" : ""}${Math.round(delta)}`
                                : fmtSigned(delta, 2)}
                        </Text>
                    )}
                </View>
            </View>
        )
    }
})

// Helper to get delta text color based on value direction
function getDeltaTextStyle(value: number, betterWhen: "higher" | "lower", theme: any): TextStyle {
    const isPositiveBetter = betterWhen === "higher" ? value > 0 : value < 0
    const isNeutral = Math.abs(value) < 0.0001

    if (isNeutral) {
        return { fontSize: 13, fontWeight: "600" as const, color: "#999" }
    }
    const color = isPositiveBetter ? theme.colors.palette.emerald : theme.colors.palette.error
    return {
        fontSize: 13,
        fontWeight: "700" as const,
        color,
    }
}

/* -------------------- helpers -------------------- */

function normalizeAndSort(data: DailySummary[]): DailySummary[] {
    return [...data].sort((a, b) => (a.day < b.day ? -1 : a.day > b.day ? 1 : 0))
}

function aggregate7(days: DailySummary[]) {
    const sessions = days.reduce((acc, d) => acc + (d.rounds ?? 1), 0)

    // Use means
    const sgPutting = mean(days.map((d) => d.sgPutting))
    const makePct6ft = mean(days.map((d) => d.makePct6ft))
    const threePuttRate = mean(days.map((d) => d.threePuttRate))
    const avgMissIn = mean(days.map((d) => d.avgMissIn))

    return { sgPutting, makePct6ft, threePuttRate, avgMissIn, sessions }
}

function computeDelta(curr: ReturnType<typeof aggregate7>, prev: ReturnType<typeof aggregate7>) {
    return {
        sgPutting: curr.sgPutting - prev.sgPutting,
        makePct6ft: curr.makePct6ft - prev.makePct6ft,
        threePuttRate: curr.threePuttRate - prev.threePuttRate,
        avgMissIn: curr.avgMissIn - prev.avgMissIn,
    }
}

function mean(xs: number[]) {
    if (!xs.length) return 0
    return xs.reduce((a, b) => a + b, 0) / xs.length
}

function fmtSigned(n: number, decimals = 2) {
    const s = n >= 0 ? "+" : ""
    return `${s}${n.toFixed(decimals)}`
}

function classify(delta: number, betterWhen: "higher" | "lower") {
    if (Math.abs(delta) < 1e-9) return "flat" as const
    const improved = betterWhen === "higher" ? delta > 0 : delta < 0
    return improved ? ("up" as const) : ("down" as const)
}

function buildImprovementSentence(
    curr: { sgPutting: number; makePct6ft: number; threePuttRate: number; avgMissIn: number; sessions: number },
    delta: { sgPutting: number; makePct6ft: number; threePuttRate: number; avgMissIn: number },
    imp: { sgPutting: "up" | "down" | "flat"; makePct6ft: "up" | "down" | "flat"; threePuttRate: "up" | "down" | "flat"; avgMissIn: "up" | "down" | "flat" },
) {
    const bits: string[] = []

    // pick 2 most meaningful
    bits.push(`SG ${fmtSigned(delta.sgPutting, 2)}`)
    bits.push(`Make % ${delta.makePct6ft >= 0 ? "+" : ""}${Math.round(delta.makePct6ft * 100)}%`)
    bits.push(
        `3-putt ${delta.threePuttRate >= 0 ? "+" : ""}${Math.round(delta.threePuttRate * 100)}%`,
    )
    bits.push(`Miss ${delta.avgMissIn >= 0 ? "+" : ""}${delta.avgMissIn.toFixed(1)} in`)

    // quick "best news" selection: prefer improvements (based on direction)
    const scored = [
        { k: "sgPutting", txt: bits[0], improved: imp.sgPutting === "up", mag: Math.abs(delta.sgPutting) },
        { k: "makePct6ft", txt: bits[1], improved: imp.makePct6ft === "up", mag: Math.abs(delta.makePct6ft) },
        { k: "threePuttRate", txt: bits[2], improved: imp.threePuttRate === "up", mag: Math.abs(delta.threePuttRate) },
        { k: "avgMissIn", txt: bits[3], improved: imp.avgMissIn === "up", mag: Math.abs(delta.avgMissIn) },
    ]
        .sort((a, b) => Number(b.improved) - Number(a.improved) || b.mag - a.mag)
        .slice(0, 2)

    const headline = scored.map((s) => s.txt).join(" • ")
    return `Trend: ${headline} (last 7 days vs previous 7).`
}

/* -------------------- fake data (temporary) -------------------- */

function generateFake14Days(): DailySummary[] {
    // Creates 14 days with a slight improvement trend in the most recent 7.
    const today = new Date()
    const days: DailySummary[] = []

    for (let i = 13; i >= 0; i--) {
        const d = new Date(today)
        d.setDate(today.getDate() - i)

        const iso = d.toISOString().slice(0, 10)

        // older week slightly worse, newer week slightly better
        const weekIdx = i >= 7 ? 0 : 1
        const noise = (n: number) => (Math.random() - 0.5) * n

        const sgBase = weekIdx === 0 ? -0.15 : +0.25
        const makeBase = weekIdx === 0 ? 0.54 : 0.61
        const threeBase = weekIdx === 0 ? 0.12 : 0.085
        const missBase = weekIdx === 0 ? 8.4 : 6.9

        days.push({
            day: iso,
            sgPutting: sgBase + noise(0.18),
            makePct6ft: clamp01(makeBase + noise(0.05)),
            threePuttRate: clamp01(threeBase + noise(0.03)),
            avgMissIn: Math.max(2.5, missBase + noise(1.4)),
            rounds: Math.random() > 0.25 ? 1 : 0,
        })
    }

    return days
}

function clamp01(x: number) {
    return Math.max(0, Math.min(1, x))
}

/* -------------------- themed styles -------------------- */

const $container: ThemedStyle<ViewStyle> = () => ({
    gap: 8,
    marginTop: 16
})

const $card: ThemedStyle<ViewStyle> = (theme) => ({
    backgroundColor: theme.colors.backgrounds.elevated,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
})

const $placeholderCard: ThemedStyle<ViewStyle> = (theme) => ({
    backgroundColor: theme.colors.backgrounds.elevated,
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 6,
})

const $placeholderTitle: ThemedStyle<TextStyle> = (theme) => ({
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.text,
})

const $placeholderBody: ThemedStyle<TextStyle> = (theme) => ({
    fontSize: 12,
    lineHeight: 16,
    color: theme.colors.textDim,
})

const $sgRow: ThemedStyle<ViewStyle> = () => ({
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
})

const $sgLabel: ThemedStyle<TextStyle> = (theme) => ({
    fontSize: 11,
    color: theme.colors.textDim,
})

const $sgValue: ThemedStyle<TextStyle> = (theme) => ({
    fontSize: 20,
    fontWeight: "800",
    color: theme.colors.text
})

const $grid: ThemedStyle<ViewStyle> = () => ({
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
})

const $tile: ThemedStyle<ViewStyle> = (theme) => ({
    width: "48%",
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
})

const $tileTitle: ThemedStyle<TextStyle> = (theme) => ({
    fontSize: 11,
    color: theme.colors.textDim,
})

const $tileValueRow: ThemedStyle<ViewStyle> = () => ({
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
    marginTop: -4
})

const $tileValue: ThemedStyle<TextStyle> = (theme) => ({
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.text,
})

const $hintRow: ThemedStyle<ViewStyle> = () => ({
    marginTop: 4,
})

const $hintText: ThemedStyle<TextStyle> = (theme) => ({
    fontSize: 11,
    color: theme.colors.textDim,
})

const $comparisonLabel: ThemedStyle<TextStyle> = (theme) => ({
    fontSize: 11,
    color: theme.colors.textDim,
})

const $comparisonMuted: ThemedStyle<TextStyle> = (theme) => ({
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.textDim,
})


