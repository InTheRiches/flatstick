/**
 * HoleSummaryModal.tsx
 *
 * End-of-hole reconciliation & scoring modal shown when the player taps the
 * scorecard button during a round. Serves as the bridge between live tracking
 * data and hole summary state.
 *
 * Mode detection (internal, no prop needed):
 *   - "tracked"      → ShotAttempts already exist for this hole
 *   - "summary-only" → No shots recorded; generates synthetic ShotAttempts on commit
 *   - "hybrid"       → Partial shots exist; adjusts summary metadata only
 *
 * State contract:
 *   - Local state is ephemeral UI state initialized from LiveHoleState on open.
 *   - onCommit emits a HoleSummaryCommit delta — the hook applies it.
 *   - This modal never calls round.session.types transformation.
 */

import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import React, {
    useCallback,
    useImperativeHandle,
    useRef,
    useState,
} from "react";
import {
    StyleSheet,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle
} from "react-native";

import { BottomSheetModalFactory } from "@/components/app/modals/BottomSheetFactory";
import { Text } from "@/components/ui/Text";
import { WheelPicker } from "@/components/ui/WheelPicker";
import { generateSyntheticShots } from "@/hooks/courses/useRoundTracking";
import type {
    HolePar,
    HoleSummaryCommit,
    LiveHoleState,
    LiveShotAttempt,
    TeeDirection,
} from "@/models/round.live.types";
import { useAppTheme } from "@/theme/context";
import { ThemedStyle } from "@/theme/types";

// ─── Public API ───────────────────────────────────────────────────────────────

export interface HoleSummaryModalHandle {
    present: () => void;
    dismiss: () => void;
}

