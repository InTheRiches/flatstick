import React, {useCallback, useImperativeHandle, useRef, useState} from "react";
import {BottomSheetModal, BottomSheetView} from "@gorhom/bottom-sheet";
import useColors from "@/hooks/useColors";
import CustomBackdrop from "@/components/general/popups/CustomBackdrop";
import PuttPrediction from "../PuttPrediction";

export function PuttPredictionModal({ puttPredictionRef }) {
    const colors = useColors();
    const bottomSheetRef = useRef(null);
    const [prediction, setPrediction] = useState(0);

    const myBackdrop = useCallback(({animatedIndex, style}) => {
        return (<CustomBackdrop
            reference={bottomSheetRef}
            animatedIndex={animatedIndex}
            style={style}
        />);
    }, []);

    useImperativeHandle(puttPredictionRef, () => ({
        open: (prediction) => {
            console.log("Opening putt prediction modal with prediction:", prediction);
            setPrediction(prediction);
            bottomSheetRef.current?.present();
        },
        close: () => {
            bottomSheetRef.current?.dismiss();
        },
    }))

    // renders
    return (<BottomSheetModal
        ref={bottomSheetRef}
        backdropComponent={myBackdrop}
        backgroundStyle={{backgroundColor: colors.background.secondary}}
        stackBehavior={"push"}
        keyboardBlurBehavior={"restore"}>
        <BottomSheetView style={{paddingHorizontal: 20, paddingBottom: 20, backgroundColor: colors.background.secondary,}}>
            <PuttPrediction prediction={prediction}/>
        </BottomSheetView>
    </BottomSheetModal>);
}
