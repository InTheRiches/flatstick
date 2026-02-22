// app/components/modals/equipment/EditPutterModal.tsx
import React, {useImperativeHandle, useMemo, useState} from "react"
import { BottomSheetModal } from "@gorhom/bottom-sheet"
import {Pressable, TextStyle, View, ViewStyle} from "react-native"

import { useAppTheme } from "@/theme/context"
import { Text } from "@/components/ui/Text"
import { TextField } from "@/components/ui/TextField"
import { Button } from "@/components/ui/Button"
import { BottomSheetModalFactory } from "../../modals/BottomSheetFactory"
import { $styles } from "@/theme/styles"

import { useEquipment } from "@/context"
import {GRIP_CATEGORIES, GripCategory, GripDoc} from "@/models/equipment"
import DropdownPicker from "@/components/ui/DropdownPicker"

interface EditGripModalProps {
    reference: React.RefObject<EditGripReference | null>
}

export interface EditGripReference {
    open: () => void
    close: () => void
    setGrip: (grip: GripDoc | null) => void
}

/**
 * Edit Putter modal
 * - Receives a PutterDoc
 * - Allows editing brand/model
 * - Optional "Specifics" toggle for loft/lie
 * - Archive toggle (instead of delete)
 * - Save calls updatePutter(...) (placeholder if you don't have it yet)
 */
export default function EditGripModal({ reference }: EditGripModalProps) {
    const {theme} = useAppTheme()
    const {updateGrip} = useEquipment()
    const innerRef = React.useRef<BottomSheetModal>(null)

    const [grip, setGrip] = useState<GripDoc | null>(null);

    // Form state
    const [name, setName] = useState("")
    const [category, setCategory] = useState<GripCategory>("conventional")

    useImperativeHandle(reference, () => ({
        open: () => {
            innerRef.current?.present();
        },
        close: () => {
            innerRef.current?.dismiss();
        },
        setGrip: (input) => {
            if (!input) return;

            setGrip(input);

            setName(input.name);
            setCategory(input.category);
        },
    } as EditGripReference));

    const nameValid = name.trim().length >= 2
    const isSaveEnabled = !!grip && nameValid

    const initialSnapshot = useMemo(() => {
        if (!grip) return null
        return {
            name: grip.name ?? "",
            category: grip.category,
        }
    }, [grip])

    const isDirty = useMemo(() => {
        if (!initialSnapshot) return false
        return (
            name !== initialSnapshot.name ||
            category !== initialSnapshot.category
        )
    }, [category, initialSnapshot, name])

    const onPressSave = async () => {
        if (!grip) return

        const patch: Partial<GripDoc> = {
            id: grip.id,
            name: name.trim(),
            nameLower: name.trim().toLowerCase(),
            category,
        }

        console.log("Saving grip with patch", patch)

        await updateGrip(patch);
        innerRef.current?.dismiss()
    }

    return (
        <BottomSheetModalFactory
            reference={innerRef}
            enablePanDownToClose={true}
            handleIndicatorStyle={{backgroundColor: theme.colors.text}}
        >
            <Text text="Edit Grip" style={$styles.modalHeader}/>

            <TextField label="Name" placeholder="e.g. Claw Grip" value={name} onChangeText={setName}/>

            {!grip ? (
                <Text text="No grip selected." style={$helperDisabled}/>
            ) : (
                <View key={grip.id}>
                    <View style={$section}>
                        <DropdownPicker
                            label="Category"
                            options={GRIP_CATEGORIES}
                            value={category}
                            onChange={(v) => setCategory(v as GripCategory)}
                        />
                    </View>

                    <Button
                        text="Save Changes"
                        onPress={onPressSave}
                        style={$button}
                        disabled={!isSaveEnabled || !isDirty}
                    />

                    {!isSaveEnabled && <Text text="Name must be at least 2 characters" style={$helperDisabled}/>}

                    {isSaveEnabled && !isDirty && (
                        <Text text="No changes to save" style={$helperDisabled}/>
                    )}
                </View>
            )}
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