export interface HoleSummaryModalProps {
    reference: React.RefObject<HoleSummaryModalHandle | null>;
    /** Current hole state from useRoundTracking.holes[activeHole]. */
    hole: LiveHoleState | undefined;
    /** Shots already recorded for this hole (may be empty). */
    holeShots: LiveShotAttempt[];
    /** Running score relative to par across all completed holes. */
    runningScore: number;
    playerName: string;
    playerHandicap?: number;
    onCommit: (commit: HoleSummaryCommit) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRunningScore(n: number): string {
    if (n === 0) return "E";
    return n > 0 ? `+${n}` : `${n}`;
}

function deriveGIR(score: number, par: HolePar, putts: number): boolean {
    // GIR = on the green in par - 2 or fewer strokes
    const strokesToGreen = score - putts;
    return strokesToGreen <= par - 2;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface StepperProps {
    label: string;
    value: number;
    onDecrement: () => void;
    onIncrement: () => void;
    min?: number;
    max?: number;
    large?: boolean;
}

const Stepper: React.FC<StepperProps> = ({
    label,
    value,
    onDecrement,
    onIncrement,
    min = 0,
    max = 20,
    large = false,
}) => {
    const { theme } = useAppTheme();
    return (
        <View style={$stepperWrapper}>
            <Text style={[$sectionLabel, { color: theme.colors.textDim }]}>{label}</Text>
            <View
                style={[
                    $stepperPill,
                    {
                        backgroundColor: theme.colors.backgrounds.default,
                        borderColor: theme.colors.border,
                    },
                    large && $stepperPillLarge,
                ]}
            >
                <TouchableOpacity
                    onPress={onIncrement}
                    disabled={value >= max}
                    style={$stepperBtn}
                    hitSlop={8}
                >
                    <Text
                        style={[
                            $stepperSymbol,
                            { color: value >= max ? theme.colors.textDim : theme.colors.text },
                        ]}
                    >
                        +
                    </Text>
                </TouchableOpacity>
                <Text style={[$stepperValue, large && $stepperValueLarge, { color: theme.colors.text }]}>
                    {value}
                </Text>
                <TouchableOpacity
                    onPress={onDecrement}
                    disabled={value <= min}
                    style={$stepperBtn}
                    hitSlop={8}
                >
                    <Text
                        style={[
                            $stepperSymbol,
                            { color: value <= min ? theme.colors.textDim : theme.colors.text },
                        ]}
                    >
                        −
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

// ─── Tee shot direction wheel ─────────────────────────────────────────────────

const DIRECTIONS: { id: TeeDirection; label: string; row: number; col: number }[] = [
    { id: "long", label: "^", row: 0, col: 2 },
    { id: "far-left", label: "«", row: 1, col: 0 },
    { id: "slight-left", label: "‹", row: 1, col: 1 },
    { id: "center", label: "HIT", row: 1, col: 2 },
    { id: "slight-right", label: "›", row: 1, col: 3 },
    { id: "far-right", label: "»", row: 1, col: 4 },
    { id: "short", label: "^", row: 2, col: 2 },
];

interface TeeWheelProps {
    value: TeeDirection;
    onChange: (d: TeeDirection) => void;
    mishit: boolean;
    onMishitToggle: () => void;
}

const TeeWheel: React.FC<TeeWheelProps> = ({ value, onChange, mishit, onMishitToggle }) => {
    const { theme } = useAppTheme();

    const grid: (typeof DIRECTIONS[0] | null)[][] = [
        [null, null, null, null, null],
        [null, null, null, null, null],
        [null, null, null, null, null],
    ];
    DIRECTIONS.forEach((d) => {
        grid[d.row][d.col] = d;
    });

    return (
        <View style={$wheelWrapper}>
            <Text style={[$sectionLabel, { color: theme.colors.textDim }]}>Tee Shot</Text>
            {grid.map((row, ri) => (
                <View key={ri} style={$wheelRow}>
                    {row.map((cell, ci) => {
                        if (!cell) return <View key={ci} style={$wheelCell} />;
                        const isSelected = value === cell.id;
                        const isCenter = cell.id === "center";
                        return (
                            <TouchableOpacity
                                key={ci}
                                onPress={() => onChange(cell.id)}
                                style={[
                                    $wheelCell,
                                    $wheelBtn,
                                    isCenter && $wheelBtnCenter,
                                    isSelected && !isCenter && {
                                        backgroundColor: theme.colors.tint + "33",
                                        borderColor: theme.colors.tint,
                                    },
                                    isCenter && isSelected && { backgroundColor: "#4CAF50" },
                                    isCenter && !isSelected && {
                                        backgroundColor: theme.colors.backgrounds.default,
                                        borderColor: theme.colors.border,
                                    },
                                ]}
                            >
                                <Text
                                    style={[
                                        (isCenter ? $wheelBtnCenterLabel : $wheelBtnLabel),
                                        {
                                            color: isCenter
                                                ? isSelected
                                                    ? "#fff"
                                                    : theme.colors.text
                                                : isSelected
                                                    ? theme.colors.tint
                                                    : theme.colors.text,
                                            transform: cell.id === "short" ? [{ rotate: "180deg" }] : undefined,
                                            marginBottom: cell.id === "long" ? -10 : cell.id === "short" ? 10 : 0,
                                        },
                                    ]}
                                >
                                    {cell.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            ))}
            <TouchableOpacity
                onPress={onMishitToggle}
                style={[
                    $mishitChip,
                    {
                        backgroundColor: mishit
                            ? theme.colors.error + "22"
                            : theme.colors.backgrounds.default,
                        borderColor: mishit ? theme.colors.error : theme.colors.border,
                    },
                ]}
            >
                <Ionicons
                    name={mishit ? "close-circle" : "close-circle-outline"}
                    size={14}
                    color={mishit ? theme.colors.error : theme.colors.textDim}
                />
                <Text
                    style={[
                        $mishitLabel,
                        { color: mishit ? theme.colors.error : theme.colors.textDim },
                    ]}
                >
                    Mis-Hit
                </Text>
            </TouchableOpacity>
        </View>
    );
};

// ─── Main modal ───────────────────────────────────────────────────────────────

export default function HoleSummaryModal({
    reference,
    hole,
    holeShots,
    runningScore,
    playerName,
    playerHandicap,
    onCommit,
}: HoleSummaryModalProps) {
    const { theme, themed } = useAppTheme();
    const innerRef = useRef<BottomSheetModal>(null);

    // ── Mode detection ────────────────────────────────────────────────────────
    const hasTrackedShots = holeShots.length > 0;
    const existingTeeShot = holeShots.find((s) => s.category === "tee");

    // ── Local ephemeral UI state ──────────────────────────────────────────────
    // Initialized from hole state on open(); not authoritative until committed.

    const par = (hole?.par ?? 4) as HolePar;
    const derivedStrokes = (hole?.shotIds.length ?? 0) + (hole?.penaltyStrokes ?? 0);

    const [localScore, setLocalScore] = useState<number>(
        // Prefer an explicit persisted score if available, otherwise derive from
        // tracked shots + penalties, and finally fall back to par.
        hole?.score ?? (derivedStrokes > 0 ? derivedStrokes : par),
    );
    const [localPutts, setLocalPutts] = useState(hole?.putts ?? 2);
    const [localPenalties, setLocalPenalties] = useState(hole?.penaltyStrokes ?? 0);
    const [firstPuttDist, setFirstPuttDist] = useState(
        hole?.firstPuttDistanceYds ?? 0,
    );
    const [teeClubLabel, setTeeClubLabel] = useState<string>(
        existingTeeShot?.club.label ?? "Driver",
    );
    const [teeDirection, setTeeDirection] = useState<TeeDirection>("center");
    const [teeMishit, setTeeMishit] = useState(false);

    // ── Imperative handle ─────────────────────────────────────────────────────

    const resetLocalState = useCallback(() => {
        const current = hole;
        const strokes = (current?.shotIds.length ?? 0) + (current?.penaltyStrokes ?? 0);
        const teeShot = holeShots.find((s) => s.category === "tee");

        // Prefer an explicit persisted score (may be partial), else derive from
        // tracked shots + penalties, then fall back to par.
        setLocalScore(current?.score ?? (strokes > 0 ? strokes : (current?.par ?? 4)));
        setLocalPutts(current?.putts ?? 2);
        setLocalPenalties(current?.penaltyStrokes ?? 0);
        setFirstPuttDist(current?.firstPuttDistanceYds ?? 0);
        // Prefer any previously committed hole summary values, then fall back to
        // an existing tracked tee shot, then sensible defaults.
        setTeeClubLabel(hole?.teeClubLabel ?? teeShot?.club.label ?? "Driver");
        setTeeDirection(hole?.teeDirection ?? "center");
        setTeeMishit(hole?.teeMishit ?? false);
    }, [hole, holeShots]);

    useImperativeHandle(reference, () => ({
        present: () => {
            resetLocalState();
            innerRef.current?.present();
        },
        dismiss: () => {
            innerRef.current?.dismiss();
        },
    }));

    // ── Commit handler ────────────────────────────────────────────────────────

    const handleCommit = () => {
        const now = new Date().toISOString();
        const gir = deriveGIR(localScore, par, localPutts);

        let syntheticShots: LiveShotAttempt[] | undefined;

        if (!hasTrackedShots) {
            // Summary-only or clean hybrid → generate synthetic shots
            syntheticShots = generateSyntheticShots(
                hole?.holeNumber ?? 1,
                par,
                localScore,
                localPutts,
                localPenalties,
                teeClubLabel,
                now,
            );
        }

        const commit: HoleSummaryCommit = {
            holeNumber: hole?.holeNumber ?? 1,
            score: localScore,
            putts: localPutts,
            penaltyStrokes: localPenalties,
            greenInRegulation: gir,
            firstPuttDistanceYds: firstPuttDist > 0 ? firstPuttDist : undefined,
            teeClubLabel,
            teeDirection,
            teeMishit,
            syntheticShots,
        };

        onCommit(commit);
        innerRef.current?.dismiss();
    };

    // ── Club stepper (label-based cycling) ───────────────────────────────────

    const clubOptions = [
        { label: "Driver", value: "Driver" },
        { label: "3 Wood", value: "3 Wood" },
        { label: "5 Wood", value: "5 Wood" },
        { label: "4 Iron", value: "4 Iron" },
        { label: "5 Iron", value: "5 Iron" },
        { label: "6 Iron", value: "6 Iron" },
        { label: "7 Iron", value: "7 Iron" },
        { label: "8 Iron", value: "8 Iron" },
        { label: "9 Iron", value: "9 Iron" },
        { label: "Pitching Wedge", value: "Pitching Wedge" },
        { label: "Gap Wedge", value: "Gap Wedge" },
        { label: "Sand Wedge", value: "Sand Wedge" },
        { label: "Lob Wedge", value: "Lob Wedge" },
        { label: "Putter", value: "Putter" },
    ];

    // ── Score arithmetic guards ───────────────────────────────────────────────
    // putts can't exceed total score - penalties
    const maxPutts = Math.max(0, localScore - localPenalties - 1);

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <BottomSheetModalFactory
            reference={innerRef}
        >
            {/* ── Header ────────────────────────────────────────────────────── */}
            <View style={[$header, { borderBottomColor: theme.colors.border }]}>
                <View style={[$avatarPlaceholder, { backgroundColor: theme.colors.backgrounds.default }]}>
                    <Ionicons name="person" size={28} color={theme.colors.textDim} />
                </View>
                <View style={$headerInfo}>
                    <Text style={[$playerName, { color: theme.colors.text }]}>
                        {playerName}
                        {playerHandicap != null ? (
                            <Text style={[$handicap, { color: theme.colors.textDim }]}>
                                {" "}[{playerHandicap}]
                            </Text>
                        ) : null}
                    </Text>
                    <View style={$scoreRow}>
                        {/* <Text style={[$runningScore, { color: theme.colors.text }]}>
                            {formatRunningScore(runningScore)}
                        </Text> */}
                        <Text style={themed($runningScoreNum)}>
                            {runningScore >= 0 ? "+" : ""}{runningScore}
                        </Text>
                    </View>
                </View>
                <TouchableOpacity
                    onPress={handleCommit}
                    style={[$enterBtn, { backgroundColor: theme.colors.buttons.background }]}
                    activeOpacity={0.8}
                >
                    <Text style={$enterBtnLabel}>Enter</Text>
                </TouchableOpacity>
            </View>

            <View style={$body}>
                {/* ── Score / Putts / Tee Shot row ─────────────────────────── */}
                <View style={$row}>
                    <Stepper
                        label="Score"
                        value={localScore}
                        onDecrement={() => setLocalScore((v) => Math.max(1, v - 1))}
                        onIncrement={() => setLocalScore((v) => v + 1)}
                        min={1}
                        max={20}
                        large
                    />
                    <Stepper
                        label="Putts"
                        value={localPutts}
                        onDecrement={() => setLocalPutts((v) => Math.max(0, v - 1))}
                        onIncrement={() => setLocalPutts((v) => Math.min(maxPutts, v + 1))}
                        min={0}
                        max={maxPutts}
                        large
                    />
                    <TeeWheel
                        value={teeDirection}
                        onChange={setTeeDirection}
                        mishit={teeMishit}
                        onMishitToggle={() => setTeeMishit((v) => !v)}
                    />
                </View>

                <View style={[$divider, { backgroundColor: theme.colors.border }]} />

                {/* ── 1st Putt Distance / Tee Shot Club row ────────────────── */}
                <View style={[$row, { justifyContent: "space-between" }]}>
                    {/* 1st Putt Distance — stepper with horizontal layout */}
                    <View style={$stepperWrapper}>
                        <Text style={[$sectionLabel, { color: theme.colors.textDim }]}>
                            1st Putt Distance
                        </Text>
                        <View
                            style={[
                                $stepperPillWide,
                                {
                                    backgroundColor: theme.colors.backgrounds.default,
                                    borderColor: theme.colors.border,
                                },
                            ]}
                        >
                            <TouchableOpacity
                                onPress={() => setFirstPuttDist((v) => Math.max(0, v - 1))}
                                style={$stepperBtn}
                                hitSlop={8}
                            >
                                <Text style={[$stepperSymbol, { color: theme.colors.text }]}>−</Text>
                            </TouchableOpacity>
                            <Text style={[$stepperValueSmall, { color: theme.colors.text }]}>
                                {firstPuttDist > 0 ? `${firstPuttDist} yd` : "--"}
                            </Text>
                            <TouchableOpacity
                                onPress={() => setFirstPuttDist((v) => v + 1)}
                                style={$stepperBtn}
                                hitSlop={8}
                            >
                                <Text style={[$stepperSymbol, { color: theme.colors.text }]}>+</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Tee Shot Club */}
                    <View style={[$stepperWrapper, $teeClub]}>
                        <WheelPicker
                            label="Tee Shot Club"
                            options={clubOptions}
                            value={teeClubLabel}
                            onChange={(val) => setTeeClubLabel(val)}
                        />
                    </View>
                </View>
            </View>
        </BottomSheetModalFactory>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const $header: ViewStyle = {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
};

const $avatarPlaceholder: ViewStyle = {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
};

const $headerInfo: ViewStyle = {
    flex: 1,
};

const $playerName: TextStyle = {
    fontSize: 16,
    fontWeight: "600",
};

const $handicap: TextStyle = {
    fontSize: 14,
    fontWeight: "400",
};

const $scoreRow: ViewStyle = {
    flexDirection: "row",
    alignItems: "center",
};

const $runningScore: TextStyle = {
    fontSize: 20,
    fontWeight: "700",
};

const $runningScoreNum: ThemedStyle<TextStyle> = (theme) => ({
    fontSize: 16,
    backgroundColor: theme.colors.buttons.background,
    color: theme.colors.buttons.textColor,
    paddingHorizontal: 12,
    fontWeight: 700,
    textAlign: "center",
    borderRadius: 24
});

const $teeClub: ViewStyle = {
    flex: 1,
}

const $enterBtn: ViewStyle = {
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 10,
};

const $enterBtnLabel: TextStyle = {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
};

const $body: ViewStyle = {
    paddingHorizontal: 20,
    paddingTop: 16,
};

const $row: ViewStyle = {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 24,
    marginBottom: 16,
};

const $divider: ViewStyle = {
    height: StyleSheet.hairlineWidth,
    marginBottom: 16,
};

const $sectionLabel: TextStyle = {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
};

// ── Stepper
const $stepperWrapper: ViewStyle = {
    alignItems: "center",
};

const $stepperPill: ViewStyle = {
    flexDirection: "column",
    alignItems: "center",
    borderRadius: 100,
    borderWidth: 1,
    paddingVertical: 6,
    justifyContent: "space-between",
};

const $stepperPillLarge: ViewStyle = {
    paddingHorizontal: 12,
};

const $stepperPillWide: ViewStyle = {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 100,
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
    minWidth: 130,
    justifyContent: "space-between",
};

const $stepperBtn: ViewStyle = {
    paddingHorizontal: 4,
};

const $stepperSymbol: TextStyle = {
    fontSize: 22,
    fontWeight: "300",
    lineHeight: 26,
};

const $stepperValue: TextStyle = {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: "700",
    minWidth: 32,
    textAlign: "center",
};

const $stepperValueLarge: TextStyle = {
    fontSize: 36,
    lineHeight: 42,
};

const $stepperValueSmall: TextStyle = {
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
    flex: 1,
};

// ── Tee wheel
const $wheelWrapper: ViewStyle = {
    alignItems: "center",
    flex: 1,
};

const $wheelRow: ViewStyle = {
    flexDirection: "row",
};

const CELL = 38;

const $wheelCell: ViewStyle = {
    width: CELL,
    height: CELL,
    justifyContent: "center",
    alignItems: "center",
};

const $wheelBtn: ViewStyle = {
    borderRadius: (CELL) / 2,
    width: CELL,
    height: CELL,
    borderWidth: 1,
    borderColor: "lightgray",
};

const $wheelBtnCenter: ViewStyle = {
    borderRadius: (CELL+4) / 2,
    width: CELL+4,
    height: CELL+4,
    borderWidth: 2,
    borderColor: "transparent",
};

const $wheelBtnCenterLabel: TextStyle = {
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
};

const $wheelBtnLabel: TextStyle = {
    fontSize: 22,
    textAlign: "center",
};

const $mishitChip: ViewStyle = {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 100,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 6,
};

const $mishitLabel: TextStyle = {
    fontSize: 12,
    fontWeight: "500",
};
