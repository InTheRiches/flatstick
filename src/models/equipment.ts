import {ISODateString} from "@/models/common";
import {DropdownOption} from "@/components/ui/DropdownPicker";

export type GripCategory =
    | "conventional"
    | "left-hand-low"
    | "claw"
    | "arm-lock"
    | "broomstick"
    | "prayer"
    | "other"

export const GRIP_CATEGORIES: DropdownOption[] = [
    {value: "conventional", label: "Conventional", description: "Traditional reverse-overlap / standard"},
    {value: "left-hand-low", label: "Left-Hand Low", description: "AKA cross-handed"},
    {value: "claw", label: "Claw", description: "Lead hand + claw trail hand"},
    {value: "arm-lock", label: "Arm Lock", description: "Grip anchored along forearm"},
    {value: "broomstick", label: "Broomstick", description: "Long putter style"},
    {value: "prayer", label: "Prayer", description: "Palms facing each other"},
    {value: "other", label: "Other", description: "Anything else / custom"},
]

export interface GripDoc {
    id: string
    name: string
    nameLower: string
    category: GripCategory

    createdAt: ISODateString
    updatedAt: ISODateString
    lastUsedAt?: ISODateString

    archived: boolean

    summary?: {
        totalPutts: number
        totalRounds: number
        makePct_6ft: number
        avgMissFt: number
        updatedAt: ISODateString
    }
}

export interface PutterDoc {
    id: string            // same as doc id
    brand: string
    model: string
    loftDeg: number | null
    lieDeg: number | null

    createdAt: ISODateString
    updatedAt: ISODateString
    lastUsedAt?: ISODateString

    archived: boolean     // instead of deleting (keeps stats usable)

    // quick display stats (denormalized, optional)
    summary?: {
        totalPutts: number
        totalRounds: number
        makePct_6ft: number
        avgMissFt: number
        updatedAt: ISODateString
    }
}

export type EquipmentType = "putter" | "grip" | "club"

export type ActiveSetup = {
    putterId?: string | null
    gripId?: string | null
    clubIds?: Record<string, string | null> // placeholder for future club slots
}
