import { useMemo } from "react"
import { Pressable, StyleSheet, View, type TextStyle, type ViewStyle } from "react-native"
import Svg, { Circle, Rect } from "react-native-svg"

import { Text } from "@/components/ui/Text"
import { useAppTheme } from "@/theme/context"

import type { ScorecardHole, ScorecardProps } from "./types"

const UNKNOWN = -1

function padTo<T>(arr: T[], length: number, padValue: T) {
  if (arr.length >= length) return arr
  return arr.concat(Array.from({ length: length - arr.length }, () => padValue))
}

function formatToPar(toPar: number) {
  if (toPar === 0) return "E"
  if (toPar > 0) return `+${toPar}`
  return `${toPar}`
}
function holeNumberForIndex({
  frontOnlyMode,
  front,
  nineIndex,
  i,
}: {
  dataLength: number
  frontOnlyMode: boolean
  front: boolean
  nineIndex: 0 | 1
  i: number
}) {
  // if dataLength === 9 we’re showing either front 1–9 or back 10–18
  if (frontOnlyMode) return front ? i + 1 : i + 10
  return i + 1 + (nineIndex === 0 ? 0 : 9)
}

function sumKnownRound(holes: ScorecardHole[]) {
  return holes.reduce((acc, h) => (isHoleKnown(h) ? acc + h.score : acc), 0)
}
function sumKnownPar(holes: ScorecardHole[]) {
  return holes.reduce((acc, h) => (isHoleKnown(h) ? acc + h.par : acc), 0)
}
function isHoleKnown(h: ScorecardHole) {
  // supports your old logic: either score !== -1 OR hasData flag
  if (typeof h.hasData === "boolean") return h.hasData
  return h.score !== UNKNOWN
}

type HoleCellModel = {
  label: number
  valueText: string
  isKnown: boolean
  overBy: number
  underBy: number
}

