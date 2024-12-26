import {Gesture, GestureDetector} from "react-native-gesture-handler";
import {Text, View} from "react-native";
import Svg, {Path} from "react-native-svg";
import {PrimaryButton} from "../../components/general/buttons/PrimaryButton";
import React, {useRef} from "react";
import useColors from "../../hooks/useColors";
import {runOnJS} from "react-native-reanimated";
import {useAppContext} from "../../contexts/AppCtx";
import {useNavigation} from "expo-router";
import {NewPutterModal, PutterSelector} from "../../components/editputters";

// TODO REMEMBER THAT WHEN YOU DELETE A PUTTER, YOU NEED TO CHECK TO SEE IF THE FILTERING PUTTER OR THE SELECTED PUTTER ARE OUT OF BOUNDS, and CHANGE THEM IF SO
// TODO add brand / model, not just name?
export default function EditPutters() {
    const colors = useColors();
    const newPutterRef = useRef(null);
    const {putters} = useAppContext();
    const navigation = useNavigation();

    const gesture = Gesture.Tap().onStart((data) => {
        runOnJS(navigation.goBack)();
    });

    return (
        <View style={{backgroundColor: colors.background.primary, flex: 1, paddingHorizontal: 24}}>
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
                {
                    putters.length < 4 ? (
                        <PrimaryButton style={{ borderRadius: 10, paddingVertical: 8, paddingHorizontal: 12, marginLeft: 8}} onPress={newPutterRef.current.present} title={"New"}></PrimaryButton>
                    ) : (
                        <View style={{borderRadius: 10, paddingVertical: 8, paddingHorizontal: 16, marginLeft: 8, borderColor: colors.input.invalid.border, borderWidth: 1, backgroundColor: colors.input.invalid.background}}>
                            <Text style={{color: colors.input.invalid.text}}>At Max Putters</Text>
                        </View>
                    )
                }
            </View>
            <View style={{marginTop: 16, width: "100%", paddingBottom: 12}}>
                { (putters !== undefined && putters.length !== 0) &&
                    putters.map((putter, index) => {
                        return <PutterSelector key={"putt_" + putter.type} id={index} name={putter.name} stats={putter.stats}></PutterSelector>
                    })
                }
            </View>
            <NewPutterModal newPutterRef={newPutterRef}></NewPutterModal>
        </View>
    )
}