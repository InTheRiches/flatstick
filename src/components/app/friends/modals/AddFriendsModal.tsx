import { BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet"
import React from "react"
import { Alert, StyleSheet, TextStyle, View, ViewStyle } from "react-native"
import { BottomSheetModalFactory } from "@/components/app/modals/BottomSheetFactory"
import { Button } from "@/components/ui/Button"
import { Text } from "@/components/ui/Text"
import { TextField } from "@/components/ui/TextField"
import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"
import { SocialUserSummary } from "@/models/social"

interface AddFriendsModalProps {
    reference: React.RefObject<BottomSheetModal | null>
    searchValue: string
    setSearchValue: (value: string) => void
    searching: boolean
    canSearch: boolean
    searchResults: SocialUserSummary[]
    activeActionKey: string | null
    onSearchUsers: () => Promise<void>
    onSendRequest: (targetUser: SocialUserSummary) => Promise<void>
    UserRowComponent: React.FC<any>
    ActionButtonComponent: React.FC<any>
}

export function AddFriendsModal({
    reference,
    searchValue,
    setSearchValue,
    searching,
    canSearch,
    searchResults,
    activeActionKey,
    onSearchUsers,
    onSendRequest,
    UserRowComponent,
    ActionButtonComponent,
}: AddFriendsModalProps) {
    const { themed, theme } = useAppTheme()

    return (
        <BottomSheetModalFactory
            reference={reference}
            snapPoints={["90%"]}
            enablePanDownToClose={true}
        >
            <View style={$headerWrap}>
                <Text style={$title}>Add Friends</Text>
            </View>

            <BottomSheetScrollView contentContainerStyle={themed($listContent)} keyboardShouldPersistTaps="handled">
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

                <Button
                    text={searching ? "Searching..." : "Find Players"}
                    onPress={onSearchUsers}
                    disabled={!canSearch || searching}
                    style={$searchBtn}
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
                                <UserRowComponent
                                    key={user.userId}
                                    name={user.displayName}
                                    username={user.username}
                                    avatar={user.avatar}
                                    actions={
                                        <ActionButtonComponent
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
            </BottomSheetScrollView>
        </BottomSheetModalFactory>
    )
}

const $headerWrap: ViewStyle = {
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ccc",
    marginBottom: 16,
}

const $title: TextStyle = {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center"
}

const $sectionDescription: ThemedStyle<TextStyle> = (theme) => ({
    fontSize: 14,
    color: theme.colors.textDim,
    marginBottom: theme.spacing.sm,
})

const $listContent: ThemedStyle<ViewStyle> = (theme) => ({
    paddingBottom: 40,
})

const $listWrap: ThemedStyle<ViewStyle> = (theme) => ({
    marginTop: theme.spacing.md,
    gap: theme.spacing.xs,
})

const $emptyText: ThemedStyle<TextStyle> = (theme) => ({
    color: theme.colors.textDim,
    fontSize: 14,
    textAlign: "center",
    marginTop: 20,
})

const $searchBtn: ViewStyle = {
    marginTop: 12,
}
