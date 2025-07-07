import React, {useCallback} from "react";
import {BottomSheetModal, BottomSheetView} from "@gorhom/bottom-sheet";
import useColors from "@/hooks/useColors";
import CustomBackdrop from "@/components/general/popups/CustomBackdrop";
import ScorecardCard from "../ScorecardCard";

export function ScorecardModal({ scorecardRef, setHoleNumber, front, roundData}) {
    const colors = useColors();

    const myBackdrop = useCallback(({animatedIndex, style}) => {
        return (<CustomBackdrop
            reference={scorecardRef}
            animatedIndex={animatedIndex}
            style={style}
        />);
    }, []);

    // renders
    return (<BottomSheetModal
        ref={scorecardRef}
        backdropComponent={myBackdrop}
        backgroundStyle={{backgroundColor: colors.background.secondary}}
        keyboardBlurBehavior={"restore"}>
        <BottomSheetView style={{paddingHorizontal: 16, marginTop: -16, backgroundColor: colors.background.secondary}}>
            <ScorecardCard scorecardRef={scorecardRef} setHoleNumber={setHoleNumber} front={front} holes={roundData}></ScorecardCard>
        </BottomSheetView>
    </BottomSheetModal>);
}
