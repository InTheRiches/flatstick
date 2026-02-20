import React, { FC, useMemo, useState } from "react"
import { FlatList, View, type ViewStyle, Text, type TextStyle, Pressable } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import type { ThemedStyle } from "@/theme/types"
import { useAppTheme } from "@/theme/context"
import { EquipmentRow } from "./EquipmentRow"
import { EquipmentSearchBar } from "./EquipmentSearchBar"
import type { EquipmentType } from "./types"
import type { PutterDoc, GripDoc } from "@/models/equipment"

type Doc = PutterDoc | GripDoc

type EquipmentListTabProps = {
    title: string
    type: EquipmentType
    items: Doc[]
    selectedId?: string | null
    onSelect: (id: string) => void
    onEdit: (item: Doc) => void
    onAdd: () => void
}

export const EquipmentListTab: FC<EquipmentListTabProps> = ({
    title,
    type,
    items,
    selectedId,
    onSelect,
    onEdit,
    onAdd,
}) => {
    const { themed, theme } = useAppTheme()
    const [searchQuery, setSearchQuery] = useState("")

    const filteredItems = useMemo(() => {
        if (!searchQuery) return items
        const lower = searchQuery.toLowerCase()
        return items.filter((item) => item.name.toLowerCase().includes(lower))
    }, [items, searchQuery])

    const renderItem = ({ item }: { item: Doc }) => (
        <EquipmentRow
            item={item}
            isSelected={item.id === selectedId}
            onSelect={onSelect}
            onEdit={onEdit}
        />
    )

    const ListEmptyComponent = useMemo(() => (
        <View style={themed($emptyContainer)}>
            <Text style={themed($emptyText)}>No {title.toLowerCase()} yet</Text>
            <Pressable onPress={onAdd}>
                <Text style={themed($emptyAction)}>+ Add {type}</Text>
            </Pressable>
        </View>
    ), [title, type, onAdd, themed])

    return (
        <View style={themed($container)}>
             <View style={themed($topBar)}>
                 <View style={{flex: 1}}>
                    <EquipmentSearchBar value={searchQuery} onChangeText={setSearchQuery} placeholder={`Search ${title}...`} />
                 </View>
                 <Pressable
                     style={({ pressed }) => [themed($addButton), pressed && { opacity: 0.6 }]}
                     onPress={onAdd}
                     hitSlop={8}
                 >
                     <Ionicons name="add" size={30} color={theme.colors.buttons.textColor} />
                 </Pressable>
             </View>

            <FlatList
                data={filteredItems}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={[themed($listContent), items.length === 0 && { flex: 1 }]}
                ListEmptyComponent={ListEmptyComponent}
                keyboardShouldPersistTaps="handled"
            />
        </View>
    )
}

const $container: ThemedStyle<ViewStyle> = () => ({
    flex: 1,
})

const $topBar: ThemedStyle<ViewStyle> = (theme) => ({
    flexDirection: "row",
    alignItems: "center",
    marginVertical: theme.spacing.sm,
    // SearchBar has margin inside, so we adjust
})

const $addButton: ThemedStyle<ViewStyle> = (theme) => ({
    borderRadius: 8,
    backgroundColor: theme.colors.buttons.background, // Matching search bar bg
    height: 36,
    width: 36,
    alignItems: "center",
    justifyContent: "center"
})

const $listContent: ThemedStyle<ViewStyle> = (theme) => ({
    paddingBottom: theme.spacing.xl,
})

const $emptyContainer: ThemedStyle<ViewStyle> = () => ({
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 200,
    gap: 12,
})

const $emptyText: ThemedStyle<TextStyle> = (theme) => ({
    color: theme.colors.textDim,
    fontSize: 18,
})

const $emptyAction: ThemedStyle<TextStyle> = (theme) => ({
    color: theme.colors.tint,
    fontWeight: "600",
    fontSize: 14,
})

