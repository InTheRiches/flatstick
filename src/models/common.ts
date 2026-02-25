// src/models/common.ts
export type ISODateString = string // new Date().toISOString()

export type ThemeMode = "system" | "light" | "dark"
export type UnitSystem = "imperial" | "metric"

export type UUID = string

export type LatLng = {
    latitude: number
    longitude: number
}

export interface BaseEntity {
  id: UUID
  userId: UUID
  createdAt: ISODateString
  updatedAt: ISODateString
  deletedAt?: ISODateString | null // soft delete for sync
}
