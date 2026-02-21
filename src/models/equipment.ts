import {ISODateString} from "@/models/common";

export type GripCategory =
    | "conventional"
    | "left-hand-low"
    | "claw"
    | "arm-lock"
    | "broomstick"
    | "prayer"
    | "other"

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
