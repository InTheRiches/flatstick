import { useLocalSearchParams } from "expo-router"

import RoundEditMapScreen from "@/screens/app/round-edit/RoundEditMapScreen"

export default function RoundEditOverviewRoute() {
  const { roundId } = useLocalSearchParams<{ roundId: string }>()

  if (!roundId) return null

  return <RoundEditMapScreen roundId={roundId} />
}