import {useAppContext} from "../../../../../contexts/AppCtx";
import {BottomSheetModal, BottomSheetView} from "@gorhom/bottom-sheet";
import {Pressable} from "react-native";
import Svg, {Path} from "react-native-svg";
import React from "react";
import useColors from "../../../../../hooks/useColors";
import CustomBackdrop from "../../../../general/popups/CustomBackdrop";
import FontText from "../../../../general/FontText";

export function FilterPutters({filterPuttersRef}) {
    const {putters, nonPersistentData, setNonPersistentData} = useAppContext()
    const colors = useColors();

    return (
        <BottomSheetModal
              backdropComponent={({animatedIndex, style}) => <CustomBackdrop reference={filterPuttersRef} animatedIndex={animatedIndex} style={style}/>}
              enableDismissOnClose={true}
              stackBehavior={"replace"}
              ref={filterPuttersRef}
              handleIndicatorStyle={{backgroundColor: colors.text.primary}}
              backgroundStyle={{backgroundColor: colors.background.primary}}>
            <BottomSheetView style={{paddingBottom: 12, marginHorizontal: 24, backgroundColor: colors.background.primary, gap: 12}}>
                <FontText style={{marginTop: 12, fontSize: 18, color: colors.text.primary, fontWeight: 500}}>Filter By Putter</FontText>
                {
                    putters.map((putter, index) => {
                        return <Putter filteringPutter={nonPersistentData.filtering.putter} reference={filterPuttersRef} setFilteringPutter={(newPutter) => setNonPersistentData({filtering: {...nonPersistentData.filtering, putter: newPutter}})} putter={putter} index={index} key={"puu-" + index}/>
                    })
                }
            </BottomSheetView>
        </BottomSheetModal>
    );
}

function Putter({putter, index, filteringPutter, setFilteringPutter, reference}) {
    const colors = useColors();

    return (
        <Pressable
            style={{flexDirection: "row", alignItems: "center", padding: 12, backgroundColor: colors.background.secondary, borderRadius: 12, justifyContent: "space-between"}}
            onPress={() => {
                reference.current.dismiss();
                if (filteringPutter !== index)
                    setFilteringPutter(index);
            }}>
            <FontText style={{color: colors.text.primary, fontSize: 16}}>{putter.type === "default" ? "All Putters" : putter.name}</FontText>
            {
                filteringPutter === index &&
                <Svg width={22} height={22} stroke={colors.checkmark.background} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="3">
                    <Path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5"/>
                </Svg>
            }
        </Pressable>
    )
}