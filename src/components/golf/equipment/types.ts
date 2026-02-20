import { PutterDoc, GripDoc } from "@/models/equipment"

export type EquipmentType = "putter" | "grip" | "club"

export type ActiveSetup = {
    putterId?: string | null
    gripId?: string | null
    clubIds?: Record<string, string | null> // placeholder for future club slots
}
