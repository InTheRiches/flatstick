import { FC } from "react"

import { FlatstickHeader } from "@/components/ui/FlatstickHeader"
import { FullFeedItem } from "@/components/ui/FullFeedItem"
import { Screen } from "@/components/ui/Screen"
import { $styles } from "@/theme/styles"
import { useSafeAreaInsetsStyle } from "@/utils/useSafeAreaInsetsStyle"
import {PracticeModes} from "@/components/app/home/PracticeModes";
import {PerformanceSummary} from "@/components/app/home/PerformanceSummary";

export const HomeScreen: FC = function HomeScreen() {
    const $containerInsets = useSafeAreaInsetsStyle(["top"])

    return (
        <Screen contentContainerStyle={[$styles.screen, $containerInsets]}>
            <FlatstickHeader />

            <PracticeModes />
            <PerformanceSummary />
        </Screen>
    )
}