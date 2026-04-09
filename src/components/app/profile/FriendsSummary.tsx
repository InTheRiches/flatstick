import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import React from "react"
import {
    ActivityIndicator,
    Image,
    ImageStyle,
    Pressable,
    TextStyle,
    View,
    ViewStyle,
} from "react-native"

import { Text } from "@/components/ui/Text"
import { useFriendsSocialData } from "@/hooks/social/useFriendsSocialData"
import type { UserProfile } from "@/models/user"
import { useAppTheme } from "@/theme/context"
import { $styles } from "@/theme/styles"
import { ThemedStyle } from "@/theme/types"

interface FriendsSummaryProps {
    userProfile?: UserProfile
}

function initialsForName(name: string) {
    const parts = name.trim().split(" ").filter(Boolean)
    if (parts.length === 0) return "?"
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
    return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase()
}

export function FriendsSummary({ userProfile }: FriendsSummaryProps) {
    const router = useRouter()
    const { themed, theme } = useAppTheme()
    const { friends, loading } = useFriendsSocialData()

    const friendCount = userProfile?.friendIds?.length ?? friends.length
    const previewFriends = friends.slice(0, 6)

    return (
        <View style={$container}>
            <Text style={$styles.sectionHeader}>Friends</Text>
            <Pressable
                onPress={() => router.push("/friends")}
                style={({ pressed }) => themed([$card, pressed && $pressedCard])}
            >
                <View>
                    <Text style={themed($subtitle)}>
                        {friendCount} {friendCount === 1 ? "Friend" : "Friends"}
                    </Text>
                    <View style={$innerSection}>
                        {loading ? (
                            <ActivityIndicator size="small" color={theme.colors.tint} />
                        ) : (
                            <>
                                {previewFriends.map((friend) => (
                                    <View key={friend.friendId} style={themed($avatar)}>
                                        {friend.avatar ? (
                                            <Image source={{ uri: friend.avatar }} style={$image} />
                                        ) : (
                                            <Text style={themed($avatarInitials)}>
                                                {initialsForName(friend.displayName)}
                                            </Text>
                                        )}
                                    </View>
                                ))}

                                {friendCount > previewFriends.length ? (
                                    <View style={themed($avatar)}>
                                        <Text style={themed($moreText)}>
                                            +{friendCount - previewFriends.length}
                                        </Text>
                                    </View>
                                ) : null}
                            </>
                        )}
                    </View>
                </View>
                <Ionicons name="chevron-forward" size={24} color={theme.colors.textDim} style={$chevron} />
            </Pressable>
        </View>
    )
}

const $chevron: TextStyle = {
    marginLeft: 8
}

const $pressedCard: ViewStyle = {
    opacity: 0.85,
}

const $innerSection: ViewStyle = {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
}

const $image: ImageStyle = {
    width: 28,
    height: 28,
    borderRadius: 999,
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

const $avatarInitials: ThemedStyle<TextStyle> = (theme) => ({
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.text,
})

const $moreText: ThemedStyle<TextStyle> = (theme) => ({
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.textDim,
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
    justifyContent: "space-between",
    backgroundColor: theme.colors.backgrounds.elevated,
    borderColor: theme.colors.border
})

const $container: ViewStyle = {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
}