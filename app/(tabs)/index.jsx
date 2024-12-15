import React, {useRef, useState} from 'react';
import {getAuth} from "firebase/auth";
import {getFirestore} from "firebase/firestore";
import {useRouter} from "expo-router";
import Svg, {Path} from "react-native-svg";
import useColors from "@/hooks/useColors";
import {useAppContext, useSession} from "@/contexts/AppCtx";
import {PrimaryButton} from "@/components/buttons/PrimaryButton";
import PracticeMode from "@/components/container/PracticeMode";
import {SecondaryButton} from "@/components/buttons/SecondaryButton";
import DrawerNewSession from "@/components/popups/DrawerNewSession";
import NewRealRound from "@/components/popups/NewRealRound";
import {ScrollView, Text, View} from "react-native";
import RecentSessionSummary from "@/utils/RecentSessionSummaries";
import PressureInfo from "@/components/popups/info/PressureInfo";

export default function HomeScreen() {
    const colors = useColors();

    const auth = getAuth();
    const db = getFirestore();

    const router = useRouter();
    const {signOut, isLoading} = useSession();
    const {userData, updateStats} = useAppContext();

    const [newSession, setNewSession] = useState(false);

    const newSessionRef = useRef(null);
    const newRealRoundRef = useRef(null);
    const pressureInfoRef = useRef(null);

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
            <ScrollView showsVerticalScrollIndicator={false}>
                <Header auth={auth}></Header>
                <RecentSessionSummary unfinished={false}></RecentSessionSummary>
                <SecondaryButton onPress={() => {}} style={{
                    borderRadius: 50,
                    flexDirection: "row",
                    alignSelf: "center",
                    paddingLeft: 12,
                    gap: 12,
                    paddingRight: 8,
                    paddingVertical: 6,
                    marginTop: 12,
                    marginBottom: 24
                }}>
                    <Text style={{color: colors.button.secondary.text, fontSize: 18}}>See All Sessions</Text>
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
                        description={"Allows you to track your putts from a real round, and keep track of real putts."}
                        name={"Real Round Tracking"}
                        distance={"~ ft"}
                        time={"~ min"}
                        focus={"Realism"}
                        onPress={() => newRealRoundRef.current.present()}/>
                    <PracticeMode
                        description={"A mode designed to replicate the pressure of a championship-winning putt, where every stroke counts and the stakes feel real."}
                        name={"Pressure Putting"}
                        distance={"< 8ft"}
                        time={"10min"}
                        focus={"Consistency"}
                        onInfo={() => pressureInfoRef.current.present()}
                        onPress={() => router.push({pathname: `/simulation/pressure/setup`})}/>
                    <PracticeMode
                        description={"A realistic mode simulating 18 unique holes to track putting performance and improve skills."}
                        name={"Ladder Challenge"}
                        distance={"< 8ft"}/>
                    <SecondaryButton onPress={() => {
                        updateStats();
                    }} style={{
                        borderRadius: 50,
                        flexDirection: "row",
                        alignSelf: "center",
                        paddingLeft: 12,
                        gap: 12,
                        paddingRight: 8,
                        paddingVertical: 6
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
            <NewRealRound newRealRoundRef={newRealRoundRef}></NewRealRound>
            <PressureInfo pressureInfoRef={pressureInfoRef}></PressureInfo>
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