export default function Scorecard({
  variant = "round",
  holes = [],
  puttsByHole = [],
  strokesGained = 0,
  totalPutts = 0,
  front = true,
  roundedTop = true,
  roundedBottom = true,
  topMargin = true,
  backgroundColor = undefined,
  onSelectHole,
}: ScorecardProps) {
  const { themed } = useAppTheme()
  const styles = themed($styles({ roundedTop, roundedBottom, topMargin }))

  const strokeColor = styles.__strokeColor // injected via styles factory (string)

  const frontOnlyMode = useMemo(() => {
    // matches your old “data.length === 9 means only front OR only back is shown”
    if (variant === "round") return holes.length === 9
    return puttsByHole.length === 9
  }, [variant, holes.length, puttsByHole.length])

  const header = useMemo(() => {
    if (variant === "putts") {
      return {
        leftLabel: "Strokes Gained",
        leftValue: strokesGained > 0 ? `+${strokesGained}` : `${strokesGained}`,
        rightLabel: "Gross Putts",
        rightValue: `${totalPutts}`,
      }
    }

    const totalScore = sumKnownRound(holes)
    const totalPar = sumKnownPar(holes)
    const toPar = totalScore - totalPar

    return {
      leftLabel: "To Par",
      leftValue: formatToPar(toPar),
      rightLabel: "Gross",
      rightValue: `${totalScore}`,
    }
  }, [variant, holes, strokesGained, totalPutts])

  const { rows, nineTotals } = useMemo(() => {
    if (variant === "putts") {
      const safe = puttsByHole.length ? puttsByHole : []
      const paddedFront = padTo(safe.slice(0, 9), 9, UNKNOWN)
      const paddedBack = safe.length > 9 ? padTo(safe.slice(9, 18), 9, UNKNOWN) : []

      const frontTotal = paddedFront.reduce((a, v) => (v !== UNKNOWN ? a + v : a), 0)
      const backTotal = paddedBack.reduce((a, v) => (v !== UNKNOWN ? a + v : a), 0)

      const makeModel = (nine: number[], nineIndex: 0 | 1): HoleCellModel[] =>
        nine.map((v, i) => {
          const label = holeNumberForIndex({
            dataLength: safe.length,
            frontOnlyMode,
            front,
            nineIndex,
            i,
          })
          const isKnown = v !== UNKNOWN
          const valueText = isKnown ? `${v}` : "?"
          const overBy = isKnown && v > 2 ? Math.min(v - 2, 10) : 0
          const underBy = isKnown && v < 2 ? Math.min(2 - v, 10) : 0
          return { label, valueText, isKnown, overBy, underBy }
        })

      const rowsOut = [
        paddedFront.length ? makeModel(paddedFront, 0) : [],
        paddedBack.length ? makeModel(paddedBack, 1) : [],
      ].filter((r) => r.length)

      return {
        rows: rowsOut as HoleCellModel[][],
        nineTotals: [frontTotal, backTotal],
      }
    }

    // round
    const safe = holes.length ? holes : []
    const paddedFront = padTo(safe.slice(0, 9), 9, { par: 0, score: UNKNOWN })
    const paddedBack =
      safe.length > 9 ? padTo(safe.slice(9, 18), 9, { par: 0, score: UNKNOWN }) : []

    const frontTotal = paddedFront.reduce((a, h) => (isHoleKnown(h) ? a + h.score : a), 0)
    const backTotal = paddedBack.reduce((a, h) => (isHoleKnown(h) ? a + h.score : a), 0)

    const makeModel = (nine: ScorecardHole[], nineIndex: 0 | 1): HoleCellModel[] =>
      nine.map((h, i) => {
        const label = holeNumberForIndex({
          dataLength: safe.length,
          frontOnlyMode,
          front,
          nineIndex,
          i,
        })
        const known = isHoleKnown(h)
        const valueText = known ? `${h.score}` : "?"
        const diff = known ? h.score - h.par : 0
        const overBy = known && diff > 0 ? Math.min(diff, 10) : 0
        const underBy = known && diff < 0 ? Math.min(-diff, 10) : 0
        return { label, valueText, isKnown: known, overBy, underBy }
      })

    const rowsOut = [
      paddedFront.length ? makeModel(paddedFront, 0) : [],
      paddedBack.length ? makeModel(paddedBack, 1) : [],
    ].filter((r) => r.length)

    return {
      rows: rowsOut as HoleCellModel[][],
      nineTotals: [frontTotal, backTotal],
    }
  }, [variant, holes, puttsByHole, frontOnlyMode, front])

  const canSelect = typeof onSelectHole === "function"

  return (
    <View style={[styles.card, backgroundColor && { backgroundColor }]}>
      {/* Header */}
      <View style={styles.topRow}>
        <View>
          <Text style={styles.topLabel}>{header.leftLabel}</Text>
          <Text style={styles.topValue}>{header.leftValue}</Text>
        </View>

        <View style={styles.topRight}>
          <Text style={styles.topLabel}>{header.rightLabel}</Text>
          <Text style={styles.topValue}>{header.rightValue}</Text>
        </View>
      </View>

      {/* Rows */}
      {rows.map((nine, nineIndex) => (
        <View key={`nine-${nineIndex}`} style={styles.scoreRow}>
          {nine.map((cell, i) => {
            const content = (
              <View style={styles.cell}>
                <Text style={styles.holeLabel}>{cell.label}</Text>

                <View style={styles.valueWrap}>
                  <Text style={[styles.value, !cell.isKnown && styles.valueUnknown]}>
                    {cell.valueText}
                  </Text>

                  {!!cell.overBy &&
                    Array.from({ length: Math.min(cell.overBy, 3) }).map((_, ringIndex) => (
                      <Svg
                        key={`over-${i}-${ringIndex}`}
                        width={40}
                        height={40}
                        style={styles.overlay}
                      >
                        <Rect
                          x={10 - 2.5 * ringIndex}
                          y={10 - 2.5 * ringIndex}
                          width={20 + 5 * ringIndex}
                          height={20 + 5 * ringIndex}
                          stroke={strokeColor}
                          strokeWidth={ringIndex === 2 && cell.overBy > 3 ? 2 : 1.5}
                          fill="none"
                        />
                      </Svg>
                    ))}

                  {!!cell.underBy &&
                    Array.from({ length: cell.underBy }).map((_, ringIndex) => (
                      <Svg
                        key={`under-${i}-${ringIndex}`}
                        width={30}
                        height={30}
                        style={styles.overlay}
                      >
                        <Circle
                          cx={15}
                          cy={15}
                          r={11 + 3 * ringIndex}
                          stroke={strokeColor}
                          strokeWidth={1.5}
                          fill="none"
                        />
                      </Svg>
                    ))}
                </View>
              </View>
            )

            if (!canSelect) return <View key={`cell-${nineIndex}-${i}`}>{content}</View>

            return (
              <Pressable
                key={`cell-${nineIndex}-${i}`}
                onPress={() => onSelectHole?.(cell.label)}
                style={({ pressed }) => [styles.pressable, pressed && styles.pressablePressed]}
                hitSlop={6}
              >
                {content}
              </Pressable>
            )
          })}

          <Text style={styles.nineTotal}>{nineIndex === 0 ? nineTotals[0] : nineTotals[1]}</Text>
        </View>
      ))}
    </View>
  )
}

