import { EquipmentScreen } from '@/screens/app/EquipmentScreen'
import {BottomSheetModalProvider} from "@gorhom/bottom-sheet";
import {GestureHandlerRootView} from "react-native-gesture-handler";

export default function Equipment() {
    return (
        <GestureHandlerRootView>
            <BottomSheetModalProvider>
                <EquipmentScreen />
            </BottomSheetModalProvider>
        </GestureHandlerRootView>
    )
}
