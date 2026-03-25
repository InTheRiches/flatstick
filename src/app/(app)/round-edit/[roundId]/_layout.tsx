import { BottomSheetModalProvider } from "@gorhom/bottom-sheet"
import { Stack, useLocalSearchParams } from "expo-router"
import { GestureHandlerRootView } from "react-native-gesture-handler"

import { RoundEditProvider } from "@/context/RoundEditProvider"

export default function RoundEditLayout() {
  const { roundId } = useLocalSearchParams<{ roundId: string }>()

  if (!roundId) {
    return null
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <RoundEditProvider roundId={roundId}>
          <Stack screenOptions={{ headerShown: false }} />
        </RoundEditProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  )
}
