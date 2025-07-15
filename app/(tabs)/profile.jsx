import React from 'react';
import {View, Text, Image, ScrollView, FlatList, StyleSheet, TouchableOpacity, Pressable} from 'react-native';
import ScreenWrapper from "../../components/general/ScreenWrapper";
import {PrimaryButton} from "../../components/general/buttons/PrimaryButton";
import {SecondaryButton} from "../../components/general/buttons/SecondaryButton";
import FontText from "../../components/general/FontText";
import useColors from "../../hooks/useColors";
import {Path, Svg} from "react-native-svg";
import {useAppContext} from "../../contexts/AppCtx";
import {RecentSession} from "../../components/tabs/stats/overview";
import {adaptFullRoundSession} from "../../utils/sessions/SessionUtils";
import {useRouter} from "expo-router";

export default function ProfileScreen() {
    const colors = useColors();
    const {userData, currentStats, puttSessions, fullRoundSessions} = useAppContext();
    const router = useRouter();

    let combined = [...puttSessions, ...fullRoundSessions];
    combined.sort((a, b) => b.timestamp - a.timestamp); // most recent first

    console.log(currentStats.strokesGained);

    return (
        <ScreenWrapper style={{paddingHorizontal: 24}}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 24}}>
                {/* Profile Header */}
                <View style={{alignItems: 'center', flexDirection: "row", marginBottom: 16, justifyContent: "space-between"}}>
                    <View style={{flexDirection: "row", alignItems: "center"}}>
                        <Image
                            source={require('../../assets/images/icon.png')} // Replace with your profile image
                            style={styles.profileImage}
                        />
                        <View style={{marginLeft: 8}}>
                            <Text style={styles.name}>{userData.displayName}</Text>
                            <Text style={{fontSize: 14, color: colors.text.tertiary, marginTop: 2, fontWeight: 700}}>
                                {`SINCE ${new Date(userData.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase()}`}
                            </Text>
                        </View>
                    </View>
                    <Pressable onPress={() => router.push("/settings")} style={{backgroundColor: colors.text.primary, borderRadius: 50, padding: 6, aspectRatio: 1}}>
                        <Svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={colors.background.secondary} width={27} height={27}>
                            <Path fillRule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 0 0-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 0 0-2.282.819l-.922 1.597a1.875 1.875 0 0 0 .432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 0 0 0 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 0 0-.432 2.385l.922 1.597a1.875 1.875 0 0 0 2.282.818l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.985.57.182.088.277.228.297.35l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.349.344-.165.673-.356.985-.57.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 0 0 2.28-.819l.923-1.597a1.875 1.875 0 0 0-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 0 0 0-1.139c-.016-.2.059-.352.153-.43l.84-.692c.708-.582.891-1.59.433-2.385l-.922-1.597a1.875 1.875 0 0 0-2.282-.818l-1.02.382c-.114.043-.282.031-.449-.083a7.49 7.49 0 0 0-.985-.57c-.183-.087-.277-.227-.297-.348l-.179-1.072a1.875 1.875 0 0 0-1.85-1.567h-1.843ZM12 15.75a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z" clipRule="evenodd" />
                        </Svg>
                    </Pressable>
                </View>
                <View style={{flexDirection: "row", justifyContent: "space-around", gap: 20, marginBottom: 20}}>
                    <View style={{flexDirection: "row", flex: 1, backgroundColor: colors.button.primary.background, borderRadius: 12, borderWidth: 1, borderColor: colors.button.primary.border}}>
                        <Pressable style={({pressed}) => [{
                            alignItems: "center",
                            justifyContent: "space-between",
                            flexDirection: "row",
                            borderRightWidth: 1,
                            backgroundColor: pressed ? colors.button.primary.depressed : colors.button.primary.background,
                            borderTopLeftRadius: 12,
                            borderBottomLeftRadius: 12,
                            borderRightColor: colors.button.primary.border,
                            paddingHorizontal: 12,
                        }]} children={true ?
                            <Svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                                 stroke={colors.text.primary} width={32} height={32}>
                                <Path strokeLinecap="round" strokeLinejoin="round"
                                      d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z"/>
                            </Svg> :
                            <Svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                                 stroke="currentColor" className="size-6">
                                <Path strokeLinecap="round" strokeLinejoin="round"
                                      d="M22 10.5h-6m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM4 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 10.374 21c-2.331 0-4.512-.645-6.374-1.766Z"/>
                            </Svg>
                        }/>
                        <Pressable style={({pressed}) => [{
                            alignItems: "center",
                            justifyContent: "space-between",
                            flexDirection: "row",
                            flex: 1,
                            paddingHorizontal: 12,
                            backgroundColor: pressed ? colors.button.primary.depressed : colors.button.primary.background,
                            borderTopRightRadius: 12,
                            borderBottomRightRadius: 12,
                        }]} children={[
                            <View key={"1"}>
                                <FontText
                                    style={{color: colors.button.primary.text, fontWeight: 700, fontSize: 20}}>{userData.friends.length}</FontText>
                                <FontText style={{fontWeight: 700, fontSize: 14, color: colors.text.tertiary}}>FRIENDS</FontText>
                            </View>,
                            <Svg key={"2"} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} width={24} height={24} stroke={colors.button.primary.text}>
                                <Path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5"/>
                            </Svg>
                        ]} onPress={() => router.push("/friends")}/>
                    </View>
                    <PrimaryButton style={{
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexDirection: "row",
                        paddingVertical: 10,
                        flex: 0.5,
                        paddingHorizontal: 14,
                        borderRadius: 10,
                    }} children={[
                        <View>
                            <FontText
                                style={{color: colors.button.primary.text, fontWeight: 700, fontSize: 20}}>{currentStats.strokesGained.overall > 0 ? "+" : ""}{currentStats.strokesGained.overall}</FontText>
                            <FontText style={{fontWeight: 700, fontSize: 14, color: colors.text.tertiary}}>SG</FontText>
                        </View>,
                        <Svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} width={24} height={24} stroke={colors.button.primary.text}>
                            <Path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5"/>
                        </Svg>
                    ]}/>
                </View>

                {/* Sessions */}
                <View style={{marginBottom: 20}}>
                    <FontText style={{color: colors.button.primary.text, fontWeight: 800, fontSize: 18, marginBottom: 10,}}>RECENT SESSIONS</FontText>
                    <View style={{gap: 12}}>
                        {
                            // sort it by the timestamp which is in milliseconds
                            combined.slice(0, 3).map((session, index) => {
                                return <RecentSession key={"recent-" + index} recentSession={adaptFullRoundSession(session)}></RecentSession>
                            })
                        }
                    </View>
                    <SecondaryButton onPress={() => router.push({pathname: "sessions"})} style={{
                        borderRadius: 50,
                        flexDirection: "row",
                        alignSelf: "center",
                        paddingLeft: 20,
                        gap: 12,
                        paddingRight: 8,
                        paddingVertical: 6,
                        marginTop: 10,
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
                </View>
                <View style={{height: 1, backgroundColor: colors.border.default, marginBottom: 20,}}></View>
                <PrimaryButton style={{paddingVertical: 8, paddingHorizontal: 12, borderRadius: 14, alignItems: "center", justifyContent: "space-between", flexDirection: "column"}} children={[
                    <View style={{flexDirection: "row", justifyContent: "space-between", width: "100%", alignItems: "center"}}>
                        <FontText style={{color: colors.button.primary.text, fontWeight: 800, fontSize: 16}}>ROUND STATS</FontText>
                        <View style={{borderRadius: 30, padding: 6, backgroundColor: colors.button.primary.text}}>
                            <Svg width={20} height={20} xmlns="http://www.w3.org/2000/svg" fill="none"
                                 viewBox="0 0 24 24" strokeWidth={1.5}
                                 stroke={colors.button.primary.background} className="size-6">
                                <Path strokeLinecap="round" strokeLinejoin="round"
                                      d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25"/>
                            </Svg>
                        </View>
                    </View>,
                    <View style={{flexDirection: "row", justifyContent: "space-between", width: "100%", marginTop: 12}}>
                        <View style={{flex: 1}}>
                            <FontText style={{fontWeight: 700, fontSize: 13, color: colors.text.tertiary}}>AVG. SCORE</FontText>
                            <FontText style={{fontWeight: 700, fontSize: 20}}>77</FontText>
                        </View>
                        <View style={{flex: 1}}>
                            <FontText style={{fontWeight: 700, fontSize: 13, color: colors.text.tertiary}}>HANDICAP</FontText>
                            <FontText style={{fontWeight: 700, fontSize: 20}}>8.9</FontText>
                        </View>
                    </View>
                ]}/>
                <PrimaryButton style={{paddingVertical: 8, paddingHorizontal: 12, marginTop: 12, borderRadius: 14, alignItems: "center", justifyContent: "space-between", flexDirection: "column"}} children={[
                    <View style={{flexDirection: "row", justifyContent: "space-between", width: "100%", alignItems: "center"}}>
                        <FontText style={{color: colors.button.primary.text, fontWeight: 800, fontSize: 16}}>PUTTING STATS</FontText>
                        <View style={{borderRadius: 30, padding: 6, backgroundColor: colors.button.primary.text}}>
                            <Svg width={20} height={20} xmlns="http://www.w3.org/2000/svg" fill="none"
                                 viewBox="0 0 24 24" strokeWidth={1.5}
                                 stroke={colors.button.primary.background} className="size-6">
                                <Path strokeLinecap="round" strokeLinejoin="round"
                                      d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25"/>
                            </Svg>
                        </View>
                    </View>,
                    <View style={{flexDirection: "row", justifyContent: "space-between", width: "100%", marginTop: 12}}>
                        <View style={{flex: 1}}>
                            <FontText style={{fontWeight: 700, fontSize: 13, color: colors.text.tertiary}}>AVG. PUTTS</FontText>
                            <FontText style={{fontWeight: 700, fontSize: 20}}>{currentStats.avgPuttsARound}</FontText>
                        </View>
                        <View style={{flex: 1}}>
                            <FontText style={{fontWeight: 700, fontSize: 13, color: colors.text.tertiary}}>AVG. MISS</FontText>
                            <FontText style={{fontWeight: 700, fontSize: 20}}>{currentStats.avgMiss}ft</FontText>
                        </View>
                    </View>
                ]}/>
                <PrimaryButton style={{paddingVertical: 8, marginTop: 12, paddingHorizontal: 12, borderRadius: 14, alignItems: "center", justifyContent: "space-between", flexDirection: "row"}} children={[
                    <FontText style={{color: colors.button.primary.text, fontWeight: 800, fontSize: 16}}>COMPARE STATS</FontText>,
                    <View style={{borderRadius: 30, padding: 6, backgroundColor: colors.button.primary.text}}>
                        <Svg width={20} height={20} xmlns="http://www.w3.org/2000/svg" fill="none"
                             viewBox="0 0 24 24" strokeWidth={1.5}
                             stroke={colors.button.primary.background} className="size-6">
                            <Path strokeLinecap="round" strokeLinejoin="round"
                                  d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25"/>
                        </Svg>
                    </View>
                ]}/>
                <PrimaryButton style={{paddingVertical: 8, marginTop: 12, paddingHorizontal: 12, borderRadius: 14, alignItems: "center", justifyContent: "space-between", flexDirection: "row"}} children={[
                    <FontText style={{color: colors.button.primary.text, fontWeight: 800, fontSize: 16}}>ACHIEVEMENTS</FontText>,
                    <View style={{borderRadius: 30, padding: 6, backgroundColor: colors.button.primary.text}}>
                        <Svg width={20} height={20} xmlns="http://www.w3.org/2000/svg" fill="none"
                             viewBox="0 0 24 24" strokeWidth={1.5}
                             stroke={colors.button.primary.background} className="size-6">
                            <Path strokeLinecap="round" strokeLinejoin="round"
                                  d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25"/>
                        </Svg>
                    </View>
                ]}/>
            </ScrollView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#f8f9fa',
        padding: 20,
    },
    profileImage: {
        width: 72, height: 72,
        borderRadius: 50,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    strokesGained: {
        fontSize: 18,
        color: '#2ecc71',
        marginTop: 4,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 10,
    },
    sessionItem: {
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 10,
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2,
    },
    sessionText: {
        fontSize: 16,
    },
    sessionGain: {
        fontSize: 16,
        color: '#2980b9',
        fontWeight: '500',
    },
    friendCard: {
        alignItems: 'center',
        marginRight: 15,
    },
    friendImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginBottom: 5,
    },
    friendName: {
        fontSize: 14,
        textAlign: 'center',
    },
});
