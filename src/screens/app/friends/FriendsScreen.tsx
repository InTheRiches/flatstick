import { FC, useMemo, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  Image,
  ImageStyle,
  Pressable,
  TextStyle,
  View,
  ViewStyle,
} from "react-native"

import PageHeader from "@/components/headers/PageHeader"
import { Screen } from "@/components/ui/Screen"
import { Text } from "@/components/ui/Text"
import { TextField } from "@/components/ui/TextField"
import { useUser } from "@/context"
import { useFriendsSocialData } from "@/hooks/social/useFriendsSocialData"
import type { FriendDoc, FriendRequestDoc, SocialUserSummary } from "@/models/social"
import {
  acceptFriendRequest,
  declineOrCancelFriendRequest,
  removeFriend,
  searchUsersByNameOrUsername,
  sendFriendRequest,
} from "@/services/firebase/social"
import { useAppTheme } from "@/theme/context"
import { $styles } from "@/theme/styles"
import { ThemedStyle } from "@/theme/types"

type ActionVariant = "primary" | "secondary" | "danger"

function initialsForName(name: string) {
    const parts = name.trim().split(" ").filter(Boolean)
    if (parts.length === 0) return "?"
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
    return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase()
}

function DisplayAvatar({ name, avatar }: { name: string; avatar?: string | null }) {
    const { themed } = useAppTheme()

    return (
        <View style={themed($avatar)}>
            {avatar ? (
                <Image source={{ uri: avatar }} style={$avatarImage} />
            ) : (
                <Text style={themed($avatarInitials)}>{initialsForName(name)}</Text>
            )}
        </View>
    )
}

function ActionButton({
    text,
    variant,
    onPress,
    disabled,
}: {
    text: string
    variant: ActionVariant
    onPress: () => void
    disabled?: boolean
}) {
    const { themed } = useAppTheme()

    return (
        <Pressable
            disabled={disabled}
            onPress={onPress}
            style={({ pressed }) =>
                themed([
                    $actionButton(variant),
                    pressed && !disabled ? $actionPressed : undefined,
                    disabled ? $actionDisabled : undefined,
                ])
            }
        >
            <Text style={themed($actionText(variant))}>{text}</Text>
        </Pressable>
    )
}

function UserRow({
    name,
    username,
    avatar,
    actions,
}: {
    name: string
    username?: string
    avatar?: string | null
    actions: React.ReactNode
}) {
    const { themed } = useAppTheme()

    return (
        <View style={themed($row)}>
            <View style={themed($rowUser)}>
                <DisplayAvatar name={name} avatar={avatar} />
                <View style={$rowTextWrap}>
                    <Text numberOfLines={1} style={themed($rowName)}>
                        {name}
                    </Text>
                    {username ? (
                        <Text numberOfLines={1} style={themed($rowUsername)}>
                            @{username}
                        </Text>
                    ) : null}
                </View>
            </View>

            <View style={$rowActions}>{actions}</View>
        </View>
    )
}

