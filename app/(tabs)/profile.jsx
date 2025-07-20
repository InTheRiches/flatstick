import React from 'react';
import {ScrollView, View} from 'react-native';
import ScreenWrapper from '../../components/general/ScreenWrapper';
import {useAppContext} from '../../contexts/AppContext';
import {adaptFullRoundSession} from '../../utils/sessions/SessionUtils';
import ProfileHeader from '../../components/user/ProfileHeader';
import FriendsCard from '../../components/user/FriendsCard';
import StrokesGainedCard from '../../components/user/StrokesGainedCard';
import SessionsSection from '../../components/user/SessionsSection';
import StatsCard from "../../components/user/StatsCard";
import useColors from "../../hooks/useColors";
import {auth} from "../../utils/firebase";
import {useFocusEffect, useRouter} from "expo-router";
import {getFriends} from "../../services/friendServices";

export default function ProfileScreen() {
    const { userData, currentStats, puttSessions, fullRoundSessions } = useAppContext();
    const colors = useColors();
    const router = useRouter();

    const combinedSessions = [...puttSessions, ...fullRoundSessions].sort((a, b) => b.timestamp - a.timestamp).map(adaptFullRoundSession);

    const [friends, setFriends] = React.useState([]);

    useFocusEffect(() => {
        getFriends(auth.currentUser.uid).then(setFriends);
    })

    return (
        <ScreenWrapper style={{ paddingHorizontal: 24, borderBottomWidth: 1, borderBottomColor: colors.border.default }}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
                <ProfileHeader userData={userData} isSelf={true}/>
                <View style={{ flexDirection: 'row', gap: 20, marginBottom: 12 }}>
                    <FriendsCard alert={userData.hasPendingFriendRequests} friendCount={friends.length} isFriend={false} isSelf={true} />
                    <StrokesGainedCard value={currentStats.strokesGained.overall} />
                </View>
                <SessionsSection sessions={combinedSessions} isSelf={true}/>
                <StatsCard title="ROUND STATS" stats={[{ label: 'AVG. SCORE', value: 77 }, { label: 'HANDICAP', value: 8.9 }]} />
                <StatsCard title="PUTTING STATS" stats={[{ label: 'AVG. PUTTS', value: currentStats.avgPuttsARound }, { label: 'AVG. MISS', value: `${currentStats.avgMiss}ft` }]} />
                <StatsCard title="COMPARE STATS" stats={[]} onPress={() => router.push({pathname: "/(tabs)/compare"})} />
                <StatsCard title="ACHIEVEMENTS" stats={[]} />
            </ScrollView>
        </ScreenWrapper>
    );
}