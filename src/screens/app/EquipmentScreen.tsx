import React, {FC, useMemo, useState} from "react"
import { useSafeAreaInsetsStyle } from "@/utils/useSafeAreaInsetsStyle"
import { Screen } from "@/components/ui/Screen"
import { $styles } from "@/theme/styles"
import PageHeader from "@/components/headers/PageHeader"
import {
    EquipmentTabs,
} from "@/components/app/equipment"
import { useEquipment, useUser } from "@/context"
import type {PutterDoc, GripDoc, ActiveSetup, EquipmentType} from "@/models/equipment"
import NewPutterModal from "@/components/app/equipment/modals/NewPutterModal";
import {BottomSheetModal} from "@gorhom/bottom-sheet";
import EditPutterModal, {EditPutterReference} from "@/components/app/equipment/modals/EditPutterModal";
import NewGripModal from "@/components/app/equipment/modals/NewGripModal";
import EditGripModal, {EditGripReference} from "@/components/app/equipment/modals/EditGripModal";

export const EquipmentScreen: FC = function EquipmentScreen() {
    const $containerInsets = useSafeAreaInsetsStyle(["top"])
    const newPutterModalRef = React.useRef<BottomSheetModal>(null)
    const newGripModalRef = React.useRef<BottomSheetModal>(null)
    const editingPutterModalRef = React.useRef<EditPutterReference>(null)
    const editingGripModalRef = React.useRef<EditGripReference>(null)

    // Use app contexts for canonical data
    const { putters: putterDocs, grips: gripDocs, setSelectedPutterId, setSelectedGripId } = useEquipment()
    const { userProfile } = useUser()

    // Clubs: not backed by docs yet; keep empty for now
    const clubs: any[] = useMemo(() => [], [])

    const activeSetup: ActiveSetup = useMemo(() => ({
        putterId: userProfile?.preferences?.selectedPutterId ?? null,
        gripId: userProfile?.preferences?.selectedGripId ?? null,
        clubIds: {},
    }), [userProfile?.preferences?.selectedPutterId, userProfile?.preferences?.selectedGripId])

    // Handlers wired to EquipmentContext so selections persist to user preferences
    const handleUpdateActive = async (type: "putter" | "grip" | "clubs", id: string) => {
        if (type === "putter") {
            // if its the same putter set the active to null (deselect)
            if (activeSetup.putterId === id) {
                await setSelectedPutterId(null)
                return
            }
            await setSelectedPutterId(id)
            return
        }
        if (type === "grip") {
            if (activeSetup.gripId === id) {
                await setSelectedGripId(null)
                return
            }
            await setSelectedGripId(id)
            return
        }
        // Clubs placeholder
        console.log("TODO clubs selection - placeholder", id)
    }

    const handleEdit = (item: PutterDoc | GripDoc) => {
        // Placeholder for edit modal; include original doc when available
        const maybePutter = item as PutterDoc
        if (maybePutter.brand) {
            console.log("Editing putter", maybePutter.brand)
            editingPutterModalRef.current?.setPutter(maybePutter);
            editingPutterModalRef.current?.open()
        } else {
            const maybeGrip = item as GripDoc
            console.log("Editing grip", maybeGrip.name)
            editingGripModalRef.current?.setGrip(maybeGrip);
            editingGripModalRef.current?.open()
        }
    }

    const handleAdd = (type: EquipmentType) => {
        if (type === "putter") {
            newPutterModalRef.current?.present();
        }
        else {
                newGripModalRef.current?.present();
        }
    }

    return (
        <Screen>
            <PageHeader title="Equipment" />

            <EquipmentTabs
                putters={putterDocs}
                grips={gripDocs}
                clubs={clubs}
                activeSetup={activeSetup}
                onUpdateActive={(t, id) => void handleUpdateActive(t, id)}
                onEdit={handleEdit}
                onAdd={handleAdd}
            />

            <NewPutterModal reference={newPutterModalRef} />
            <NewGripModal reference={newGripModalRef} />
            <EditPutterModal reference={editingPutterModalRef} />
            <EditGripModal reference={editingGripModalRef} />
        </Screen>
    )
}