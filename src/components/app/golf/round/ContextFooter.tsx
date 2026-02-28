import { useAppTheme } from "@/theme/context";
import { ThemedStyle } from "@/theme/types";
import { TextStyle, View, ViewStyle } from "react-native";

import { Text } from "@/components/ui/Text";
import { LatLng } from "@/models/geo";
import { LiveShotAttempt } from "@/models/round.live.types";
import { haversineMeters } from "@/utils/courses/geometry/distance.utils";
import { Text as RNText } from "react-native";

interface ContextFooterProps {
    currentShot: LiveShotAttempt | null
    userLocation: LatLng | null
}

export const ContextFooter: React.FC<ContextFooterProps> = ({ currentShot, userLocation }) => {
    const { theme, themed } = useAppTheme();

    return userLocation && currentShot && (
        <View style={themed($container)}>
            <RNText style={themed($footerText)}>
                Tracking <RNText style={themed($highlightText)}>{currentShot?.club.label ?? "unknown club"}</RNText> shot
            </RNText>
            <Text text={`${Math.round(haversineMeters(userLocation, currentShot?.start.point))} yards`} style={themed($distanceText)} />
        </View>
    )
}

const $container: ThemedStyle<ViewStyle> = (theme) => ({
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
    borderRadius: 12,
    backgroundColor: "black",
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
});

const $footerText: ThemedStyle<TextStyle> = (theme) => ({
    color: "white",
    textAlign: "left",
    fontSize: 16,
    fontWeight: 600
});

const $highlightText: ThemedStyle<TextStyle> = (theme) => ({
    color: theme.colors.palette.emerald300,
    textAlign: "left",
    fontSize: 16,
    fontWeight: 600,
});

const $distanceText: ThemedStyle<TextStyle> = (theme) => ({
    color: theme.colors.palette.emerald300,
    textAlign: "right",
    fontSize: 16,
    fontWeight: 600
});