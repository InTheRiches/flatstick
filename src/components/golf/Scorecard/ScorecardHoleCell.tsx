import { View, type ViewStyle, type TextStyle } from "react-native"
import Svg, { Circle, Rect } from "react-native-svg"

import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

type Props = {
  label: number
  valueText: string
  isKnown: boolean
  overBy?: number // bogeys (or 3-putts)
  underBy?: number // birdies (or 1-putts)
}

export function ScorecardHoleCell({ label, valueText, isKnown, overBy = 0, underBy = 0 }: Props) {
  const { themed } = useAppTheme()

  return (
    <View style={themed($cell)}>
      <Text style={themed($holeLabel)}>{label}</Text>

      <View style={$valueWrap}>
        <Text style={[themed($value), !isKnown && themed($valueUnknown)]}>{valueText}</Text>

        {!!overBy &&
          Array.from({ length: Math.min(overBy, 3) }).map((_, i) => (
            <Svg key={`over-${i}`} width={40} height={40} style={$overlay}>
              <Rect
                x={10 - 2.5 * i}
                y={10 - 2.5 * i}
                width={20 + 5 * i}
                height={20 + 5 * i}
                strokeWidth={i === 2 && overBy > 3 ? 2 : 1.5}
                fill="none"
                // stroke set via theme in styles by wrapping Svg is annoying; simplest is a prop:
                // but lint hates inline. We'll use currentColor trick via style on Svg:
              />
            </Svg>
          ))}

        {!!underBy &&
          Array.from({ length: underBy }).map((_, i) => (
            <Svg key={`under-${i}`} width={30} height={30} style={$overlay}>
              <Circle cx={15} cy={15} r={11 + 3 * i} strokeWidth={1.5} fill="none" />
            </Svg>
          ))}
      </View>
    </View>
  )
}

const $cell: ThemedStyle<ViewStyle> = (theme) => ({
  justifyContent: "center",
  alignItems: "center",
  gap: theme.spacing.xs,
})

const $holeLabel: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.textDim,
  fontSize: 12,
})

const $valueWrap: ViewStyle = {
  width: 28,
  height: 28,
  justifyContent: "center",
  alignItems: "center",
}

const $value: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.text,
  fontSize: 18,
  fontWeight: "600",
})

const $valueUnknown: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.textDim,
})

const $overlay: ViewStyle = {
  position: "absolute",
}
