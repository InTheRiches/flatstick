// NewGripModal.tsx
import React, {useState} from "react"
import {BottomSheetModal} from "@gorhom/bottom-sheet"
import {View, TextStyle, ViewStyle} from "react-native"

import {BottomSheetModalFactory} from "../../modals/BottomSheetFactory"
import {Text} from "@/components/ui/Text"
import {TextField} from "@/components/ui/TextField"
import {Button} from "@/components/ui/Button"
import {useAppTheme} from "@/theme/context"
import {$styles} from "@/theme/styles"
import {useEquipment} from "@/context"
import {GRIP_CATEGORIES, GripCategory} from "@/models/equipment";
import DropdownPicker from "@/components/ui/DropdownPicker"

interface NewGripModalProps {
    reference: React.RefObject<BottomSheetModal | null>
}

export default function NewGripModal({reference}: NewGripModalProps) {
    const {theme} = useAppTheme()
    const {createGrip} = useEquipment()

    // Form state
    const [name, setName] = useState("")
    const [category, setCategory] = useState<GripCategory>("conventional")
    const isSaveEnabled = name.trim().length >= 2

    const onSave = async () => {
        if (!isSaveEnabled) return

        await createGrip({
            name: name.trim(),
            nameLower: name.trim().toLowerCase(),
            category,
        })

        reference.current?.dismiss()
    }

    return (
        <BottomSheetModalFactory
            reference={reference}
            enablePanDownToClose={true}
            handleIndicatorStyle={{backgroundColor: theme.colors.text}}
        >
            <Text text="New Grip" style={$styles.modalHeader}/>

            <TextField label="Name" placeholder="e.g. Claw Grip" value={name} onChangeText={setName}/>

            <View style={$section}>
                <DropdownPicker
                    label="Category"
                    options={GRIP_CATEGORIES}
                    value={category}
                    onChange={(v) => setCategory(v as GripCategory)}
                />
            </View>

            <Button text="Save Grip" onPress={onSave} style={$button} disabled={!isSaveEnabled}/>

            {!isSaveEnabled && <Text text="Name must be at least 2 characters" style={$helperDisabled}/>}
        </BottomSheetModalFactory>
    )
}

const $section: ViewStyle = {
    marginTop: 12,
}

const $button: ViewStyle = {
    marginTop: 14,
    alignSelf: "center",
    paddingHorizontal: 48,
    paddingVertical: 8,
}

const $helperDisabled: TextStyle = {
    marginTop: 8,
    textAlign: "center",
    color: "#8b8b8b",
    fontSize: 12,
}