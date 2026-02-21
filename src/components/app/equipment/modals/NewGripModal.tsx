// NewGripModal.tsx
import React, {useMemo, useState} from "react"
import {BottomSheetModal} from "@gorhom/bottom-sheet"
import {Pressable, TextStyle, View, ViewStyle} from "react-native"

import {BottomSheetModalFactory} from "../../modals/BottomSheetFactory"
import {Text} from "@/components/Text"
import {TextField} from "@/components/TextField"
import {Button} from "@/components/Button"
import {Checkbox} from "@/components/Toggle/Checkbox"
import {useAppTheme} from "@/theme/context"
import {$styles} from "@/theme/styles"
import {useEquipment} from "@/context"
import {GripCategory} from "@/models/equipment";

const GRIP_CATEGORIES: { value: GripCategory; label: string; description?: string }[] = [
    {value: "conventional", label: "Conventional", description: "Traditional reverse-overlap / standard"},
    {value: "left-hand-low", label: "Left-Hand Low", description: "AKA cross-handed"},
    {value: "claw", label: "Claw", description: "Lead hand + claw trail hand"},
    {value: "arm-lock", label: "Arm Lock", description: "Grip anchored along forearm"},
    {value: "broomstick", label: "Broomstick", description: "Long putter style"},
    {value: "prayer", label: "Prayer", description: "Palms facing each other"},
    {value: "other", label: "Other", description: "Anything else / custom"},
]

interface NewGripModalProps {
    reference: React.RefObject<BottomSheetModal | null>
}

export default function NewGripModal({reference}: NewGripModalProps) {
    const {theme} = useAppTheme()
    const {createGrip} = useEquipment()

    // Form state
    const [name, setName] = useState("")
    const [category, setCategory] = useState<GripCategory>("conventional")
    const [showCategoryPicker, setShowCategoryPicker] = useState(false)

    // Optional toggle (matches your doc shape, but for "New" it should be false by default)
    const [archived, setArchived] = useState(false)

    const nameValid = name.trim().length >= 2
    const isSaveEnabled = nameValid

    const selectedCategoryLabel = useMemo(() => {
        return GRIP_CATEGORIES.find((c) => c.value === category)?.label ?? "Select"
    }, [category])

    const selectedCategoryDescription = useMemo(() => {
        return GRIP_CATEGORIES.find((c) => c.value === category)?.description
    }, [category])

    const onSave = async () => {
        if (!isSaveEnabled) return

        // await createGrip({
        //     name: name.trim(),
        //     category,
        //     archived,
        // })

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

            {/* Category "dropdown" (no extra deps): tap to expand options */}
            <View style={$section}>
                <Text text="Category" style={[$label, {color: theme.colors.text}]}/>

                <Pressable
                    onPress={() => setShowCategoryPicker((v) => !v)}
                    style={[
                        $selectRow,
                        {
                            borderColor: theme.colors.border,
                            backgroundColor: theme.colors.backgrounds.elevated,
                        },
                    ]}
                >
                    <View style={{flex: 1}}>
                        <Text text={selectedCategoryLabel} style={$optionTitle}/>
                        {!!selectedCategoryDescription && (
                            <Text text={selectedCategoryDescription}
                                  style={[$optionDesc, {color: theme.colors.textDim}]}/>
                        )}
                    </View>

                    <Text
                        text={showCategoryPicker ? "▲" : "▼"}
                        style={[$caret, {color: theme.colors.textDim}]}
                    />
                </Pressable>

                {showCategoryPicker && (
                    <View style={[$optionsWrap, {borderColor: theme.colors.border}]}>
                        {GRIP_CATEGORIES.map((opt) => {
                            const selected = opt.value === category
                            return (
                                <Pressable
                                    key={opt.value}
                                    onPress={() => {
                                        setCategory(opt.value)
                                        setShowCategoryPicker(false)
                                    }}
                                    style={[
                                        $optionRow,
                                        {
                                            backgroundColor: selected ? theme.colors.tint : "transparent",
                                        },
                                    ]}
                                >
                                    <View style={{flex: 1}}>
                                        <Text
                                            text={opt.label}
                                            style={[
                                                $optionTitle,
                                                {color: selected ? theme.colors.backgrounds.elevated : theme.colors.text},
                                            ]}
                                        />
                                        {!!opt.description && (
                                            <Text
                                                text={opt.description}
                                                style={[
                                                    $optionDesc,
                                                    {color: selected ? theme.colors.backgrounds.elevated : theme.colors.textDim},
                                                ]}
                                            />
                                        )}
                                    </View>

                                    <Text
                                        text={selected ? "✓" : ""}
                                        style={{color: selected ? theme.colors.backgrounds.elevated : theme.colors.textDim}}
                                    />
                                </Pressable>
                            )
                        })}
                    </View>
                )}
            </View>

            <Button text="Save Grip" onPress={onSave} style={$button} disabled={!isSaveEnabled}/>

            {!isSaveEnabled && <Text text="Name must be at least 2 characters" style={$helperDisabled}/>}
        </BottomSheetModalFactory>
    )
}

const $section: ViewStyle = {
    marginTop: 12,
}

const $label: TextStyle = {
    marginBottom: 6,
    fontSize: 16,
    fontWeight: 500,
}

const $selectRow: ViewStyle = {
    width: "100%",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
}

const $caret: TextStyle = {
    fontSize: 12,
}

const $optionsWrap: ViewStyle = {
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 12,
    overflow: "hidden",
    paddingBottom: 4
}

const $optionRow: ViewStyle = {
    paddingHorizontal: 12,
    paddingVertical: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
}

const $optionTitle: TextStyle = {
    fontSize: 14,
    fontWeight: "bold",
}

const $optionDesc: TextStyle = {
    marginTop: -4,
    fontSize: 12,
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