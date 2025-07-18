import {Pressable, ScrollView, View} from "react-native";
import Svg, {Path} from "react-native-svg";
import FontText from "../../../components/general/FontText";
import React, {useEffect, useRef} from "react";
import {BottomSheetModalProvider} from "@gorhom/bottom-sheet";
import ScreenWrapper from "../../../components/general/ScreenWrapper";
import useColors from "../../../hooks/useColors";
import {useNavigation, useRouter} from "expo-router";
import {PrimaryButton} from "../../../components/general/buttons/PrimaryButton";
import {useAppContext} from "../../../contexts/AppCtx";
import {SecondaryButton} from "../../../components/general/buttons/SecondaryButton";
import {
    acceptFriendRequest, cancelFriendRequest,
    getRequests,
    rejectFriendRequest,
    sendFriendRequest
} from "../../../utils/friends/friendServices";
import {auth, getProfileById} from "../../../utils/firebase";
import {CancelRequestModal} from "../../../components/friends/CancelRequestModal";
import {getUserDataByID} from "../../../utils/users/userServices";

export default function FriendRequests({}) {
    const colors = useColors();
    const navigation = useNavigation();
    const router = useRouter();

    const [received, setReceived] = React.useState(true);

    const cancelRequestRef = useRef(null);

    const [requests, setRequests] = React.useState({
        receivedRequests: [],
        sentRequests: []
    });

    const cancelRequest = (id) => {
        cancelFriendRequest(auth.currentUser.uid, id);
        setRequests((prev) => ({
            ...prev,
            sentRequests: prev.sentRequests.filter(r => r.to !== id)
        }));
        cancelRequestRef.current?.close();
    }

    useEffect(() => {
        getRequests(auth.currentUser.uid).then(async (res) => {
            // Fetch profiles for each of the received requests
            const receivedRequestsWithProfiles = await Promise.all(
                res.receivedRequests.map(async (request) => {
                    const profile = await getUserDataByID(request.from);
                    return {
                        ...request,
                        ...profile
                    };
                })
            );

            const sentRequestsWithProfiles = await Promise.all(
                res.sentRequests.map(async (request) => {
                    const profile = await getUserDataByID(request.to);
                    return {
                        ...request,
                        ...profile
                    };
                })
            );

            // Update the requests state with the modified received requests
            setRequests({
                sentRequests: sentRequestsWithProfiles,
                receivedRequests: receivedRequestsWithProfiles
            });

            console.log("Received Requests:", JSON.stringify(receivedRequestsWithProfiles));
        });
    }, []);

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
                            }}>Friend Requests</FontText>
                            <Pressable onPress={() => router.push("friends/search")} style={({pressed}) => [{backgroundColor: pressed ? colors.button.secondary.depressed : colors.button.secondary.background, padding: 8, alignItems: "center", justifyContent: "center", aspectRatio: 1, borderRadius: 50}]}>
                                <Svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={colors.button.secondary.text} width={24} height={24}>
                                    <Path
                                        d="M5.25 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM2.25 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM18.75 7.5a.75.75 0 0 0-1.5 0v2.25H15a.75.75 0 0 0 0 1.5h2.25v2.25a.75.75 0 0 0 1.5 0v-2.25H21a.75.75 0 0 0 0-1.5h-2.25V7.5Z"/>
                                </Svg>
                            </Pressable>
                        </View>
                    </View>
                    <View style={{marginBottom: 20, marginTop: 20}}>
                        <View style={{marginBottom: 14, width: "100%", borderBottomWidth: 1, borderColor: colors.border.default, paddingBottom: 8, flexDirection: "row", justifyContent: "space-between"}}>
                            <FontText style={{color: colors.button.primary.text, fontWeight: 800, fontSize: 16}}>{requests.receivedRequests.length} FRIEND REQUEST{requests.receivedRequests.length === 1 ? "" : "S"}{received ? "" : " SENT"}</FontText>
                            <View style={{flexDirection: "row"}}>
                                <Pressable onPress={() => setReceived(true)} style={{borderBottomWidth: received ? 1 : 0}}>
                                    <FontText style={{color: received ? colors.text.primary : colors.text.secondary, fontSize: 16, fontWeight: 700}}>Received</FontText>
                                </Pressable>
                                <Pressable onPress={() => setReceived(false)} style={{borderBottomWidth: received ? 0 : 1, marginLeft: 8}}>
                                    <FontText style={{color: received ? colors.text.secondary : colors.text.primary, fontSize: 16, fontWeight: 700}}>Sent</FontText>
                                </Pressable>
                            </View>
                        </View>
                        { received && requests.receivedRequests.length < 1 && (
                            <View style={{backgroundColor: colors.background.secondary, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 16, borderWidth: 1, borderColor: colors.border.default}}>
                                <FontText style={{width: "100%", textAlign: "center", color: colors.text.secondary}}>You don't have any friend requests! When your friends add you, they will show up here.</FontText>
                            </View>
                        )}
                        { !received && requests.sentRequests.length < 1 && (
                            <View style={{backgroundColor: colors.background.secondary, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 16, borderWidth: 1, borderColor: colors.border.default}}>
                                <FontText style={{width: "100%", textAlign: "center", color: colors.text.secondary}}>You haven't sent any friend requests! When you send one, it will show up here.</FontText>
                            </View>
                        )}
                        {received && requests.receivedRequests.length > 0 && requests.receivedRequests.map((request, index) => {
                            const date = new Date(request.date);
                            return (
                                <Pressable key={"user-" + index} style={({pressed}) => [{
                                    padding: 8,
                                    backgroundColor: pressed ? colors.button.primary.depressed : colors.background.secondary,
                                    borderWidth: 1,
                                    borderColor: colors.border.default,
                                    borderRadius: 14,
                                    marginBottom: 8,
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    gap: 12
                                }]} onPress={() => {
                                    router.push({pathname: "/user", params: {userDataString: JSON.stringify(request)}})
                                }}>
                                    <View style={{flexDirection: "row", flex: 1}}>
                                        <Svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                                             fill={colors.text.secondary} width={48} height={48}>
                                            <Path fillRule="evenodd"
                                                  d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm11.378-3.917c-.89-.777-2.366-.777-3.255 0a.75.75 0 0 1-.988-1.129c1.454-1.272 3.776-1.272 5.23 0 1.513 1.324 1.513 3.518 0 4.842a3.75 3.75 0 0 1-.837.552c-.676.328-1.028.774-1.028 1.152v.75a.75.75 0 0 1-1.5 0v-.75c0-1.279 1.06-2.107 1.875-2.502.182-.088.351-.199.503-.331.83-.727.83-1.857 0-2.584ZM12 18a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
                                                  clipRule="evenodd"/>
                                        </Svg>
                                        <View style={{marginLeft: 6, flex: 1}}>
                                            <FontText style={{
                                                color: colors.text.primary,
                                                fontSize: 16,
                                                fontWeight: 500
                                            }}>{request.displayName}</FontText>
                                            <View style={{
                                                flexDirection: "row",
                                                alignItems: "center",
                                                marginTop: 4,
                                                justifyContent: "space-between"
                                            }}>
                                                <FontText style={{
                                                    color: colors.text.secondary,
                                                    fontSize: 14
                                                }}>SG: {request.strokesGained}</FontText>
                                                <FontText style={{
                                                    color: colors.text.secondary,
                                                    fontSize: 14
                                                }}>Joined: {(date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear()}</FontText>
                                            </View>
                                        </View>
                                    </View>
                                    <Pressable style={({pressed}) => [{
                                        backgroundColor: pressed ? colors.button.primary.depressed : colors.button.primary.background,
                                        borderWidth: 1,
                                        borderColor: colors.button.primary.border,
                                        alignItems: "center",
                                        justifyContent: "center",
                                        aspectRatio: 1,
                                        borderRadius: 24,
                                        paddingHorizontal: 8
                                    }]} onPress={() => {
                                        rejectFriendRequest(auth.currentUser.uid, request.from);
                                        setRequests((prev) => ({
                                            ...prev,
                                            receivedRequests: prev.receivedRequests.filter(r => r.from !== request.from)
                                        }));
                                    }}>
                                        <Svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                             strokeWidth={3} stroke={colors.text.primary} width={20}
                                             height={20}>
                                            <Path strokeLinecap="round" strokeLinejoin="round"
                                                  d="M6 18 18 6M6 6l12 12"/>
                                        </Svg>
                                    </Pressable>
                                    <Pressable style={({pressed}) => [{
                                        backgroundColor: pressed ? colors.button.secondary.depressed : colors.button.secondary.background,
                                        alignItems: "center",
                                        justifyContent: "center",
                                        aspectRatio: 1,
                                        borderRadius: 24,
                                        paddingHorizontal: 8
                                    }]} onPress={() => {
                                        acceptFriendRequest(auth.currentUser.uid, request.from);
                                        setRequests((prev) => ({
                                            ...prev,
                                            receivedRequests: prev.receivedRequests.filter(r => r.from !== request.from)
                                        }));
                                    }}>
                                        <Svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                             strokeWidth={3} stroke={colors.background.secondary} width={20} height={20}>
                                            <Path strokeLinecap="round" strokeLinejoin="round"
                                                  d="m4.5 12.75 6 6 9-13.5"/>
                                        </Svg>
                                    </Pressable>
                                </Pressable>
                            )
                        })}
                        {!received && requests.sentRequests.length > 0 && requests.sentRequests.map((request, index) => {
                            const date = new Date(request.date);
                            return (
                                <Pressable key={"user-" + index} style={({pressed}) => [{
                                    padding: 8,
                                    backgroundColor: pressed ? colors.button.primary.depressed : colors.background.secondary,
                                    borderWidth: 1,
                                    borderColor: colors.border.default,
                                    borderRadius: 14,
                                    marginBottom: 8,
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    gap: 12
                                }]} onPress={() => {
                                    router.push({pathname: "/user", params: {userDataString: JSON.stringify(request)}})
                                }}>
                                    <View style={{flexDirection: "row", flex: 1}}>
                                        <Svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                                             fill={colors.text.secondary} width={48} height={48}>
                                            <Path fillRule="evenodd"
                                                  d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm11.378-3.917c-.89-.777-2.366-.777-3.255 0a.75.75 0 0 1-.988-1.129c1.454-1.272 3.776-1.272 5.23 0 1.513 1.324 1.513 3.518 0 4.842a3.75 3.75 0 0 1-.837.552c-.676.328-1.028.774-1.028 1.152v.75a.75.75 0 0 1-1.5 0v-.75c0-1.279 1.06-2.107 1.875-2.502.182-.088.351-.199.503-.331.83-.727.83-1.857 0-2.584ZM12 18a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
                                                  clipRule="evenodd"/>
                                        </Svg>
                                        <View style={{marginLeft: 6, flex: 1}}>
                                            <FontText style={{
                                                color: colors.text.primary,
                                                fontSize: 16,
                                                fontWeight: 500
                                            }}>{request.displayName}</FontText>
                                            <View style={{
                                                flexDirection: "row",
                                                alignItems: "center",
                                                marginTop: 4,
                                                justifyContent: "space-between"
                                            }}>
                                                <FontText style={{
                                                    color: colors.text.secondary,
                                                    fontSize: 14
                                                }}>SG: {request.strokesGained}</FontText>
                                                <FontText style={{
                                                    color: colors.text.secondary,
                                                    fontSize: 14
                                                }}>Joined: {(date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear()}</FontText>
                                            </View>
                                        </View>
                                    </View>
                                    <Pressable style={({pressed}) => [{
                                        backgroundColor: pressed ? colors.button.secondary.depressed : colors.button.secondary.background,
                                        alignItems: "center",
                                        justifyContent: "center",
                                        aspectRatio: 1,
                                        borderRadius: 24,
                                        paddingHorizontal: 8
                                    }]} onPress={() => {
                                        cancelRequestRef.current?.open(request.uid);
                                    }}>
                                        <Svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                             strokeWidth={3} stroke={colors.button.secondary.text} width={20}
                                             height={20}>
                                            <Path strokeLinecap="round" strokeLinejoin="round"
                                                  d="M6 18 18 6M6 6l12 12"/>
                                        </Svg>
                                    </Pressable>
                                </Pressable>
                            )
                        })}
                    </View>
                </ScrollView>
            </ScreenWrapper>
            <CancelRequestModal cancelRequestRef={cancelRequestRef} cancel={cancelRequest} />
        </BottomSheetModalProvider>
    )
}