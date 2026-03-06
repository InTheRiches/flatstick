const palette = {
  neutral900: "#FFFFFF",
  neutral800: "#F4F2F1",
  neutral700: "#D7CEC9",
  neutral600: "#B6ACA6",
  neutral500: "#978F8A",
  neutral400: "#564E4A",
  neutral300: "#393939",
  neutral200: "#171717",
  neutral100: "#000000",

  primary600: "#F4E0D9",
  primary500: "#E8C1B4",
  primary400: "#DDA28E",
  primary300: "#D28468",
  primary200: "#C76542",
  primary100: "#A54F31",

  secondary500: "#DCDDE9",
  secondary400: "#BCC0D6",
  secondary300: "#9196B9",
  secondary200: "#626894",
  secondary100: "#41476E",

  accent500: "#FFEED4",
  accent400: "#FFE1B2",
  accent300: "#FDD495",
  accent200: "#FBC878",
  accent100: "#FFBB50",

  emerald: "#00674F",
  emerald100: "#D1EDEA",
  emerald200: "#A3D5C1",
  emerald300: "#74B999",
  emerald400: "#469F71",
  emerald500: "#1B6649",
  emerald550: "#114f37",
  emerald600: "#003228",
  tintedEmerald: "#003228",
  error: "#C03403",

  angry100: "#F2D6CD",
  angry500: "#C03403",
    angry800: "#7A1B01",

  black: "#000000",
  white: "#FFFFFF",

  overlay20: "rgba(25, 16, 21, 0.2)",
  overlay50: "rgba(25, 16, 21, 0.5)",
} as const

const buttons = {
  background: palette.emerald400,
  border: palette.emerald400,
  textColor: palette.white,
  pressed: {
    background: palette.emerald550,
    border: palette.emerald400,
    textColor: palette.neutral100,
  },
  disabled: {
    background: palette.neutral300,
    border: palette.neutral300,
    textColor: palette.neutral500,
  },
  danger: {
    background: palette.angry500,
    border: palette.angry500,
    textColor: palette.neutral100,
    pressed: {
      background: palette.angry800,
      border: palette.angry800,
      textColor: palette.neutral100,
    }
  },
  secondary: {
    background: palette.neutral200,
    border: palette.neutral300,
    textColor: palette.neutral800,
    pressed: {
      background: palette.neutral400,
      border: palette.neutral400,
      textColor: palette.neutral800,
    }
  }
}

const backgrounds = {
  default: palette.neutral200,
  elevated: palette.black,
  overlay: palette.overlay20,
}

export const colors = {
  palette,
  buttons,
  backgrounds,
  transparent: "rgba(0, 0, 0, 0)",
  text: palette.neutral800,
  textDim: palette.neutral600,
  textDim2: palette.neutral400,
  background: palette.neutral200,
  border: palette.neutral400,
  tint: palette.emerald300,
  tintInactive: palette.neutral400,
  separator: palette.neutral300,
  error: palette.angry500,
  errorBackground: palette.angry100,
  scorecardBackground: palette.black,
} as const
