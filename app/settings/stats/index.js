import {Platform, Pressable, Switch, View} from "react-native";
import useColors from "../../../hooks/useColors";
import React, {useRef, useState} from "react";
import {FilterGrips, FilterPutters} from "../../../components/tabs/stats/settings/popups";
import {useAppContext} from "../../../contexts/AppContext";
import Svg, {Path} from "react-native-svg";
import {useNavigation} from "expo-router";
import {SafeAreaView} from "react-native-safe-area-context";
import {BannerAd, BannerAdSize, TestIds, useForeground} from "react-native-google-mobile-ads";
import FontText from "../../../components/general/FontText";

const bannerAdId = __DEV__ ? TestIds.BANNER : Platform.OS === "ios" ? "ca-app-pub-2701716227191721/1882654810" : "ca-app-pub-2701716227191721/8611403632";

export default function StatSettings({}) {
    const colors = useColors();
    const {putters, grips, userData, updateData, refreshStats, nonPersistentData} = useAppContext();

    const [initialData, setInitialData] = useState(userData.preferences);

    const [misHits, setMisHits] = useState(userData.preferences.countMishits);
    const filterPuttersRef = useRef(null);
    const filterGripsRef = useRef(null);
    const navigation = useNavigation();
    const [isPuttersPressed, setIsPuttersPressed] = useState(false);
    const [isGripsPressed, setIsGripsPressed] = useState(false);
    const bannerRef = useRef(null);

    useForeground(() => {
        bannerRef.current?.load();
    })

    const toggleMisHits = () => {
        updateData({...userData, preferences: {...userData.preferences, countMishits: !misHits}});

        setMisHits(previousState => !previousState);
    }

    return (
        <>
            <SafeAreaView style={{flex: 1, paddingHorizontal: 20, backgroundColor: colors.background.primary}}>
                <View style={{flexDirection: "row", alignItems: "center", gap: 12}}>
                    <Pressable onPress={() => {
                        if (initialData !== userData.preferences) {
                            refreshStats().catch(e => {
                                console.log("Error overall updating stats: " + e)
                            });
                        }
                        navigation.goBack()
                    }} style={{padding: 4, paddingLeft: 0}}>
                        <Svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3.5}
                             stroke={colors.text.primary} width={24} height={24}>
                            <Path strokeLinecap="round" strokeLinejoin="round"
                                  d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"/>
                        </Svg>
                    </Pressable>
                    <FontText style={{fontSize: 24, fontWeight: 500, color: colors.text.primary}}>Stat Settings</FontText>
                </View>
                <FontText style={{color: colors.text.secondary, fontWeight: 600, marginTop: 24, marginBottom: 6}}>PREFERENCES</FontText>
                <View style={{backgroundColor: colors.background.secondary, borderRadius: 12, paddingLeft: 10, paddingRight: 8, paddingVertical: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12}}>
                    <FontText style={{color: colors.text.primary, fontSize: 18, fontWeight: 500}}>Show Mishits</FontText>
                    <Switch
                        trackColor={{false: colors.switch.track, true: colors.switch.active.track}}
                        thumbColor={misHits ? colors.switch.active.thumb : colors.switch.thumb}
                        ios_backgroundColor="#3e3e3e"
                        onValueChange={toggleMisHits}
                        value={misHits}
                    />
                </View>
                <View style={{backgroundColor: colors.background.secondary, borderRadius: 12, paddingLeft: 10, paddingRight: 24, paddingVertical: 6, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12}}>
                    <FontText style={{color: colors.text.primary, fontSize: 18, fontWeight: 500}}>Filter Putters</FontText>
                    <Pressable
                        onPressIn={() => setIsPuttersPressed(true)}
                        onPressOut={() => setIsPuttersPressed(false)}
                        onPress={() => filterPuttersRef.current.present()} style={{padding: 7}}>
                        <FontText style={{color: colors.text.link, opacity: isPuttersPressed ? 0.3 : 1, fontSize: 18, fontWeight: 500}}>{nonPersistentData.filtering.putter === 0 ? "All" : putters[nonPersistentData.filtering.putter].name}</FontText>
                    </Pressable>
                </View>
                <View style={{backgroundColor: colors.background.secondary, borderRadius: 12, paddingLeft: 10, paddingRight: 24, paddingVertical: 6, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12}}>
                    <FontText style={{color: colors.text.primary, fontSize: 18, fontWeight: 500}}>Filter Grips</FontText>
                    <Pressable
                        onPressIn={() => setIsGripsPressed(true)}
                        onPressOut={() => setIsGripsPressed(false)}
                        onPress={() => filterGripsRef.current.present()} style={{padding: 7}}>
                        <FontText style={{color: colors.text.link, opacity: isGripsPressed ? 0.3 : 1, fontSize: 18, fontWeight: 500}}>{nonPersistentData.filtering.grip === 0 ? "All" : grips[nonPersistentData.filtering.grip].name}</FontText>
                    </Pressable>
                </View>
                <View style={{position: "absolute", bottom: 0}}>
                    <BannerAd ref={bannerRef} unitId={bannerAdId} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />
                </View>
            </SafeAreaView>
            <FilterPutters filterPuttersRef={filterPuttersRef}/>
            <FilterGrips filterGripsRef={filterGripsRef}/>
        </>
    )
}
