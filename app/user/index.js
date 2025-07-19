import React, {useEffect, useImperativeHandle, useRef} from 'react';
import { ScrollView, View } from 'react-native';
import ScreenWrapper from '../../components/general/ScreenWrapper';
import useColors from '../../hooks/useColors';
import { useAppContext } from '../../contexts/AppCtx';
import { adaptFullRoundSession } from '../../utils/sessions/SessionUtils';
import ProfileHeader from '../../components/user/ProfileHeader';
import FriendsCard from '../../components/user/FriendsCard';
import StrokesGainedCard from '../../components/user/StrokesGainedCard';
import SessionsSection from '../../components/user/SessionsSection';
import StatsCard from "../../components/user/StatsCard";
import {useLocalSearchParams, useNavigation} from "expo-router";
import {getUserSessionsByID, getUserStatsByID} from "../../utils/users/userServices";
import {createSimpleStats} from "../../utils/PuttUtils";
import {
    acceptFriendRequest,
    cancelFriendRequest,
    getRequests,
    removeFriend,
    sendFriendRequest
} from "../../utils/friends/friendServices";
import {auth} from "../../utils/firebase";
import {RemoveFriendModal} from "../../components/friends/RemoveFriendModal";
import {CancelRequestModal} from "../../components/friends/CancelRequestModal";
import {useImage} from "expo-image";
import {SecondaryButton} from "../../components/general/buttons/SecondaryButton";
import Svg, {Path} from "react-native-svg";

export default function UserScreen({}) {
    const colors = useColors();
    const {userDataString} = useLocalSearchParams();
    const navigation = useNavigation();

    const friendData = JSON.parse(userDataString);

    console.log("UserScreen: friendData:", friendData);

    const [combinedSessions, setCombinedSessions] = React.useState([]);
    const [stats, setStats] = React.useState(createSimpleStats());
    const [isFriend, setIsFriend] = React.useState(friendData.friends.includes(auth.currentUser.uid));
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
        console.log("UserScreen: friendData:", friendData);
        if (!friendData.uid) return; // avoid double runs with invalid ID

        getUserSessionsByID(friendData.uid).then((newSessions) => {
            console.log("Fetched sessions for user:", friendData.uid, newSessions);
            if (newSessions.sessions.length > 0 || newSessions.fullRoundSessions.length > 0)
                setCombinedSessions([...newSessions.sessions, ...newSessions.fullRoundSessions].sort((a, b) => b.timestamp - a.timestamp).map(adaptFullRoundSession))
            // todo maybe making a loading thingy here for the sessions?
        }).catch((error) => {
            console.error("Error fetching user sessions:", error);
        });

        getUserStatsByID(friendData.uid).then(setStats).catch((error) => {
            console.error("Error fetching user stats:", error);
        });

        getRequests(friendData.uid).then((requests) => {
            if (requests.receivedRequests.some(request => request.from === auth.currentUser.uid)) {
                setPending("sent");
            }
            else if (requests.sentRequests.some(request => request.to === auth.currentUser.uid)) {
                setPending("received");
            }
        });
    }, []);

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
        console.log("Removing friend:", friendData.uid);
        console.log("Current user ID:", auth.currentUser.uid);
        removeFriend(auth.currentUser.uid, friendData.uid)
        friendData.friends = friendData.friends.filter(friend => friend !== auth.currentUser.uid);
        console.log("Updated friend list:", friendData.friends);
        setIsFriend(false);
    }

    const removeRequest = () => {
        cancelRequestRef.current.close();

        cancelFriendRequest(auth.currentUser.uid, friendData.uid);
        setPending("none");
        console.log("Friend request removed.");
    }

    const acceptRequest = () => {
        acceptFriendRequest(auth.currentUser.uid, friendData.uid)
        setIsFriend(true);
        setPending("none");
        console.log("Friend request accepted.");
    }

    return (
        <>
            <ScreenWrapper style={{ paddingHorizontal: 24 }}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 80 }}>
                    <ProfileHeader userData={friendData} isSelf={false} />
                    <View style={{ flexDirection: 'row', gap: 20, marginBottom: 12 }}>
                        <FriendsCard pending={pending} userScreenRef={userScreenRef} friendCount={friendData.friends.length} isFriend={isFriend} isSelf={false} />
                        <StrokesGainedCard value={stats.strokesGained.overall} />
                    </View>
                    <SessionsSection sessions={combinedSessions} />
                    <StatsCard title="ROUND STATS" stats={[{ label: 'AVG. SCORE', value: 77 }, { label: 'HANDICAP', value: 8.9 }]} />
                    <StatsCard title="PUTTING STATS" stats={[{ label: 'AVG. PUTTS', value: stats.avgPuttsARound }, { label: 'AVG. MISS', value: `${stats.avgMiss}ft` }]} />
                    <StatsCard title="COMPARE STATS" stats={[]} />
                    <StatsCard title="ACHIEVEMENTS" stats={[]} />
                </ScrollView>
                <View style={{position: "absolute", bottom: 0, width: "100%", flexDirection: "row", alignItems: "center", justifyContent: "center", marginLeft: 24, gap: 12, marginBottom: 24}}>
                    <SecondaryButton onPress={() => navigation.goBack()} title={"Back"}
                                     style={{paddingVertical: 10, borderRadius: 10, flex: 0.7}}></SecondaryButton>
                </View>
            </ScreenWrapper>
            <RemoveFriendModal removeFriendRef={removeFriendRef} remove={removeAsFriend}/>
            <CancelRequestModal cancelRequestRef={cancelRequestRef} cancel={removeRequest}/>
        </>
    );
}