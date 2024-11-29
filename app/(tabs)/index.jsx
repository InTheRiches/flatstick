import {ThemedText} from '@/components/ThemedText';
import {ThemedView} from '@/components/ThemedView';
import {Pressable, View, Text, ScrollView} from 'react-native';
import {ThemedButton} from "@/components/ThemedButton";
import {Image} from 'react-native';

import React, {useEffect, useRef, useState} from 'react';
import {getAuth} from "firebase/auth";
import {getFirestore, query, limit, orderBy, collection, getDocs} from "firebase/firestore";
import {useNavigation, useRouter} from "expo-router";
import Svg, {Path} from "react-native-svg";
import useColors from "@/hooks/useColors";
import {useAppContext, useSession} from "@/contexts/AppCtx";
import {PrimaryButton} from "@/components/buttons/PrimaryButton";
import PracticeMode from "@/components/container/PracticeMode";
import {SecondaryButton} from "@/components/buttons/SecondaryButton";
import DrawerNewSession from "@/components/popups/DrawerNewSession";

export default function HomeScreen() {
    const colors = useColors();

    const auth = getAuth();
    const db = getFirestore();

    const router = useRouter();
    const {signOut, isLoading} = useSession();
    const {userData} = useAppContext();

    const [newSession, setNewSession] = useState(false);

    const newSessionRef = useRef(null);

    return (
        <View style={{
            height: "100%",
            flex: 1,
            overflow: "hidden",
            flexDirection: "column",
            alignContent: "center",
            borderBottomWidth: 1,
            borderBottomColor: colors.border.default,
            paddingHorizontal: 20,
            backgroundColor: colors.background.primary
        }}>
            <ScrollView>
                <Header auth={auth}></Header>
                <MostRecentSession unfinished={true}></MostRecentSession>
                <View
                    style={{
                        backgroundColor: colors.background.secondary,
                        paddingHorizontal: 12,
                        paddingTop: 8,
                        paddingBottom: 14,
                        borderTopLeftRadius: 8,
                        borderTopRightRadius: 8,
                        borderBottomLeftRadius: 16,
                        borderBottomRightRadius: 16,
                        marginBottom: 32
                    }}>
                    <View style={{
                        flexDirection: "row",
                        paddingBottom: 4,
                    }}>
                        <View style={{flex: 1}}>
                            <Text style={{textAlign: "left", color: colors.text.secondary}}>Unfinished
                                Round</Text>
                            <Text style={{
                                textAlign: "left",
                                color: colors.text.primary,
                                fontSize: 20,
                            }}>Simulation</Text>
                        </View>
                        <View style={{flex: 1}}>
                            <Text style={{textAlign: "right", color: colors.text.secondary}}>Started at
                                1:32</Text>
                            <Text style={{
                                textAlign: "right",
                                color: colors.text.primary,
                                fontSize: 20,
                            }}>Resume
                                -></Text>
                        </View>
                    </View>
                    <View style={{flexDirection: "row", alignItems: "center"}}>
                        <View
                            style={{
                                height: 6,
                                marginTop: 1,
                                backgroundColor: colors.text.primary,
                                borderRadius: 24,
                                flex: 1,
                            }}></View>
                        <View style={{alignSelf: 'center', paddingLeft: 10}}>
                            <Text style={{color: colors.text.primary}}>Hole 12</Text>
                        </View>
                    </View>
                </View>
                <View style={{gap: 12, marginBottom: 18}}>
                    <Text style={{color: colors.text.primary, fontSize: 20, fontWeight: 500}}>New
                        Practice</Text>
                    <PracticeMode
                        description={"A realistic mode simulating 18 unique holes to track putting performance and improve skills."}
                        name={"18 Hole Simulation"}
                        distance={"3 - 40ft"}
                        time={"10 - 20min"}
                        focus={"Adaptability"}
                        onPress={() => newSessionRef.current?.present()}/>
                    <PracticeMode
                        description={"A mode designed to replicate the pressure of a championship-winning putt, where every stroke counts and the stakes feel real."}
                        name={"Pressure Putting"}
                        distance={"< 8ft"}
                        time={"10min"}
                        focus={"Consistency"}
                        onPress={() => router.push({pathname: `/simulation/pressure`})}/>
                    <PracticeMode
                        description={"A realistic mode simulating 18 unique holes to track putting performance and improve skills."}
                        name={"Ladder Challenge"}
                        distance={"< 8ft"}/>
                    <SecondaryButton onPress={() => {
                    }} style={{
                        borderRadius: 50,
                        flexDirection: "row",
                        alignSelf: "center",
                        paddingLeft: 12,
                        gap: 12,
                        paddingRight: 8,
                        paddingVertical: 8
                    }}>
                        <Text style={{color: colors.button.secondary.text, fontSize: 18}}>See All Modes</Text>
                        <View style={{
                            borderRadius: 30,
                            padding: 6,
                            backgroundColor: colors.button.secondary.text
                        }}>
                            <Svg width={20} height={20} xmlns="http://www.w3.org/2000/svg" fill="none"
                                 viewBox="0 0 24 24" strokeWidth={1.5}
                                 stroke={colors.button.secondary.background} className="size-6">
                                <Path strokeLinecap="round" strokeLinejoin="round"
                                      d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25"/>
                            </Svg>
                        </View>
                    </SecondaryButton>
                </View>
            </ScrollView>
            <DrawerNewSession newSessionRef={newSessionRef}></DrawerNewSession>
        </View>
    );
}

