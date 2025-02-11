import ScreenWrapper from "../../../../components/general/ScreenWrapper";
import FontText from "../../../../components/general/FontText";
import React from "react";
import useColors from "../../../../hooks/useColors";
import {Image, Pressable, View} from "react-native";
import {SecondaryButton} from "../../../../components/general/buttons/SecondaryButton";
import {useLocalSearchParams, useNavigation, useRouter} from "expo-router";
import Svg, {Path} from "react-native-svg";

export default function RealDemo({}) {
    const colors = useColors();
    const router = useRouter();
    const {justInfo, stringHoles} = useLocalSearchParams();
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
                    <FontText style={{fontSize: 24, fontWeight: 500, color: colors.text.primary}}>Real Round Tutorial</FontText>
                </View>
                <View style={{backgroundColor: colors.background.secondary, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10}}>
                    <FontText style={{color: colors.text.primary}}>This mode allows you to track your putting in a real round.</FontText>
                </View>
                <View onLayout={onLayout} style={{flexDirection: "column", marginTop: 12, flex: 0.7, alignItems: "center"}}>
                    <FontText style={{fontSize: 18, fontWeight: 500, width: "100%"}}>Step 1</FontText>
                    <FontText style={{width: "100%"}}>Select the break for the hole by spinning the green on the left, and set the distance in the bottom right.</FontText>
                    <Image source={require('@/assets/tutorials/real/breakSelectorDemo.png')}
                           style={{
                               marginTop: 12,
                               borderRadius: 18,
                               aspectRatio: "1272/739",
                               maxWidth: "100%",
                               maxHeight: maxWidth * 0.72,
                               flex: 1,
                           }}/>
                </View>
                <View style={{flexDirection: "column", marginTop: 12, alignItems: "center", flex: 1, width: "100%"}}>
                    <FontText style={{fontSize: 18, fontWeight: 500, width: "100%"}}>Step 2</FontText>
                    <FontText style={{width: "100%"}}>Once you have putt it out, mark on this grid where you putt landed in regards to the hole. The units are labelled above.</FontText>
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
                                stringHoles: stringHoles
                            }
                        });
                    }
                }}
                     title={isJustInfo ? "Back" : "Continue"}
                     style={{paddingVertical: 10, borderRadius: 10, marginTop: 24, marginHorizontal: 24, marginBottom: 12}}></SecondaryButton>
        </ScreenWrapper>
    )
}