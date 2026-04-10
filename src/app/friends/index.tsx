import { FriendsScreen } from "@/screens/app/friends/FriendsScreen"
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet"

export default function Friends() {
    return (
        <BottomSheetModalProvider>
            <FriendsScreen />
        </BottomSheetModalProvider>
    )
}
