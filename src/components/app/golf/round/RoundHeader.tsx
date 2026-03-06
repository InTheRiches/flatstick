import { useAppTheme } from "@/theme/context";
import { ThemedStyle } from "@/theme/types";
import { Ionicons } from "@expo/vector-icons";
import { Animated, FlatList, Pressable, TextStyle, View, ViewStyle } from "react-native";

import { Text } from "@/components/ui/Text";
import { useEffect, useRef, useState } from "react";

interface RoundHeaderProps {
    isPutting: boolean;
    prevHole: () => void;
    activeHole: number;
    nextHole: () => void;
    onExit?: () => void;
    onPuttingExit?: () => void;
    setHoleNumber: (hole: number) => void;
}

export const RoundHeader: React.FC<RoundHeaderProps> = ({ isPutting, onPuttingExit, prevHole, activeHole, nextHole, onExit, setHoleNumber }) => {
    const { theme, themed } = useAppTheme();
    const [showHoleNumbers, setShowHoleNumbers] = useState(false);

    // Animation
    const translateY = useRef(new Animated.Value(-60)).current;
    const opacity = useRef(new Animated.Value(0)).current;
    const [mounted, setMounted] = useState(showHoleNumbers);

    useEffect(() => {
        if (showHoleNumbers) {
            setMounted(true);
            Animated.parallel([
                Animated.timing(translateY, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(translateY, {
                    toValue: -60,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start(() => setMounted(false));
        }
    }, [showHoleNumbers]);

    return (
        <>
            <View style={$container}>
                {isPutting ? (
                    <Pressable style={themed($exitPuttingButton)} onPress={onPuttingExit}>
                        <Ionicons name="close-outline" size={36} color={theme.colors.buttons.textColor} />
                    </Pressable>
                ) : (
                    <Pressable style={themed($exitButton)} onPress={onExit}>
                        <Ionicons name="exit-outline" size={30} color={theme.colors.buttons.textColor} />
                    </Pressable>
                )}
                <View style={themed($topOverlay)}>
                    <Pressable onPress={prevHole} style={themed($navButton)}>
                        <Ionicons name="chevron-back" size={24} color={theme.colors.buttons.textColor} />
                    </Pressable>
                    <Pressable onPress={() => setShowHoleNumbers(!showHoleNumbers)} style={$holeInfo}>
                        <Text style={$holeText}>Hole {activeHole}</Text>
                    </Pressable>
                    <Pressable onPress={nextHole} style={themed($navButton)}>
                        <Ionicons name="chevron-forward" size={24} color={theme.colors.buttons.textColor} />
                    </Pressable>
                </View>
            </View>
            {mounted && (
                <Animated.View style={[themed($holeNumbers), { transform: [{ translateY }], opacity }]}>
                    <FlatList 
                        contentContainerStyle={[themed($holeNumbersOverlay), {marginRight: -24}]}
                        data={Array.from({ length: 9 }, (_, i) => i + 1)}
                        renderItem={({item, index}) => {
                            return (
                                <Pressable style={themed($holeNumber)} key={index} onPress={() => {
                                    setHoleNumber(index + 1);
                                    setShowHoleNumbers(false);
                                }}>
                                    <Text style={$holeText}>{index + 1}</Text>
                                </Pressable>
                            )
                        }}
                        numColumns={3}/>
                    <FlatList 
                        contentContainerStyle={[themed($holeNumbersOverlay), {marginLeft: -24}]}
                        data={Array.from({ length: 9 }, (_, i) => i + 1)}
                        renderItem={({item, index}) => {
                            return (
                                <Pressable style={themed($holeNumber)} key={index} onPress={() => {
                                    setHoleNumber(index + 10);
                                    setShowHoleNumbers(false);
                                }}>
                                    <Text style={$holeText}>{index + 10}</Text>
                                </Pressable>
                            )
                        }}
                        numColumns={3}/>
                </Animated.View>
            )}
        </>

    )
}

const $holeNumber: ThemedStyle<ViewStyle> = (theme) => ({
    borderRadius: 999,
    width: 50,
    height: 50,
    backgroundColor: theme.colors.backgrounds.default,
    alignItems: "center",
    justifyContent: "center",
    margin: 4,
});

const $holeNumbers: ThemedStyle<ViewStyle> = (theme) => ({
    position: "absolute",
    top: 120,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "space-around",
    flexDirection: "row",
    zIndex: 1000,
});

const $holeNumbersOverlay: ThemedStyle<ViewStyle> = (theme) => ({
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    padding: 6,
    backgroundColor: theme.colors.backgrounds.elevated,
    borderRadius: 24,
});

const $container: ViewStyle = {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
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
    width: 50,
    height: 50,
    borderRadius: 999,
    backgroundColor: theme.colors.buttons.background,
    position: "absolute",
    left: 16,
    alignItems: "center",
    justifyContent: "center",
});

const $exitPuttingButton: ThemedStyle<ViewStyle> = (theme) => ({
    padding: 8,
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
