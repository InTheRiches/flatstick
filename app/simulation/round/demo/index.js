import ScreenWrapper from "../../../../components/general/ScreenWrapper";
import FontText from "../../../../components/general/FontText";
import React from "react";
import useColors from "../../../../hooks/useColors";
import {Image, Pressable, ScrollView, View} from "react-native";
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
        <ScreenWrapper style={{paddingHorizontal: 24}}>
                <View style={{flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 4}}>
                    <Pressable onPress={() => navigation.goBack()} style={{paddingHorizontal: 4, paddingLeft: 0}}>
                        <Svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3}
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
                <View onLayout={onLayout} style={{flexDirection: "column", marginTop: 12, flex: 0.8, alignItems: "center"}}>
                    <FontText style={{fontSize: 18, fontWeight: 500, width: "100%"}}>Step 1</FontText>
                    <FontText style={{width: "100%"}}>This diagram shows the generated break that the app wants you to putt. Find this break and distance on your local putting green, and putt it out.</FontText>
                    <Image source={require('@/assets/tutorials/round/greenBreakDemo.png')}
                           style={{
                               marginTop: 12,
                               borderRadius: 12,
                               aspectRatio: "553/396",
                               maxWidth: "100%",
                               maxHeight: maxWidth * 0.72,
                               flex: 1,
                           }}/>
                </View>
                <View style={{flexDirection: "column", marginTop: 12, alignItems: "center", flex: 1, width: "100%"}}>
                    <FontText style={{fontSize: 18, fontWeight: 500, width: "100%"}}>Step 2</FontText>
                    <FontText style={{width: "100%"}}>Once you have putted it out, mark on this grid where you putt landed in regards to the hole. The units are labelled above.</FontText>
                    <Image source={require('@/assets/tutorials/round/PuttingGreenDemo.png')}
                           style={{
                               borderRadius: 12,
                               aspectRatio: "1",
                               maxWidth: "100%",
                               marginTop: 12,
                               flex: 1,
                               maxHeight: maxWidth
                           }}/>
                </View>
                <SecondaryButton onPress={() => {
                    if (isJustInfo) {
                        router.back();
                    } else {
                        router.replace({
                            pathname: `/simulation/real`, params: {
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