// src/context/UserContext.usage.example.tsx
/**
 * UserContext Usage Examples
 *
 * The UserContext provides global access to user profile data and Firebase sync.
 * It automatically handles:
 * - Offline loading from cache
 * - Real-time sync when online
 * - Loading data on login
 * - Clearing data on logout
 * - Updating profiles via Firebase
 */

import { useUser } from "@/context/UserContext"

import { Text } from "@/components/ui/Text"
import {View} from "react-native";
import {Button} from "@/components/ui/Button";

/**
 * Example 1: Display user profile in a component
 */
export function UserProfileDisplay() {
  const { userProfile, loading, error } = useUser()

  if (loading) {
    return <Text>Loading profile...</Text>
  }

  if (error) {
    return <Text>Error loading profile: {error}</Text>
  }

  if (!userProfile) {
    return <Text>No profile found</Text>
  }

  return (
    <View>
      <Text>Welcome, {userProfile.displayName}!</Text>
      <Text>Email: {userProfile.preferences.units}</Text>
      <Text>Theme: {userProfile.preferences.theme}</Text>
    </View>
  )
}

/**
 * Example 2: Update user preferences
 */
export function PreferenceUpdater() {
  const { syncUserProfile, syncing, error } = useUser()

  async function handleThemeChange(theme: "dark" | "light" | "system") {
    try {
      await syncUserProfile({
        preferences: {
          countMishits: true,
          selectedPutterId: null,
          selectedGripId: null,
          theme,
          units: "imperial",
          remindersEnabled: false,
        },
      })
    } catch (err) {
      console.error("Failed to update theme:", err)
    }
  }

  return (
    <Button
      disabled={syncing}
      onPress={() => handleThemeChange("dark")}
      text={syncing ? "Saving..." : "Set Dark Theme"}
    />
  )
}

/**
 * Example 3: Access auth user alongside profile
 */
export function UserInfo() {
  const { userProfile, authUser } = useUser()

  return (
    <View>
      <Text>Profile ID: {userProfile?.id}</Text>
      <Text>Auth Email: {authUser?.email}</Text>
      <Text>Name: {userProfile?.firstName} {userProfile?.lastName}</Text>
    </View>
  )
}

/**
 * Example 4: Handle loading and sync states
 */
export function UserDataStatus() {
  const { loading, syncing, error, userProfile } = useUser()

  return (
    <View>
      {loading && <Text>Loading user data...</Text>}
      {syncing && <Text>Syncing changes...</Text>}
      {error && <Text style={{ color: "red" }}>Error: {error}</Text>}
      {userProfile && !loading && !error && (
        <Text style={{ color: "green" }}>Profile loaded and ready</Text>
      )}
    </View>
  )
}

/**
 * Integration with SignUp Screen:
 *
 * The useAuth hook now accepts an onUserProfileCreated callback:
 *
 * const { signUp } = useAuth({
 *   onUserProfileCreated: (profile) => {
 *     console.log("New user profile created:", profile)
 *     // The UserContext will automatically load this profile
 *   }
 * })
 */

/**
 * Data Flow:
 *
 * 1. User signs up via SignUpScreen
 *    - useAuth creates auth user and UserProfile
 *    - Saves UserProfile to Firestore
 *    - Calls onUserProfileCreated callback
 *
 * 2. Auth state changes (user logs in)
 *    - RootLayout passes authUser to UserProvider
 *    - UserContext.loadUserProfile is triggered
 *    - Loads from offline cache first, then subscribes to real-time updates
 *
 * 3. User is authenticated
 *    - Components can use useUser() to access userProfile
 *    - Can call syncUserProfile() to update preferences
 *    - Changes sync to Firebase automatically
 *
 * 4. User logs out
 *    - RootLayout passes null authUser to UserProvider
 *    - UserContext clears userProfile and unsubscribes from updates
 *    - App navigates to login screen
 */

