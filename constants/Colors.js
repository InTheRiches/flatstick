/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#06B2FF';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#111827',
    textMiddle: "#374151",
    textSecondary: "#687076",
    textLink: "#42aaf5",
    background: '#fbfcfd',
    backgroundSecondary: "#fff",
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    border: "#CFCFCF",

    buttonPrimaryBorder: "#677943",
    buttonPrimaryText: "white",
    buttonPrimaryBackground: "#677943",
    buttonPrimaryDepressed: "#525E3A",

    buttonSecondaryBackground: "rgba(59, 130, 246, 0.15)",
    buttonSecondaryBorder: "#B5B3B3",
    buttonSecondaryText: "#B5B3B3",
    buttonSecondaryDisabledBackground: "#f1f2f3",
    buttonSecondaryDisabledBorder: "#D1D1D1",
    buttonSecondaryDisabledText: "#C4C4C4",

    buttonDangerBackground: "#DC2626",
    buttonDangerBorder: "#DC2626",
    buttonDangerText: "#FFFFFF",
    buttonDangerDisabledBackground: "#FEE2E2",
    buttonDangerDisabledBorder: "#FEE2E2",
    buttonDangerDisabledText: "#FFFFFF",

    inputBackground: "#f1f2f3",
    inputFocusedBackground: "rgba(191,209,123,0.2)",
    inputInvalidBackground: "#F5D3D3",
    inputBorder: "#D1D1D1",
    inputFocusedBorder: "#ACCD30",
    inputText: "#111827",
    inputInvalidBorder: "#CE7070",
    inputInvalidFocusedBorder: "#F86868",
    inputInvalidText: "#FF3D3D"
  },
  dark: {
    text: '#fff',
    textMiddle: "#CDD0D3",
    textSecondary: "#9ba1a6",
    textLink: "#42aaf5",
    background: '#1B1D17',
    backgroundSecondary: "#1E1E1E",
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    border: "#34392A",

    buttonPrimaryBorder: "#677943",
    buttonPrimaryText: "white",
    buttonPrimaryBackground: "#677943",
    buttonPrimaryDepressed: "#525E3A",

    buttonSecondaryBackground: "#202425",
    buttonSecondaryBorder: "#4c5155",
    buttonSecondaryText: "#9ba1a6",
    buttonSecondaryDisabledBackground: "#0c0d0e",
    buttonSecondaryDisabledBorder: "#2E2E2E",
    buttonSecondaryDisabledText: "#2E2E2E",

    buttonDangerBackground: "#C13838",
    buttonDangerBorder: "#C13838",
    buttonDangerText: "#E1E2E3",
    buttonDangerDisabledBackground: "#C13838",
    buttonDangerDisabledBorder: "#C13838",
    buttonDangerDisabledText: "#C13838",

    inputBackground: "#272922",
    inputFocusedBackground: "rgba(191,209,123,0.1)",
    inputBorder: "#484A4B",
    inputFocusedBorder: "#606E43",
    inputText: "#fff",
    inputInvalidBorder: "#943737",
    inputInvalidFocusedBorder: "#dc2626",
    inputInvalidText: "#CF5151",
    inputInvalidBackground: "rgba(255,74,74,0.15)",
  },
};
