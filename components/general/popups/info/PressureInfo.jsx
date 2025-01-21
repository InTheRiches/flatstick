import {BottomSheetModal, BottomSheetView, useBottomSheetTimingConfigs} from "@gorhom/bottom-sheet";
import {Image, View} from "react-native";
import {useMemo} from "react";
import useColors from "@/hooks/useColors";
import Svg, {Path} from "react-native-svg";
import {Easing, runOnJS} from "react-native-reanimated";
import {PrimaryButton} from "@/components/general/buttons/PrimaryButton";
import {Gesture, GestureDetector} from "react-native-gesture-handler";
import {useRouter} from "expo-router";
import FontText from "../../FontText";

export default function PressureInfo({pressureInfoRef}) {
    const colors = useColors();
    const router = useRouter();
    const colorScheme = "light";

    const snapPoints = useMemo(() => ["100%"], []);

    const animationConfigs = useBottomSheetTimingConfigs({
        duration: 250,
        easing: Easing.ease,
    });

    // this prevents a goofy runOnJS issue, don't remove this
    const personalRef = pressureInfoRef.current;

    const gesture = Gesture.Tap().onStart((data) => {
        runOnJS(personalRef.close)();
    });

    return (
        <BottomSheetModal animationConfigs={animationConfigs} enableOverDrag={false} handleStyle={{ display: "none"}} backgroundStyle={{backgroundColor: colors.background.primary}} ref={pressureInfoRef} snapPoints={snapPoints}>
            <BottomSheetView style={{ flex: 1, width: "100%", paddingHorizontal: 32, flexDirection: "column", alignItems: "center"}}>
                {/* this is a gesutre handler as a pressable didnt work */}
                <GestureDetector gesture={gesture}>
                    <View style={{flexDirection: "row", alignItems: "center", gap: 4, alignSelf: "flex-start"}}>
                        <Svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5}
                             stroke={colors.text.primary} width={24} height={24}>
                            <Path strokeLinecap="round" strokeLinejoin="round"
                                  d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"/>
                        </Svg>
                        <FontText style={{color: colors.text.primary, fontSize: 20, fontWeight: 500, marginLeft: 8}}>Back</FontText>
                    </View>
                </GestureDetector>
                <Image source={colorScheme === "light" ? require("../../../../assets/images/info-pages/pressureLight.png") : require("../../../../assets/images/info-pages/pressureDark.png")} style={{height: 200, aspectRatio: 1, marginTop: 64, borderRadius: 16}}></Image>
                <FontText style={{color: colors.text.primary, fontSize: 40, fontWeight: 600, marginTop: 16, textAlign: "center"}}>Pressure Putting</FontText>
                <FontText style={{ textAlign: "center", marginTop: 12, color: colors.text.secondary, fontSize: 20}}>Learn to putt under pressure and sink them every time, no matter the stakes.</FontText>

                <PrimaryButton onPress={() => router.push({pathname: `/simulation/pressure/setup`})} style={{ borderRadius: 10, paddingVertical: 12, width: "70%", marginTop: 32}} title={"Start a Session"}></PrimaryButton>
            </BottomSheetView>
        </BottomSheetModal>
    )
}