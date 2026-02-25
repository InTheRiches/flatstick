import { Image, Pressable, View, Text, ViewStyle, ImageStyle, TextStyle } from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"

import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"
import { UserProfile } from "@/models/user"

interface ProfileHeaderProps {
    userProfile?: UserProfile
}

export function ProfileHeader({ userProfile }: ProfileHeaderProps) {
    const router = useRouter()
    const { themed, theme } = useAppTheme()

    // 🔒 Placeholder until you add global user context
    const user = userProfile
        ? {
            name: userProfile.displayName || `${userProfile.firstName} ${userProfile.lastName}`,
            memberSince: new Date(userProfile.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }),
          }
        : {
            name: "Hayden Williams",
            memberSince: "October 2024",
          }

    return (
        <View style={themed($container)}>
            <View style={themed($row)}>
                {/* LEFT SIDE: Profile Icon + Name */}
                <View style={themed($leftSection)}>
                    <View style={themed($avatar)}>
                        <Image
                            source={require("@assets/branding/FlatstickMallet.png")}
                            resizeMode="contain"
                            style={$image}
                        />
                    </View>

                    <View style={$textContainer}>
                        <Text style={themed($name)} numberOfLines={1}>
                            {user.name}
                        </Text>
                        <Text style={themed($subtext)}>
                            Member since {user.memberSince}
                        </Text>
                    </View>
                </View>

                {/* RIGHT SIDE: Settings */}
                <Pressable
                    onPress={() => router.push("/settings")}
                    hitSlop={10}
                    style={({ pressed }) => themed($settingsButton(pressed))}
                >
                    <Ionicons
                        name="settings-sharp"
                        size={20}
                        color={theme.colors.backgrounds.default}
                    />
                </Pressable>
            </View>
        </View>
    )
}

const $image: ImageStyle = {
    width: 40,
    height: 40
}

const $container: ThemedStyle<ViewStyle> = (theme) => ({
    width: "100%",
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
})

const $row: ThemedStyle<ViewStyle> = () => ({
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
})

const $leftSection: ThemedStyle<ViewStyle> = (theme) => ({
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
})

const $avatar: ThemedStyle<ViewStyle> = (theme) => ({
    width: 56,
    height: 56,
    borderRadius: 999,
    backgroundColor: theme.colors.backgrounds.elevated,
    alignItems: "center",
    justifyContent: "center",
})

const $name: ThemedStyle<TextStyle> = (theme) => ({
    fontSize: 22,
    fontWeight: "700",
    color: theme.colors.text,
})

const $subtext: ThemedStyle<TextStyle> = (theme) => ({
    fontSize: 14,
    color: theme.colors.textDim,
    marginTop: 2,
})

const $textContainer: ViewStyle = {
    justifyContent: "center",
}

const $settingsButton =
    (pressed: boolean): ThemedStyle<ViewStyle> =>
        (theme) => ({
            backgroundColor: theme.colors.buttons.background,
            opacity: pressed ? 0.85 : 1,
            width: 36,
            height: 36,
            borderRadius: 999,
            alignItems: "center",
            justifyContent: "center",
        })
