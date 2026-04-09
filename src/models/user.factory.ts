// src/models/user.factory.ts
import type { ISODateString, UUID } from "./common"
import type { UserPreferences, UserProfile } from "./user"

const nowIso = (): ISODateString => new Date().toISOString()

const defaultPreferences = (): UserPreferences => ({
  countMishits: true,
  selectedPutterId: null,
  selectedGripId: null,
  theme: "system",
  units: "imperial",
  remindersEnabled: false,
})

export function createUserProfile(params: {
  id: UUID // auth uid from provider
  firstName: string
  lastName: string
}): UserProfile {
  const firstName = params.firstName.trim()
  const lastName = params.lastName.trim()
  const displayName = `${firstName} ${lastName}`.trim()

  const t = nowIso()

  return {
    id: params.id,
    firstName,
    lastName,
    displayName,
    displayNameLower: displayName.toLowerCase(),
    username: undefined,
    usernameLower: undefined,
    avatar: null,

    createdAt: t,
    updatedAt: t,

    flags: {
      hasPendingFriendRequests: false,
      seenTutorials: {
        round: false,
        real: false,
      },
    },

    friendIds: [],
    phoneHash: [],

    preferences: defaultPreferences(),
  }
}
