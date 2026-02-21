import React, { useState } from "react"
import { BottomSheetModal } from "@gorhom/bottom-sheet"
import { useAppTheme } from "@/theme/context"
import { Text } from "@/components/Text"
import { BottomSheetModalFactory } from "../../modals/BottomSheetFactory"
import { $styles } from "@/theme/styles"
import { TextField } from "@/components/TextField"
import { Checkbox } from "@/components/Toggle/Checkbox"
import {TextStyle, ViewStyle} from "react-native";
import {Button} from "@/components/Button";
import {useEquipment} from "@/context";
import {CreatePutterInput} from "@/context/EquipmentContext";
import {PutterDoc} from "@/models/equipment";
import {ISODateString} from "@/models/common";
import {clampAngle, normalizeDecimalInput} from "@/utils/common";

interface NewPutterModalProps {
    reference: React.RefObject<BottomSheetModal | null>
}

export default function NewPutterModal({ reference }: NewPutterModalProps) {
    const { theme } = useAppTheme()
    const { createPutter } = useEquipment()

    // Form state
    const [specifics, setSpecifics] = useState(false)
    const [brand, setBrand] = useState("")
    const [model, setModel] = useState("")
    const [loft, setLoft] = useState("")
    const [lie, setLie] = useState("")

    // Validation: require brand and model at least 2 characters
    const brandValid = brand.trim().length >= 2
    const modelValid = model.trim().length >= 2
    const isSaveEnabled = brandValid && modelValid

    // Numeric-only handlers for loft/lie
    const onChangeLoft = (text: string) => {
        const normalized = normalizeDecimalInput(text)

        // Allow empty or "." while typing
        if (normalized === "" || normalized === ".") {
            setLoft(normalized)
            return
        }

        const num = parseFloat(normalized)

        if (Number.isNaN(num)) {
            setLoft(normalized)
            return
        }

        const clamped = clampAngle(num)

        // If clamped changed value, overwrite
        if (clamped !== num) {
            setLoft(String(clamped))
            return
        }

        setLoft(normalized)
    }

    const onChangeLie = (text: string) => {
        const normalized = normalizeDecimalInput(text)

        if (normalized === "" || normalized === ".") {
            setLie(normalized)
            return
        }

        const num = parseFloat(normalized)

        if (Number.isNaN(num)) {
            setLie(normalized)
            return
        }

        const clamped = clampAngle(num)

        if (clamped !== num) {
            setLie(String(clamped))
            return
        }

        setLie(normalized)
    }

    return (
        <BottomSheetModalFactory
            reference={reference}
            enablePanDownToClose={true}
            handleIndicatorStyle={{ backgroundColor: theme.colors.text }}
        >
            <Text text="New Putter" style={$styles.modalHeader} />

            <TextField
                label="Brand"
                placeholder="Enter brand"
                value={brand}
                onChangeText={setBrand}
            />

            <TextField
                label="Model"
                placeholder="Enter model"
                value={model}
                onChangeText={setModel}
            />

            {/* Specifics toggle reveals brand/model/loft/lie */}
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

            <Button text="Save Putter" onPress={() => {
                createPutter({
                    brand: brand.trim(),
                    model: model.trim(),
                    loftDeg: loft ? parseFloat(loft) : undefined,
                    lieDeg: lie ? parseFloat(lie) : undefined,
                } as Partial<PutterDoc>).then(() => {
                    reference.current?.dismiss()
                });

            }} style={$button} disabled={!isSaveEnabled} />

            {!isSaveEnabled && (
                <Text text="Brand and Model must be at least 2 characters" style={$helperDisabled} />
            )}
        </BottomSheetModalFactory>
    )
}

const $checkbox: ViewStyle = {
    marginVertical: 8
}

const $button: ViewStyle = {
    marginTop: 14,
    alignSelf: "center",
    paddingHorizontal: 48,
    paddingVertical: 8
}

const $helperDisabled: TextStyle = {
    marginTop: 8,
    textAlign: "center",
    color: "#8b8b8b",
    fontSize: 12,
}
