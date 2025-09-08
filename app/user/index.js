import React, {useEffect, useImperativeHandle, useRef} from 'react';
import {Platform, ScrollView, Text, View} from 'react-native';
import ScreenWrapper from '../../components/general/ScreenWrapper';
import ProfileHeader from '../../components/user/ProfileHeader';
import FriendsCard from '../../components/user/FriendsCard';
import StrokesGainedCard from '../../components/user/StrokesGainedCard';
import SessionsSection from '../../components/user/SessionsSection';
import StatsCard from "../../components/user/StatsCard";
import {useLocalSearchParams, useRouter} from "expo-router";
import {getUserDataByID, getUserSessionsByID} from "../../services/userService";
import {createSimpleStats} from "../../utils/PuttUtils";
import {
    acceptFriendRequest,
    cancelFriendRequest,
    getRequests,
    removeFriend,
    sendFriendRequest
} from "../../services/friendServices";
import {auth} from "../../utils/firebase";
import {RemoveFriendModal} from "../../components/friends/RemoveFriendModal";
import {CancelRequestModal} from "../../components/friends/CancelRequestModal";
import {SecondaryButton} from "../../components/general/buttons/SecondaryButton";
import {BannerAd, BannerAdSize, TestIds, useForeground} from "react-native-google-mobile-ads";
import StrokesGainedModal from "../../components/user/StrokesGainedModal";
import {getAllStats} from "../../services/statsService";

const bannerAdId = __DEV__ ? TestIds.BANNER : Platform.OS === "ios" ? "ca-app-pub-2701716227191721/1882654810" : "ca-app-pub-2701716227191721/3548415690";

