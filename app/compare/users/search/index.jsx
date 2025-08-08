import {Platform, Pressable, ScrollView, TextInput, View} from "react-native";
import React, {useRef, useState} from "react";
import useColors from "../../../../hooks/useColors";
import {auth, getProfilesByDisplayName} from "../../../../utils/firebase";
import Svg, {Path} from "react-native-svg";
import {useNavigation, useRouter} from "expo-router";
import ScreenWrapper from "../../../../components/general/ScreenWrapper";
import {BannerAd, BannerAdSize, TestIds, useForeground} from "react-native-google-mobile-ads";
import FontText from "../../../../components/general/FontText";
import {SecondaryButton} from "../../../../components/general/buttons/SecondaryButton";

const bannerAdId = __DEV__ ? TestIds.BANNER : Platform.OS === "ios" ? "ca-app-pub-2701716227191721/1882654810" : "ca-app-pub-2701716227191721/3548415690";

export default function SearchUsers({}) {
    const colors = useColors();

    const [profiles, setProfiles] = useState([]);
    const [username, setUsername] = useState("");
    const router = useRouter();
    const navigation = useNavigation();
    const bannerRef = useRef(null);

    useForeground(() => {
        bannerRef.current?.load();
    });

    const updateUsername = (text) => {
        // search for profiles that match that name
        setUsername(text);
        if (text.length > 1) {
            getProfilesByDisplayName(text).then(fetchedProfiles => {
                // remove the current user from the list
                const currentUser = auth.currentUser;
                const filteredProfiles = fetchedProfiles.filter(profile => profile.id !== currentUser.uid);
                setProfiles(filteredProfiles);
            });
        } else {
            setProfiles([]);
        }
    };

    return (
        <ScreenWrapper>
            <View style={{paddingBottom: 25, paddingHorizontal: 20, gap: 12, width: "100%"}}>
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
                    <FontText style={{fontSize: 24, fontWeight: 500, color: colors.text.primary}}>Find Users</FontText>
                </View>
                <TextInput
                    placeholder={"Username"}
                    style={{
                        backgroundColor: colors.input.background,
                        color: colors.input.text,
                        borderWidth: 1,
                        borderColor: colors.input.border,
                        borderRadius: 12,
                        padding: 12,
                        fontSize: 16,
                    }}
                    placeholderTextColor={colors.text.secondary}
                    onChangeText={updateUsername}
                />
                {profiles.length === 0 && <FontText style={{color: colors.text.secondary, textAlign: "center", fontSize: 18, fontWeight: 500}}>No users found</FontText>}
                <ScrollView keyboardShouldPersistTaps={"always"} bounces={false} contentContainerStyle={{paddingBottom: 120}}>
                    {profiles.length > 0 && profiles.map((profile, index) => {
                        const date = new Date(profile.date);

                        return (
                            <Pressable key={"user-" + index} style={({pressed}) => [{
                                padding: 8,
                                backgroundColor: pressed ? colors.button.primary.depressed : colors.background.secondary,
                                borderRadius: 14,
                                marginBottom: 8,
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: 12
                            }]} onPress={() => router.push({pathname: "/compare/users", params: {id: profile.uid, jsonProfile: JSON.stringify(profile)}})}>
                                <View style={{flexDirection: "row", flex: 1}}>
                                    <Svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={colors.text.secondary} width={48} height={48}>
                                        <Path fillRule="evenodd"
                                              d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm11.378-3.917c-.89-.777-2.366-.777-3.255 0a.75.75 0 0 1-.988-1.129c1.454-1.272 3.776-1.272 5.23 0 1.513 1.324 1.513 3.518 0 4.842a3.75 3.75 0 0 1-.837.552c-.676.328-1.028.774-1.028 1.152v.75a.75.75 0 0 1-1.5 0v-.75c0-1.279 1.06-2.107 1.875-2.502.182-.088.351-.199.503-.331.83-.727.83-1.857 0-2.584ZM12 18a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
                                              clipRule="evenodd"/>
                                    </Svg>
                                    <View style={{marginLeft: 6, flex: 1}}>
                                        <FontText style={{color: colors.text.primary, fontSize: 16, fontWeight: 500}}>{profile.firstName + " " + profile.lastName}</FontText>
                                        <View style={{flexDirection: "row", alignItems: "center", marginTop: 4, justifyContent: "space-between"}}>
                                            <FontText style={{color: colors.text.secondary, fontSize: 14}}>SG: {profile.strokesGained}</FontText>
                                            <FontText style={{color: colors.text.secondary, fontSize: 14}}>Joined: {(date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear()}</FontText>
                                        </View>
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
                            </Pressable>
                        )
                    })}
                </ScrollView>
            </View>
            <View style={{position: "absolute", bottom: 72}}>
                <BannerAd ref={bannerRef} unitId={bannerAdId} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />
            </View>
            <View style={{position: "absolute", bottom: 0, width: "100%", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 20}}>
                <SecondaryButton onPress={() => router.back()} title={"Back"}
                                 style={{paddingVertical: 10, borderRadius: 10, flex: 0.7}}></SecondaryButton>
            </View>
        </ScreenWrapper>
    )
}