// app/_layout.tsx
import { useEffect } from "react"
import {Slot, SplashScreen, useRouter, useSegments} from "expo-router"
import { KeyboardProvider } from "react-native-keyboard-controller"
import { initialWindowMetrics, SafeAreaProvider } from "react-native-safe-area-context"

import { ThemeProvider } from "@/theme/context"
import {useAuth} from "@/hooks/useAuth";

SplashScreen.preventAutoHideAsync()

if (__DEV__) {
  // Load Reactotron configuration in development. We don't want to
  // include this in our production bundle, so we are using `if (__DEV__)`
  // to only execute this in development.
  require("@/devtools/ReactotronConfig")
}

export default function RootLayout() {
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
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <ThemeProvider>
          <KeyboardProvider>
            <Slot />
          </KeyboardProvider>
        </ThemeProvider>
      </SafeAreaProvider>
  )
}
