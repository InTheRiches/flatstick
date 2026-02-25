import {BottomSheetModalProvider} from "@gorhom/bottom-sheet";
import {GestureHandlerRootView} from "react-native-gesture-handler";
import {SearchCoursesScreen} from "@/screens/app/golf/SearchCoursesScreen"

export default function SearchCourses() {
    return (
        <GestureHandlerRootView>
            <BottomSheetModalProvider>
                <SearchCoursesScreen />
            </BottomSheetModalProvider>
        </GestureHandlerRootView>
    )
}