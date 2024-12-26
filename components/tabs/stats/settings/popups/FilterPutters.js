import {useAppContext} from "../../../../../contexts/AppCtx";
import {BottomSheetModal, BottomSheetView} from "@gorhom/bottom-sheet";
import {Pressable, Text} from "react-native";
import Svg, {Path} from "react-native-svg";
import React, {useState} from "react";
import useColors from "../../../../../hooks/useColors";
import CustomBackdrop from "../../../../general/popups/CustomBackdrop";

export function FilterPutters({filterPuttersRef}) {
    const {putters, userData, updateData, setUserData} = useAppContext()
    const colors = useColors();
    const [open, setOpen] = useState(false);

    const close = () => {
        console.log("updating");
        updateData({...userData});
    }

    return (
        <BottomSheetModal onChange={() => {
            if (open) {
                close();
            }
            setOpen(!open);
        }}
              backdropComponent={({animatedIndex, style}) => <CustomBackdrop reference={filterPuttersRef} animatedIndex={animatedIndex} style={style}/>}
              enableDismissOnClose={true}
              stackBehavior={"replace"}
              ref={filterPuttersRef}
              backgroundStyle={{backgroundColor: colors.background.primary}}>
            <BottomSheetView style={{paddingBottom: 12, marginHorizontal: 24, backgroundColor: colors.background.primary, gap: 12}}>
                <Text style={{marginTop: 12, fontSize: 18, color: colors.text.primary, fontWeight: 500}}>Filter By Putter</Text>
                {
                    putters.map((putter, index) => {
                        return <Putter filteringPutter={userData.preferences.filteringPutter} setFilteringPutter={(newPutter) => setUserData({preferences: {...userData.preferences, filteringPutter: newPutter}})} putter={putter} index={index} key={"puu-" + index}/>
                    })
                }
            </BottomSheetView>
        </BottomSheetModal>
    );
}

function Putter({putter, index, filteringPutter, setFilteringPutter}) {
    const colors = useColors();

    console.log(index);

    return (
        <Pressable
            style={{flexDirection: "row", alignItems: "center", padding: 12, backgroundColor: colors.background.secondary, borderRadius: 12, justifyContent: "space-between"}}
            onPress={() => {
                if (filteringPutter !== index)
                    setFilteringPutter(index);
            }}>
            <Text style={{color: colors.text.primary, fontSize: 16}}>{putter.type === "default" ? "All Putters" : putter.name}</Text>
            {
                filteringPutter === index &&
                <Svg width={22} height={22} stroke={colors.checkmark.background} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="3">
                    <Path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5"/>
                </Svg>
            }
        </Pressable>
    )
}