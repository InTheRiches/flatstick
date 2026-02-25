import React, {useMemo, useState} from "react"
import {Pressable, View, type ViewStyle} from "react-native"

import { useAppTheme } from "@/theme/context"
import { Text } from "@/components/ui/Text"

export type DropdownOption = {
    value: string
    label: string
    description?: string
}

export interface DropdownPickerProps {
    value: string | null
    onChange: (value: string) => void
    options: DropdownOption[]
    placeholder?: string
    label?: string
    disabled?: boolean
    style?: ViewStyle
    // Controlled open state (optional). If omitted, component manages its own open state.
    isOpen?: boolean
    onOpenChange?: (open: boolean) => void
}

export default function DropdownPicker(props: DropdownPickerProps) {
    const {
        value,
        onChange,
        options,
        placeholder = "Select",
        label,
        disabled = false,
        style,
        isOpen: controlledOpen,
        onOpenChange,
    } = props

    const { theme } = useAppTheme()
    const [openInternal, setOpenInternal] = useState(false)
    const open = typeof controlledOpen === "boolean" ? controlledOpen : openInternal

    const setOpen = (v: boolean) => {
        if (typeof controlledOpen === "boolean") {
            onOpenChange?.(v)
        } else {
            setOpenInternal(v)
            onOpenChange?.(v)
        }
    }

    const selectedOption = useMemo(() => options.find((o) => o.value === value) ?? null, [options, value])

    return (
        <View style={style}>
            {label && <Text text={label} style={{marginBottom: 6, fontSize: 16, fontWeight: "500", color: theme.colors.text}} />}

            <Pressable
                onPress={() => !disabled && setOpen(!open)}
                style={[
                    {
                        width: "100%",
                        borderWidth: 1,
                        borderRadius: 12,
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 10,
                        borderColor: theme.colors.border,
                        backgroundColor: theme.colors.backgrounds?.elevated ?? theme.colors.backgrounds?.default,
                    },
                ]}
            >
                <View style={{flex: 1}}>
                    <Text text={selectedOption ? selectedOption.label : placeholder} style={{fontSize: 14, fontWeight: "600", color: theme.colors.text}} />
                    {!!selectedOption?.description && (
                        <Text text={selectedOption!.description} style={{marginTop: -4, fontSize: 12, color: theme.colors.textDim}} />
                    )}
                </View>

                <Text text={open ? "▲" : "▼"} style={{fontSize: 12, color: theme.colors.textDim}} />
            </Pressable>

            {open && (
                <View style={{marginTop: 8, borderWidth: 1, borderRadius: 12, overflow: "hidden", borderColor: theme.colors.border}}>
                    {options.map((opt) => {
                        const selected = opt.value === value
                        return (
                            <Pressable
                                key={opt.value}
                                onPress={() => {
                                    onChange(opt.value)
                                    setOpen(false)
                                }}
                                style={{
                                    paddingHorizontal: 12,
                                    paddingVertical: 8,
                                    flexDirection: "row",
                                    alignItems: "center",
                                    gap: 10,
                                    backgroundColor: selected ? theme.colors.tint : "transparent",
                                }}
                            >
                                <View style={{flex: 1}}>
                                    <Text text={opt.label} style={{fontSize: 14, fontWeight: "bold", color: selected ? theme.colors.backgrounds?.elevated : theme.colors.text}} />
                                    {!!opt.description && (
                                        <Text text={opt.description} style={{marginTop: -4, fontSize: 12, color: selected ? theme.colors.backgrounds?.elevated : theme.colors.textDim}} />
                                    )}
                                </View>

                                <Text text={selected ? "✓" : ""} style={{color: selected ? theme.colors.backgrounds?.elevated : theme.colors.textDim, fontSize: 18, fontWeight: 600}} />
                            </Pressable>
                        )
                    })}
                </View>
            )}
        </View>
    )
}
