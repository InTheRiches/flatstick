import {Pressable, ScrollView, Text, View} from "react-native";
import React, {useRef, useState} from "react";
import useColors from "../../../hooks/useColors";
import {useAppContext} from "../../../contexts/AppCtx";
import Svg, {Path} from "react-native-svg";
import {SelectPutter} from "../../../components/tabs/compare/popups";
import {compareStats, DataTable, MiniDataTable} from "../../../components/tabs/compare";
import {useNavigation} from "expo-router";

export default function ComparePutters({}) {
    const colors = useColors();
    const {userData, putters} = useAppContext();
    const navigation = useNavigation();

    const [firstPutter, setFirstPutter] = useState(0);
    const [secondPutter, setSecondPutter] = useState(0);

    const [isOnePressed, setIsOnePressed] = useState(false);
    const [isTwoPressed, setIsTwoPressed] = useState(false);

    const firstPutterRef = useRef(null);
    const secondPutterRef = useRef(null);

    const betterPutter = compareStats(putters[firstPutter].stats, putters[secondPutter].stats);

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
                <Text style={{fontSize: 24, fontWeight: 500, color: colors.text.primary}}>Compare Putters</Text>
            </View>
            <Text style={{color: colors.text.secondary, fontWeight: 600, marginTop: 24, marginBottom: 6}}>SELECT PUTTERS</Text>
            <View style={{backgroundColor: colors.background.secondary, borderRadius: 12, paddingLeft: 10, paddingRight: 24, paddingVertical: 6, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12}}>
                <Text style={{color: colors.text.primary, fontSize: 18, fontWeight: 500}}>Putter One</Text>
                <Pressable
                    onPressIn={() => setIsOnePressed(true)}
                    onPressOut={() => setIsOnePressed(false)}
                    onPress={() => firstPutterRef.current.present()} style={{padding: 7}}>
                    <Text style={{color: colors.text.link, opacity: isOnePressed ? 0.3 : 1, fontSize: 18, fontWeight: 500}}>{firstPutter === 0 ? "N/A" : putters[firstPutter].name}</Text>
                </Pressable>
            </View>
            <View style={{backgroundColor: colors.background.secondary, borderRadius: 12, paddingLeft: 10, paddingRight: 24, paddingVertical: 6, flexDirection: "row", alignItems: "center", justifyContent: "space-between"}}>
                <Text style={{color: colors.text.primary, fontSize: 18, fontWeight: 500}}>Putter Two</Text>
                <Pressable
                    onPressIn={() => setIsTwoPressed(true)}
                    onPressOut={() => setIsTwoPressed(false)}
                    onPress={() => secondPutterRef.current.present()} style={{padding: 7}}>
                    <Text style={{color: colors.text.link, opacity: isTwoPressed ? 0.3 : 1, fontSize: 18, fontWeight: 500}}>{secondPutter === 0 ? "N/A" : putters[secondPutter].name}</Text>
                </Pressable>
            </View>
            <SelectPutter setSelectedPutter={setFirstPutter} selectedPutter={firstPutter} filterPuttersRef={firstPutterRef}/>
            <SelectPutter setSelectedPutter={setSecondPutter} selectedPutter={secondPutter} filterPuttersRef={secondPutterRef}/>
            {
                firstPutter !== 0 && secondPutter !== 0 && <>
                    <Text style={{color: colors.text.secondary, fontWeight: 600, marginTop: 24, marginBottom: 6}}>RESULT</Text>
                    <View style={{backgroundColor: colors.background.secondary, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 12, alignItems: "center", justifyContent: "center"}}>
                        <Text style={{color: colors.text.primary, fontSize: 18, fontWeight: 500, textAlign: "center"}}>You can be confident that <Text style={{fontWeight: 800, textDecorationLine: "underline"}}>{betterPutter === 0 ? "neither" : betterPutter === 1 ? putters[firstPutter].name : putters[secondPutter].name}</Text> putts better.</Text>
                    </View>
                    <Text style={{color: colors.text.primary, fontWeight: 600, marginTop: 20, fontSize: 18}}>All Putts</Text>
                    <View style={{flexDirection: "row", justifyContent: "space-between", marginTop: 12}}>
                        <Text style={{flex: 1, color: colors.text.secondary, fontWeight: 600}}>Category</Text>
                        <Text style={{flex: 1, color: colors.text.secondary, fontWeight: 600, textAlign: "center"}}>{firstPutter === 0 ? "All" : putters[firstPutter].name}</Text>
                        <Text style={{flex: 1, color: colors.text.secondary, fontWeight: 600, textAlign: "center"}}>{secondPutter === 0 ? "All" : putters[secondPutter].name}</Text>
                    </View>
                    <DataTable stats1={putters[firstPutter].stats} stats2={putters[secondPutter].stats} type={"putters"}/>
                    <Text style={{flex: 1, color: colors.text.primary, fontWeight: 600, marginTop: 12, fontSize: 18}}>{"< " + (userData.preferences.units === 0 ? "6ft" : "2m")}</Text>
                    <MiniDataTable stats1={putters[firstPutter].stats} stats2={putters[secondPutter].stats} type={"putters"} distance={0}/>
                    <Text style={{flex: 1, color: colors.text.primary, fontWeight: 600, marginTop: 12, fontSize: 18}}>{(userData.preferences.units === 0 ? "6-12ft" : "2-4m")}</Text>
                    <MiniDataTable stats1={putters[firstPutter].stats} stats2={putters[secondPutter].stats} type={"putters"} distance={1}/>
                    <Text style={{flex: 1, color: colors.text.primary, fontWeight: 600, marginTop: 12, fontSize: 18}}>{(userData.preferences.units === 0 ? "12-20ft" : "4-7m")}</Text>
                    <MiniDataTable stats1={putters[firstPutter].stats} stats2={putters[secondPutter].stats} type={"putters"} distance={2}/>
                    <Text style={{flex: 1, color: colors.text.primary, fontWeight: 600, marginTop: 12, fontSize: 18}}>{(userData.preferences.units === 0 ? ">20ft" : ">7m")}</Text>
                    <MiniDataTable stats1={putters[firstPutter].stats} stats2={putters[secondPutter].stats} type={"putters"} distance={3}/>
                </>
            }
        </ScrollView>
    )
}