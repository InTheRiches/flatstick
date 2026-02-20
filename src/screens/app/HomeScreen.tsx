import { FC } from "react"

import { FlatstickHeader } from "@/components/FlatstickHeader"
import { FullFeedItem } from "@/components/FullFeedItem"
import { Screen } from "@/components/Screen"
import { $styles } from "@/theme/styles"
import { useSafeAreaInsetsStyle } from "@/utils/useSafeAreaInsetsStyle"

export const HomeScreen: FC = function HomeScreen() {
  const $containerInsets = useSafeAreaInsetsStyle(["top"])

  return (
    <Screen contentContainerStyle={[$styles.flex1, $styles.px, $containerInsets]}>
      <FlatstickHeader />

      {/* Demo FullFeedItem shown beneath the header as requested */}
      <FullFeedItem />
    </Screen>
  )
}