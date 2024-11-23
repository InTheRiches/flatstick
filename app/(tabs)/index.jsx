import {ThemedText} from '@/components/ThemedText';
import {ThemedView} from '@/components/ThemedView';
import {Pressable, View, Text} from 'react-native';
import {ThemedButton} from "@/components/ThemedButton";
import {Image} from 'react-native';

import React, {useEffect, useState} from 'react';
import {getAuth} from "firebase/auth";
import {doc, getDoc, getFirestore, query, limit, orderBy, collection, getDocs} from "firebase/firestore";
import {useNavigation, useRouter} from "expo-router";
import Svg, {Path} from "react-native-svg";
import useColors from "@/hooks/useColors";
import {useAppContext, useSession} from "@/contexts/AppCtx";

export default function HomeScreen() {
    const colors = useColors();

    const auth = getAuth();
    const db = getFirestore();

    const router = useRouter();
    const {signOut, isLoading} = useSession();
    const {userData} = useAppContext();

    const [newSession, setNewSession] = useState(false);

    return (
        <ThemedView style={{
            height: "100%",
            flex: 1,
            overflow: "hidden",
            flexDirection: "column",
            alignContent: "center",
            borderBottomWidth: 1,
            borderBottomColor: colors.border.default,
        }}>
            <Header></Header>
            <View style={{
                flexDirection: "col",
                marginHorizontal: 16,
                paddingHorizontal: 12,
                paddingTop: 8,
                paddingBottom: 14,
                backgroundColor: colors.background.primary,
                elevation: 4,
                borderRadius: 24
            }}>
                <Text style={{textAlign: "center", fontSize: 24, marginBottom: 12, fontWeight: 500}}>Recent
                    Session</Text>
                <View
                    style={{
                        backgroundColor: "black",
                        paddingHorizontal: 12,
                        paddingTop: 8,
                        paddingBottom: 14,
                        borderTopLeftRadius: 16,
                        borderTopRightRadius: 16,
                        borderBottomLeftRadius: 8,
                        borderBottomRightRadius: 8,
                        marginBottom: 2
                    }}>
                    <View style={{
                        flexDirection: "row",
                        paddingBottom: 20,
                        borderBottomWidth: 1,
                        borderColor: "#777777",
                        marginBottom: 20
                    }}>
                        <View style={{flex: 1}}>
                            <Text style={{textAlign: "left", color: "white"}}>11/22</Text>
                            <Text style={{textAlign: "left", color: "white", fontSize: 24}}>Simulation</Text>
                        </View>
                        <View style={{flex: 1}}>
                            <Text style={{textAlign: "right", color: "white"}}>#132</Text>
                            <Text style={{textAlign: "right", color: "white", fontSize: 24}}>Summary</Text>
                        </View>
                    </View>
                    <View style={{flexDirection: "row", justifyContent: "space-between"}}>
                        <View>
                            <Text style={{textAlign: "left", color: "#777777"}}>Difficulty</Text>
                            <Text style={{textAlign: "left", color: "white", fontSize: 18}}>Easy</Text>
                        </View>
                        <View>
                            <Text style={{textAlign: "left", color: "#777777"}}>Made</Text>
                            <Text style={{textAlign: "left", color: "white", fontSize: 18}}>24%</Text>
                        </View>
                        <View>
                            <Text style={{textAlign: "left", color: "#777777"}}>Total Putts</Text>
                            <Text style={{textAlign: "left", color: "white", fontSize: 18}}>16</Text>
                        </View>
                        <View>
                            <Text style={{textAlign: "left", color: "#777777"}}>Avg. Miss</Text>
                            <Text style={{textAlign: "left", color: "white", fontSize: 18}}>1.2ft</Text>
                        </View>
                    </View>
                </View>
                <View
                    style={{
                        backgroundColor: "black", paddingHorizontal: 12, paddingTop: 8, paddingBottom: 14,
                        borderTopLeftRadius: 8,
                        borderTopRightRadius: 8,
                        borderBottomLeftRadius: 16,
                        borderBottomRightRadius: 16
                    }}>
                    <View style={{
                        flexDirection: "row",
                        paddingBottom: 20,
                    }}>
                        <View style={{flex: 1}}>
                            <Text style={{textAlign: "left", color: "#777777"}}>Unfinished Round</Text>
                            <Text style={{textAlign: "left", color: "white", fontSize: 24}}>Simulation</Text>
                        </View>
                        <View style={{flex: 1}}>
                            <Text style={{textAlign: "right", color: "#777777"}}>Started at 1:32</Text>
                            <Text style={{textAlign: "right", color: "white", fontSize: 24}}>Resume -></Text>
                        </View>
                    </View>
                    <View style={{flexDirection: "row", alignItems: "center"}}>
                        <View
                            style={{
                                height: 3,
                                backgroundColor: "white",
                                borderRadius: 24,
                                flex: 1,
                            }}></View>
                        <View style={{alignSelf: 'center', paddingLeft: 10}}>
                            <Text style={{color: "white"}}>Hole 12</Text>
                        </View>
                    </View>
                </View>
            </View>
        </ThemedView>
    );
}

