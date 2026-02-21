import {TextStyle, ViewStyle} from "react-native"

/* Use this file to define styles that are used in multiple places in your app. */
export const $styles = {
    row: {flexDirection: "row"} as ViewStyle,
    flex1: {flex: 1} as ViewStyle,
    flexWrap: {flexWrap: "wrap"} as ViewStyle,
    px: {paddingHorizontal: 16} as ViewStyle,
    screen: {flex: 1, paddingHorizontal: 24} as ViewStyle,
    screen2: {flex: 1, paddingHorizontal: 36} as ViewStyle,

    toggleInner: {
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
    } as ViewStyle,

    sectionHeader: {
      fontSize: 18,
      textAlign: "left",
      width: "100%",
      fontWeight: "700",
    } as TextStyle,

    modalHeader: {
        fontSize: 20,
        textAlign: "left",
        width: "100%",
        fontWeight: "700",
    } as TextStyle,
}
