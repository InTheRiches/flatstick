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
    backgroundTinted: "rgba(0, 0, 0, 0.5)",
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    border: "#CFCFCF",

    popupBorder: "white",

    buttonPrimaryBorder: "#677943",
    buttonPrimaryText: "white",
    buttonPrimaryBackground: "#677943",
    buttonPrimaryDepressed: "#525E3A",

    radioButtonBorder: "#484A4B",
    radioButtonBackground: "#1E1F20",
    radioButtonText: "white",
    radioButtonSelectedBorder: "#B8B08D",
    radioButtonSelectedBackground: "#B8B08D",
    radioButtonSelectedRadio: "#1E1F20",
    radioButtonSelectedText: "black",

    buttonSecondaryBackground: "rgba(59, 130, 246, 0.15)",
    buttonSecondaryBorder: "#B5B3B3",
    buttonSecondaryText: "#111827",
    buttonSecondaryDepressed: "#969696",

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
    inputInvalidText: "#FF3D3D",

    puttingGridBorder: "transparent",
    puttingGridText: "#B2C490",

    checkmarkBare: "#fff",
    checkmarkBackground: "#333D20",
    checkmarkColor: "white",
    checkmarkBareColor: "#D9D9D9",

    puttingVisualBackground: "#333D20",
    puttingVisualBorder: "#677943",
    puttingVisualText: "#111827",
    puttingVisualSecondaryText: "#B2C490",
  },
  dark: {
    text: '#fff',
    textMiddle: "#CDD0D3",
    textSecondary: "#9ba1a6",
    textLink: "#42aaf5",
    background: '#161718',
    backgroundSecondary: "#1E1F20",
    backgroundTinted: "rgba(0, 0, 0, 0.8)",
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    border: "#484A4B",

    popupBorder: "#484A4B",

    buttonPrimaryBorder: "#B8B08D",
    buttonPrimaryText: "black",
    buttonPrimaryBackground: "#B8B08D",
    buttonPrimaryDepressed: "#908A70",

    radioButtonBorder: "#484A4B",
    radioButtonBackground: "#1E1F20",
    radioButtonText: "white",
    radioButtonSelectedBorder: "#B8B08D",
    radioButtonSelectedBackground: "#B8B08D",
    radioButtonSelectedRadio: "#CAC4AA",
    radioButtonSelectedText: "black",

    buttonSecondaryBackground: "#202425",
    buttonSecondaryBorder: "#424647",
    buttonSecondaryText: "#fff",
    buttonSecondaryDepressedBackground: "#323536",

    buttonDisabledBackground: "#0c0d0e",
    buttonDisabledBorder: "#2E2E2E",
    buttonDisabledText: "#6b6e70",

    buttonDangerBackground: "#C13838",
    buttonDangerBorder: "#C13838",
    buttonDangerText: "#E1E2E3",
    buttonDangerDepressedBackground: "#e04343",

    buttonDangerDisabledBackground: "#751C21",
    buttonDangerDisabledBorder: "#751C21",
    buttonDangerDisabledText: "white",

    inputBackground: "#272922",
    inputFocusedBackground: "rgba(191,209,123,0.1)",
    inputBorder: "#484A4B",
    inputFocusedBorder: "#606E43",
    inputText: "#fff",
    inputInvalidBorder: "#943737",
    inputInvalidFocusedBorder: "#dc2626",
    inputInvalidText: "#CF5151",
    inputInvalidBackground: "rgba(255,74,74,0.15)",

    puttingGridBorder: "#CEDD94",
    puttingGridText: "#A5CA5F",

    checkmarkBareBackground: "#fff",
    checkmarkBackground: "#333D20",
    checkmarkColor: "white",
    checkmarkBareColor: "#D9D9D9",

    puttingVisualBackground: "#333D20",
    puttingVisualBorder: "#677943",
    puttingVisualText: "#fff",
    puttingVisualSecondaryText: "#B2C490",
  },
};
