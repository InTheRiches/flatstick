import {Pressable, Switch, Text, View} from "react-native";
import useColors from "../../hooks/useColors";
import React, {useRef, useState} from "react";
import {FilterPutters} from "../../components/tabs/stats/settings/popups";
import {useAppContext} from "../../contexts/AppCtx";
import Svg, {Path} from "react-native-svg";
import {useNavigation} from "expo-router";

export default function StatSettings({}) {
    const colors = useColors();
    const {putters, userData, updateData, updateStats} = useAppContext();

    // TODO implement the mishits functionality
    const [misHits, setMisHits] = useState(userData.preferences.countMishits);
    const filterPuttersRef = useRef(null);
    const navigation = useNavigation();
    const [isPressed, setIsPressed] = useState(false);

    const toggleMisHits = () => {
        updateData({...userData, preferences: {...userData.preferences, countMishits: !misHits}});

        setMisHits(previousState => !previousState);
    }

    return (
        <View style={{backgroundColor: colors.background.primary, flex: 1, paddingHorizontal: 24}}>
            <View style={{flexDirection: "row", alignItems: "center", gap: 12}}>
                <Pressable onPress={() => {
                    updateStats();
                    navigation.goBack()
                }} style={{padding: 4, paddingLeft: 0}}>
                    <Svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3}
                         stroke={colors.text.primary} width={24} height={24}>
                        <Path strokeLinecap="round" strokeLinejoin="round"
                              d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"/>
                    </Svg>
                </Pressable>
                <Text style={{fontSize: 24, fontWeight: 500, color: colors.text.primary}}>Stat Settings</Text>
            </View>
            <Text style={{color: colors.text.secondary, fontWeight: 600, marginTop: 24, marginBottom: 6}}>PREFERENCES</Text>
            <View style={{backgroundColor: colors.background.secondary, borderRadius: 12, paddingLeft: 10, paddingRight: 8, paddingVertical: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12}}>
                <Text style={{color: colors.text.primary, fontSize: 18, fontWeight: 500}}>Show Mishits</Text>
                <Switch
                    trackColor={{false: colors.switch.track, true: colors.switch.active.track}}
                    thumbColor={misHits ? colors.switch.active.thumb : colors.switch.thumb}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={toggleMisHits}
                    value={misHits}
                />
            </View>
            <View style={{backgroundColor: colors.background.secondary, borderRadius: 12, paddingLeft: 10, paddingRight: 24, paddingVertical: 6, flexDirection: "row", alignItems: "center", justifyContent: "space-between"}}>
                <Text style={{color: colors.text.primary, fontSize: 18, fontWeight: 500}}>Filter Putters</Text>
                <Pressable
                    onPressIn={() => setIsPressed(true)}
                    onPressOut={() => setIsPressed(false)}
                    onPress={() => filterPuttersRef.current.present()} style={{padding: 7}}>
                    <Text style={{color: colors.text.link, opacity: isPressed ? 0.3 : 1, fontSize: 18, fontWeight: 500}}>{userData.preferences.filteringPutter === 0 ? "All" : putters[userData.preferences.filteringPutter].name}</Text>
                </Pressable>
            </View>
            <FilterPutters filterPuttersRef={filterPuttersRef}/>
        </View>
    )
}
