import {useAppContext} from "../../contexts/AppCtx";
import {FlatList, Pressable, Text, useColorScheme, View} from "react-native";
import useColors from "../../hooks/useColors";
import {useNavigation, useRouter} from "expo-router";
import Svg, {Path} from "react-native-svg";
import React from "react";

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
                <Pressable onPress={() => navigation.goBack()} style={{position: "absolute", left: 0, marginLeft: 24}}>
                    <View style={{flexDirection: "row", alignItems: "center", gap: 4, alignSelf: "flex-start"}}>
                        <Svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5}
                             stroke={colors.text.primary} width={20} height={20}>
                            <Path strokeLinecap="round" strokeLinejoin="round"
                                  d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"/>
                        </Svg>
                        <Text style={{color: colors.text.primary, fontSize: 18, fontWeight: 500, marginLeft: 8}}>Back</Text>
                    </View>
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

function Session({session}) {
    const colors = useColors();
    const router = useRouter();
    const colorScheme = useColorScheme();

    const condensedType = {
        "real-simulation": "Round",
        "round-simulation": "Sim"
    }
    return (
        <Pressable onPress={() => router.push({pathname: "sessions/individual", params: {jsonSession: JSON.stringify(session)}})}
                   style={({pressed}) =>
                       [{
                           backgroundColor: colorScheme === "light" ? pressed ? colors.button.primary.depressed : colors.button.primary.background : pressed ? colors.button.secondary.depressed : colors.button.secondary.background,
                       }, {
                           flexDirection: "row",
                           borderBottomWidth: 1,
                           borderColor: colors.border.default,
                           paddingLeft: 12,
                           paddingVertical: 10
                   }]}>
            <Text style={{color: colors.text.primary, fontSize: 18, flex: 0.7, textAlign: "left"}}>{condensedType[session.type]}</Text>
            <Text style={{color: colors.text.primary, fontSize: 18, flex: 1, textAlign: "center"}}>{new Date(session.timestamp).toLocaleDateString('en-US', {
                year: '2-digit',
                month: '2-digit',
                day: '2-digit'
            })}</Text>
            <Text style={{color: colors.text.primary, fontSize: 18, flex: 1, textAlign: "center"}}>{session.totalPutts}</Text>
            <Text style={{color: colors.text.primary, fontSize: 18, flex: 1, textAlign: "center"}}>{session.strokesGained}</Text>
        </Pressable>
    )
}