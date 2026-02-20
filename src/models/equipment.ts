import {ISODateString} from "@/models/common";

export interface GripDoc {
    id: string
    name: string
    nameLower: string
    type?: "claw" | "conventional" | "leftHandLow" | "other"

    createdAt: ISODateString
    updatedAt: ISODateString

    archived: boolean
    lastUsedAt?: ISODateString | null

    summary?: {
        totalPutts: number
        makePct_6ft: number
        avgMissFt: number
        updatedAt: ISODateString
    }
}

export interface PutterDoc {
    id: string            // same as doc id
    name: string          // "Scotty Newport 2"
    nameLower: string     // for search
    brand?: string
    model?: string
    loftDeg?: number
    lieDeg?: number

    createdAt: ISODateString
    updatedAt: ISODateString

    archived: boolean     // instead of deleting (keeps stats usable)
    lastUsedAt?: ISODateString | null

    // quick display stats (denormalized, optional)
    summary?: {
        totalPutts: number
        totalRounds: number
        makePct_6ft: number
        avgMissFt: number
        updatedAt: ISODateString
    }
}