import React from 'react';
import {View} from 'react-native';
import FontText from '../../components/general/FontText';
import {SecondaryButton} from '../../components/general/buttons/SecondaryButton';
import {Path, Svg} from 'react-native-svg';
import {useRouter} from 'expo-router';
import {RecentSession} from "../tabs/stats/overview";
import useColors from "../../hooks/useColors";

export default function SessionsSection({ sessions, userId = "" }) {
    const router = useRouter();
    const colors = useColors();

    return (
        <View style={{ marginBottom: 12 }}>
            <FontText style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>RECENT SESSIONS</FontText>
            <View style={{ gap: 12 }}>
                {sessions.slice(0, 3).map((session, i) => (
                    <RecentSession key={`session-${i}`} recentSession={session} />
                ))}
            </View>
            {sessions.length > 0 ? (
                <SecondaryButton onPress={() => router.push({pathname: "sessions", params: {puttSessionsString: JSON.stringify(sessions), userId: userId}})} style={{
                    borderRadius: 50,
                    flexDirection: "row",
                    alignSelf: "center",
                    paddingLeft: 20,
                    gap: 12,
                    paddingRight: 8,
                    paddingVertical: 6,
                    marginTop: 16,
                }}>
                    <FontText style={{color: colors.button.secondary.text, fontSize: 16, fontWeight: 700}}>SEE ALL SESSIONS</FontText>
                    <View style={{borderRadius: 30, padding: 6, backgroundColor: colors.button.secondary.text}}>
                        <Svg width={20} height={20} xmlns="http://www.w3.org/2000/svg" fill="none"
                             viewBox="0 0 24 24" strokeWidth={1.5}
                             stroke={colors.button.secondary.background} className="size-6">
                            <Path strokeLinecap="round" strokeLinejoin="round"
                                  d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25"/>
                        </Svg>
                    </View>
                </SecondaryButton>
            ) : (
                <View style={{backgroundColor: colors.background.secondary, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 16}}>
                    <FontText style={{width: "100%", textAlign: "center", color: colors.text.secondary, fontSize: 16}}>No sessions recorded yet</FontText>
                </View>
            )}
        </View>
    );
}
