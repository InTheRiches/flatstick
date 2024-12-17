import useColors from "../../hooks/useColors";
import {useRouter} from "expo-router";
import {Image, Text, useColorScheme, View} from "react-native";
import React, {useEffect, useMemo, useState} from "react";
import {BottomSheetModal, BottomSheetView, useBottomSheetTimingConfigs} from "@gorhom/bottom-sheet";
import {Easing, runOnJS} from "react-native-reanimated";
import {Gesture, GestureDetector} from "react-native-gesture-handler";
import Svg, {Path} from "react-native-svg";
import {PrimaryButton} from "../buttons/PrimaryButton";

export default function SelectPutterModal({selectPutterRef, selectedPutter, setSelectedPutter}) {
    const colors = useColors();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const [personalRef, setPersonalRef] = useState();

    const snapPoints = useMemo(() => ["100%"], []);

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
                    <PrimaryButton style={{borderRadius: 10, paddingVertical: 8, paddingHorizontal: 12, marginLeft: 8}} title={"New"}></PrimaryButton>
                </View>
                <View style={{marginTop: 16, width: "100%"}}>
                    <GestureDetector gesture={Gesture.Tap().onStart((data) => runOnJS(setSelectedPutter)(0))}>
                        <View style={{flexDirection: "row", width: "100%", gap: 12, borderWidth: 1, borderRadius: 10, borderColor: selectedPutter === 0 ? colors.toggleable.toggled.border : colors.toggleable.border, backgroundColor: selectedPutter === 0 ? colors.toggleable.toggled.background : colors.toggleable.background, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 24, alignItems: "center"}}>
                            <Image source={require("@/assets/images/putterTest.png")} style={{height: 48, width: 48, aspectRatio: 1, borderRadius: 8}}></Image>
                            <View style={{flexDirection: "column", flex: 1}}>
                                <Text style={{fontSize: 16, color: colors.text.primary, fontWeight: 500}}>Default Putter</Text>
                                <View style={{flexDirection: "row"}}>
                                    <View style={{flexDirection: "column", flex: 1}}>
                                        <Text style={{color: colors.text.secondary}}>Sessions: 3</Text>
                                        <Text style={{color: colors.text.secondary}}>Strokes Gained: 2.3</Text>
                                    </View>
                                    <View style={{flexDirection: "column", flex: 1}}>
                                        <Text style={{color: colors.text.secondary}}>Sessions: 3</Text>
                                        <Text style={{color: colors.text.secondary}}>Strokes Gained: 2.3</Text>
                                    </View>
                                </View>
                            </View>
                            {selectedPutter === 0 && (
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
                    <GestureDetector gesture={Gesture.Tap().onStart((data) => runOnJS(setSelectedPutter)(1))}>
                        <View style={{flexDirection: "row", width: "100%", gap: 12, borderWidth: 1, borderRadius: 10, borderColor: selectedPutter === 1 ? colors.toggleable.toggled.border : colors.toggleable.border, backgroundColor: selectedPutter === 1 ? colors.toggleable.toggled.background : colors.toggleable.background, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 24, alignItems: "center"}}>
                            <Image source={require("@/assets/images/putterTest.png")} style={{height: 48, width: 48, aspectRatio: 1, borderRadius: 8}}></Image>
                            <View style={{flexDirection: "column", flex: 1}}>
                                <Text style={{fontSize: 16, color: colors.text.primary, fontWeight: 500}}>Default Putter</Text>
                                <View style={{flexDirection: "row"}}>
                                    <View style={{flexDirection: "column", flex: 1}}>
                                        <Text style={{color: colors.text.secondary}}>Sessions: 3</Text>
                                        <Text style={{color: colors.text.secondary}}>Strokes Gained: 2.3</Text>
                                    </View>
                                    <View style={{flexDirection: "column", flex: 1}}>
                                        <Text style={{color: colors.text.secondary}}>Sessions: 3</Text>
                                        <Text style={{color: colors.text.secondary}}>Strokes Gained: 2.3</Text>
                                    </View>
                                </View>
                            </View>
                            {selectedPutter === 1 && (
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
                </View>
            </BottomSheetView>
        </BottomSheetModal>
    )
}