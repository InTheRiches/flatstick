import { useAppTheme } from "@/theme/context";
import { ThemedStyle } from "@/theme/types";
import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Text as RNText, TextStyle, ViewStyle } from "react-native";

import { Text } from "@/components/ui/Text";
import { LatLng } from "@/models/geo";
import { LiveShotAttempt } from "@/models/round.live.types";
import { haversineMeters } from "@/utils/courses/geometry/distance.utils";

interface ContextFooterProps {
    currentShot: LiveShotAttempt | null;
    userLocation: LatLng | null;
    isPutting?: boolean;
    holePinCoord?: LatLng | null;
    pendingPuttStart?: LatLng | null;
    putts?: number;
}

function toFeet(meters: number): number {
    return meters * 3.28084;
}

function ordinalSuffix(n: number): string {
    if (n === 1) return "st";
    if (n === 2) return "nd";
    if (n === 3) return "rd";
    return "th";
}

export const ContextFooter: React.FC<ContextFooterProps> = ({
    currentShot,
    userLocation,
    isPutting,
    holePinCoord,
    pendingPuttStart,
    putts,
}) => {
    const { themed } = useAppTheme();

    const isTrackingShot = Boolean(
        userLocation && currentShot && currentShot.category !== "putt"
    );
    const isTrackingPutt = Boolean(isPutting && holePinCoord && pendingPuttStart);
    const isActive = isTrackingShot || isTrackingPutt;

    const shotDistance = useMemo(() => {
        if (!isTrackingShot || !userLocation || !currentShot) return null;
        return Math.round(haversineMeters(userLocation, currentShot.start.point));
    }, [isTrackingShot, userLocation, currentShot]);

    const puttDistance = useMemo(() => {
        if (!isTrackingPutt || !holePinCoord || !pendingPuttStart) return null;
        return Math.round(toFeet(haversineMeters(pendingPuttStart, holePinCoord)));
    }, [isTrackingPutt, pendingPuttStart, holePinCoord]);

    const puttNumber = (putts ?? 0) + 1;

    // Animation
    const translateY = useRef(new Animated.Value(60)).current;
    const opacity = useRef(new Animated.Value(0)).current;
    const [mounted, setMounted] = useState(isActive);

    useEffect(() => {
        if (isActive) {
            setMounted(true);
            Animated.parallel([
                Animated.timing(translateY, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(translateY, {
                    toValue: 60,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start(() => setMounted(false));
        }
    }, [isActive]);

    if (!mounted) return null;

    return (
        <Animated.View style={[themed($container), { transform: [{ translateY }], opacity }]}>
            {isTrackingShot ? (
                <>
                    <RNText style={themed($footerText)}>
                        Tracking{" "}
                        <RNText style={themed($highlightText)}>
                            {currentShot?.club.label ?? "unknown club"}
                        </RNText>{" "}
                        shot
                    </RNText>
                    <Text
                        text={`${shotDistance ?? "--"} yards`}
                        style={themed($distanceText)}
                    />
                </>
            ) : (
                <>
                    <RNText style={themed($footerText)}>
                        Tracking{" "}
                        <RNText style={themed($highlightText)}>
                            {puttNumber}{ordinalSuffix(puttNumber)}
                        </RNText>{" "}
                        putt
                    </RNText>
                    <Text
                        text={`${puttDistance ?? "--"} feet`}
                        style={themed($distanceText)}
                    />
                </>
            )}
        </Animated.View>
    );
};

const $container: ThemedStyle<ViewStyle> = (theme) => ({
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
    borderRadius: 12,
    backgroundColor: theme.colors.backgrounds.elevated,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
});

const $footerText: ThemedStyle<TextStyle> = (theme) => ({
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "600",
});

const $highlightText: ThemedStyle<TextStyle> = (theme) => ({
    color: theme.colors.tint,
    fontSize: 16,
    fontWeight: "600",
});

const $distanceText: ThemedStyle<TextStyle> = (theme) => ({
    color: theme.colors.tint,
    textAlign: "right",
    fontSize: 16,
    fontWeight: "600",
});