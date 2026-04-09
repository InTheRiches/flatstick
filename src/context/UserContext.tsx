// src/context/UserContext.tsx
import { FirebaseAuthTypes } from "@react-native-firebase/auth"
import {
  doc,
  getDoc,
  getFirestore,
  onSnapshot,
  setDoc,
  Unsubscribe,
} from "@react-native-firebase/firestore"
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react"
import { AppState, AppStateStatus } from "react-native"

import type { UserProfile } from "@/models/user"

function normalizeUserProfile(profile: UserProfile): UserProfile {
  const legacyFriends = (profile as UserProfile & { friends?: string[] }).friends

  const friendIds = Array.isArray(profile.friendIds)
    ? profile.friendIds
    : Array.isArray(legacyFriends)
      ? legacyFriends
      : []

  return {
    ...profile,
    id: profile.id,
    friendIds,
    phoneHash: Array.isArray(profile.phoneHash) ? profile.phoneHash : [],
    usernameLower: profile.usernameLower || profile.username?.toLowerCase(),
    avatar: profile.avatar || null,
  }
}

export interface UserContextType {
  // Data
  userProfile: UserProfile | null
  authUser: FirebaseAuthTypes.User | null

  // State
  loading: boolean
  syncing: boolean
  error: string | null

  // Actions
  loadUserProfile: (uid: string) => Promise<void>
  syncUserProfile: (profile: Partial<UserProfile>) => Promise<void>
  setNewUserProfile: (profile: UserProfile) => void
  clearUserData: () => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

interface UserProviderProps {
  children: React.ReactNode
  authUser: FirebaseAuthTypes.User | null
  authInitializing: boolean
}

export function UserProvider({ children, authUser, authInitializing }: UserProviderProps) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const db = getFirestore()
  const snapshotUnsubscribeRef = useRef<Unsubscribe | null>(null)

  /**
   * Load user profile from Firestore
   * First attempts offline, then syncs with online data
   */
  const loadUserProfile = useCallback(
    async (uid: string) => {
      setLoading(true)
      setError(null)

      try {
        // Try to get from cache/offline first
        const docRef = doc(db, "users", uid)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          const profile = normalizeUserProfile(docSnap.data() as UserProfile)
          setUserProfile(profile)

          // Setup real-time listener for online sync
          if (snapshotUnsubscribeRef.current) {
            snapshotUnsubscribeRef.current()
          }

          snapshotUnsubscribeRef.current = onSnapshot(
            docRef,
            (snapshot) => {
              if (snapshot.exists()) {
                const updatedProfile = normalizeUserProfile(snapshot.data() as UserProfile)
                setUserProfile(updatedProfile)
              }
            },
            (err) => {
              console.error("Error syncing user profile:", err)
              setError(err.message)
            }
          )
        } else {
          // Profile doesn't exist - user will need to complete signup
          console.warn("User profile not found in Firestore for uid:", uid)
          setError("User profile not found")
        }
      } catch (err: any) {
        const errorMessage = err?.message ?? "Failed to load user profile"

        // Check for permission errors specifically
        if (errorMessage.includes("permission") || errorMessage.includes("PERMISSION")) {
          console.error("🔐 Firebase Permission Error - User may not be authenticated properly:", errorMessage)
        } else {
          console.error("Error loading user profile:", errorMessage)
        }

        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    },
    [db]
  )

  /**
   * Sync user profile changes to Firebase
   */
  const syncUserProfile = useCallback(
    async (updates: Partial<UserProfile>) => {
      if (!authUser?.uid) {
        setError("No authenticated user")
        return
      }

      setSyncing(true)
      setError(null)

      try {
        const docRef = doc(db, "users", authUser.uid)

        // Add updatedAt timestamp
        const dataToSync = {
          ...updates,
          updatedAt: new Date().toISOString(),
        }

        await setDoc(docRef, dataToSync, { merge: true })

        // Update local state with new data
        setUserProfile((prev) => (prev ? { ...prev, ...dataToSync } : null))
      } catch (err: any) {
        console.error("Error syncing user profile:", err)
        setError(err?.message ?? "Failed to sync user profile")
        throw err
      } finally {
        setSyncing(false)
      }
    },
    [authUser?.uid, db]
  )

  /**
   * Set new user profile after signup
   * Called from useAuth when a new account is created
   */
  const setNewUserProfile = useCallback((profile: UserProfile) => {
    setUserProfile(normalizeUserProfile(profile))
    setError(null)
  }, [])

  /**
   * Clear user data on logout
   */
  const clearUserData = useCallback(() => {
    setUserProfile(null)
    setError(null)
    if (snapshotUnsubscribeRef.current) {
      snapshotUnsubscribeRef.current()
      snapshotUnsubscribeRef.current = null
    }
  }, [])

  /**
   * Reload user profile when app comes to foreground
   * Ensures data is fresh and account still exists
   */
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === "active" && authUser?.uid && userProfile) {
        try {
          // Reload profile from Firebase
          await loadUserProfile(authUser.uid)
        } catch (err: any) {
          console.error("Error reloading user profile on app foreground:", err)
        }
      }
    }

    const subscription = AppState.addEventListener("change", handleAppStateChange)
    return () => subscription.remove()
  }, [authUser?.uid, userProfile, loadUserProfile])

  /**
   * Load user profile when auth user changes
   * Only loads after auth is fully initialized AND user exists
   */
  useEffect(() => {
    // IMPORTANT: Wait for auth to fully initialize before attempting to load profile
    if (authInitializing) {
      return
    }

    // Only attempt to load profile if we have a valid, authenticated user
    if (authUser?.uid) {
      console.log("Auth initialized with user:", authUser.uid, "- Loading user profile...")
      loadUserProfile(authUser.uid)
    } else {
      // No authenticated user - clear any existing profile data
      console.log("Auth initialized but no user - clearing user data")
      clearUserData()
    }

    return () => {
      if (snapshotUnsubscribeRef.current) {
        snapshotUnsubscribeRef.current()
        snapshotUnsubscribeRef.current = null
      }
    }
  }, [authUser?.uid, authInitializing, loadUserProfile, clearUserData])

  const value: UserContextType = {
    userProfile,
    authUser,
    loading,
    syncing,
    error,
    loadUserProfile,
    syncUserProfile,
    setNewUserProfile,
    clearUserData,
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

/**
 * Hook to access user context
 * Must be used within UserProvider
 */
export function useUser(): UserContextType {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
