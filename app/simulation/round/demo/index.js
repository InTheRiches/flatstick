import ScreenWrapper from "../../../../components/general/ScreenWrapper";
import FontText from "../../../../components/general/FontText";
import React from "react";
import useColors from "../../../../hooks/useColors";
import {Pressable, View} from "react-native";
import {SecondaryButton} from "../../../../components/general/buttons/SecondaryButton";
import {useLocalSearchParams, useNavigation, useRouter} from "expo-router";
import Svg, {Path} from "react-native-svg";

export default function RoundDemo({}) {
    const colors = useColors();
    const router = useRouter();
    const {justInfo, localHoles, difficulty, mode} = useLocalSearchParams();
    const navigation = useNavigation();

    const isJustInfo = justInfo === "true";

    const [maxWidth, setMaxWidth] = React.useState(0);

    const onLayout = (event) => {
        const {width} = event.nativeEvent.layout;
        setMaxWidth(width);
    }

    return (
        <ScreenWrapper style={{paddingHorizontal: 20}}>
                <View style={{flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 4}}>
                    <Pressable onPress={() => navigation.goBack()} style={{paddingHorizontal: 4, paddingLeft: 0}}>
                        <Svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3.5}
                             stroke={colors.text.primary} width={24} height={24}>
                            <Path strokeLinecap="round" strokeLinejoin="round"
                                  d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"/>
                        </Svg>
                    </Pressable>
                    <FontText style={{fontSize: 24, fontWeight: 500, color: colors.text.primary}}>Simulation Tutorial</FontText>
                </View>
                <View style={{backgroundColor: colors.background.secondary, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 12}}>
                    <FontText style={{color: colors.text.secondary}}>This mode presents 18 holes of make-or-break putts designed to test consistency under pressure and track your putting trends.</FontText>
                </View>
                <View onLayout={onLayout} style={{flexDirection: "column", marginTop: 12, alignItems: "center"}}>
                    <FontText style={{fontSize: 20, fontWeight: 800, width: "100%"}}>Step 1</FontText>
                    <FontText style={{width: "100%", fontSize: 15}}>For this mode to work, you need to be standing on or near a real life putting green. If yours doesnt show up, just contact us and we can add it.</FontText>
                </View>
                <View onLayout={onLayout} style={{flexDirection: "column", marginTop: 12, alignItems: "center"}}>
                    <FontText style={{fontSize: 20, fontWeight: 800, width: "100%"}}>Step 2</FontText>
                    <FontText style={{width: "100%", fontSize: 15}}>The app loads your putting green, and the only thing it needs, is for you to mark where the pins are. You can either walk to each, and click "Mark From Location," or you can manually tap to locate them.</FontText>
                </View>
                <View style={{flexDirection: "column", marginTop: 12, alignItems: "center", width: "100%"}}>
                    <FontText style={{fontSize: 20, fontWeight: 800, width: "100%"}}>Step 3</FontText>
                    <FontText style={{width: "100%", fontSize: 15}}>Once all of the pins are mapped, it generates a set of putts for you to attempt. The orange dot, is where it wants you to start from, and the red pin icon is where you should putt too. Try to be as accurate as possible when putting these.</FontText>
                </View>
                <View style={{flexDirection: "column", marginTop: 12, alignItems: "center", width: "100%", flex: 1}}>
                    <FontText style={{fontSize: 20, fontWeight: 800, width: "100%"}}>Step 4</FontText>
                    <FontText style={{width: "100%", fontSize: 15}}>Once you have putted out the hole, mark on the map where each putt went. Hold down to mark if you misread the slope or break. That means thought it went left->right when it actually went right->left, for example.</FontText>
                </View>
                <SecondaryButton onPress={() => {
                    if (isJustInfo) {
                        router.back();
                    } else {
                        router.replace({
                            pathname: `/simulation/round`, params: {
                                localHoles: localHoles, difficulty: difficulty, mode: mode,
                            }
                        });
                    }
                }}
                     title={isJustInfo ? "Back" : "Continue"}
                     style={{paddingVertical: 10, borderRadius: 10, marginTop: 24, marginHorizontal: 24, marginBottom: 12}}></SecondaryButton>
        </ScreenWrapper>
    )
}