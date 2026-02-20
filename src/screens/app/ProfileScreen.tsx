import { FC } from "react"

import { Screen } from "@/components/Screen"
import { $styles } from "@/theme/styles"
import { useSafeAreaInsetsStyle } from "@/utils/useSafeAreaInsetsStyle"
import {ProfileHeader} from "@/components/app/profile/ProfileHeader";
import {Equipment} from "@/components/app/profile/Equipment";
import {FriendsSummary} from "@/components/app/profile/FriendsSummary";
import { UserProfile } from "@/models/user"

interface ProfileScreenProps {
    userProfile?: UserProfile
}

export const ProfileScreen: FC<ProfileScreenProps> = function ProfileScreen({ userProfile }) {
    const $containerInsets = useSafeAreaInsetsStyle(["top"])

    return (
        <Screen contentContainerStyle={[$styles.screen, $containerInsets]}>
            <ProfileHeader userProfile={userProfile} />

            <FriendsSummary />

            <Equipment/>
        </Screen>
    )
}