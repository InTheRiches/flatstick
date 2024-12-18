import useColors from "../../../hooks/useColors";
import {Image, Text, useColorScheme, View} from "react-native";
import React, {useEffect, useMemo, useRef, useState} from "react";
import {BottomSheetModal, BottomSheetView, useBottomSheetTimingConfigs} from "@gorhom/bottom-sheet";
import {Easing, runOnJS} from "react-native-reanimated";
import {Gesture, GestureDetector} from "react-native-gesture-handler";
import Svg, {Path} from "react-native-svg";
import {PrimaryButton} from "../../buttons/PrimaryButton";
import {doc, getDoc} from "firebase/firestore";
import NewPutterModal from "@/components/popups/putters/NewPutterModal";
import {useAppContext} from "@/contexts/AppCtx";

export default function SelectPutterModal({selectPutterRef, selectedPutter, setSelectedPutter}) {
    const colors = useColors();
    const [personalRef, setPersonalRef] = useState();
    const {userData, currentStats} = useAppContext();
    const snapPoints = useMemo(() => ["100%"], []);
    const [putters, setPutters] = useState([]);
    const newPutterRef = useRef();

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

    useEffect(() => {
        if (userData.putters === undefined) return;

        for (const type of userData.putters) {
            if (type==="default") {
                // TODO when you switch to individual files change this
                setPutters(prev => [...prev, {
                    type: type,
                    name: "Default Putter",
                    stats: currentStats.averagePerformance
                }]);
                continue;
            }

            console.log("Getting putter data for: " + type);

            const getData = async () => {
                const docRef = doc(firestore, `users/${auth.currentUser.uid}/putters/` + type);
                const data = await getDoc(docRef);
                // the type is in this format: default-putter, format it so it is Default Putter
                const formattedName = type.split("-").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
                return {
                    type: type,
                    name: formattedName,
                    stats: data.data()
                };
            }

            setPutters(prev => [...prev, getData()]);
        }
    }, [userData]);

    return (
            <BottomSheetModal stackBehavior={"push"} animationConfigs={animationConfigs} enableOverDrag={false} handleStyle={{ display: "none"}} backgroundStyle={{backgroundColor: colors.background.primary}} ref={selectPutterRef} snapPoints={snapPoints}>
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
                    <Text style={{fontSize: 24, fontWeight: 600, color: colors.text.primary, textAlign: "left", width: "100%", marginTop: 12}}>Your Putters</Text>
                    <View style={{width: "100%", flexDirection: "row", marginTop: 8}}>
                        <View style={{flex: 1, borderWidth: 1, borderColor: colors.input.border, backgroundColor: colors.input.background, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 10,}}>
                            <Text style={{fontSize: 14, color: colors.text.secondary}}>Search...</Text>
                        </View>
                        <PrimaryButton style={{borderRadius: 10, paddingVertical: 8, paddingHorizontal: 12, marginLeft: 8}} onPress={() => newPutterRef.current.present()} title={"New"}></PrimaryButton>
                    </View>
                    <View style={{marginTop: 16, width: "100%"}}>
                        {
                            putters.map((putter, index) => {
                                return <PutterSelector key={putter.type} id={index} setSelectedPutter={setSelectedPutter} selectedPutter={selectedPutter} name={putter.name} stats={putter.stats}></PutterSelector>
                            })
                        }
                    </View>
                    <NewPutterModal newPutterRef={newPutterRef} putters={putters} setPutters={setPutters}></NewPutterModal>
                </BottomSheetView>
            </BottomSheetModal>
    )
}

function PutterSelector({id, setSelectedPutter, selectedPutter, name, stats}) {
    const colors = useColors();

    return (
        <GestureDetector gesture={Gesture.Tap().onStart((data) => runOnJS(setSelectedPutter)(id))}>
            <View style={{flexDirection: "row", width: "100%", gap: 12, borderWidth: 1, borderRadius: 10, borderColor: selectedPutter === id ? colors.toggleable.toggled.border : colors.toggleable.border, backgroundColor: selectedPutter === id ? colors.toggleable.toggled.background : colors.toggleable.background, paddingHorizontal: 12, paddingVertical: 8, alignItems: "center"}}>
                <Image source={require("@/assets/images/putterTest.png")} style={{height: 48, width: 48, aspectRatio: 1, borderRadius: 8}}></Image>
                <View style={{flexDirection: "column", flex: 1}}>
                    <Text style={{fontSize: 16, color: colors.text.primary, fontWeight: 500}}>{name}</Text>
                    <View style={{flexDirection: "row"}}>
                        <View style={{flexDirection: "column", flex: 1}}>
                            <Text style={{color: colors.text.secondary}}>Sessions: 3</Text>
                            <Text style={{color: colors.text.secondary}}>Strokes Gained: {stats.strokesGained.overall}</Text>
                        </View>
                        <View style={{flexDirection: "column", flex: 1}}>
                            <Text style={{color: colors.text.secondary}}>Sessions: 3</Text>
                            <Text style={{color: colors.text.secondary}}>Strokes Gained: {stats.strokesGained.overall}</Text>
                        </View>
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