import {useRouter} from "expo-router";
import {useAppTheme} from "@/theme/context";
import {Image, ImageStyle, TextStyle, View, ViewStyle} from "react-native";

import {Text} from "@/components/Text";
import {ThemedStyle} from "@/theme/types";
import React from "react";
import {Ionicons} from "@expo/vector-icons";
import {$styles} from "@/theme/styles";

export function FriendsSummary() {
    const router = useRouter()
    const {themed, theme} = useAppTheme()

    return (
        <View style={$container}>
            <Text style={$styles.sectionHeader}>Friends</Text>
            <View style={themed($card)}>
                <View>
                    <Text style={themed($subtitle)}>24 Friends</Text>
                    <View style={$innerSection}>
                        <View style={themed($avatar)}>
                            <Image
                                source={require("@assets/branding/FlatstickMallet.png")}
                                resizeMode="contain"
                                style={$image}
                            />
                        </View>
                        <View style={themed($avatar)}>
                            <Image
                                source={require("@assets/branding/FlatstickMallet.png")}
                                resizeMode="contain"
                                style={$image}
                            />
                        </View>
                        <View style={themed($avatar)}>
                            <Image
                                source={require("@assets/branding/FlatstickMallet.png")}
                                resizeMode="contain"
                                style={$image}
                            />
                        </View>
                        <View style={themed($avatar)}>
                            <Image
                                source={require("@assets/branding/FlatstickMallet.png")}
                                resizeMode="contain"
                                style={$image}
                            />
                        </View>
                        <View style={themed($avatar)}>
                            <Image
                                source={require("@assets/branding/FlatstickMallet.png")}
                                resizeMode="contain"
                                style={$image}
                            />
                        </View>
                        <View style={themed($avatar)}>
                            <Image
                                source={require("@assets/branding/FlatstickMallet.png")}
                                resizeMode="contain"
                                style={$image}
                            />
                        </View>
                        <View style={themed($avatar)}>
                            <Text>+17</Text>
                        </View>
                    </View>
                </View>
                <Ionicons name="chevron-forward" size={24} color={theme.colors.textDim} style={$chevron} />
            </View>
        </View>
    )
}

const $chevron: TextStyle = {
    marginLeft: 8
}

const $innerSection: ViewStyle = {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
}

const $image: ImageStyle = {
    width: 28,
    height: 28
}

const $avatar: ThemedStyle<ViewStyle> = (theme) => ({
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: theme.colors.backgrounds.elevated,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
})

const $subtitle: ThemedStyle<TextStyle> = (theme) => ({
    fontWeight: "700",
    color: theme.colors.textDim,
    fontSize: 13
})

const $card: ThemedStyle<ViewStyle> = (theme) => ({
    width: "100%",
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingTop: 4,
    paddingBottom: 10,
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.backgrounds.elevated,
    borderColor: theme.colors.border
})

const $container: ViewStyle = {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
}