export default function UserScreen({}) {
    const {userDataString, userId = ""} = useLocalSearchParams();
    const router = useRouter();

    console.log("userId:", userId);

    const [friendData, setFriendData] = React.useState(
        userDataString ? JSON.parse(userDataString) : null
    );
    const [loadingUser, setLoadingUser] = React.useState(!userDataString);
    console.log("initial friendData:", friendData);
    console.log("loadingUser:", !userDataString);

    useEffect(() => {
        if (!friendData && userId) {
            getUserDataByID(userId)
                .then((data) => {
                    setFriendData(data);
                    setIsFriend(data.friends.includes(auth.currentUser.uid));
                })
                .catch((err) => console.error("Error fetching user data:", err))
                .finally(() => setLoadingUser(false));
        } else if (friendData) {
            console.log("Initial friendData:", friendData);
            setIsFriend(friendData.friends.includes(auth.currentUser.uid));
        }
    }, [userId]);

    const bannerRef = useRef(null);
    const strokesGainedRef = useRef(null);

    useForeground(() => {
        bannerRef.current?.load();
    })
    const [sessions, setSessions] = React.useState([]);
    const [yearlyStats, setYearlyStats] = React.useState({});
    const [stats, setStats] = React.useState(createSimpleStats());
    const [isFriend, setIsFriend] = React.useState(false);
    const [adLoaded, setAdLoaded] = React.useState(false);
    const [pending, setPending] = React.useState("none");
    const removeFriendRef = useRef(null);
    const cancelRequestRef = useRef(null);
    const userScreenRef = useRef(null);

    useImperativeHandle(userScreenRef, () => ({
        acceptRequest,
        removeFriend: () => removeFriendRef.current.open(),
        removeRequest: () => cancelRequestRef.current.open(),
        addFriend,
        friendData
    }));

    useEffect(() => {
        if (!friendData) return;
        if (!friendData.uid) return; // avoid double runs with invalid ID

        getUserSessionsByID(friendData.uid).then(setSessions).catch((error) => {
            console.error("Error fetching user sessions:", error);
        });

        getAllStats(friendData.uid, {}).then(stats => {
            setStats(stats.currentStats);
            setYearlyStats(stats.yearlyStats);
        })

        getRequests(friendData.uid).then((requests) => {
            if (requests.receivedRequests.some(request => request.from === auth.currentUser.uid)) {
                setPending("sent");
            }
            else if (requests.sentRequests.some(request => request.to === auth.currentUser.uid)) {
                setPending("received");
            }
        });
    }, [friendData]);

    const addFriend = () => {
        // Implement add friend functionality
        sendFriendRequest(auth.currentUser.uid, friendData.uid)
            .then(() => {
                console.log("Friend request sent successfully.");
            })
            .catch((error) => {
                console.error("Error sending friend request:", error);
            });
        setIsFriend(false);
        setPending("sent");
    }

    const removeAsFriend = () => {
        removeFriendRef.current.close();
        // Implement remove friend functionality
        removeFriend(auth.currentUser.uid, friendData.uid)
        friendData.friends = friendData.friends.filter(friend => friend !== auth.currentUser.uid);
        setIsFriend(false);
        setPending("none");
    }

    const removeRequest = () => {
        cancelRequestRef.current.close();

        cancelFriendRequest(auth.currentUser.uid, friendData.uid);
        setPending("none");
    }

    const acceptRequest = () => {
        acceptFriendRequest(auth.currentUser.uid, friendData.uid)
        setIsFriend(true);
        setPending("none");
    }

    if (loadingUser) {
        return (
            <ScreenWrapper>
                <Text>Loading...</Text>
            </ScreenWrapper>
        );
    }

    if (!friendData) {
        return (
            <ScreenWrapper>
                <Text>User not found</Text>
            </ScreenWrapper>
        );
    }

    return (
        <>
            <ScreenWrapper style={{ paddingHorizontal: 24 }}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 150 }}>
                    <ProfileHeader userData={friendData} isSelf={false} />
                    <View style={{ flexDirection: 'row', gap: 20, marginBottom: 12}}>
                        <FriendsCard pending={pending} userScreenRef={userScreenRef} friendCount={friendData.friends.length} isFriend={isFriend} isSelf={false} />
                        <StrokesGainedCard strokesGainedRef={strokesGainedRef} yearlyStats={yearlyStats} value={stats.strokesGained.overall} />
                    </View>
                    <SessionsSection userId={friendData.uid} name={friendData.displayName} sessions={sessions} />
                    {/*<StatsCard title="ROUND STATS" stats={[{ label: 'AVG. SCORE', value: 77 }, { label: 'HANDICAP', value: 8.9 }]} />*/}
                    <StatsCard title="PUTTING STATS" stats={[{ label: 'AVG. PUTTS', value: stats.avgPuttsARound }, { label: 'AVG. MISS', value: `${stats.avgMiss}ft` }]} onPress={() => router.push({pathname: "user/stats", params: {uid: friendData.uid, userDataString: JSON.stringify(friendData)}})}/>
                    <StatsCard title="COMPARE STATS" stats={[]} onPress={() => router.push({pathname: "compare/users", params: {id: friendData.uid, jsonProfile: JSON.stringify(friendData)}})}/>
                    {/*<StatsCard title="ACHIEVEMENTS" stats={[]} />*/}
                </ScrollView>
                <View style={{
                    position: 'absolute',
                    bottom: 72,
                    left: 24,
                    right: 0,
                    width: "100%", // or '100%'
                    zIndex: 9999,
                    alignItems: 'center', // optional: center the ad if it’s not full width,
                }}>
                    <BannerAd
                        ref={bannerRef}
                        unitId={bannerAdId}
                        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
                        onAdLoaded={() => setAdLoaded(true)}
                        onAdClosed={() => setAdLoaded(false)}
                    />
                </View>
                <View style={{position: "absolute", bottom: 0, width: "100%", flexDirection: "row", alignItems: "center", justifyContent: "center", marginLeft: 24, gap: 12, marginBottom: 24}}>
                    <SecondaryButton onPress={() => router.back()} title={"Back"}
                                     style={{paddingVertical: 10, borderRadius: 10, flex: 0.7}}></SecondaryButton>
                </View>
                <StrokesGainedModal yearlyStats={yearlyStats} strokesGainedRef={strokesGainedRef}/>
            </ScreenWrapper>
            <RemoveFriendModal removeFriendRef={removeFriendRef} remove={removeAsFriend}/>
            <CancelRequestModal cancelRequestRef={cancelRequestRef} cancel={removeRequest}/>
        </>
    );
}