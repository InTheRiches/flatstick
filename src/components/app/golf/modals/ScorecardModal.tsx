import { LiveHoleState } from "@/models/round.live.types";
import { useAppTheme } from "@/theme/context";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useMemo } from "react";
import { BottomSheetModalFactory } from "../../modals/BottomSheetFactory";
import Scorecard from "../Scorecard/Scorecard";
import type { ScorecardHole } from "../Scorecard/types";

interface ScorecardModalProps {
    reference: React.RefObject<BottomSheetModal | null>
    holes?: LiveHoleState[]
}

export default function ScorecardModal({reference, holes}: ScorecardModalProps) {
    const {theme, themed} = useAppTheme()

    const scorecardData = useMemo(() => {
        if (!holes || Object.keys(holes).length === 0) return null;
        const data = [];
        for (let i = 1; i <= Object.keys(holes).length; i++) {
            const hole = holes[i];
            data.push({
                par: hole?.par ?? 4,
                score: hole?.score ?? -1,
            } as ScorecardHole);
        }
        return data;
    }, [holes]);

    return (
        <BottomSheetModalFactory
            reference={reference}
            enablePanDownToClose={true}
            handleIndicatorStyle={{backgroundColor: theme.colors.text}}
        >
            <Scorecard
                holes={scorecardData}
                />
        </BottomSheetModalFactory>
     )
}