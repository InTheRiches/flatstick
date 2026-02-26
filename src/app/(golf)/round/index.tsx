import {BottomSheetModalProvider} from "@gorhom/bottom-sheet";
import {GestureHandlerRootView} from "react-native-gesture-handler";
import {useLocalSearchParams} from "expo-router";
import {useMemo} from "react";
import {useNavPayloadStore} from "@/hooks/useNavPayloadStore";
import type {CourseSelectionDetails} from "@/components/app/golf/modals/SelectCourseDetailsModal";
import {RoundTrackingScreen} from "@/screens/app/golf/RoundTrackingScreen";

export default function RoundTracking() {
  const { key } = useLocalSearchParams<{ key?: string }>()

  const payload = useMemo(() => {
    if (!key) return null
    return useNavPayloadStore.getState().takePayload<{ _details: CourseSelectionDetails }>(key)
  }, [key])

  const course: CourseSelectionDetails | null = payload?._details ?? null

  return (
      <GestureHandlerRootView>
        <BottomSheetModalProvider>
          <RoundTrackingScreen course={course} />
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
  )
}