import {Platform, Pressable, ScrollView, View} from "react-native";
import React, {useRef, useState} from "react";
import useColors from "../../../hooks/useColors";
import {useAppContext} from "../../../contexts/AppCtx";
import Svg, {Path} from "react-native-svg";
import {SelectPutter} from "../../../components/tabs/compare/popups";
import {compareStats, DataTable, MiniDataTable} from "../../../components/tabs/compare";
import {useNavigation} from "expo-router";
import ScreenWrapper from "../../../components/general/ScreenWrapper";
import FontText from "../../../components/general/FontText";
import {BannerAd, BannerAdSize, TestIds, useForeground} from "react-native-google-mobile-ads";

const bannerAdId = __DEV__ ? TestIds.BANNER : Platform.OS === "ios" ? "ca-app-pub-2701716227191721/1882654810" : "ca-app-pub-2701716227191721/3548415690";

export default function ComparePutters({}) {
    const colors = useColors();
    const {userData, putters} = useAppContext();
    const navigation = useNavigation();

    const [firstPutter, setFirstPutter] = useState(-1);
    const [secondPutter, setSecondPutter] = useState(-1);

    const [isOnePressed, setIsOnePressed] = useState(false);
    const [isTwoPressed, setIsTwoPressed] = useState(false);

    const firstPutterRef = useRef(null);
    const secondPutterRef = useRef(null);
    const bannerRef = useRef(null);

    useForeground(() => {
        bannerRef.current?.load();
    })

    let betterPutter = 0;
    if (firstPutter !== -1 && secondPutter !== -1) {
        betterPutter = compareStats(putters[firstPutter].stats, putters[secondPutter].stats)
    }

    return (
        <>
            <ScreenWrapper>
                <ScrollView style={{flex: 1, paddingHorizontal: 20}}>
                    <View style={{flexDirection: "row", alignItems: "center", gap: 12}}>
                        <Pressable onPress={() => {
                            navigation.goBack()
                        }} style={{padding: 4, paddingLeft: 0}}>
                            <Svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3.5}
                                 stroke={colors.text.primary} width={24} height={24}>
                                <Path strokeLinecap="round" strokeLinejoin="round"
                                      d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"/>
                            </Svg>
                        </Pressable>
                        <FontText style={{fontSize: 24, fontWeight: 500, color: colors.text.primary}}>Compare Putters</FontText>
                    </View>
                    <FontText style={{color: colors.text.secondary, fontWeight: 600, marginTop: 24, marginBottom: 6}}>SELECT PUTTERS</FontText>
                    <View style={{backgroundColor: colors.background.secondary, borderRadius: 12, paddingLeft: 10, paddingRight: 24, paddingVertical: 6, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12}}>
                        <FontText style={{color: colors.text.primary, fontSize: 18, fontWeight: 500}}>Putter One</FontText>
                        <Pressable
                            onPressIn={() => setIsOnePressed(true)}
                            onPressOut={() => setIsOnePressed(false)}
                            onPress={() => firstPutterRef.current.present()} style={{padding: 7}}>
                            <FontText style={{color: colors.text.link, opacity: isOnePressed ? 0.3 : 1, fontSize: 18, fontWeight: 500}}>{firstPutter === -1 ? "N/A" : firstPutter === 0 ? "All Putters" : putters[firstPutter].name}</FontText>
                        </Pressable>
                    </View>
                    <View style={{backgroundColor: colors.background.secondary, borderRadius: 12, paddingLeft: 10, paddingRight: 24, paddingVertical: 6, flexDirection: "row", alignItems: "center", justifyContent: "space-between"}}>
                        <FontText style={{color: colors.text.primary, fontSize: 18, fontWeight: 500}}>Putter Two</FontText>
                        <Pressable
                            onPressIn={() => setIsTwoPressed(true)}
                            onPressOut={() => setIsTwoPressed(false)}
                            onPress={() => secondPutterRef.current.present()} style={{padding: 7}}>
                            <FontText style={{color: colors.text.link, opacity: isTwoPressed ? 0.3 : 1, fontSize: 18, fontWeight: 500}}>{secondPutter === -1 ? "N/A" : secondPutter === 0 ? "All Putters" : putters[secondPutter].name}</FontText>
                        </Pressable>
                    </View>
                    <View style={{marginLeft: -24, marginTop: 12}}>
                        <BannerAd ref={bannerRef} unitId={bannerAdId} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />
                    </View>
                    {
                        firstPutter !== -1 && secondPutter !== -1 && <>
                            <FontText style={{color: colors.text.secondary, fontWeight: 600, marginTop: 12, marginBottom: 6}}>RESULT</FontText>
                            <View style={{backgroundColor: colors.background.secondary, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 12, alignItems: "center", justifyContent: "center"}}>
                                <FontText style={{color: colors.text.primary, fontSize: 18, fontWeight: 500, textAlign: "center"}}>You can be confident that <FontText style={{fontWeight: 800, textDecorationLine: "underline"}}>{betterPutter === 0 ? "neither" : betterPutter === 1 ? firstPutter === 0 ? "the average" : putters[firstPutter].name : secondPutter === 0 ? "the average" : putters[secondPutter].name}</FontText> putts better.</FontText>
                            </View>
                            <FontText style={{color: colors.text.primary, fontWeight: 600, marginTop: 20, fontSize: 18}}>All Putts</FontText>
                            <View style={{flexDirection: "row", justifyContent: "space-between", marginTop: 12}}>
                                <FontText style={{flex: 1, color: colors.text.secondary, fontWeight: 600}}>Category</FontText>
                                <FontText style={{flex: 1, color: colors.text.secondary, fontWeight: 600, textAlign: "center"}}>{firstPutter === 0 ? "All" : putters[firstPutter].name}</FontText>
                                <FontText style={{flex: 1, color: colors.text.secondary, fontWeight: 600, textAlign: "center"}}>{secondPutter === 0 ? "All" : putters[secondPutter].name}</FontText>
                            </View>
                            <DataTable stats1={putters[firstPutter].stats} stats2={putters[secondPutter].stats} type={"putters"}/>
                            <FontText style={{flex: 1, color: colors.text.primary, fontWeight: 600, marginTop: 12, fontSize: 18}}>{"< " + (userData.preferences.units === 0 ? "6ft" : "2m")}</FontText>
                            <MiniDataTable stats1={putters[firstPutter].stats} stats2={putters[secondPutter].stats} type={"putters"} distance={0}/>
                            <FontText style={{flex: 1, color: colors.text.primary, fontWeight: 600, marginTop: 12, fontSize: 18}}>{(userData.preferences.units === 0 ? "6-12ft" : "2-4m")}</FontText>
                            <MiniDataTable stats1={putters[firstPutter].stats} stats2={putters[secondPutter].stats} type={"putters"} distance={1}/>
                            <View style={{marginLeft: -24}}>
                                <BannerAd ref={bannerRef} unitId={bannerAdId} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />
                            </View>
                            <FontText style={{flex: 1, color: colors.text.primary, fontWeight: 600, marginTop: 12, fontSize: 18}}>{(userData.preferences.units === 0 ? "12-20ft" : "4-7m")}</FontText>
                            <MiniDataTable stats1={putters[firstPutter].stats} stats2={putters[secondPutter].stats} type={"putters"} distance={2}/>
                            <FontText style={{flex: 1, color: colors.text.primary, fontWeight: 600, marginTop: 12, fontSize: 18}}>{(userData.preferences.units === 0 ? ">20ft" : ">7m")}</FontText>
                            <MiniDataTable stats1={putters[firstPutter].stats} stats2={putters[secondPutter].stats} type={"putters"} distance={3}/>
                        </>
                    }
                </ScrollView>
            </ScreenWrapper>
            <SelectPutter setSelectedPutter={setFirstPutter} selectedPutter={firstPutter} filterPuttersRef={firstPutterRef}/>
            <SelectPutter setSelectedPutter={setSecondPutter} selectedPutter={secondPutter} filterPuttersRef={secondPutterRef}/>
        </>
    )
}