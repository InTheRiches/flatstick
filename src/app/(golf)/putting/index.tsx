import {BottomSheetModalProvider} from "@gorhom/bottom-sheet";
import {GestureHandlerRootView} from "react-native-gesture-handler";
import {PuttingScreen} from "@/screens/app/golf/PuttingScreen"
import {useLocalSearchParams} from "expo-router";
import {useMemo} from "react";
import {useNavPayloadStore} from "@/hooks/useNavPayloadStore";
import type {CourseSelectionDetails} from "@/components/app/golf/modals/SelectCourseDetailsModal";

export default function PuttingSession() {
    const { key } = useLocalSearchParams<{ key?: string }>()

    const payload = useMemo(() => {
        if (!key) return null
        return useNavPayloadStore.getState().takePayload<{ _details: CourseSelectionDetails }>(key)
    }, [key])

    const course: CourseSelectionDetails | null = payload?._details ?? null

    return (
        <GestureHandlerRootView>
            <BottomSheetModalProvider>
                <PuttingScreen course={course} />
            </BottomSheetModalProvider>
        </GestureHandlerRootView>
    )
}