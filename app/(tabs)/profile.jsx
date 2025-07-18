import React from 'react';
import { ScrollView, View } from 'react-native';
import ScreenWrapper from '../../components/general/ScreenWrapper';
import { useAppContext } from '../../contexts/AppCtx';
import { adaptFullRoundSession } from '../../utils/sessions/SessionUtils';
import ProfileHeader from '../../components/user/ProfileHeader';
import FriendsCard from '../../components/user/FriendsCard';
import StrokesGainedCard from '../../components/user/StrokesGainedCard';
import SessionsSection from '../../components/user/SessionsSection';
import StatsCard from "../../components/user/StatsCard";
import useColors from "../../hooks/useColors";

export default function ProfileScreen() {
    const { userData, currentStats, puttSessions, fullRoundSessions } = useAppContext();
    const colors = useColors();

    const combinedSessions = [...puttSessions, ...fullRoundSessions].sort((a, b) => b.timestamp - a.timestamp).map(adaptFullRoundSession);

    return (
        <ScreenWrapper style={{ paddingHorizontal: 24, borderBottomWidth: 1, borderBottomColor: colors.border.default }}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
                <ProfileHeader userData={userData} isSelf={true}/>
                <View style={{ flexDirection: 'row', gap: 20, marginBottom: 12 }}>
                    <FriendsCard friendCount={userData.friends.length} isFriend={false} isSelf={true} />
                    <StrokesGainedCard value={currentStats.strokesGained.overall} />
                </View>
                <SessionsSection sessions={combinedSessions} isSelf={true}/>
                <StatsCard title="ROUND STATS" stats={[{ label: 'AVG. SCORE', value: 77 }, { label: 'HANDICAP', value: 8.9 }]} />
                <StatsCard title="PUTTING STATS" stats={[{ label: 'AVG. PUTTS', value: currentStats.avgPuttsARound }, { label: 'AVG. MISS', value: `${currentStats.avgMiss}ft` }]} />
                <StatsCard title="COMPARE STATS" stats={[]} />
                <StatsCard title="ACHIEVEMENTS" stats={[]} />
            </ScrollView>
        </ScreenWrapper>
    );
}