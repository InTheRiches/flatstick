import React, {useRef} from 'react';
import {ScrollView, View} from 'react-native';
import ScreenWrapper from '../../components/general/ScreenWrapper';
import {useAppContext} from '../../contexts/AppContext';
import ProfileHeader from '../../components/user/ProfileHeader';
import FriendsCard from '../../components/user/FriendsCard';
import StrokesGainedCard from '../../components/user/StrokesGainedCard';
import SessionsSection from '../../components/user/SessionsSection';
import StatsCard from "../../components/user/StatsCard";
import useColors from "../../hooks/useColors";
import {auth} from "../../utils/firebase";
import {useFocusEffect, useRouter} from "expo-router";
import {getFriends} from "../../services/friendServices";
import StrokesGainedModal from "../../components/user/StrokesGainedModal";

export default function ProfileScreen() {
    const { userData, currentStats, yearlyStats, sessions } = useAppContext();
    const colors = useColors();
    const router = useRouter();

    const strokesGainedRef = useRef(null);

    const [friends, setFriends] = React.useState([]);

    useFocusEffect(() => {
        getFriends(auth.currentUser.uid).then(setFriends);
    });

    return (
        <ScreenWrapper style={{ paddingHorizontal: 24, borderBottomWidth: 1, borderBottomColor: colors.border.default }}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
                <ProfileHeader userData={userData} isSelf={true}/>
                <View style={{ flexDirection: 'row', gap: 20, marginBottom: 12 }}>
                    <FriendsCard alert={userData.hasPendingFriendRequests} friendCount={friends.length} isFriend={false} isSelf={true} />
                    <StrokesGainedCard strokesGainedRef={strokesGainedRef} value={currentStats.strokesGained.overall} yearlyStats={yearlyStats} />
                </View>
                <SessionsSection sessions={sessions} isSelf={true}/>
                {/*<StatsCard title="ROUND STATS" stats={[{ label: 'AVG. SCORE', value: 77 }, { label: 'HANDICAP', value: 8.9 }]} />*/}
                <StatsCard title="PUTTING STATS" onPress={() => router.push({pathname: "/(tabs)/stats"})} stats={[{ label: 'AVG. PUTTS', value: currentStats.avgPuttsARound }, { label: 'AVG. MISS', value: `${currentStats.avgMiss}${userData.preferences.units === 0 ? "ft" : "m"}` }]} />
                <StatsCard title="COMPARE STATS" stats={[]} onPress={() => router.push({pathname: "/(tabs)/compare"})} />
                {/*<StatsCard title="ACHIEVEMENTS" stats={[]} onPress={() => router.push({pathname: "/achievements"})}/>*/}
            </ScrollView>
            <StrokesGainedModal yearlyStats={yearlyStats} strokesGainedRef={strokesGainedRef}/>
        </ScreenWrapper>
    );
}