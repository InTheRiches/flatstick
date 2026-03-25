import { useRouter } from "expo-router"
import React, { FC, useMemo } from "react"
import {
    Alert,
    FlatList,
    Pressable,
    TextStyle,
    View,
    ViewStyle,
} from "react-native"

import HoleSummaryModal, { type HoleSummaryModalHandle } from "@/components/app/golf/modals/HoleSummaryModal"
import WarningModal from "@/components/app/golf/modals/WarningModal"
import Scorecard from "@/components/app/golf/Scorecard/Scorecard"
import { ScorecardHole } from "@/components/app/golf/Scorecard/types"
import PageHeader from "@/components/headers/PageHeader"
import { Button } from "@/components/ui/Button"
import { Screen } from "@/components/ui/Screen"
import { Text } from "@/components/ui/Text"
import { useRoundEdit } from "@/context/RoundEditProvider"
import type { RoundHoleSummary } from "@/models/round.session.types"
import { useAppTheme } from "@/theme/context"
import { $styles } from "@/theme/styles"
import type { ThemedStyle } from "@/theme/types"

interface RoundEditOverviewScreenProps {
    roundId: string
}

export const RoundEditOverviewScreen: FC<RoundEditOverviewScreenProps> = ({ roundId }) => {
    const router = useRouter()
    const { themed, theme } = useAppTheme()
    const { editableRound, isDirty, isSaving, saveChanges, discardChanges, commitHoleSummary } = useRoundEdit()
    const [pendingHoleNumber, setPendingHoleNumber] = React.useState<number | null>(null)

    const holeSummaryRef = React.useRef<HoleSummaryModalHandle>(null)
    const addDataModalRef = React.useRef<any>(null)

    const openHoleSummaryModal = React.useCallback((holeNumber: number) => {
        if (!editableRound) return

        const targetHole: RoundHoleSummary =
            editableRound.holes.find((hole) => hole.hole === holeNumber) ?? {
                hole: holeNumber,
                par: (editableRound.meta.scorecard[holeNumber - 1]?.par ?? 4) as RoundHoleSummary["par"],
                score: editableRound.meta.scorecard[holeNumber - 1]?.par ?? 4,
                penalties: 0,
                putts: 2,
                fairwayHit: false,
                gir: false,
                shotIds: [],
                pinLocation: { lat: 0, lon: 0 },
            }

        const runningScore = editableRound.holes
            .filter((h) => h.hole <= holeNumber)
            .reduce((sum, h) => sum + (h.score - h.par), 0)

        holeSummaryRef.current?.present({
            hole: targetHole,
            holeShots: editableRound.shots
                .filter((shot) => shot.hole === holeNumber)
                .map((shot) => ({ category: shot.category, club: shot.club })),
            runningScore,
            playerName: "Hayden Williams",
        })
    }, [editableRound])

    const totals = useMemo(() => {
        if (!editableRound) return null
        const played = editableRound.holes.length
        const totalScore = editableRound.holes.reduce((sum, h) => sum + h.score, 0)
        const totalPutts = editableRound.holes.reduce((sum, h) => sum + h.putts, 0)
        const girHits = editableRound.holes.filter((h) => h.gir).length
        const firEligible = editableRound.holes.filter((h) => h.par > 3).length
        const firHits = editableRound.holes.filter((h) => h.par > 3 && h.fairwayHit).length

        return {
            played,
            totalScore,
            totalPutts,
            girHits,
            firHits,
            firEligible,
        }
    }, [editableRound])

    const teeColor = useMemo(() => {
        const name = editableRound?.meta?.teebox?.name
        if (!name) return undefined
        const n = name.toLowerCase()
        const mapping: Record<string, string> = {
            red: "#D9534F",
            blue: "#007bff",
            white: "#ffffff",
            black: "#000000",
            yellow: "#FFC107",
            gold: "#D4AF37",
            silver: "#C0C0C0",
            green: "#28a745",
            orange: "#fd7e14",
            purple: "#6f42c1",
            pink: "#e83e8c",
            brown: "#8B4513",
            navy: "#001f3f",
        }

        for (const key of Object.keys(mapping)) {
            if (n.includes(key)) return mapping[key]
        }

        return undefined
    }, [editableRound?.meta?.teebox?.name])

    const handleExit = () => {
        if (!isDirty) {
            router.back()
            return
        }

        Alert.alert("Unsaved changes", "Save your round edits before leaving?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Discard",
                style: "destructive",
                onPress: () => {
                    discardChanges()
                    router.back()
                },
            },
            {
                text: "Save",
                onPress: async () => {
                    await saveChanges()
                    router.back()
                },
            },
        ])
    }

    if (!editableRound || !totals) {
        return (
            <Screen preset="fixed" contentContainerStyle={$styles.screen}>
                <View style={$centered}>
                    <Text text="Round not found" />
                    <Button text="Back" onPress={() => router.back()} style={$inlineButton} />
                </View>
            </Screen>
        )
    }

    const scorecardHoles: ScorecardHole[] = useMemo(() => {
        const holesByNumber = new Map(editableRound.holes.map((hole) => [hole.hole, hole]))
        const totalHoles = Math.max(
            editableRound.meta.teebox.number_of_holes ?? 0,
            editableRound.meta.scorecard.length,
        )

        return Array.from({ length: totalHoles }, (_, index) => {
            const holeNumber = index + 1
            const hole = holesByNumber.get(holeNumber)

            if (hole) {
                return {
                    par: hole.par,
                    score: hole.score,
                    hasData: true,
                }
            }

            return {
                par: editableRound.meta.scorecard[index]?.par ?? 4,
                score: -1,
                hasData: false,
            }
        })
    }, [editableRound.holes, editableRound.meta.scorecard, editableRound.meta.teebox.number_of_holes])

    return (
        <Screen preset="scroll" contentContainerStyle={$styles.screen}>
            <PageHeader title="Edit Round" />
            <View style={themed($descriptor)}>
                <Text text={editableRound.meta.courseName ?? "Round"} style={themed($title)} />
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                    <Text
                        text={`GIR ${totals.girHits}/${totals.played}  •  FIR ${totals.firHits}/${totals.firEligible}   • `}
                        style={themed($subtitle)}
                    />
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        {teeColor ? <View style={[themed($teeSwatch), { backgroundColor: teeColor }]} /> : null}
                        <Text
                            text={`${editableRound.meta.teebox.name}  •  Par ${editableRound.meta.teebox.par}`}
                            style={themed($subtitle)}
                        />
                    </View>
                </View>
            </View>

            <Scorecard
                variant="round"
                holes={scorecardHoles}
                roundedTop
                roundedBottom
                backgroundColor={theme.colors.backgrounds.elevated}
                topMargin={false}
                onSelectHole={(hole) => {
                    const hasExistingData = editableRound.holes.some((entry) => entry.hole === hole)
                    if (!hasExistingData) {
                        setPendingHoleNumber(hole)
                        addDataModalRef.current?.present()
                        return
                    }

                    openHoleSummaryModal(hole)
                }}
            />
            <Text
                text={`Click on a hole to edit details like score, putts, GIR, and more.`}
                style={themed($description)}
            />

            <FlatList
                data={[...editableRound.holes].sort((a, b) => a.hole - b.hole)}
                keyExtractor={(item) => String(item.hole)}
                scrollEnabled={false}
                renderItem={({ item }) => (
                    <Pressable
                        style={themed($holeCard)}
                        onPress={() => router.push(`/(app)/round-edit/${roundId}/hole/${item.hole}` as never)}
                    >
                        <View style={$holeRow}>
                            <Text text={`Hole ${item.hole}`} style={themed($holeTitle)} />
                            <Text text={`Par ${item.par}`} style={themed($holeMeta)} />
                        </View>
                        <Text
                            text={`Score ${item.score}  •  Putts ${item.putts}  •  FIR ${item.fairwayHit ? "Y" : "N"}  •  GIR ${item.gir ? "Y" : "N"}`}
                            style={themed($holeMeta)}
                        />
                    </Pressable>
                )}
            />
            <Button
                text={isSaving ? "Saving..." : "Save"}
                onPress={saveChanges}
                disabled={!isDirty || isSaving}
                style={$inlineButton}
            />
            <HoleSummaryModal
                reference={holeSummaryRef}
                onCommit={(committedHole) => {
                    commitHoleSummary(committedHole)
                }}
            />
            <WarningModal
                reference={addDataModalRef}
                header={"Add Data?"}
                subtext={"You did not record any data for this hole. Do you want to add details like score, putts, and more?"}
                onAction={() => {
                    addDataModalRef.current?.dismiss()
                    if (pendingHoleNumber != null) {
                        openHoleSummaryModal(pendingHoleNumber)
                    }
                }}
                actionText="Add Data"
            />
        </Screen>
    )
}