function Profile({userData, auth}) {
    const colors = useColors();

    return (
        <View style={{
            borderColor: colors.border.default,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            borderBottomWidth: 1,
            paddingBottom: 24,
            marginBottom: 24
        }}>
            <View style={{flexDirection: "row", alignItems: "center"}}>
                <Image source={require('../../assets/images/image.png')}
                       style={{width: 60, height: 60, borderRadius: 30}}/>
                <View style={{marginLeft: 12}}>
                    <ThemedText type="subtitle">{auth.currentUser.displayName}</ThemedText>
                    <ThemedText
                        type="default">Since {(userData === undefined || userData.length === 0) ? "~~~~" : new Date(userData.date).getFullYear()}</ThemedText>
                    <ThemedText
                        type="default">{(userData === undefined || userData.length === 0) ? "~" : userData.totalPutts} Total
                        Putts</ThemedText>
                </View>
            </View>
            <View style={{flexDirection: "column", justifyContent: "center", alignContent: "center"}}>
                <View style={{
                    overflow: "hidden",
                    width: 56,
                    height: 56,
                    borderRadius: 50,
                    alignSelf: "center",
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 1,
                    marginBottom: 1,
                    backgroundColor: colors.background.secondary,
                    borderColor: colors.border.default
                }} type="secondary">
                    <ThemedText type="header"
                                style={{lineHeight: 26, zIndex: 20, color: colors.text.primary}}>1.8</ThemedText>
                </View>
                <ThemedText type="defaultSemiBold"
                            style={{alignSelf: 'flex-start', fontSize: 16, width: "auto", textAlign: "center"}}>Strokes
                    Gained</ThemedText>
            </View>
        </View>
    )
}

function Header({signOut}) {
    const colors = useColors();

    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <View style={{
            justifyContent: "space-between",
            alignContent: "center",
            flexDirection: "row",
            width: "100%",
            paddingTop: 2,
            paddingBottom: 10,
        }}>
            <View style={{flexDirection: "col", alignItems: "flex-start", flex: 0, paddingHorizontal: 16}}>
                <Text style={{color: colors.text.secondary}}>Welcome Back,</Text>
                <Text style={{fontSize: 20, fontWeight: 500}}>Hayden Williams</Text>
            </View>
            <View style={{
                aspectRatio: 1,
                backgroundColor: "white",
                paddingHorizontal: 6,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 30
            }}>
                <Svg width={32} height={32} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                     strokeWidth={1.5}
                     stroke="black"
                     className="size-6">
                    <Path strokeLinecap="round" strokeLinejoin="round"
                          d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"/>
                </Svg>
            </View>
        </View>
    )
}

