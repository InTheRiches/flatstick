import { useAppTheme } from "@/theme/context";
import { ThemedStyle } from "@/theme/types";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, TextStyle, View, ViewStyle } from "react-native";

import { Text } from "@/components/ui/Text";

interface RoundHeaderProps {
    prevHole: () => void;
    activeHole: number;
    nextHole: () => void;
}

export const RoundHeader: React.FC<RoundHeaderProps> = ({ prevHole, activeHole, nextHole }) => {
    const { theme, themed } = useAppTheme();

    return (
        <View style={$container}>
            <Pressable style={themed($exitButton)}>
                <Ionicons name="exit-outline" size={30} color={theme.colors.buttons.textColor} />
            </Pressable>
            <View style={themed($topOverlay)}>
                <Pressable onPress={prevHole} style={themed($navButton)}>
                    <Ionicons name="chevron-back" size={24} color={theme.colors.buttons.textColor} />
                </Pressable>
                <View style={$holeInfo}>
                    <Text style={$holeText}>Hole {activeHole}</Text>
                </View>
                <Pressable onPress={nextHole} style={themed($navButton)}>
                    <Ionicons name="chevron-forward" size={24} color={theme.colors.buttons.textColor} />
                </Pressable>
            </View>
        </View>
    )
}

const $container: ViewStyle = {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    gap: 12,
    paddingHorizontal: 16, // Optional: adds breathing room from edges
};

const $topOverlay: ThemedStyle<ViewStyle> = (theme) => ({
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: theme.colors.backgrounds.elevated,
    borderRadius: 30,
    padding: 6,
    flex: 1,
    maxWidth: 250,
});

const $navButton: ThemedStyle<ViewStyle> = (theme) => ({
    padding: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.buttons.background,
});

const $exitButton: ThemedStyle<ViewStyle> = (theme) => ({
    paddingLeft: 14,
    paddingTop: 12,
    paddingRight: 10,
    paddingBottom: 12,
    borderRadius: 999,
    backgroundColor: theme.colors.buttons.background,
    position: "absolute",
    left: 16,
    alignItems: "center",
    justifyContent: "center",
});

const $holeInfo: ViewStyle = {
    alignItems: "center",
};

const $holeText: TextStyle = {
    fontSize: 20,
    fontWeight: "800",
}