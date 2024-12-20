import useColors from "../../../hooks/useColors";
import {Image, Text, useColorScheme, View} from "react-native";
import React, {useEffect, useMemo, useRef, useState} from "react";
import {BottomSheetModal, BottomSheetView, useBottomSheetTimingConfigs} from "@gorhom/bottom-sheet";
import {Easing, runOnJS} from "react-native-reanimated";
import {Gesture, GestureDetector} from "react-native-gesture-handler";
import Svg, {Path} from "react-native-svg";
import {PrimaryButton} from "../../buttons/PrimaryButton";
import {getFirestore} from "firebase/firestore";
import NewPutterModal from "@/components/popups/putters/NewPutterModal";
import {useAppContext} from "@/contexts/AppCtx";

export default function SelectPutterModal({selectPutterRef, selectedPutter, setSelectedPutter}) {
    const colors = useColors();
    const [personalRef, setPersonalRef] = useState();
    const {userData, currentStats, putters} = useAppContext();
    const snapPoints = useMemo(() => ["100%"], []);
    const newPutterRef = useRef();
    const db = getFirestore();

    const animationConfigs = useBottomSheetTimingConfigs({
        duration: 250,
        easing: Easing.ease,
    });

    useEffect(() => {
        setPersonalRef(selectPutterRef.current);
    }, []);

    const gesture = Gesture.Tap().onStart((data) => {
        runOnJS(personalRef.close)();
    });

    return (
            <BottomSheetModal style={{borderRadius: 0}} stackBehavior={"push"} animationConfigs={animationConfigs} enableOverDrag={false} handleStyle={{ display: "none"}} backgroundStyle={{backgroundColor: colors.background.primary, borderRadius: 0}} ref={selectPutterRef} snapPoints={snapPoints}>
                <BottomSheetView style={{ flex: 1, width: "100%", paddingHorizontal: 32, flexDirection: "column", alignItems: "center"}}>
                    {/* this is a gesutre handler as a pressable didnt work */}
                    <GestureDetector gesture={gesture}>
                        <View style={{flexDirection: "row", alignItems: "center", gap: 4, alignSelf: "flex-start"}}>
                            <Svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5}
                                 stroke={colors.text.primary} width={20} height={20}>
                                <Path strokeLinecap="round" strokeLinejoin="round"
                                      d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"/>
                            </Svg>
                            <Text style={{color: colors.text.primary, fontSize: 18, fontWeight: 500, marginLeft: 8}}>Back</Text>
                        </View>
                    </GestureDetector>
                    <View style={{flexDirection: "row", marginTop: 12, justifyContent: "space-between", alignItems: "center", width: "100%", borderBottomWidth: 1, borderColor: colors.border.default, paddingBottom: 10}}>
                        <Text style={{fontSize: 24, fontWeight: 600, color: colors.text.primary}}>Your Putters</Text>
                        <PrimaryButton style={{ borderRadius: 10, paddingVertical: 8, paddingHorizontal: 12, marginLeft: 8}} onPress={() => newPutterRef.current.present()} title={"New"}></PrimaryButton>
                    </View>
                    <View style={{marginTop: 16, width: "100%"}}>
                        { (putters !== undefined && putters.length !== 0) &&
                            putters.map((putter, index) => {
                                return <PutterSelector key={"putt_" + putter.type} id={index} setSelectedPutter={setSelectedPutter} selectedPutter={selectedPutter} name={putter.name} stats={putter.stats}></PutterSelector>
                            })
                        }
                    </View>
                    <NewPutterModal newPutterRef={newPutterRef}></NewPutterModal>
                </BottomSheetView>
            </BottomSheetModal>
    )
}

function PutterSelector({id, setSelectedPutter, selectedPutter, name, stats}) {
    const colors = useColors();
    const colorScheme = useColorScheme();

    return (
        <GestureDetector key={id + "_putter"} gesture={Gesture.Tap().onStart((data) => runOnJS(setSelectedPutter)(id))}>
            <View style={{
                flexDirection: "row",
                width: "100%",
                gap: 12,
                borderWidth: 1,
                borderRadius: 10,
                borderColor: selectedPutter === id ? colors.toggleable.toggled.border : colors.toggleable.border,
                backgroundColor: selectedPutter === id ? colors.toggleable.toggled.background : colorScheme === "light" ? colors.background.secondary : "transparent",
                paddingHorizontal: 12,
                paddingVertical: 8,
                marginBottom: 12,
                alignItems: "center"}}>
                <Image source={require("@/assets/images/putterTest.png")} style={{height: 48, width: 48, aspectRatio: 1, borderRadius: 8}}></Image>
                <View style={{flexDirection: "column", flex: 1}}>
                    <Text style={{fontSize: 16, color: colors.text.primary, fontWeight: 500}}>{name}</Text>
                    <View style={{flexDirection: "row", width: "100%", justifyContent: "flex-start", alignItems: "center"}}>
                        <Text style={{color: colors.text.secondary, width: "40%"}}>Sessions: 3</Text>
                        <Text style={{color: colors.text.secondary, width: "50%"}}>Strokes Gained: {stats.strokesGained.overall}</Text>
                    </View>
                </View>
                {selectedPutter === id && (
                    <View style={{
                        position: "absolute",
                        right: -7,
                        top: -7,
                        backgroundColor: "#40C2FF",
                        padding: 3,
                        borderRadius: 50,
                    }}>
                        <Svg width={18}
                             height={18}
                             stroke={colors.checkmark.color}
                             xmlns="http://www.w3.org/2000/svg"
                             fill="none"
                             viewBox="0 0 24 24"
                             strokeWidth="3">
                            <Path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5"/>
                        </Svg>
                    </View>
                )}
            </View>
        </GestureDetector>
    )
}