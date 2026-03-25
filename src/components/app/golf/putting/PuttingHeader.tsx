import { Text } from "@/components/ui/Text";
import { TeeSet } from "@/models/courses";
import { HoleState } from "@/models/session.types";
import { UseRoundTimerEngine } from "@/models/timer";
import { useAppTheme } from "@/theme/context";
import { ThemedStyle } from "@/theme/types";
import { FC } from "react";
import { Pressable, View, type TextStyle, type ViewStyle } from "react-native";
import Svg, { Path } from "react-native-svg";

interface PuttingHeaderProps {
    holeState: HoleState,
    timer: UseRoundTimerEngine,
    teeSet: TeeSet,
    onExitPress?: () => void
}

export const PuttingHeader: FC<PuttingHeaderProps> = ({ holeState, teeSet, onExitPress }) => {
    const {themed} = useAppTheme()

    return (
        <View style={$container}>
            <View style={$left}>
                <Text style={$holeNumber} preset={"heading"} text={holeState.hole.toString()}></Text>
                <Text style={$ordinal}>{holeState.hole === 1 ? "ST" : holeState.hole === 2 ? "ND" : holeState.hole === 3 ? "RD" : "TH"}</Text>
            </View>
            <View style={themed($teeInfo)}>
                <Text style={themed($teeText)}>Par {teeSet.holes[holeState.hole-1].par === 0 ? "?" : teeSet.holes[holeState.hole-1].par}</Text>
                <View style={themed($dot)}></View>
                <Text style={themed($teeText)}>{teeSet.holes[holeState.hole-1].yardage === 0 ? "?" : teeSet.holes[holeState.hole-1].yardage} yds</Text>
                <View style={themed($dot)}></View>
                <Text style={themed($teeText)}>{teeSet.holes[holeState.hole-1].handicap === 0 ? "?" : teeSet.holes[holeState.hole-1].handicap}</Text>
            </View>
            <Pressable onPress={() => onExitPress?.()} style={$pressableIcon}>
                <Svg fill="none" viewBox="0 0 24 24"
                     strokeWidth={1.5}
                     stroke={"black"} width={32} height={32}>
                    <Path strokeLinecap="round" strokeLinejoin="round"
                          d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15M12 9l3 3m0 0-3 3m3-3H2.25"/>
                </Svg>
            </Pressable>

        </View>
    )
}

const $teeInfo: ThemedStyle<ViewStyle> = (theme) => ({
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
    backgroundColor: theme.colors.buttons.background,
    paddingHorizontal: 12,
    paddingVertical: 2,
    borderRadius: 50
})

const $container: ViewStyle = {
    flexDirection: "row",
    justifyContent: "center",
};

const $left: ViewStyle = {
    flexDirection: "row",
    marginBottom: 6,
    position: "absolute",
    left: 0
};

const $holeNumber: TextStyle = {
    fontSize: 40,
    lineHeight: 40,
    // fontWeight is string in RN styling
    fontWeight: "800",
};

const $ordinal: TextStyle = {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 12,
};

const $pressableIcon: ViewStyle = {
    // placeholder for future icon alignment if needed
    justifyContent: "center",
    position: "absolute",
    right: 0
};

const $teeText: ThemedStyle<TextStyle> = (theme) => ({
    fontSize: 13,
    color: theme.colors.buttons.textColor,
    fontWeight: "600",
})

const $dot: ThemedStyle<ViewStyle> = (theme) => ({
    width: 4,
    height: 4,
    borderRadius: 2,
    color: theme.colors.buttons.textColor
})
