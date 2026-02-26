import { useAppTheme } from "@/theme/context";
import { ThemedStyle } from "@/theme/types";
import ScorecardIcon from "@assets/icons/svg/scorecard";
import TrackingIcon from "@assets/icons/svg/tracking";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, View, ViewStyle } from "react-native";


interface RoundActionsProps {
    
}

export const RoundActions: React.FC<RoundActionsProps> = ({ }) => {
    const { theme, themed } = useAppTheme();

    return (
        <View style={$container}>
            <View style={themed($topOverlay)}>
                <Pressable style={themed($navButton)}>
                    <Ionicons name="settings-sharp" size={30} color={theme.colors.buttons.textColor} />
                </Pressable>
                <Pressable style={themed($navButton)}>
                    <Ionicons name="golf" size={24} color={theme.colors.buttons.textColor} />
                </Pressable>
                <Pressable style={themed($navButton)}>
                    <TrackingIcon size={24} color={theme.colors.buttons.textColor} />
                </Pressable>
                <Pressable style={themed($navButton)}>
                    <ScorecardIcon width={30} height={30} darkColor={theme.colors.buttons.textColor} lightColor={theme.colors.buttons.disabled.background} />
                </Pressable>
            </View>
        </View>
    )
}

const $container: ViewStyle = {
    position: "absolute",
    right: 16,
    top: 0,
    bottom: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
};

const $topOverlay: ThemedStyle<ViewStyle> = (theme) => ({
    flexDirection: "column",
    justifyContent: "space-between",
    maxHeight: 240,
    backgroundColor: theme.colors.backgrounds.elevated,
    borderRadius: 30,
    padding: 6,
    gap: 12
});

const $navButton: ThemedStyle<ViewStyle> = (theme) => ({
    padding: 6,
    aspectRatio: 1,
    backgroundColor: theme.colors.buttons.background,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
});