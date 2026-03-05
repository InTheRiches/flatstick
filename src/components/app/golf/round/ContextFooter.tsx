import { useAppTheme } from "@/theme/context";
import { ThemedStyle } from "@/theme/types";
import { TextStyle, View, ViewStyle } from "react-native";

import { Text } from "@/components/ui/Text";
import { LatLng } from "@/models/geo";
import { LiveShotAttempt } from "@/models/round.live.types";
import { haversineMeters } from "@/utils/courses/geometry/distance.utils";
import { useMemo } from "react";
import { Text as RNText } from "react-native";

interface ContextFooterProps {
    currentShot: LiveShotAttempt | null
    userLocation: LatLng | null
    isPutting?: boolean;
    holePinCoord?: LatLng | null;
    pendingPuttStart?: LatLng | null;
    putts?: number;
}

function toFeet(meters: number): number {
    return meters * 3.28084;
}   

export const ContextFooter: React.FC<ContextFooterProps> = ({ currentShot, userLocation, isPutting, holePinCoord, pendingPuttStart, putts }) => {
    const { theme, themed } = useAppTheme();

    if (userLocation && currentShot && currentShot.category !== "putt") {
        return (
            <View style={themed($container)}>
                <RNText style={themed($footerText)}>
                    Tracking <RNText style={themed($highlightText)}>{currentShot?.club.label ?? "unknown club"}</RNText> shot
                </RNText>
                <Text text={`${Math.round(haversineMeters(userLocation, currentShot?.start.point))} yards`} style={themed($distanceText)} />
            </View>
        )
    }

    const pendingDistance = useMemo(() => {
        if (!isPutting || !holePinCoord || !pendingPuttStart) return null;
        const distM = haversineMeters(pendingPuttStart, holePinCoord);
        return Math.round(toFeet(distM));
    }, [pendingPuttStart, holePinCoord]);

    if (isPutting && holePinCoord && pendingPuttStart) {
        return (
            <View style={themed($container)}>
                <RNText style={themed($footerText)}>
                    Tracking <RNText style={themed($highlightText)}>{(putts ?? 0) + 1}{(putts ?? 0) === 0 ? "st" : (putts ?? 0) === 1 ? "nd" : (putts ?? 0) === 2 ? "rd" : "th"}</RNText> putt
                </RNText>
                <Text text={`${pendingDistance ?? "--"} feet`} style={themed($distanceText)} />
            </View>
        )
    }

    return (
        <></>
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