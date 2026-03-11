// app/_layout.tsx
import { Slot, SplashScreen, useRouter, useSegments } from "expo-router"
import React, { useEffect } from "react"
import { KeyboardProvider } from "react-native-keyboard-controller"
import { initialWindowMetrics, SafeAreaProvider } from "react-native-safe-area-context"

import { EquipmentProvider } from "@/context/EquipmentContext"
import { UserProvider } from "@/context/UserContext"
import { useAuth } from "@/hooks/useAuth"
import { RoundsProvider } from "@/context/RoundsProvider"
import { ThemeProvider } from "@/theme/context"

SplashScreen.preventAutoHideAsync()

if (__DEV__) {
  // Load Reactotron configuration in development. We don't want to
  // include this in our production bundle, so we are using `if (__DEV__)`
  // to only execute this in development.
  require("@/devtools/ReactotronConfig")
}

function RootLayoutContent() {
  const { isAuthed, initializing } = useAuth()
  const segments = useSegments()
  const router = useRouter()

  useEffect(() => {
    if (initializing) return

    const inAuthGroup = segments[0] === "(auth)"

    if (!isAuthed && !inAuthGroup) {
      router.replace("/(auth)/sign-in")
    } else if (isAuthed && inAuthGroup) {
      router.replace("/(app)")
    }
  }, [isAuthed, initializing, segments, router])

  useEffect(() => {
    if (!initializing) {
      SplashScreen.hideAsync()
    }
  }, [initializing])

  if (initializing) {
    return null
  }

  return (
    <KeyboardProvider>
      <Slot />
    </KeyboardProvider>
  )
}

export default function RootLayout() {
  const { initializing, user } = useAuth()

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <ThemeProvider>
        <UserProvider authUser={user} authInitializing={initializing}>
          {user ? (
            <RoundsProvider userId={user.uid}>
              <EquipmentProvider authInitializing={initializing}>
                <RootLayoutContent />
              </EquipmentProvider>
            </RoundsProvider>
          ) : (
            <EquipmentProvider authInitializing={initializing}>
              <RootLayoutContent />
            </EquipmentProvider>
          )}
        </UserProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  )
}
