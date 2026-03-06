const palette = {
    neutral100: "#FFFFFF",
    neutral200: "#F4F2F1",
    neutral300: "#D7CEC9",
    neutral400: "#B6ACA6",
    neutral500: "#978F8A",
    neutral600: "#564E4A",
    neutral700: "#3C3836",
    neutral800: "#191015",
    neutral900: "#000000",

    primary100: "#F4E0D9",
    primary200: "#E8C1B4",
    primary300: "#DDA28E",
    primary400: "#D28468",
    primary500: "#C76542",
    primary600: "#A54F31",

    secondary100: "#DCDDE9",
    secondary200: "#BCC0D6",
    secondary300: "#9196B9",
    secondary400: "#626894",
    secondary500: "#41476E",

    accent100: "#FFEED4",
    accent200: "#FFE1B2",
    accent300: "#FDD495",
    accent400: "#FBC878",
    accent500: "#FFBB50",

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
    background: palette.emerald,
    border: palette.emerald,
    textColor: palette.neutral100,
    pressed: {
        background: palette.emerald550,
        border: palette.emerald,
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
        background: palette.white,
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
    elevated: palette.white,
    overlay: palette.overlay20,
}

export const colors = {
    /**
     * The palette is available to use, but prefer using the name.
     * This is only included for rare, one-off cases. Try to use
     * semantic names as much as possible.
     */
    palette,
    buttons,
    backgrounds,
    /**
     * A helper for making something see-thru.
     */
    transparent: "rgba(0, 0, 0, 0)",
    /**
     * The default text color in many components.
     */
    text: palette.neutral800,
    textOnDark: palette.neutral100,
    /**
     * Secondary text information.
     */
    textDim: palette.neutral600,
    textDimOnDark: palette.neutral400,
    /**
     * Tertiary text information, or text on top of colored backgrounds.
     */
    textDim2: palette.neutral400,
    /**
     * The default border color.
     */
    border: palette.neutral300,
    /**
     * The main tinting color.
     */
    tint: palette.emerald,
    /**
     * The inactive tinting color.
     */
    tintInactive: palette.neutral400,
    /**
     * A subtle color used for lines.
     */
    separator: palette.neutral300,
    /**
     * Error messages.
     */
    error: palette.angry500,
    /**
     * Error Background.
     */
    errorBackground: palette.angry100,
    /**
     * Scorecard background
     */
    scorecardBackground: palette.black,
} as const
