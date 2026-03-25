import { useLocalSearchParams } from "expo-router";

import { HoleEditScreen } from "@/screens/app/round-edit/HoleEditScreen";

export default function HoleEditRoute() {
  const { roundId, holeNumber } = useLocalSearchParams<{ roundId: string; holeNumber: string }>()

  if (!roundId || !holeNumber) return null

  return <HoleEditScreen roundId={roundId} holeNumber={Number(holeNumber)} />
}
