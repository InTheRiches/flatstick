import React, { FC, useMemo } from "react"
import { useSafeAreaInsetsStyle } from "@/utils/useSafeAreaInsetsStyle"
import { Screen } from "@/components/Screen"
import { $styles } from "@/theme/styles"
import PageHeader from "@/components/headers/PageHeader"
import {
    EquipmentTabs,
    type EquipmentType,
    type ActiveSetup,
} from "@/components/golf/equipment"
import { useEquipment, useUser } from "@/context"
import type { PutterDoc, GripDoc } from "@/models/equipment"

export const EquipmentScreen: FC = function EquipmentScreen() {
    const $containerInsets = useSafeAreaInsetsStyle(["top"])

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
            await setSelectedPutterId(id)
            return
        }
        if (type === "grip") {
            await setSelectedGripId(id)
            return
        }
        // Clubs placeholder
        console.log("TODO clubs selection - placeholder", id)
    }

    const handleEdit = (item: PutterDoc | GripDoc) => {
        // Placeholder for edit modal; include original doc when available
        console.log("TODO open edit modal", item)
    }

    const handleAdd = (type: EquipmentType) => {
        // Placeholder for add modal
        console.log("TODO open add modal", type)
    }

    return (
        <Screen contentContainerStyle={[$styles.screen, $containerInsets]}>
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
        </Screen>
    )
}