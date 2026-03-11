// SelectCourseDetailsModal.tsx
import { BottomSheetModal } from "@gorhom/bottom-sheet"
import React from "react"
import { TextStyle, View, ViewStyle } from "react-native"

import { Button } from "@/components/ui/Button"
import { Text } from "@/components/ui/Text"
import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"
import { BottomSheetModalFactory } from "../../modals/BottomSheetFactory"

interface WarningModalProps {
    reference: React.RefObject<BottomSheetModal | null>
    onAction: () => void
    actionText?: string
    header?: string
    subtext?: string
}

export default function WarningModal({reference, onAction, actionText, header, subtext}: WarningModalProps) {
    const {theme, themed} = useAppTheme()

    return (
        <BottomSheetModalFactory
            reference={reference}
            enablePanDownToClose={true}
            handleIndicatorStyle={{backgroundColor: theme.colors.text}}
        >
            <Text text={header || "Submit Round?"} style={themed($titleText)} />
            <Text text={subtext || "You have not recorded any data for this round. Nothing to submit."} style={{color: theme.colors.textDim, fontSize: 14, textAlign: "center", marginTop: 8}} />

            <View style={$actionRow}>
                <Button text={"Cancel"} preset={"secondary"} onPress={() => reference.current?.dismiss()} style={themed($secondaryButton)} />
                <Button text={actionText || `Submit`} preset={"default"} style={themed($secondaryButton)} onPress={onAction} />
            </View>
        </BottomSheetModalFactory>
     )
}

const $titleText: ThemedStyle<TextStyle> = (theme) => ({
    fontSize: 20,
    fontWeight: "700",
    color: theme.colors.text,
    textAlign: "center"
})

const $actionRow: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    flex: 1,
    gap: 19
}

const $secondaryButton: ThemedStyle<ViewStyle> = (theme) => ({
    flex: 1,
    flexBasis: 0,
})
