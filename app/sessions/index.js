import {useAppContext} from "../../contexts/AppCtx";
import {FlatList, Pressable, Text, View} from "react-native";
import useColors from "../../hooks/useColors";
import {useNavigation} from "expo-router";
import Svg, {Path} from "react-native-svg";
import React from "react";
import {Session} from "../../components/sessions";

// TODO add a fixed back button to the bottom
export default function Sessions({}) {
    const {puttSessions} = useAppContext();
    const colors = useColors();
    const navigation = useNavigation();

    const renderItem = ({ item, index }) => (
        <Session key={"session_" + index} session={item} />
    );

    return (
        <View style={{backgroundColor: colors.background.primary, flex: 1}}>
            <View style={{flexDirection: "row", alignItems: "center", marginBottom: 12}}>
                <Text style={{textAlign: "center", width: "100%", color: colors.text.primary, fontSize: 24, fontWeight: 600}}>Your Sessions</Text>
                <Pressable onPress={() => navigation.goBack()} style={{position: "absolute", left: 0, marginLeft: 14, padding: 10}}>
                    <Svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3}
                         stroke={colors.text.primary} width={24} height={24}>
                        <Path strokeLinecap="round" strokeLinejoin="round"
                              d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"/>
                    </Svg>
                </Pressable>
            </View>
            <View style={{flexDirection: "row", borderBottomWidth: 1, borderColor: colors.border.default, paddingLeft: 12, paddingVertical: 10, borderTopWidth: 1}}>
                <Text style={{color: colors.text.secondary, fontSize: 16, flex: 0.7, textAlign: "left"}}>Type</Text>
                <Text style={{color: colors.text.secondary, fontSize: 16, flex: 1, textAlign: "center"}}>Date</Text>
                <Text style={{color: colors.text.secondary, fontSize: 16, flex: 1, textAlign: "center"}}>Total Putts</Text>
                <Text style={{color: colors.text.secondary, fontSize: 16, flex: 1, textAlign: "center"}}>SG</Text>
            </View>
            <FlatList
                data={puttSessions}
                renderItem={renderItem}
                keyExtractor={(item, index) => "session_" + index}
            />
        </View>
    )
}