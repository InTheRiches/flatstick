import { useLocalSearchParams } from "expo-router"

import { RoundEditOverviewScreen } from "@/screens/app/round-edit/RoundEditOverviewScreen"

export default function RoundEditOverviewRoute() {
  const { roundId } = useLocalSearchParams<{ roundId: string }>()

  if (!roundId) return null

  return <RoundEditOverviewScreen roundId={roundId} />
}
