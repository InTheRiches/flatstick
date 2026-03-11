// SelectCourseDetailsModal.tsx
import { BottomSheetModal } from "@gorhom/bottom-sheet"
import React from "react"
import { Pressable, TextStyle, View, ViewStyle } from "react-native"

import { Button } from "@/components/ui/Button"
import { Text } from "@/components/ui/Text"
import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"
import { BottomSheetModalFactory } from "../../modals/BottomSheetFactory"

interface ConfirmExitModalProps {
    reference: React.RefObject<BottomSheetModal | null>
    onSave?: () => void
    onDelete?: () => void
}

export default function ConfirmExitModal({reference, onSave, onDelete}: ConfirmExitModalProps) {
    const {theme, themed} = useAppTheme()

    return (
        <BottomSheetModalFactory
            reference={reference}
            enablePanDownToClose={true}
            handleIndicatorStyle={{backgroundColor: theme.colors.text}}
        >
            <Text text={"Exit Round?"} style={themed($titleText)} />
            <Text text={"What would you like to do with this round?"} style={{ textAlign: "center", marginTop: 16 }} />
            <View style={$buttonsContainer}>
                <Button text={"Upload as Partial"} onPress={() => {
                    reference.current?.dismiss();
                    onSave && onSave();
                }} style={$button} />
                <Button text={"Save for Later"} onPress={() => {
                    reference.current?.dismiss();
                    onSave && onSave();
                }} style={themed($secondaryButton)} textStyle={themed($secondaryButtonTextStyle)} />
                <Pressable onPress={() => {
                    reference.current?.dismiss();
                    onDelete && onDelete();
                }} style={themed($dangerButton)}>
                    <Text text={"Discard Round"} style={themed($dangerButtonText)} />
                </Pressable>
                <Pressable onPress={() => reference.current?.dismiss()} style={$cancelButton}>
                    <Text text={"Cancel"} style={themed($cancelButtonText)} />
                </Pressable>
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

const $buttonsContainer: ViewStyle = {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    gap: 10
}

const $button: ViewStyle = {
    width: "100%",
    maxWidth: 240,
}

const $secondaryButton: ThemedStyle<ViewStyle> = (theme) => ({
    width: "100%",
    maxWidth: 240,
    backgroundColor: theme.colors.buttons.secondary.background,
    borderColor: theme.colors.buttons.secondary.border,
})

const $secondaryButtonTextStyle: ThemedStyle<TextStyle> = (theme) => ({
    color: theme.colors.buttons.secondary.textColor,
})

const $dangerButton: ThemedStyle<ViewStyle> = (theme) => ({
    marginTop: 12,
    borderTopWidth: 1,
    width: "100%",
    maxWidth: 240,
    borderColor: theme.colors.border,
    paddingTop: 16,
})

const $cancelButton: ViewStyle = {
    marginTop: 8
}

const $cancelButtonText: ThemedStyle<TextStyle> = (theme) => ({
    color: theme.colors.buttons.secondary.textColor,
    fontSize: 18
})

const $dangerButtonText: ThemedStyle<TextStyle> = (theme) => ({
    color: theme.colors.buttons.danger.background,
    fontWeight: "600",
    textAlign: "center",
    fontSize: 18
})
