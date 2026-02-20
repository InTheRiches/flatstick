// src/app/hooks/useAuth.ts
import { useEffect, useState, useCallback } from "react"
import { AppState, AppStateStatus } from "react-native"

// Auth (modular)
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signOut as modularSignOut,
  deleteUser,
  FirebaseAuthTypes,
} from "@react-native-firebase/auth"

// Firestore (modular)
import {
  getFirestore,
  doc,
  setDoc,
} from "@react-native-firebase/firestore"
import {UserProfile} from "@/models/user";
import {createUserProfile} from "@/models/user.factory";

export function useAuth() {
  const [initializing, setInitializing] = useState(true)
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null)

  const [signingUp, setSigningUp] = useState(false)
  const [signingIn, setSigningIn] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const auth = getAuth()
  const db = getFirestore()

  useEffect(() => {
    console.log("🔐 Setting up auth state listener...")
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      console.log("🔐 Auth state changed - user:", u?.uid || "no user")
      setUser(u)
      setInitializing(false)
    })
    return unsubscribe
  }, [auth])

  const signOut = useCallback(async () => {
    try {
      await modularSignOut(auth)
    } catch (err) {
      console.warn("signOut error", err)
    }
  }, [auth])

  // Reload user token when app comes to foreground to detect deleted accounts
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === "active" && user) {
        try {
          // Force token refresh - this will fail if account was deleted
          await user.reload()
          // Get fresh token to verify account still exists
          const token = await user.getIdToken(true)
          console.log("App came to foreground, user token refreshed:", token)
        } catch (err: any) {
          console.log("User account no longer valid, signing out:", err?.code)
          // If reload fails, account was likely deleted - sign out locally
          if (err?.code === "auth/user-token-expired" || err?.code === "auth/user-disabled") {
            await signOut()
          }
        }
      }
    }

    const subscription = AppState.addEventListener("change", handleAppStateChange)
    return () => subscription.remove()
  }, [user, signOut])

  async function signUp(email: string, password: string, displayName?: string) {
    setSigningUp(true)
    setError(null)

    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password)
      const createdUser = credential.user

      if (displayName && createdUser) {
        try {
          await updateProfile(createdUser, { displayName })
        } catch (e) {
          console.warn("Failed to update displayName on auth user:", e)
        }
      }

      const firstName = displayName && displayName.includes(" ") ? displayName.split(" ")[0] : displayName || "New User"
      const lastName = displayName && displayName.includes(" ") ? displayName.split(" ").slice(1).join(" ") : ""

      const defaultState: UserProfile = createUserProfile({id: createdUser.uid, firstName, lastName})

      try {
        await setDoc(doc(db, "users", createdUser.uid), defaultState)
      } catch (fsErr) {
        console.error("Failed to write user document after signup:", fsErr)
        try {
          // rollback user if we can
          const current = auth.currentUser
          if (current && current.uid === createdUser.uid) {
            await deleteUser(current)
          }
        } catch (delErr) {
          console.error("Failed to delete auth user after Firestore failure:", delErr)
        }
        throw fsErr
      }

      return createdUser
    } catch (err: any) {
      setError(err?.message ?? "Signup failed")
      throw err
    } finally {
      setSigningUp(false)
    }
  }

  async function signIn(email: string, password: string) {
    setSigningIn(true)
    setError(null)
    try {
      console.log("Attempting sign up with email:", email)
      const credential = await signInWithEmailAndPassword(auth, email, password)

      console.log("Sign in successful, user:", credential.user?.email)
      return credential.user
    } catch (err: any) {
      setError(err?.message ?? "Sign in failed")
      throw err
    } finally {
      setSigningIn(false)
    }
  }


  return {
    user,
    initializing,
    isAuthed: !!user,
    signingUp,
    signingIn,
    error,
    signUp,
    signIn,
    signOut,
  }
}
