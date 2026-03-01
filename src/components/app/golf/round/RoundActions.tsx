import { useAppTheme } from "@/theme/context";
import { ThemedStyle } from "@/theme/types";
import ScorecardIcon from "@assets/icons/svg/scorecard";
import TrackingIcon from "@assets/icons/svg/tracking";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, View, ViewStyle } from "react-native";


interface RoundActionsProps {
    onSettingsPress?: () => void;
    onScorecardPress?: () => void;
    startTracking?: () => void;
    endTracking?: () => void;
    onGreenViewPress?: () => void;
    trackingState?: "tracking" | "idle";
    /** Whether player-tracking (camera-follow) mode is active. */
    isPlayerTracking?: boolean;
    /** Toggle player-tracking mode on/off. */
    onPlayerTrackingToggle?: () => void;
}

export const RoundActions: React.FC<RoundActionsProps> = ({ onSettingsPress, onScorecardPress, startTracking, endTracking, onGreenViewPress, trackingState, isPlayerTracking, onPlayerTrackingToggle }) => {
    const { theme, themed } = useAppTheme();

    const getButtonStyle = (pressed?: boolean, active?: boolean) => [
        themed($navButton),
        pressed && themed($navButtonPressed),
        active && themed($activeNavButton),
    ];

    const getIconColor = (pressed?: boolean, active?: boolean) => {
        if (active) return theme.colors.buttons.textColor;
        if (pressed) return theme.colors.buttons.textColor;
        return theme.colors.palette.black;
    }

    return (
        <View style={$container}>
            <View style={themed($topOverlay)}>
                <Pressable style={(state) => getButtonStyle(state.pressed, false)} onPress={onSettingsPress}>
                    <Ionicons name="settings-sharp" size={30} color={getIconColor(false, false)} />
                </Pressable>
                <Pressable style={(state) => getButtonStyle(state.pressed, false)} onPress={onGreenViewPress}>
                    <Ionicons name="golf" size={24} color={getIconColor(false, false)} />
                </Pressable>
                <Pressable style={(state) => getButtonStyle(state.pressed, !!isPlayerTracking)} onPress={onPlayerTrackingToggle}>
                    <Ionicons name="navigate" size={24} color={getIconColor(false, !!isPlayerTracking)} />
                </Pressable>
                <Pressable style={(state) => getButtonStyle(state.pressed, trackingState === "tracking")} onPress={trackingState === "tracking" ? endTracking : startTracking}>
                    <TrackingIcon size={24} color={getIconColor(false, trackingState === "tracking")} />
                </Pressable>
                <Pressable style={(state) => getButtonStyle(state.pressed, false)} onPress={onScorecardPress}>
                    <ScorecardIcon width={30} height={30} darkColor={theme.colors.text} lightColor={theme.colors.textDim} />
                </Pressable>
            </View>
        </View>
    )
}

const $container: ViewStyle = {
    position: "absolute",
    right: 16,
    top: 200,
    bottom: 200,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
};

const $topOverlay: ThemedStyle<ViewStyle> = (theme, trackingState?: string) => ({
    flexDirection: "column",
    justifyContent: "space-between",
    maxHeight: 300,
    backgroundColor: theme.colors.backgrounds.elevated,
    borderRadius: 30,
    padding: 6,
    gap: 12
});

const $navButton: ThemedStyle<ViewStyle> = (theme) => ({
    padding: 6,
    aspectRatio: 1,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
});

const $navButtonPressed: ThemedStyle<ViewStyle> = (theme) => ({
    opacity: 0.8
});

const $activeNavButton: ThemedStyle<ViewStyle> = (theme) => ({
    backgroundColor: theme.colors.buttons.background,
})