export const FriendsScreen: FC = function FriendsScreen() {
    const { themed, theme } = useAppTheme()
    const { authUser, userProfile } = useUser()
    const { friends, incomingRequests, outgoingRequests, loading, error } = useFriendsSocialData({
        includeRequests: true,
    })

    const [searchValue, setSearchValue] = useState("")
    const [searching, setSearching] = useState<boolean>(false)
    const [searchResults, setSearchResults] = useState<SocialUserSummary[]>([])
    const [activeActionKey, setActiveActionKey] = useState<string | null>(null)

    const currentUser = useMemo<SocialUserSummary | null>(() => {
        if (!authUser?.uid || !userProfile) return null

        return {
            userId: authUser.uid,
            displayName:
                userProfile.displayName || `${userProfile.firstName} ${userProfile.lastName}`.trim(),
            username: userProfile.username,
            usernameLower: userProfile.usernameLower,
            avatar: userProfile.avatar || null,
        }
    }, [authUser?.uid, userProfile])

    const existingRelationshipIds = useMemo(() => {
        const ids = new Set<string>()

        friends.forEach((friend) => ids.add(friend.friendId))
        incomingRequests.forEach((request) => ids.add(request.fromUserId))
        outgoingRequests.forEach((request) => ids.add(request.toUserId))

        return ids
    }, [friends, incomingRequests, outgoingRequests])

    const canSearch = !!authUser?.uid && searchValue.trim().length > 1

    const onSearchUsers = async () => {
        if (!authUser?.uid) return

        setSearching(true)
        try {
            const users = await searchUsersByNameOrUsername(authUser.uid, searchValue)
            const filtered = users.filter((user) => !existingRelationshipIds.has(user.userId))
            setSearchResults(filtered)
        } catch (nextError: any) {
            Alert.alert("Search Failed", nextError?.message || "Unable to search users right now")
        } finally {
            setSearching(false)
        }
    }

    const onSendRequest = async (targetUser: SocialUserSummary) => {
        if (!currentUser) return

        const actionKey = `send-${targetUser.userId}`
        setActiveActionKey(actionKey)
        try {
            await sendFriendRequest(currentUser, targetUser)
            setSearchResults((prev) => prev.filter((user) => user.userId !== targetUser.userId))
        } catch (nextError: any) {
            Alert.alert("Request Failed", nextError?.message || "Unable to send friend request")
        } finally {
            setActiveActionKey(null)
        }
    }

    const onAcceptRequest = async (request: FriendRequestDoc) => {
        if (!currentUser) return

        const actionKey = `accept-${request.requestId}`
        setActiveActionKey(actionKey)
        try {
            await acceptFriendRequest(currentUser, request)
        } catch (nextError: any) {
            Alert.alert("Accept Failed", nextError?.message || "Unable to accept request")
        } finally {
            setActiveActionKey(null)
        }
    }

    const onDeclineRequest = async (request: FriendRequestDoc) => {
        if (!authUser?.uid) return

        const actionKey = `decline-${request.requestId}`
        setActiveActionKey(actionKey)
        try {
            await declineOrCancelFriendRequest(authUser.uid, request)
        } catch (nextError: any) {
            Alert.alert("Decline Failed", nextError?.message || "Unable to decline request")
        } finally {
            setActiveActionKey(null)
        }
    }

    const onCancelRequest = async (request: FriendRequestDoc) => {
        if (!authUser?.uid) return

        const actionKey = `cancel-${request.requestId}`
        setActiveActionKey(actionKey)
        try {
            await declineOrCancelFriendRequest(authUser.uid, request)
        } catch (nextError: any) {
            Alert.alert("Cancel Failed", nextError?.message || "Unable to cancel request")
        } finally {
            setActiveActionKey(null)
        }
    }

    const onRemoveFriend = (friend: FriendDoc) => {
        if (!authUser?.uid) return

        Alert.alert(
            "Remove Friend",
            `Remove ${friend.displayName} from your friends list?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Remove",
                    style: "destructive",
                    onPress: async () => {
                        const actionKey = `remove-${friend.friendId}`
                        setActiveActionKey(actionKey)
                        try {
                            await removeFriend(authUser.uid, friend.friendId)
                        } catch (nextError: any) {
                            Alert.alert(
                                "Remove Failed",
                                nextError?.message || "Unable to remove this friend",
                            )
                        } finally {
                            setActiveActionKey(null)
                        }
                    },
                },
            ],
        )
    }

    return (
        <Screen contentContainerStyle={$styles.screen2} preset="scroll">
            <PageHeader title="Friends" />

            <View style={themed($content)}>
                {loading ? (
                    <View style={themed($loadingContainer)}>
                        <ActivityIndicator size="small" color={theme.colors.tint} />
                    </View>
                ) : null}

                {error ? <Text style={themed($errorText)}>{error}</Text> : null}

                <View style={themed($sectionCard)}>
                    <Text style={$styles.sectionHeader}>Add Friends</Text>
                    <Text style={themed($sectionDescription)}>
                        Search by display name or username.
                    </Text>

                    <TextField
                        label="Search"
                        placeholder="Type at least 2 characters"
                        value={searchValue}
                        onChangeText={setSearchValue}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />

                    <ActionButton
                        text={searching ? "Searching..." : "Find Players"}
                        variant="primary"
                        onPress={onSearchUsers}
                        disabled={!canSearch || searching}
                    />

                    <View style={themed($listWrap)}>
                        {searchResults.length === 0 ? (
                            <Text style={themed($emptyText)}>
                                {searching
                                    ? "Searching..."
                                    : "No users found yet. Try another name."}
                            </Text>
                        ) : (
                            searchResults.map((user) => {
                                const sending = activeActionKey === `send-${user.userId}`

                                return (
                                    <UserRow
                                        key={user.userId}
                                        name={user.displayName}
                                        username={user.username}
                                        avatar={user.avatar}
                                        actions={
                                            <ActionButton
                                                text={sending ? "Sending" : "Add"}
                                                variant="primary"
                                                onPress={() => onSendRequest(user)}
                                                disabled={sending}
                                            />
                                        }
                                    />
                                )
                            })
                        )}
                    </View>
                </View>

                <View style={themed($sectionCard)}>
                    <Text style={$styles.sectionHeader}>Incoming Requests</Text>

                    <View style={themed($listWrap)}>
                        {incomingRequests.length === 0 ? (
                            <Text style={themed($emptyText)}>No incoming requests.</Text>
                        ) : (
                            incomingRequests.map((request) => {
                                const accepting = activeActionKey === `accept-${request.requestId}`
                                const declining = activeActionKey === `decline-${request.requestId}`

                                return (
                                    <UserRow
                                        key={request.requestId}
                                        name={request.fromDisplayName}
                                        username={request.fromUsername}
                                        avatar={request.fromAvatar}
                                        actions={
                                            <View style={$stackedActions}>
                                                <ActionButton
                                                    text={accepting ? "Accepting" : "Accept"}
                                                    variant="primary"
                                                    onPress={() => onAcceptRequest(request)}
                                                    disabled={accepting || declining}
                                                />
                                                <ActionButton
                                                    text={declining ? "Declining" : "Decline"}
                                                    variant="secondary"
                                                    onPress={() => onDeclineRequest(request)}
                                                    disabled={accepting || declining}
                                                />
                                            </View>
                                        }
                                    />
                                )
                            })
                        )}
                    </View>
                </View>

                <View style={themed($sectionCard)}>
                    <Text style={$styles.sectionHeader}>Outgoing Requests</Text>

                    <View style={themed($listWrap)}>
                        {outgoingRequests.length === 0 ? (
                            <Text style={themed($emptyText)}>No outgoing requests.</Text>
                        ) : (
                            outgoingRequests.map((request) => {
                                const cancelling = activeActionKey === `cancel-${request.requestId}`

                                return (
                                    <UserRow
                                        key={request.requestId}
                                        name={request.toDisplayName}
                                        username={request.toUsername}
                                        avatar={request.toAvatar}
                                        actions={
                                            <ActionButton
                                                text={cancelling ? "Cancelling" : "Cancel"}
                                                variant="secondary"
                                                onPress={() => onCancelRequest(request)}
                                                disabled={cancelling}
                                            />
                                        }
                                    />
                                )
                            })
                        )}
                    </View>
                </View>

                <View style={themed($sectionCard)}>
                    <Text style={$styles.sectionHeader}>Friends ({friends.length})</Text>

                    <View style={themed($listWrap)}>
                        {friends.length === 0 ? (
                            <Text style={themed($emptyText)}>You have no friends yet.</Text>
                        ) : (
                            friends.map((friend) => {
                                const removing = activeActionKey === `remove-${friend.friendId}`

                                return (
                                    <UserRow
                                        key={friend.friendId}
                                        name={friend.displayName}
                                        username={friend.username}
                                        avatar={friend.avatar}
                                        actions={
                                            <ActionButton
                                                text={removing ? "Removing" : "Remove"}
                                                variant="danger"
                                                onPress={() => onRemoveFriend(friend)}
                                                disabled={removing}
                                            />
                                        }
                                    />
                                )
                            })
                        )}
                    </View>
                </View>
            </View>
        </Screen>
    )
}

const $content: ThemedStyle<ViewStyle> = (theme) => ({
    paddingTop: theme.spacing.xs,
    paddingBottom: theme.spacing.xl,
    gap: theme.spacing.md,
})

const $loadingContainer: ThemedStyle<ViewStyle> = (theme) => ({
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.xs,
})

const $errorText: ThemedStyle<TextStyle> = (theme) => ({
    color: theme.colors.error,
    marginBottom: theme.spacing.xs,
})

const $sectionCard: ThemedStyle<ViewStyle> = (theme) => ({
    width: "100%",
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 16,
    backgroundColor: theme.colors.backgrounds.elevated,
    padding: theme.spacing.sm,
    gap: theme.spacing.xs,
})

const $sectionDescription: ThemedStyle<TextStyle> = (theme) => ({
    fontSize: 13,
    color: theme.colors.textDim,
    marginBottom: theme.spacing.xs,
})

const $listWrap: ThemedStyle<ViewStyle> = (theme) => ({
    marginTop: theme.spacing.xs,
    gap: theme.spacing.xs,
})

const $emptyText: ThemedStyle<TextStyle> = (theme) => ({
    color: theme.colors.textDim,
    fontSize: 14,
})

const $row: ThemedStyle<ViewStyle> = (theme) => ({
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 12,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.backgrounds.default,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: theme.spacing.xs,
    gap: theme.spacing.xs,
})

const $rowUser: ThemedStyle<ViewStyle> = () => ({
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
})

const $avatar: ThemedStyle<ViewStyle> = (theme) => ({
    width: 34,
    height: 34,
    borderRadius: 999,
    backgroundColor: theme.colors.backgrounds.elevated,
    borderColor: theme.colors.border,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
})

const $avatarImage: ImageStyle = {
    width: 32,
    height: 32,
    borderRadius: 999,
}

const $avatarInitials: ThemedStyle<TextStyle> = (theme) => ({
    fontSize: 11,
    fontWeight: "700",
    color: theme.colors.text,
})

const $rowTextWrap: ViewStyle = {
    marginLeft: 10,
    flex: 1,
}

const $rowName: ThemedStyle<TextStyle> = (theme) => ({
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.text,
})

const $rowUsername: ThemedStyle<TextStyle> = (theme) => ({
    fontSize: 12,
    color: theme.colors.textDim,
})

const $rowActions: ViewStyle = {
    alignItems: "flex-end",
}

const $stackedActions: ViewStyle = {
    flexDirection: "row",
    gap: 8,
}

const $actionButton = (variant: ActionVariant): ThemedStyle<ViewStyle> => (theme) => {
    if (variant === "danger") {
        return {
            minWidth: 74,
            minHeight: 32,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: theme.colors.error,
            backgroundColor: theme.colors.errorBackground,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: theme.spacing.sm,
        }
    }

    if (variant === "secondary") {
        return {
            minWidth: 74,
            minHeight: 32,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.backgrounds.elevated,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: theme.spacing.sm,
        }
    }

    return {
        minWidth: 74,
        minHeight: 32,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: theme.colors.buttons.border,
        backgroundColor: theme.colors.buttons.background,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: theme.spacing.sm,
    }
}

const $actionText = (variant: ActionVariant): ThemedStyle<TextStyle> => (theme) => {
    if (variant === "danger") {
        return {
            fontSize: 12,
            fontWeight: "700",
            color: theme.colors.error,
        }
    }

    if (variant === "secondary") {
        return {
            fontSize: 12,
            fontWeight: "700",
            color: theme.colors.text,
        }
    }

    return {
        fontSize: 12,
        fontWeight: "700",
        color: theme.colors.buttons.textColor,
    }
}

const $actionPressed: ViewStyle = {
    opacity: 0.85,
}

const $actionDisabled: ViewStyle = {
    opacity: 0.55,
}
