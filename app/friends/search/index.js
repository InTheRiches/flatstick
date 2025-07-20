import {Platform, Pressable, ScrollView, TextInput, View} from "react-native";
import Svg, {Path} from "react-native-svg";
import FontText from "../../../components/general/FontText";
import React, {useEffect, useRef, useState} from "react";
import {BottomSheetModalProvider} from "@gorhom/bottom-sheet";
import ScreenWrapper from "../../../components/general/ScreenWrapper";
import useColors from "../../../hooks/useColors";
import {useRouter} from "expo-router";
import {auth, getProfilesByDisplayName} from "../../../utils/firebase";
import {cancelFriendRequest, getRequests, sendFriendRequest} from "../../../services/friendServices";
import {CancelRequestModal} from "../../../components/friends/CancelRequestModal";
import {BannerAd, BannerAdSize, TestIds, useForeground} from "react-native-google-mobile-ads";

const bannerAdId = __DEV__ ? TestIds.BANNER : Platform.OS === "ios" ? "ca-app-pub-2701716227191721/1882654810" : "ca-app-pub-2701716227191721/3548415690";

export default function SearchFriends({}) {
    const colors = useColors();
    const router = useRouter()

    const [profiles, setProfiles] = useState([]);
    const [displayName, setDisplayName] = useState("");
    const [friendRequests, setFriendRequests] = useState([]);
    const cancelRequestRef = React.useRef(null);
    const bannerRef = useRef(null);

    useForeground(() => {
        bannerRef.current?.load();
    })

    useEffect(() => {
        getRequests(auth.currentUser.uid).then(setFriendRequests)
    }, []);

    const currentUser = auth.currentUser;

    const updateDisplayName = (text) => {
        // search for profiles that match that name
        setDisplayName(text);
        if (text.length > 1) {
            getProfilesByDisplayName(text).then(fetchedProfiles => {
                // remove the current user from the list
                const filteredProfiles = fetchedProfiles; //fetchedProfiles.filter(profile => profile.uid !== currentUser.uid);
                setProfiles(filteredProfiles);
            });
        } else {
            setProfiles([]);
        }
    };

    const cancelRequest = (id) => {
        cancelFriendRequest(auth.currentUser.uid, id);
        setFriendRequests((prev) => ({
            ...prev,
            sentRequests: prev.sentRequests.filter(r => r.to !== id)
        }));
        cancelRequestRef.current?.close();
    }

    return (
        <BottomSheetModalProvider>
            <ScreenWrapper style={{borderBottomWidth: 1, borderBottomColor: colors.border.default, paddingHorizontal: 24}}>
                <View style={{flexDirection: "row"}}>
                    <Pressable onPress={() => router.back()} style={{marginLeft: -10, marginTop: 4, paddingHorizontal: 10}}>
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
                        }}>Add Friends</FontText>
                    </View>
                </View>
                <TextInput
                    placeholder={"Search users..."}
                    style={{
                        backgroundColor: colors.input.background,
                        color: colors.input.text,
                        borderWidth: 1,
                        borderColor: colors.input.border,
                        borderRadius: 12,
                        padding: 12,
                        marginBottom: 12,
                        fontSize: 16,
                    }}
                    placeholderTextColor={colors.text.secondary}
                    onChangeText={updateDisplayName}
                />
                {profiles.length === 0 && <FontText style={{color: colors.text.secondary, textAlign: "center", fontSize: 18, fontWeight: 500}}>No users found</FontText>}
                <ScrollView keyboardShouldPersistTaps={"always"} bounces={false} contentContainerStyle={{paddingBottom: 64}}>
                    {profiles.length > 0 && profiles.map((profile, index) => {
                        const date = new Date(profile.date);
                        const isPending = friendRequests.sentRequests.some(request => request.to === profile.uid);
                        const isFriend = profile.friends && profile.friends.includes(currentUser.uid);

                        return (
                            <Pressable key={"user-" + index} style={({pressed}) => [{
                                padding: 8,
                                backgroundColor: pressed ? colors.button.primary.depressed : colors.background.secondary,
                                borderRadius: 14,
                                marginBottom: 8,
                                borderWidth: 1,
                                borderColor: colors.border.default,
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: 12
                            }]} onPress={() => {
                                router.push({pathname: "/user", params: {userDataString: JSON.stringify(profile)}})
                            }}>
                                <View style={{flexDirection: "row", flex: 1}}>
                                    <Svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={colors.text.secondary} width={48} height={48}>
                                        <Path fillRule="evenodd"
                                              d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm11.378-3.917c-.89-.777-2.366-.777-3.255 0a.75.75 0 0 1-.988-1.129c1.454-1.272 3.776-1.272 5.23 0 1.513 1.324 1.513 3.518 0 4.842a3.75 3.75 0 0 1-.837.552c-.676.328-1.028.774-1.028 1.152v.75a.75.75 0 0 1-1.5 0v-.75c0-1.279 1.06-2.107 1.875-2.502.182-.088.351-.199.503-.331.83-.727.83-1.857 0-2.584ZM12 18a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
                                              clipRule="evenodd"/>
                                    </Svg>
                                    <View style={{marginLeft: 6, flex: 1}}>
                                        <FontText style={{color: colors.text.primary, fontSize: 16, fontWeight: 500}}>{profile.displayName}</FontText>
                                        <View style={{flexDirection: "row", alignItems: "center", marginTop: 4, justifyContent: "space-between"}}>
                                            <FontText style={{color: colors.text.secondary, fontSize: 14}}>SG: {profile.strokesGained}</FontText>
                                            {isFriend ?
                                                <FontText style={{color: colors.text.secondary, fontSize: 14}}>Already friends...</FontText>
                                                : isPending ?
                                                    <FontText style={{color: colors.text.secondary, fontSize: 14}}>Request pending...</FontText>
                                                    : <FontText style={{color: colors.text.secondary, fontSize: 14}}>Joined: {(date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear()}</FontText>}
                                        </View>
                                    </View>
                                </View>
                                { isFriend ? (
                                    <Svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke={colors.text.primary} width={24} height={24} style={{marginRight: 4}}>
                                        <Path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5"/>
                                    </Svg>
                                    ) : isPending ? (
                                    <Pressable style={({pressed}) => [{
                                        backgroundColor: pressed ? colors.button.secondary.depressed : colors.button.secondary.background,
                                        alignItems: "center",
                                        justifyContent: "center",
                                        aspectRatio: 1,
                                        borderRadius: 24,
                                        paddingHorizontal: 8
                                    }]} onPress={() => {
                                        cancelRequestRef.current?.open(profile.uid);
                                    }}>
                                        <Svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                             strokeWidth={3} stroke={colors.button.secondary.text} width={20}
                                             height={20}>
                                            <Path strokeLinecap="round" strokeLinejoin="round"
                                                  d="M6 18 18 6M6 6l12 12"/>
                                        </Svg>
                                    </Pressable>
                                ) : (
                                    <Pressable style={({pressed}) => [{
                                        backgroundColor: pressed ? colors.button.secondary.depressed : colors.button.secondary.background,
                                        alignItems: "center",
                                        justifyContent: "center",
                                        aspectRatio: 1,
                                        borderRadius: 24,
                                        paddingHorizontal: 8
                                    }]} onPress={() => {
                                        sendFriendRequest(currentUser.uid, profile.uid);
                                        setFriendRequests((prev) => ({
                                            ...prev,
                                            sentRequests: [...prev.sentRequests, {to: profile.uid}]
                                        }));
                                    }}>
                                        <Svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={colors.button.secondary.text} width={20} height={20}>
                                            <Path
                                                d="M5.25 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM2.25 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM18.75 7.5a.75.75 0 0 0-1.5 0v2.25H15a.75.75 0 0 0 0 1.5h2.25v2.25a.75.75 0 0 0 1.5 0v-2.25H21a.75.75 0 0 0 0-1.5h-2.25V7.5Z"/>
                                        </Svg>
                                    </Pressable>
                                )}
                            </Pressable>
                        )
                    })}
                </ScrollView>
                <View style={{position: "absolute", bottom: 0}}>
                    <BannerAd ref={bannerRef} unitId={bannerAdId} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />
                </View>
            </ScreenWrapper>
            <CancelRequestModal cancelRequestRef={cancelRequestRef} cancel={cancelRequest} />
        </BottomSheetModalProvider>
    )
}