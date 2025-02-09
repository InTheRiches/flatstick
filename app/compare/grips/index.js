import {Platform, Pressable, ScrollView, View} from "react-native";
import React, {useRef, useState} from "react";
import useColors from "../../../hooks/useColors";
import {useAppContext} from "../../../contexts/AppCtx";
import Svg, {Path} from "react-native-svg";
import {SelectGrip} from "../../../components/tabs/compare/popups";
import {compareStats, DataTable, MiniDataTable} from "../../../components/tabs/compare";
import {useNavigation} from "expo-router";
import ScreenWrapper from "../../../components/general/ScreenWrapper";
import FontText from "../../../components/general/FontText";
import {BannerAd, BannerAdSize, TestIds, useForeground} from "react-native-google-mobile-ads";

const bannerAdId = __DEV__ ? TestIds.BANNER : Platform.OS === "ios" ? "ca-app-pub-2701716227191721/1882654810" : "ca-app-pub-2701716227191721/3548415690";

export default function CompareGrips({}) {
    const colors = useColors();
    const {userData, grips} = useAppContext();
    const navigation = useNavigation();

    const [firstGrip, setFirstGrip] = useState(-1);
    const [secondGrip, setSecondGrip] = useState(-1);

    const [isOnePressed, setIsOnePressed] = useState(false);
    const [isTwoPressed, setIsTwoPressed] = useState(false);

    const firstGripRef = useRef(null);
    const secondGripRef = useRef(null);
    const bannerRef = useRef(null);

    useForeground(() => {
        bannerRef.current?.load();
    })

    let betterGrip = 0;
    if (firstGrip !== -1 && secondGrip !== -1) {
        betterGrip = compareStats(grips[firstGrip].stats, grips[secondGrip].stats)
    }

    return (
        <>
            <ScreenWrapper>
                <ScrollView style={{flex: 1, paddingHorizontal: 24}}>
                    <View style={{flexDirection: "row", alignItems: "center", gap: 12}}>
                        <Pressable onPress={() => {
                            navigation.goBack()
                        }} style={{padding: 4, paddingLeft: 0}}>
                            <Svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3}
                                 stroke={colors.text.primary} width={24} height={24}>
                                <Path strokeLinecap="round" strokeLinejoin="round"
                                      d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"/>
                            </Svg>
                        </Pressable>
                        <FontText style={{fontSize: 24, fontWeight: 500, color: colors.text.primary}}>Compare Grips</FontText>
                    </View>
                    <FontText style={{color: colors.text.secondary, fontWeight: 600, marginTop: 24, marginBottom: 6}}>SELECT GRIPS</FontText>
                    <View style={{backgroundColor: colors.background.secondary, borderRadius: 12, paddingLeft: 10, paddingRight: 24, paddingVertical: 6, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12}}>
                        <FontText style={{color: colors.text.primary, fontSize: 18, fontWeight: 500}}>Grip One</FontText>
                        <Pressable
                            onPressIn={() => setIsOnePressed(true)}
                            onPressOut={() => setIsOnePressed(false)}
                            onPress={() => firstGripRef.current.present()} style={{padding: 7}}>
                            <FontText style={{color: colors.text.link, opacity: isOnePressed ? 0.3 : 1, fontSize: 18, fontWeight: 500}}>{firstGrip === -1 ? "N/A" : firstGrip === 0 ? "All Grips" : grips[firstGrip].name}</FontText>
                        </Pressable>
                    </View>
                    <View style={{backgroundColor: colors.background.secondary, borderRadius: 12, paddingLeft: 10, paddingRight: 24, paddingVertical: 6, flexDirection: "row", alignItems: "center", justifyContent: "space-between"}}>
                        <FontText style={{color: colors.text.primary, fontSize: 18, fontWeight: 500}}>Grip Two</FontText>
                        <Pressable
                            onPressIn={() => setIsTwoPressed(true)}
                            onPressOut={() => setIsTwoPressed(false)}
                            onPress={() => secondGripRef.current.present()} style={{padding: 7}}>
                            <FontText style={{color: colors.text.link, opacity: isTwoPressed ? 0.3 : 1, fontSize: 18, fontWeight: 500}}>{secondGrip === -1 ? "N/A" : secondGrip === 0 ? "All Grips" : grips[secondGrip].name}</FontText>
                        </Pressable>
                    </View>
                    <View style={{marginLeft: -24, marginTop: 12}}>
                        <BannerAd ref={bannerRef} unitId={bannerAdId} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />
                    </View>
                    {
                        firstGrip !== -1 && secondGrip !== -1 && <>
                            <FontText style={{color: colors.text.secondary, fontWeight: 600, marginTop: 12, marginBottom: 6}}>RESULT</FontText>
                            <View style={{backgroundColor: colors.background.secondary, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 12, alignItems: "center", justifyContent: "center"}}>
                                <FontText style={{color: colors.text.primary, fontSize: 18, fontWeight: 500, textAlign: "center"}}>You can be confident that you putt better with <FontText style={{fontWeight: 800, textDecorationLine: "underline"}}>{betterGrip === 0 ? "neither" : betterGrip === 1 ? firstGrip === 0 ? "the average" : grips[firstGrip].name : secondGrip === 0 ? "the average" : grips[secondGrip].name}</FontText> grip method.</FontText>
                            </View>
                            <FontText style={{color: colors.text.primary, fontWeight: 600, marginTop: 20, fontSize: 18}}>All Putts</FontText>
                            <View style={{flexDirection: "row", justifyContent: "space-between", marginTop: 12}}>
                                <FontText style={{flex: 1, color: colors.text.secondary, fontWeight: 600}}>Category</FontText>
                                <FontText style={{flex: 1, color: colors.text.secondary, fontWeight: 600, textAlign: "center"}}>{firstGrip === 0 ? "All" : grips[firstGrip].name}</FontText>
                                <FontText style={{flex: 1, color: colors.text.secondary, fontWeight: 600, textAlign: "center"}}>{secondGrip === 0 ? "All" : grips[secondGrip].name}</FontText>
                            </View>
                            <DataTable stats1={grips[firstGrip].stats} stats2={grips[secondGrip].stats}/>
                            <FontText style={{flex: 1, color: colors.text.primary, fontWeight: 600, marginTop: 12, fontSize: 18}}>{"< " + (userData.preferences.units === 0 ? "6ft" : "2m")}</FontText>
                            <MiniDataTable stats1={grips[firstGrip].stats} stats2={grips[secondGrip].stats} distance={0}/>
                            <FontText style={{flex: 1, color: colors.text.primary, fontWeight: 600, marginTop: 12, fontSize: 18}}>{(userData.preferences.units === 0 ? "6-12ft" : "2-4m")}</FontText>
                            <MiniDataTable stats1={grips[firstGrip].stats} stats2={grips[secondGrip].stats} distance={1}/>
                            <View style={{marginLeft: -24}}>
                                <BannerAd ref={bannerRef} unitId={bannerAdId} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />
                            </View>
                            <FontText style={{flex: 1, color: colors.text.primary, fontWeight: 600, marginTop: 12, fontSize: 18}}>{(userData.preferences.units === 0 ? "12-20ft" : "4-7m")}</FontText>
                            <MiniDataTable stats1={grips[firstGrip].stats} stats2={grips[secondGrip].stats} distance={2}/>
                            <FontText style={{flex: 1, color: colors.text.primary, fontWeight: 600, marginTop: 12, fontSize: 18}}>{(userData.preferences.units === 0 ? ">20ft" : ">7m")}</FontText>
                            <MiniDataTable stats1={grips[firstGrip].stats} stats2={grips[secondGrip].stats} distance={3}/>
                        </>
                    }
                </ScrollView>
            </ScreenWrapper>
            <SelectGrip setSelectedGrip={setFirstGrip} selectedGrip={firstGrip} filterGripsRef={firstGripRef}/>
            <SelectGrip setSelectedGrip={setSecondGrip} selectedGrip={secondGrip} filterGripsRef={secondGripRef}/>
        </>
    )
}