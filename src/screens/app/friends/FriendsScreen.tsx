import { FC, useMemo, useRef, useState } from "react"
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
import { Button } from "@/components/ui/Button"
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
import { Ionicons } from "@expo/vector-icons"
import { BottomSheetModal } from "@gorhom/bottom-sheet"
import { AddFriendsModal } from "@/components/app/friends/modals/AddFriendsModal"
import { FriendRequestsModal } from "@/components/app/friends/modals/FriendRequestsModal"

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

    const addFriendsModalRef = useRef<BottomSheetModal>(null)
    const friendRequestsModalRef = useRef<BottomSheetModal>(null)

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
        <Screen contentContainerStyle={$styles.screen} preset="scroll">
            <PageHeader title="Friends" />

            <View style={themed($actionRow)}>
                <Button 
                    style={$addFriendsBtn} 
                    preset={"secondary"} 
                    text="Add friends" 
                    onPress={() => addFriendsModalRef.current?.present()}
                    LeftAccessory={(props) => <Ionicons name="add-outline" size={24} color={theme.colors.buttons.secondary.textColor} />} 
                />
                <View style={$requestsBtnWrapper}>
                    <Button 
                        style={$addFriendsBtn} 
                        preset={"secondary"} 
                        text="Requests" 
                        onPress={() => friendRequestsModalRef.current?.present()}
                    />
                    {incomingRequests.length > 0 && (
                        <View style={themed($notificationDot)}>
                            <Text style={$notificationText}>!</Text>
                        </View>
                    )}
                </View>
            </View>

            <Text style={themed($friendCount)}>{friends.length} friends</Text>
            <View style={themed($friendsList)}>
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

            <View style={themed($content)}>
                {loading ? (
                    <View style={themed($loadingContainer)}>
                        <ActivityIndicator size="small" color={theme.colors.tint} />
                    </View>
                ) : null}

                {error ? <Text style={themed($errorText)}>{error}</Text> : null}
            </View>

            <AddFriendsModal
                reference={addFriendsModalRef}
                searchValue={searchValue}
                setSearchValue={setSearchValue}
                searching={searching}
                canSearch={canSearch}
                searchResults={searchResults}
                activeActionKey={activeActionKey}
                onSearchUsers={onSearchUsers}
                onSendRequest={onSendRequest}
                UserRowComponent={UserRow}
                ActionButtonComponent={ActionButton}
            />

            <FriendRequestsModal
                reference={friendRequestsModalRef}
                incomingRequests={incomingRequests}
                outgoingRequests={outgoingRequests}
                activeActionKey={activeActionKey}
                onAcceptRequest={onAcceptRequest}
                onDeclineRequest={onDeclineRequest}
                onCancelRequest={onCancelRequest}
                UserRowComponent={UserRow}
                ActionButtonComponent={ActionButton}
            />
        </Screen>
    )
}

const $actionRow: ThemedStyle<ViewStyle> = (theme) => ({
    flexDirection: "row",
    gap: theme.spacing.xs,
})

const $friendCount: ThemedStyle<TextStyle> = (theme) => ({
    marginTop: theme.spacing.md,
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.text,
})

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

const $friendsList: ThemedStyle<ViewStyle> = (theme) => ({
    marginTop: -theme.spacing.xxs,
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

const $addFriendsBtn: ViewStyle = {
    marginTop: 12,
    flex: 1
}

const $requestsBtnWrapper: ViewStyle = {
    flex: 1,
    position: "relative",
}

const $notificationDot: ThemedStyle<ViewStyle> = (theme) => ({
    position: "absolute",
    top: 6,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.colors.error,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    borderWidth: 2,
    borderColor: theme.colors.backgrounds.default,
})

const $notificationText: TextStyle = {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
}

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
