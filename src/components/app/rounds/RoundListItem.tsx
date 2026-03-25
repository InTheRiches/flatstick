import { Ionicons } from "@expo/vector-icons"
import { FC, useState } from "react"
import { Pressable, View, type TextStyle, type ViewStyle } from "react-native"

import Scorecard from "@/components/app/golf/Scorecard/Scorecard"
import { Button } from "@/components/ui/Button"
import { Text } from "@/components/ui/Text"
import type { RoundSession } from "@/models/round.session.types"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import { ScorecardHole } from "../golf/Scorecard/types"

interface RoundListItemProps {
    round: RoundSession
    onEdit: (roundId: string) => void
}

type ParDiff = "under" | "even" | "over"

function formatDate(isoDate: string): string {
    const d = new Date(isoDate)
    return `${d.getMonth() + 1}/${d.getDate()}/${String(d.getFullYear()).slice(-2)}`
}

function formatToPar(toPar: number): string {
    if (toPar === 0) return "E"
    return toPar > 0 ? `+${toPar}` : `${toPar}`
}

function getParDiff(toPar: number): ParDiff {
    if (toPar < 0) return "under"
    if (toPar === 0) return "even"
    return "over"
}

function formatSG(sg?: number): string {
    if (sg == null) return "—"
    return sg > 0 ? `+${sg.toFixed(1)}` : sg.toFixed(1)
}

function formatPct(numerator: number, denominator?: number): string {
    if (denominator === undefined) return `${Math.round(numerator * 100)}%`
    if (denominator === 0) return "—"
    return `${Math.round((numerator / denominator) * 100)}%`
}

export const RoundListItem: FC<RoundListItemProps> = ({ round, onEdit }) => {
    const { themed, theme } = useAppTheme()
    const [isExpanded, setIsExpanded] = useState(false)

    const { meta, stats, holes } = round
    const toPar = formatToPar(stats?.scoreToPar ?? 0)
    const parDiff = getParDiff(stats?.scoreToPar ?? 0)

    const girPct = formatPct(stats?.girPercentage ?? 0)
    const firPct = formatPct(stats?.fairwayPercentage ?? 0)
    const totalPutts = stats?.putts ?? 0
    const sgTotal = formatSG(stats?.strokesGained?.total)

    const scorecardHoles: ScorecardHole[] = holes.map((h) => ({
        par: h.par,
        score: h.score,
    }))

    return (
        <Pressable
            onPress={() => setIsExpanded((prev) => !prev)}
            style={({ pressed }) => [themed($card), pressed && themed($cardPressed)]}
        >
            {/* Header row */}
            <View style={$headerRow}>
                {/* Score badge */}
                <View style={themed($scoreBadge(parDiff))}>
                    <Text style={themed($scoreBadgeText(parDiff))}>{toPar}</Text>
                </View>

                {/* Course info */}
                <View style={$courseInfo}>
                    <Text style={themed($courseName)} numberOfLines={1}>
                        {meta.courseName ?? "Unknown Course"}
                    </Text>
                    <Text style={themed($courseSubtitle)} numberOfLines={1}>
                        {meta.clubName ? `${meta.clubName} · ` : ""}
                        {meta.teebox.name} · Par {meta.teebox.par}
                    </Text>
                </View>

                {/* Date + chevron */}
                <View style={$dateChevron}>
                    <Text style={themed($dateText)}>{formatDate(meta.date)}</Text>
                    <Ionicons
                        name={isExpanded ? "chevron-up" : "chevron-down"}
                        size={16}
                        color={theme.colors.textDim2}
                        style={$chevronIcon as TextStyle}
                    />
                </View>
            </View>

            {/* Expanded content */}
            {isExpanded && (
                <>
                    <View style={themed($divider)} />

                    {/* Compact inline stats row */}
                    <View style={$statsRow}>
                        <InlineStat label="GIR%" value={girPct} />
                        <View style={themed($statSep)} />
                        <InlineStat label="FIR%" value={firPct} />
                        <View style={themed($statSep)} />
                        <InlineStat label="Putts" value={`${totalPutts}`} />
                        <View style={themed($statSep)} />
                        <InlineStat label="SG" value={sgTotal} />
                    </View>

                    {/* Scorecard */}
                    <Scorecard
                        variant="round"
                        holes={scorecardHoles}
                        roundedTop
                        roundedBottom
                        topMargin={false}
                    />

                    <View style={$actionsRow}>
                        <Button text="Edit Round" onPress={() => onEdit(round.id)} style={$editButton} />
                    </View>
                </>
            )}
        </Pressable>
    )
}

