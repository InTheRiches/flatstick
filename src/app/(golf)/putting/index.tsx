import {BottomSheetModalProvider} from "@gorhom/bottom-sheet";
import {GestureHandlerRootView} from "react-native-gesture-handler";
import {PuttingScreen} from "@/screens/app/golf/PuttingScreen"

export default function PuttingSession() {
    return (
        <GestureHandlerRootView>
            <BottomSheetModalProvider>
                <PuttingScreen />
            </BottomSheetModalProvider>
        </GestureHandlerRootView>
    )
}