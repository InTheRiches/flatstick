import { useLocalSearchParams } from "expo-router";

import { MapHoleEditorScreen } from "@/screens/app/round-edit/MapHoleEditorScreen";

export default function MapHoleEditRoute() {
  const { roundId, holeNumber } = useLocalSearchParams<{ roundId: string; holeNumber: string }>()

  if (!roundId || !holeNumber) return null

  return <MapHoleEditorScreen roundId={roundId} holeNumber={Number(holeNumber)} />
}