function Header({signOut, auth}) {
    const colors = useColors();

    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <View style={{
            justifyContent: "space-between",
            alignItems: "center",
            flexDirection: "row",
            width: "100%",
            paddingTop: 2,
            paddingBottom: 10,
        }}>
            <View style={{flexDirection: "col", alignItems: "flex-start", flex: 0}}>
                <Text style={{color: colors.text.secondary, fontSize: 16}}>Welcome Back,</Text>
                <Text style={{
                    fontSize: 24,
                    fontWeight: 500,
                    color: colors.text.primary
                }}>{auth.currentUser.displayName}</Text>
            </View>
            <PrimaryButton onPress={() => {
            }} style={{borderRadius: 30, aspectRatio: 1, height: 42}}>
                <Svg width={28} height={28} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                     strokeWidth={1.5}
                     stroke={colors.button.primary.text}>
                    <Path strokeLinecap="round" strokeLinejoin="round"
                          d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"/>
                </Svg>
            </PrimaryButton>
        </View>
    )
}

// TODO Consider adding a see more button that brings up a dedication menu with a insights graphic for each session
function MostRecentSession({unfinished}) {
    const auth = getAuth();
    const db = getFirestore();

    const navigation = useNavigation();

    const [recentSession, setRecentSession] = useState(null);
    const [loading, setLoading] = useState(true)

    const colors = useColors();

    useEffect(() => {
        const q = query(collection(db, "users/" + auth.currentUser.uid + "/sessions"), orderBy("timestamp", "desc"), limit(1));
        getDocs(q).then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                // doc.data() is never undefined for query doc snapshots
                setRecentSession(doc.data());
            });
        }).catch((error) => {
            console.log("couldnt find the documents: " + error)
        });
    }, []);

    let date;
    if (recentSession !== null)
        date = new Date(recentSession.date);
    else
        date = new Date();

    return recentSession === null ? (
        <View
            style={{
                backgroundColor: colors.background.secondary,
                paddingHorizontal: 16,
                paddingTop: 8,
                paddingBottom: 14,
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
                borderBottomLeftRadius: unfinished ? 8 : 16,
                borderBottomRightRadius: unfinished ? 8 : 16,
                marginBottom: unfinished ? 4 : 0
            }}>
            <Text style={{
                textAlign: "left",
                color: colors.text.primary,
                fontSize: 24,

            }}>No sessions</Text>
            <Text style={{
                textAlign: "left",
                color: colors.text.secondary,
                fontSize: 16
            }}>You haven't practiced yet, what are you waiting for? A motivational speech from your putter?</Text>
        </View>
    ) : (
        <View
            style={{
                backgroundColor: colors.background.secondary,
                paddingHorizontal: 16,
                paddingTop: 8,
                paddingBottom: 14,
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
                borderBottomLeftRadius: unfinished ? 8 : 16,
                borderBottomRightRadius: unfinished ? 8 : 16,
                marginBottom: unfinished ? 4 : 0
            }}>
            <View style={{
                flexDirection: "row",
                paddingBottom: 12,
                borderBottomWidth: 2,
                borderColor: colors.border.default,
                marginBottom: 14
            }}>
                <View style={{flex: 1}}>
                    <Text style={{textAlign: "left", color: colors.text.primary}}>{(date.getMonth() + 1) +
                        "/" + date.getDate()}</Text>
                    <Text style={{
                        textAlign: "left",
                        color: colors.text.primary,
                        fontSize: 24
                    }}>Previous</Text>
                    <Text style={{
                        textAlign: "left",
                        color: colors.text.primary,
                        fontSize: 24,
                        marginTop: -8
                    }}>Session</Text>
                </View>
                <View style={{flex: 1}}>
                    <Text style={{textAlign: "right", color: colors.text.primary}}>#132</Text>
                    <Text
                        style={{
                            textAlign: "right",
                            color: colors.text.primary,
                            fontSize: 24
                        }}>Simulation</Text>
                    <Text style={{
                        textAlign: "right",
                        color: colors.text.primary,
                        fontSize: 24,
                        marginTop: -8
                    }}>Summary</Text>
                </View>
            </View>
            <View style={{flexDirection: "row", justifyContent: "space-between"}}>
                <View>
                    <Text style={{textAlign: "left", color: colors.text.secondary}}>Difficulty</Text>
                    <Text style={{
                        textAlign: "left",
                        color: colors.text.primary,
                        fontSize: 18
                    }}>{recentSession.difficulty}</Text>
                </View>
                <View>
                    <Text style={{textAlign: "left", color: colors.text.secondary}}>Made</Text>
                    <Text
                        style={{
                            textAlign: "left",
                            color: colors.text.primary,
                            fontSize: 18
                        }}>{recentSession.madePercent * 100}%</Text>
                </View>
                <View>
                    <Text style={{textAlign: "left", color: colors.text.secondary}}>Total Putts</Text>
                    <Text
                        style={{
                            textAlign: "left",
                            color: colors.text.primary,
                            fontSize: 18
                        }}>{recentSession.totalPutts}</Text>
                </View>
                <View>
                    <Text style={{textAlign: "left", color: colors.text.secondary}}>Avg. Miss</Text>
                    <Text style={{
                        textAlign: "left",
                        color: colors.text.primary,
                        fontSize: 18
                    }}>{recentSession.avgMiss}ft</Text>
                </View>
            </View>
        </View>
    );
}