const $styles =
  ({
    roundedTop,
    roundedBottom,
    topMargin,
  }: {
    roundedTop: boolean
    roundedBottom: boolean
    topMargin: boolean
  }) =>
  (theme: any) => {
    const radius = 16

    // Hacky-but-clean: stash strokeColor in styles object so we can avoid inline literals.
    // If you dislike this, I’ll switch to passing `strokeColor` down as a prop.
    const strokeColor = theme.colors.border

    const styles = StyleSheet.create({
      card: {
        backgroundColor: theme.colors.backgrounds.default,
        borderTopLeftRadius: roundedTop ? radius : 0,
        borderTopRightRadius: roundedTop ? radius : 0,
        borderBottomLeftRadius: roundedBottom ? radius : 0,
        borderBottomRightRadius: roundedBottom ? radius : 0,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        marginTop: topMargin ? theme.spacing.md : 0,
        borderWidth: 1,
        borderColor: theme.colors.border,
      } satisfies ViewStyle,

      cell: {
        justifyContent: "center",
        alignItems: "center",
      } satisfies ViewStyle,

      holeLabel: {
        color: theme.colors.textDim,
        fontSize: 12,
      } satisfies TextStyle,

      nineTotal: {
        color: theme.colors.text,
        fontWeight: "800",
        fontSize: 20,
        marginLeft: theme.spacing.sm,
        width: 30,
        textAlign: "center",
      } satisfies TextStyle,

      overlay: {
        position: "absolute",
      } satisfies ViewStyle,

      pressable: {
        borderRadius: 8,
      } satisfies ViewStyle,

      pressablePressed: {
        opacity: 0.85,
      } satisfies ViewStyle,

      scoreRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: theme.spacing.xs,
        justifyContent: "space-between",
      } satisfies ViewStyle,

      topLabel: {
        color: theme.colors.textDim,
        fontSize: 16,
        fontWeight: "700",
      } satisfies TextStyle,

      topRight: {
        alignItems: "flex-end",
      } satisfies ViewStyle,

      topRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: theme.spacing.sm,
      } satisfies ViewStyle,

      topValue: {
        color: theme.colors.text,
        fontSize: 24,
        fontWeight: "800",
      } satisfies TextStyle,

      value: {
        color: theme.colors.text,
        fontSize: 18,
        fontWeight: "600",
      } satisfies TextStyle,

      valueUnknown: {
        color: theme.colors.textDim,
      } satisfies TextStyle,

      valueWrap: {
        width: 28,
        height: 28,
        justifyContent: "center",
        alignItems: "center",
      } satisfies ViewStyle,
    })

    // attach stroke color
    return Object.assign(styles, { __strokeColor: strokeColor })
  }
