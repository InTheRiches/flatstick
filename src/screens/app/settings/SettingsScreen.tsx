import { FC } from "react"

import { FlatstickHeader } from "@/components/FlatstickHeader"
import { FullFeedItem } from "@/components/FullFeedItem"
import { Screen } from "@/components/Screen"
import { $styles } from "@/theme/styles"
import { useSafeAreaInsetsStyle } from "@/utils/useSafeAreaInsetsStyle"
import type {ThemedStyle} from "@/theme/types";
import {TouchableOpacity, View, ViewStyle} from "react-native";
import FeatherIcon from "@expo/vector-icons/Feather";
import {useAppTheme} from "@/theme/context";
import {useRouter} from "expo-router";

export const SettingsScreen: FC = function SettingsScreen() {
    const { themed, theme } = useAppTheme()

    const $containerInsets = useSafeAreaInsetsStyle(["top"])

    const router = useRouter()

    return (
        <Screen contentContainerStyle={[$styles.flex1, $styles.px, $containerInsets]}>
            <View style={themed($header)}>
              <TouchableOpacity onPress={() => router.back()} style={themed($headerBack)}>
                <FeatherIcon color={theme.colors.text} name="chevron-left" size={30} />
              </TouchableOpacity>
            </View>
            <FullFeedItem />
        </Screen>
    )
}

const $header: ThemedStyle<ViewStyle> = (theme) => ({
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing.md,
})

const $headerBack: ThemedStyle<ViewStyle> = (theme) => ({
    padding: theme.spacing.xs,
    paddingTop: 0,
    position: "relative",
    marginLeft: -theme.spacing.md,
})