// ── Subcomponents ──────────────────────────────────────────────────────────────

interface InlineStatProps {
    label: string
    value: string
}

const InlineStat: FC<InlineStatProps> = ({ label, value }) => {
    const { themed } = useAppTheme()
    return (
        <View style={$inlineStat}>
            <Text style={themed($inlineStatValue)}>{value}</Text>
            <Text style={themed($inlineStatLabel)}>{label}</Text>
        </View>
    )
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const $card: ThemedStyle<ViewStyle> = (theme) => ({
    backgroundColor: theme.colors.backgrounds.elevated,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
})

const $cardPressed: ThemedStyle<ViewStyle> = (theme) => ({
    backgroundColor: theme.colors.backgrounds.default,
})

const $headerRow: ViewStyle = {
    flexDirection: "row",
    alignItems: "center",
}

const $scoreBadge =
    (parDiff: ParDiff): ThemedStyle<ViewStyle> =>
        (theme) => ({
            width: 38,
            height: 38,
            borderRadius: 24,
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
            backgroundColor:
                parDiff === "under"
                    ? theme.colors.tint
                    : parDiff === "over"
                        ? theme.colors.error
                        : theme.colors.backgrounds.default,
            borderWidth: 1,
            borderColor:
                parDiff === "under"
                    ? theme.colors.tint
                    : parDiff === "over"
                        ? theme.colors.error
                        : theme.colors.border,
        })

const $scoreBadgeText =
    (parDiff: ParDiff): ThemedStyle<TextStyle> =>
        (theme) => ({
            fontSize: 13,
            fontWeight: "700",
            color: parDiff === "under" || parDiff === "over" ? "#FFFFFF" : theme.colors.text,
        })

const $courseInfo: ViewStyle = {
    flex: 1,
    marginRight: 8,
}

const $courseName: ThemedStyle<TextStyle> = (theme) => ({
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.text,
})

const $courseSubtitle: ThemedStyle<TextStyle> = (theme) => ({
    fontSize: 13,
    color: theme.colors.textDim,
    marginTop: -6,
})

const $dateChevron: ViewStyle = {
    alignItems: "flex-end",
    gap: 4,
}

const $dateText: ThemedStyle<TextStyle> = (theme) => ({
    fontSize: 13,
    color: theme.colors.textDim,
})

const $chevronIcon: TextStyle = {
    marginTop: -6,
}

const $divider: ThemedStyle<ViewStyle> = (theme) => ({
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 10,
})

const $statsRow: ViewStyle = {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
}

const $inlineStat: ViewStyle = {
    flex: 1,
    alignItems: "center",
}

const $inlineStatValue: ThemedStyle<TextStyle> = (theme) => ({
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.text,
})

const $inlineStatLabel: ThemedStyle<TextStyle> = (theme) => ({
    fontSize: 11,
    color: theme.colors.textDim,
    marginTop: -6,
})

const $statSep: ThemedStyle<ViewStyle> = (theme) => ({
    width: 1,
    height: 28,
    backgroundColor: theme.colors.border,
})

const $scorecardWrap: ViewStyle = {
    marginHorizontal: -16,
}

const $actionsRow: ViewStyle = {
    marginTop: 10,
    alignItems: "flex-end",
}

const $editButton: ViewStyle = {
    width: 132,
    minHeight: 38,
}
