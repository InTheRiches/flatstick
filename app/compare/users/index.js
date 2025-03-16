import {Platform, Pressable, ScrollView, View} from "react-native";
import React, {useEffect, useRef, useState} from "react";
import useColors from "../../../hooks/useColors";
import {useAppContext} from "../../../contexts/AppCtx";
import Svg, {Path} from "react-native-svg";
import {compareStats, DataTable, MiniDataTable} from "../../../components/tabs/compare";
import {useLocalSearchParams, useNavigation} from "expo-router";
import {doc, getDoc} from "firebase/firestore";
import {auth, firestore} from "../../../utils/firebase";
import {createSimpleRefinedStats} from "../../../utils/PuttUtils";
import ScreenWrapper from "../../../components/general/ScreenWrapper";
import FontText from "../../../components/general/FontText";
import {BannerAd, BannerAdSize, TestIds, useForeground} from "react-native-google-mobile-ads";

const bannerAdId = __DEV__ ? TestIds.BANNER : Platform.OS === "ios" ? "ca-app-pub-2701716227191721/1882654810" : "ca-app-pub-2701716227191721/3548415690";

export default function CompareUsers({}) {
    const colors = useColors();
    const {userData, currentStats} = useAppContext();
    const navigation = useNavigation();
    const {id, jsonProfile} = useLocalSearchParams();
    const profile = JSON.parse(jsonProfile);
    const [loading, setLoading] = useState(true);

    const [usersStats, setUsersStats] = useState(createSimpleRefinedStats());
    const bannerRef = useRef(null);

    useForeground(() => {
        bannerRef.current?.load();
    })

    useEffect(() => {
        // fetch users stats
        const userDocRef = doc(firestore, `users/${id}/stats/current`);
        getDoc(userDocRef).then(async (doc) => {
            if (doc.exists()) {
                setUsersStats(doc.data());
                setLoading(false);
            }
        });
    }, []);

    const betterPutter = compareStats(currentStats, usersStats);

    return (
        <ScreenWrapper>
            <ScrollView style={{flex: 1, paddingHorizontal: 20}}>
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
                    <FontText style={{fontSize: 24, fontWeight: 500, color: colors.text.primary}}>Compare Users</FontText>
                </View>
                <FontText style={{color: colors.text.secondary, fontWeight: 600, marginTop: 16, marginBottom: 6}}>USER</FontText>
                <View style={{
                    padding: 6,
                    backgroundColor: colors.background.secondary,
                    borderRadius: 14,
                    marginBottom: 8,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between"
                }}>
                    <View style={{flexDirection: "row", alignItems: "center"}}>
                        <Svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={colors.text.secondary} width={48} height={48}>
                            <Path fillRule="evenodd"
                                  d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm11.378-3.917c-.89-.777-2.366-.777-3.255 0a.75.75 0 0 1-.988-1.129c1.454-1.272 3.776-1.272 5.23 0 1.513 1.324 1.513 3.518 0 4.842a3.75 3.75 0 0 1-.837.552c-.676.328-1.028.774-1.028 1.152v.75a.75.75 0 0 1-1.5 0v-.75c0-1.279 1.06-2.107 1.875-2.502.182-.088.351-.199.503-.331.83-.727.83-1.857 0-2.584ZM12 18a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
                                  clipRule="evenodd"/>
                        </Svg>
                        <View style={{marginLeft: 6}}>
                            <FontText style={{color: colors.text.primary, fontSize: 20, fontWeight: 500, marginBottom: Platform.OS === "ios" ? 0 : 4}}>{profile.firstName + " " + profile.lastName}</FontText>
                        </View>
                    </View>
                </View>
                <View style={{marginLeft: -24}}>
                    <BannerAd ref={bannerRef} unitId={bannerAdId} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />
                </View>
                <FontText style={{color: colors.text.secondary, fontWeight: 600, marginTop: 16, marginBottom: 6}}>COMPARISON</FontText>
                <View style={{backgroundColor: colors.background.secondary, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 12, alignItems: "center", justifyContent: "center"}}>
                    {loading ?
                        <FontText style={{color: colors.text.primary, fontSize: 18, fontWeight: 500}}>Loading...</FontText> :
                        <FontText style={{color: colors.text.primary, fontSize: 18, fontWeight: 500, textAlign: "center"}}>You can be confident that <FontText style={{fontWeight: 800, textDecorationLine: "underline"}}>{betterPutter === 0 ? "neither" : betterPutter === 1 ? "you" : profile.firstName + " " + profile.lastName}</FontText> putt better.</FontText>
                    }
                </View>
                <FontText style={{color: colors.text.primary, fontWeight: 600, marginTop: 20, fontSize: 18}}>All Putts</FontText>
                <View style={{flexDirection: "row", justifyContent: "space-between", marginTop: 12}}>
                    <FontText style={{flex: 1, color: colors.text.secondary, fontWeight: 600}}>Category</FontText>
                    <FontText style={{flex: 1, color: colors.text.secondary, fontWeight: 600, textAlign: "center"}}>{auth.currentUser.displayName}</FontText>
                    <FontText style={{flex: 1, color: colors.text.secondary, fontWeight: 600, textAlign: "center"}}>{profile.firstName + " " + profile.lastName}</FontText>
                </View>
                <DataTable stats1={currentStats} stats2={usersStats} type={"users"}/>
                <FontText style={{flex: 1, color: colors.text.primary, fontWeight: 600, marginTop: 12, fontSize: 18}}>{"< " + (userData.preferences.units === 0 ? "6ft" : "2m")}</FontText>
                <MiniDataTable stats1={currentStats} stats2={usersStats} type={"users"} distance={0}/>
                <FontText style={{flex: 1, color: colors.text.primary, fontWeight: 600, marginTop: 12, fontSize: 18}}>{(userData.preferences.units === 0 ? "6-12ft" : "2-4m")}</FontText>
                <MiniDataTable stats1={currentStats} stats2={usersStats} type={"users"} distance={1}/>
                <View style={{marginLeft: -24}}>
                    <BannerAd ref={bannerRef} unitId={bannerAdId} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />
                </View>
                <FontText style={{flex: 1, color: colors.text.primary, fontWeight: 600, marginTop: 12, fontSize: 18}}>{(userData.preferences.units === 0 ? "12-20ft" : "4-7m")}</FontText>
                <MiniDataTable stats1={currentStats} stats2={usersStats} type={"users"} distance={2}/>
                <FontText style={{flex: 1, color: colors.text.primary, fontWeight: 600, marginTop: 12, fontSize: 18}}>{(userData.preferences.units === 0 ? ">20ft" : ">7m")}</FontText>
                <MiniDataTable stats1={currentStats} stats2={usersStats} type={"users"} distance={3}/>
            </ScrollView>
        </ScreenWrapper>
    )
}