// TODO Consider adding a see more button that brings up a dedication menu with a insights graphic for each session
function RecentSessions({setNewSession}) {
    const auth = getAuth();
    const db = getFirestore();

    const navigation = useNavigation();

    const [recentSessions, setRecentSessions] = useState([]);
    const [listedSessions, setListedSessions] = useState([null]);
    const [loading, setLoading] = useState(true)

    const colors = useColors();

    const pressed = (session) => {
        navigation.navigate("simulation/recap/index", {
            current: false,
            holes: session.holes,
            difficulty: session.difficulty,
            mode: session.mode,
            serializedPutts: JSON.stringify(session.putts),
            date: session.date
        });
    }

    useEffect(() => {
        const q = query(collection(db, "users/" + auth.currentUser.uid + "/sessions"), orderBy("timestamp", "desc"), limit(3));
        getDocs(q).then((querySnapshot) => {
            let docs = [];
            querySnapshot.forEach((doc) => {
                // doc.data() is never undefined for query doc snapshots
                docs.push(doc.data());
            });

            setListedSessions(docs.map((session, index) => {
                let putts = 0;
                session.putts.forEach((putt) => {
                    if (putt.distanceMissed === 0) putts++;
                    else putts += 2;
                });

                const date = new Date(session.date);

                return (
                    <Pressable onPress={(e) => pressed(session)} key={session.timestamp} style={({pressed}) => [{
                        backgroundColor: pressed ? colors.background.primary : "transparent",
                        borderBottomLeftRadius: index < docs.length - 1 ? 0 : 15,
                        borderBottomRightRadius: index < docs.length - 1 ? 0 : 15
                    }, {
                        width: "100%",
                        paddingHorizontal: 16,
                        paddingVertical: 10,
                        borderTopWidth: 1,
                        borderColor: colors.border.default,
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignContent: "center"
                    }]}>
                        <View>
                            <ThemedText>{session.type === "round-simulation" ? session.holes + " Hole Simulation" : "N/A"}</ThemedText>
                            <ThemedText secondary={true} style={{
                                fontSize: 13,
                                marginTop: -6
                            }}>{(date.getMonth() + 1) + "/" + date.getDate()}</ThemedText>
                        </View>
                        <View
                            style={{flexDirection: "row", gap: 12, width: "50%", height: "auto", alignItems: "center"}}>
                            <ThemedText
                                style={{width: "50%"}}>{session.type === "round-simulation" ? session.difficulty : "N/A"}</ThemedText>
                            <ThemedText
                                style={{width: "50%"}}>{session.type === "round-simulation" ? putts : "N/A"}</ThemedText>
                        </View>
                    </Pressable>
                )
            }));

            setRecentSessions(docs);
        }).catch((error) => {
            console.log("couldnt find the documents: " + error)
        });
    }, []);

    useEffect(() => {
        if (listedSessions[0] !== null)
            setLoading(false);
    }, [recentSessions])

    return loading ? <View></View> : recentSessions.length === 0 ? (
        <View style={{
            alignItems: "center",
            padding: 24,
            paddingVertical: 48,
            borderTopWidth: 1,
            borderColor: colors.border.default
        }}>
            <ThemedText type="subtitle">No sessions</ThemedText>
            <ThemedText secondary={true} style={{textAlign: "center", marginBottom: 24}}>No putts to review — it’s like
                the
                green’s waiting for you. Start a new session to show the green you’re serious this time… or at least
                slightly
                less terrible.</ThemedText>
            <ThemedButton onPress={() => setNewSession(true)} title="New session"></ThemedButton>
        </View>
    ) : (
        <View style={{alignContent: "center", borderTopWidth: 1, borderColor: colors.border.default}}>
            <View style={{
                width: "100%",
                paddingHorizontal: 16,
                paddingVertical: 8,
                flexDirection: "row",
                justifyContent: "space-between"
            }}>
                <Text style={{textAlign: "left", color: "#898989"}}>Sessions</Text>
                <View style={{flexDirection: "row", gap: 12, width: "50%"}}>
                    <Text style={{textAlign: "left", color: "#898989", width: "50%"}}>Difficulty</Text>
                    <Text style={{textAlign: "left", color: "#898989", width: "50%"}}>Total Putts</Text>
                </View>
            </View>
            {listedSessions}

        </View>
    );
}