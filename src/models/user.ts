// src/models/user.ts
import type { ISODateString, ThemeMode, UnitSystem, UUID } from "./common"

export type TutorialKey = "round" | "real"

export interface UserPreferences {
  countMishits: boolean

  // These can become IDs later when you have user-created equipment.
  selectedPutterId?: string | null
  selectedGripId?: string | null

  theme: ThemeMode
  units: UnitSystem

  remindersEnabled: boolean

  // Leave room for future: notification schedule, accessibility, etc.
  // reminderTime?: string; // "08:00"
}

export interface UserFlags {
  hasPendingFriendRequests: boolean
  seenTutorials: Record<TutorialKey, boolean>
}

export interface UserProfile {
  id: UUID

  firstName: string
  lastName: string
  displayName: string
  displayNameLower: string
  username?: string
  usernameLower?: string
  avatar?: string | null

  // If you later add username/handle:
  // handle?: string;

  // Lifecycle / sync
  createdAt: ISODateString
  updatedAt: ISODateString

  flags: UserFlags

  // Social
  friendIds: UUID[]
  phoneHash: string[]

  preferences: UserPreferences
}
