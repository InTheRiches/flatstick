import {Pressable, ScrollView, View} from "react-native";
import Svg, {Path} from "react-native-svg";
import FontText from "../../components/general/FontText";
import React from "react";
import {BottomSheetModalProvider} from "@gorhom/bottom-sheet";
import ScreenWrapper from "../../components/general/ScreenWrapper";
import useColors from "../../hooks/useColors";
import {useNavigation, useRouter} from "expo-router";
import {PrimaryButton} from "../../components/general/buttons/PrimaryButton";
import {useAppContext} from "../../contexts/AppCtx";
import {SecondaryButton} from "../../components/general/buttons/SecondaryButton";

export default function Friends({}) {
    const colors = useColors();
    const navigation = useNavigation();
    const router = useRouter();
    const {userData} = useAppContext();

    return (
        <BottomSheetModalProvider>
            <ScreenWrapper style={{borderBottomWidth: 1, borderBottomColor: colors.border.default, paddingHorizontal: 24}}>
                <ScrollView keyboardShouldPersistTaps={'handled'}>
                    <View style={{flexDirection: "row"}}>
                        <Pressable onPress={() => navigation.goBack()} style={{marginLeft: -10, marginTop: 7, paddingHorizontal: 10}}>
                            <Svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3.5}
                                 stroke={colors.text.primary} width={24} height={24}>
                                <Path strokeLinecap="round" strokeLinejoin="round"
                                      d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"/>
                            </Svg>
                        </Pressable>
                        <View style={{flexDirection: "row", flex: 1, alignItems: "center", justifyContent: "space-between", paddingBottom: 10,}}>
                            <FontText style={{
                                fontSize: 24,
                                fontWeight: 600,
                                color: colors.text.primary
                            }}>Friends</FontText>
                            <Pressable onPress={() => router.push("friends/search")} style={({pressed}) => [{backgroundColor: pressed ? colors.button.secondary.depressed : colors.button.secondary.background, padding: 8, alignItems: "center", justifyContent: "center", aspectRatio: 1, borderRadius: 50}]}>
                                <Svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={colors.button.secondary.text} width={24} height={24}>
                                    <Path
                                        d="M5.25 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM2.25 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM18.75 7.5a.75.75 0 0 0-1.5 0v2.25H15a.75.75 0 0 0 0 1.5h2.25v2.25a.75.75 0 0 0 1.5 0v-2.25H21a.75.75 0 0 0 0-1.5h-2.25V7.5Z"/>
                                </Svg>
                            </Pressable>
                        </View>
                    </View>
                    <PrimaryButton style={{
                        paddingVertical: 8,
                        paddingHorizontal: 12,
                        borderRadius: 14,
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexDirection: "row"
                    }} children={[
                        <FontText style={{color: colors.button.primary.text, fontWeight: 800, fontSize: 16}}>FRIEND
                            REQUESTS</FontText>,
                        <View style={{borderRadius: 30, padding: 6, backgroundColor: colors.button.primary.text}}>
                            <Svg width={20} height={20} xmlns="http://www.w3.org/2000/svg" fill="none"
                                 viewBox="0 0 24 24" strokeWidth={1.5}
                                 stroke={colors.button.primary.background} className="size-6">
                                <Path strokeLinecap="round" strokeLinejoin="round"
                                      d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25"/>
                            </Svg>
                        </View>
                    ]}/>
                    <View style={{marginBottom: 20, marginTop: 20}}>
                        <FontText style={{color: colors.button.primary.text, fontWeight: 800, fontSize: 16, marginBottom: 14, width: "100%", borderBottomWidth: 1, borderColor: colors.border.default, paddingBottom: 8}}>{userData.friends.length} FRIENDS</FontText>
                        <View style={{backgroundColor: colors.background.secondary, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 12, borderWidth: 1, borderColor: colors.border.default}}>
                            <FontText style={{width: "100%", textAlign: "center", color: colors.text.secondary, marginBottom: 16}}>Looking for your friends? Search for them, or invite them to Flatstick!</FontText>
                            <SecondaryButton title={"Add Friends"} onPress={() => router.push("friends/search")}/>
                        </View>
                    </View>
                </ScrollView>
            </ScreenWrapper>
        </BottomSheetModalProvider>
    )
}