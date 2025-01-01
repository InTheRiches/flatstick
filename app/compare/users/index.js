import {Pressable, ScrollView, Text, View} from "react-native";
import React, {useEffect, useState} from "react";
import useColors from "../../../hooks/useColors";
import {useAppContext} from "../../../contexts/AppCtx";
import Svg, {Path} from "react-native-svg";
import {compareStats, DataTable, MiniDataTable} from "../../../components/tabs/compare";
import {useLocalSearchParams, useNavigation} from "expo-router";
import {doc, getDoc} from "firebase/firestore";
import {auth, firestore} from "../../../utils/firebase";
import {createSimpleRefinedStats} from "../../../utils/PuttUtils";

export default function CompareUsers({}) {
    const colors = useColors();
    const {userData, currentStats} = useAppContext();
    const navigation = useNavigation();
    const {id, jsonProfile} = useLocalSearchParams();
    const profile = JSON.parse(jsonProfile);
    const [loading, setLoading] = useState(true);

    const [usersStats, setUsersStats] = useState(createSimpleRefinedStats());

    useEffect(() => {
        // fetch users stats
        const userDocRef = doc(firestore, `users/${id}/stats/current`);
        getDoc(userDocRef).then(async (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                setUsersStats(data.averagePerformance);
                setLoading(false);
            }
        });
    }, []);

    const betterPutter = compareStats(currentStats.averagePerformance, usersStats);

    return (
        <ScrollView style={{backgroundColor: colors.background.primary, flex: 1, paddingHorizontal: 24}}>
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
                <Text style={{fontSize: 24, fontWeight: 500, color: colors.text.primary}}>Compare Users</Text>
            </View>
            <View style={{
                padding: 8,
                backgroundColor: colors.background.secondary,
                borderRadius: 14,
                marginBottom: 8,
                marginTop: 16,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between"
            }}>
                <View style={{flexDirection: "row",}}>
                    <Svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={colors.text.secondary} width={48} height={48}>
                        <Path fillRule="evenodd"
                              d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm11.378-3.917c-.89-.777-2.366-.777-3.255 0a.75.75 0 0 1-.988-1.129c1.454-1.272 3.776-1.272 5.23 0 1.513 1.324 1.513 3.518 0 4.842a3.75 3.75 0 0 1-.837.552c-.676.328-1.028.774-1.028 1.152v.75a.75.75 0 0 1-1.5 0v-.75c0-1.279 1.06-2.107 1.875-2.502.182-.088.351-.199.503-.331.83-.727.83-1.857 0-2.584ZM12 18a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
                              clipRule="evenodd"/>
                    </Svg>
                    <View style={{marginLeft: 6}}>
                        <Text style={{color: colors.text.primary, fontSize: 16, fontWeight: 500}}>{profile.username}</Text>
                        <Text style={{color: colors.text.secondary, fontSize: 14}}>SG: {profile.strokesGained}</Text>
                    </View>
                </View>
                <View style={{backgroundColor: colors.button.secondary.background, alignItems: "center", justifyContent: "center", aspectRatio: 1, borderRadius: 24, paddingHorizontal: 8}}>
                    <Svg width={20} height={20} xmlns="http://www.w3.org/2000/svg" fill="none"
                         viewBox="0 0 24 24" strokeWidth={2}
                         stroke={colors.button.secondary.text} className="size-6">
                        <Path strokeLinecap="round" strokeLinejoin="round"
                              d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25"/>
                    </Svg>
                </View>
            </View>
            <Text style={{color: colors.text.secondary, fontWeight: 600, marginTop: 24, marginBottom: 6}}>COMPARISON</Text>
            <View style={{backgroundColor: colors.background.secondary, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 12, alignItems: "center", justifyContent: "center"}}>
                {loading ?
                    <Text style={{color: colors.text.primary, fontSize: 18, fontWeight: 500}}>Loading...</Text> :
                    <Text style={{color: colors.text.primary, fontSize: 18, fontWeight: 500, textAlign: "center"}}>You can be confident that <Text style={{fontWeight: 800, textDecorationLine: "underline"}}>{betterPutter === 0 ? "neither" : betterPutter === 1 ? "you" : profile.username}</Text> putt better.</Text>
                }
            </View>
            <Text style={{color: colors.text.primary, fontWeight: 600, marginTop: 20, fontSize: 18}}>All Putts</Text>
            <View style={{flexDirection: "row", justifyContent: "space-between", marginTop: 12}}>
                <Text style={{flex: 1, color: colors.text.secondary, fontWeight: 600}}>Category</Text>
                <Text style={{flex: 1, color: colors.text.secondary, fontWeight: 600, textAlign: "center"}}>{auth.currentUser.displayName}</Text>
                <Text style={{flex: 1, color: colors.text.secondary, fontWeight: 600, textAlign: "center"}}>{profile.username}</Text>
            </View>
            <DataTable stats1={currentStats.averagePerformance} stats2={usersStats} type={"users"}/>
            <Text style={{flex: 1, color: colors.text.primary, fontWeight: 600, marginTop: 12, fontSize: 18}}>{"< " + (userData.preferences.units === 0 ? "6ft" : "2m")}</Text>
            <MiniDataTable stats1={currentStats.averagePerformance} stats2={usersStats} type={"users"} distance={0}/>
            <Text style={{flex: 1, color: colors.text.primary, fontWeight: 600, marginTop: 12, fontSize: 18}}>{(userData.preferences.units === 0 ? "6-12ft" : "2-4m")}</Text>
            <MiniDataTable stats1={currentStats.averagePerformance} stats2={usersStats} type={"users"} distance={1}/>
            <Text style={{flex: 1, color: colors.text.primary, fontWeight: 600, marginTop: 12, fontSize: 18}}>{(userData.preferences.units === 0 ? "12-20ft" : "4-7m")}</Text>
            <MiniDataTable stats1={currentStats.averagePerformance} stats2={usersStats} type={"users"} distance={2}/>
            <Text style={{flex: 1, color: colors.text.primary, fontWeight: 600, marginTop: 12, fontSize: 18}}>{(userData.preferences.units === 0 ? ">20ft" : ">7m")}</Text>
            <MiniDataTable stats1={currentStats.averagePerformance} stats2={usersStats} type={"users"} distance={3}/>
        </ScrollView>
    )
}