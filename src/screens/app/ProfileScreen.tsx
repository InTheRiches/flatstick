import { FC } from "react"

import { FlatstickHeader } from "@/components/FlatstickHeader"
import { FullFeedItem } from "@/components/FullFeedItem"
import { Screen } from "@/components/Screen"
import { $styles } from "@/theme/styles"
import { useSafeAreaInsetsStyle } from "@/utils/useSafeAreaInsetsStyle"
import {ProfileHeader} from "@/components/app/profile/ProfileHeader";
import {Equipment} from "@/components/app/profile/Equipment";
import {FriendsSummary} from "@/components/app/profile/FriendsSummary";

export const ProfileScreen: FC = function ProfileScreen() {
    const $containerInsets = useSafeAreaInsetsStyle(["top"])

    return (
        <Screen contentContainerStyle={[$styles.screen, $containerInsets]}>
            <ProfileHeader />

            <FriendsSummary />

            <Equipment/>
        </Screen>
    )
}