const $centered: ViewStyle = {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
}

const $headerRow: ViewStyle = {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
}

const $inlineButton: ViewStyle = {
    width: 100,
}

const $descriptor: ViewStyle = {
    marginBottom: 12
}

const $title: ThemedStyle<TextStyle> = (theme) => ({
    color: theme.colors.text,
    fontWeight: "700",
    fontSize: 20
})

const $subtitle: ThemedStyle<TextStyle> = (theme) => ({
    color: theme.colors.textDim,
    fontWeight: 500,
    fontSize: 15
})

const $description: TextStyle = {
    lineHeight: 16,
    marginTop: 8,
    fontSize: 14,
    marginBottom: 16,
    fontWeight: 500,
    paddingHorizontal: 4
}

const $teeSwatch: ThemedStyle<ViewStyle> = (theme) => ({
    width: 14,
    height: 14,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginRight: 8,
})

const $holeCard: ThemedStyle<ViewStyle> = (theme) => ({
    backgroundColor: theme.colors.backgrounds.elevated,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 6,
    marginBottom: 8,
})

const $holeRow: ViewStyle = {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
}

const $holeTitle: ThemedStyle<TextStyle> = (theme) => ({
    color: theme.colors.text,
    fontWeight: "700",
})

const $holeMeta: ThemedStyle<TextStyle> = (theme) => ({
    color: theme.colors.textDim,
})
