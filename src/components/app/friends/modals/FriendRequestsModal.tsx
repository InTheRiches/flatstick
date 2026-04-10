import React, { useState } from "react"
import { Alert, StyleSheet, TextStyle, View, ViewStyle } from "react-native"
import { BottomSheetModalFactory } from "@/components/app/modals/BottomSheetFactory"
import { Button } from "@/components/ui/Button"
import { Text } from "@/components/ui/Text"
import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"
import { BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet"
import { FriendRequestDoc, SocialUserSummary } from "@/models/social"

interface FriendRequestsModalProps {
    reference: React.RefObject<BottomSheetModal | null>
    incomingRequests: FriendRequestDoc[]
    outgoingRequests: FriendRequestDoc[]
    activeActionKey: string | null
    onAcceptRequest: (request: FriendRequestDoc) => Promise<void>
    onDeclineRequest: (request: FriendRequestDoc) => Promise<void>
    onCancelRequest: (request: FriendRequestDoc) => Promise<void>
    UserRowComponent: React.FC<any>
    ActionButtonComponent: React.FC<any>
}

export function FriendRequestsModal({
    reference,
    incomingRequests,
    outgoingRequests,
    activeActionKey,
    onAcceptRequest,
    onDeclineRequest,
    onCancelRequest,
    UserRowComponent,
    ActionButtonComponent,
}: FriendRequestsModalProps) {
    const { themed, theme } = useAppTheme()
    const [view, setView] = useState<"incoming" | "outgoing">("incoming")

    return (
        <BottomSheetModalFactory
            reference={reference}
            snapPoints={["90%"]}
            enablePanDownToClose={true}
        >
            <View style={$headerWrap}>
                <Text style={$title}>Friend Requests</Text>
            </View>
            
            <View style={themed($switcherWrap)}>
                <Button
                    text="Incoming"
                    preset={view === "incoming" ? "default" : "secondary"}
                    onPress={() => setView("incoming")}
                    style={$switcherBtn}
                />
                <Button
                    text="Outgoing"
                    preset={view === "outgoing" ? "default" : "secondary"}
                    onPress={() => setView("outgoing")}
                    style={$switcherBtn}
                />
            </View>

            <BottomSheetScrollView contentContainerStyle={themed($listContent)}>
                {view === "incoming" && (
                    <View style={themed($listWrap)}>
                        {incomingRequests.length === 0 ? (
                            <Text style={themed($emptyText)}>No incoming requests.</Text>
                        ) : (
                            incomingRequests.map((request) => {
                                const accepting = activeActionKey === `accept-${request.requestId}`
                                const declining = activeActionKey === `decline-${request.requestId}`

                                return (
                                    <UserRowComponent
                                        key={request.requestId}
                                        name={request.fromDisplayName}
                                        username={request.fromUsername}
                                        avatar={request.fromAvatar}
                                        actions={
                                            <View style={$stackedActions}>
                                                <ActionButtonComponent
                                                    text={accepting ? "Accepting" : "Accept"}
                                                    variant="primary"
                                                    onPress={() => onAcceptRequest(request)}
                                                    disabled={accepting || declining}
                                                />
                                                <ActionButtonComponent
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
                )}

                {view === "outgoing" && (
                    <View style={themed($listWrap)}>
                        {outgoingRequests.length === 0 ? (
                            <Text style={themed($emptyText)}>No outgoing requests.</Text>
                        ) : (
                            outgoingRequests.map((request) => {
                                const cancelling = activeActionKey === `cancel-${request.requestId}`

                                return (
                                    <UserRowComponent
                                        key={request.requestId}
                                        name={request.toDisplayName}
                                        username={request.toUsername}
                                        avatar={request.toAvatar}
                                        actions={
                                            <ActionButtonComponent
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
                )}
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

const $switcherWrap: ThemedStyle<ViewStyle> = (theme) => ({
    flexDirection: "row",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
})

const $switcherBtn: ViewStyle = {
    flex: 1,
}

const $listContent: ThemedStyle<ViewStyle> = (theme) => ({
    paddingBottom: 40,
})

const $listWrap: ThemedStyle<ViewStyle> = (theme) => ({
    gap: theme.spacing.xs,
})

const $emptyText: ThemedStyle<TextStyle> = (theme) => ({
    color: theme.colors.textDim,
    fontSize: 14,
    textAlign: "center",
    marginTop: 20,
})

const $stackedActions: ViewStyle = {
    flexDirection: "row",
    gap: 8,
}
