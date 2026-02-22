// app/components/modals/equipment/EditPutterModal.tsx
import React, {useEffect, useImperativeHandle, useMemo, useState} from "react"
import { BottomSheetModal } from "@gorhom/bottom-sheet"
import { TextStyle, View, ViewStyle } from "react-native"

import { useAppTheme } from "@/theme/context"
import { Text } from "@/components/ui/Text"
import { TextField } from "@/components/ui/TextField"
import { Checkbox } from "@/components/Toggle/Checkbox"
import { Button } from "@/components/ui/Button"
import { BottomSheetModalFactory } from "../../modals/BottomSheetFactory"
import { $styles } from "@/theme/styles"

import { useEquipment } from "@/context"
import type { PutterDoc } from "@/models/equipment"
import { clampAngle, normalizeDecimalInput } from "@/utils/common"

interface EditPutterModalProps {
    reference: React.RefObject<EditPutterReference | null>
}

export interface EditPutterReference {
    open: () => void
    close: () => void
    setPutter: (putter: PutterDoc | null) => void
}

/**
 * Edit Putter modal
 * - Receives a PutterDoc
 * - Allows editing brand/model
 * - Optional "Specifics" toggle for loft/lie
 * - Archive toggle (instead of delete)
 * - Save calls updatePutter(...) (placeholder if you don't have it yet)
 */
export default function EditPutterModal({ reference }: EditPutterModalProps) {
    const { theme } = useAppTheme()
    const { updatePutter } = useEquipment()
    const innerRef = React.useRef<BottomSheetModal>(null)

    const [putter, setPutter] = useState<PutterDoc | null>(null);

    // Form state
    const [specifics, setSpecifics] = useState(false)
    const [brand, setBrand] = useState("")
    const [model, setModel] = useState("")
    const [loft, setLoft] = useState("")
    const [lie, setLie] = useState("")
    const [archived, setArchived] = useState(false)

    useImperativeHandle(reference, () => ({
        open: () => {
            innerRef.current?.present();
        },
        close: () => {
            innerRef.current?.dismiss();
        },
        setPutter: (input) => {
            if (!input) return;

            console.log("Setting putter in EditPutterModal", input)

            setPutter(input);

            setBrand(input.brand ?? "")
            setModel(input.model ?? "")
            setLoft(input.loftDeg === null ? "" : String(input.loftDeg))
            setLie(input.lieDeg === null ? "" : String(input.lieDeg))
            setArchived(input.archived)

            // auto-open specifics if it already has specifics
            setSpecifics(input.loftDeg !== null || input.lieDeg !== null)
        },
    } as EditPutterReference));

    const brandValid = brand.trim().length >= 2
    const modelValid = model.trim().length >= 2
    const isSaveEnabled = !!putter && brandValid && modelValid

    const initialSnapshot = useMemo(() => {
        if (!putter) return null
        return {
            brand: putter.brand ?? "",
            model: putter.model ?? "",
            loft: putter.loftDeg === null ? "" : String(putter.loftDeg),
            lie: putter.lieDeg === null ? "" : String(putter.lieDeg),
            archived: putter.archived,
        }
    }, [putter])

    const isDirty = useMemo(() => {
        if (!initialSnapshot) return false
        return (
            brand.trim() !== initialSnapshot.brand ||
            model.trim() !== initialSnapshot.model ||
            loft !== initialSnapshot.loft ||
            lie !== initialSnapshot.lie ||
            archived !== initialSnapshot.archived
        )
    }, [brand, model, loft, lie, archived, initialSnapshot])

    // Numeric-only handlers for loft/lie
    const onChangeLoft = (text: string) => {
        const normalized = normalizeDecimalInput(text)
        if (normalized === "" || normalized === ".") return setLoft(normalized)

        const num = parseFloat(normalized)
        if (Number.isNaN(num)) return setLoft(normalized)

        const clamped = clampAngle(num)
        if (clamped !== num) return setLoft(String(clamped))

        setLoft(normalized)
    }

    const onChangeLie = (text: string) => {
        const normalized = normalizeDecimalInput(text)
        if (normalized === "" || normalized === ".") return setLie(normalized)

        const num = parseFloat(normalized)
        if (Number.isNaN(num)) return setLie(normalized)

        const clamped = clampAngle(num)
        if (clamped !== num) return setLie(String(clamped))

        setLie(normalized)
    }

    const onPressSave = async () => {
        if (!putter) return

        const patch: Partial<PutterDoc> = {
            id: putter.id,
            brand: brand.trim(),
            model: model.trim(),
            archived,
            // If specifics is off, keep existing values (do not wipe) OR optionally wipe. We’ll keep.
            loftDeg: specifics ? (loft ? parseFloat(loft) : null) : putter.loftDeg,
            lieDeg: specifics ? (lie ? parseFloat(lie) : null) : putter.lieDeg,
        }

        console.log("Saving putter with patch", patch)

        await updatePutter(patch);
        innerRef.current?.dismiss()
    }

    return (
        <BottomSheetModalFactory
            reference={innerRef}
            enablePanDownToClose={true}
            handleIndicatorStyle={{ backgroundColor: theme.colors.text }}
        >
            <Text text="Edit Putter" style={$styles.modalHeader} />

            {!putter ? (
                <Text text="No putter selected." style={$helperDisabled} />
            ) : (
                <View key={putter.id}>
                    <TextField label="Brand" placeholder="Enter brand" value={brand} onChangeText={setBrand} />

                    <TextField label="Model" placeholder="Enter model" value={model} onChangeText={setModel} />

                    <Checkbox value={specifics} onValueChange={setSpecifics} label="Specifics" containerStyle={$checkbox} />

                    {specifics && (
                        <>
                            <TextField
                                label="Loft (deg)"
                                placeholder="e.g. 3.0"
                                value={loft}
                                onChangeText={onChangeLoft}
                                keyboardType="numeric"
                            />

                            <TextField
                                label="Lie (deg)"
                                placeholder="e.g. 70"
                                value={lie}
                                onChangeText={onChangeLie}
                                keyboardType="numeric"
                            />
                        </>
                    )}

                    <Button
                        text="Save Changes"
                        onPress={onPressSave}
                        style={$button}
                        disabled={!isSaveEnabled || !isDirty}
                    />

                    {(!brandValid || !modelValid) && (
                        <Text text="Brand and Model must be at least 2 characters" style={$helperDisabled} />
                    )}

                    {isSaveEnabled && !isDirty && (
                        <Text text="No changes to save" style={$helperDisabled} />
                    )}
                </View>
            )}
        </BottomSheetModalFactory>
    )
}

const $checkbox: ViewStyle = {
    marginVertical: 8,
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