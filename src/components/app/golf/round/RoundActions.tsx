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
    trackingState?: "tracking" | "idle"
}

export const RoundActions: React.FC<RoundActionsProps> = ({ onSettingsPress, onScorecardPress, startTracking, endTracking, onGreenViewPress, trackingState }) => {
    const { theme, themed } = useAppTheme();

    const getButtonStyle = (pressed?: boolean, active?: boolean) => [
        themed($navButton),
        pressed && themed($navButtonPressed),
        active && themed($activeNavButton),
    ];

    return (
        <View style={$container}>
            <View style={themed($topOverlay)}>
                <Pressable style={(state) => getButtonStyle(state.pressed, false)} onPress={onSettingsPress}>
                    <Ionicons name="settings-sharp" size={30} color={theme.colors.buttons.textColor} />
                </Pressable>
                <Pressable style={(state) => getButtonStyle(state.pressed, false)} onPress={onGreenViewPress}>
                    <Ionicons name="golf" size={24} color={theme.colors.buttons.textColor} />
                </Pressable>
                <Pressable style={(state) => getButtonStyle(state.pressed, trackingState === "tracking")} onPress={trackingState === "tracking" ? endTracking : startTracking}>
                    <TrackingIcon size={24} color={theme.colors.buttons.textColor} />
                </Pressable>
                <Pressable style={(state) => getButtonStyle(state.pressed, false)} onPress={onScorecardPress}>
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

const $topOverlay: ThemedStyle<ViewStyle> = (theme, trackingState?: string) => ({
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

const $navButtonPressed: ThemedStyle<ViewStyle> = (theme) => ({
    backgroundColor: theme.colors.buttons.pressed.background,
});

const $activeNavButton: ThemedStyle<ViewStyle> = (theme) => ({
    backgroundColor: theme.colors.buttons.danger.background,
})