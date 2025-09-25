import React, {useEffect, useRef, useState} from 'react';
import useColors from "@/hooks/useColors";
import {NewRealRound, NewRound} from "@/components/tabs/practice/popups";
import {Platform, ScrollView, View} from "react-native";
import {PracticeModes, RecentSessionSummary, SeeAllSessions} from "@/components/tabs/practice";
import {BottomSheetModalProvider} from "@gorhom/bottom-sheet";
import ScreenWrapper from "@/components/general/ScreenWrapper";
import {BannerAd, BannerAdSize, TestIds, useForeground} from "react-native-google-mobile-ads";
import {Header} from "../../components/tabs/Header";
import FontText from "../../components/general/FontText";
import ResumeSession from "../../components/tabs/practice/ResumeSession";
import AsyncStorage from "@react-native-async-storage/async-storage";

const bannerAdId = __DEV__ ? TestIds.BANNER : Platform.OS === "ios" ? "ca-app-pub-2701716227191721/1882654810" : "ca-app-pub-2701716227191721/3548415690";

export default function HomeScreen() {
    const colors = useColors();

    const newSessionRef = useRef(null);
    const newRealRoundRef = useRef(null);
    const bannerRef = useRef(null);

    const [unfinishedRound, setUnfinishedRound] = useState(null);

    useEffect(() => {
        AsyncStorage.getItem("currentRound").then(item => {
            if (item === null) return;

            setUnfinishedRound(JSON.parse(item));
        })
    }, [])

    useForeground(() => {
        bannerRef.current?.load();
    })

    return (
        <BottomSheetModalProvider>
            <ScreenWrapper>
                <View style={{
                    flex: 1,
                    flexDirection: "column",
                    alignContent: "center",
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border.default,
                    paddingHorizontal: 20,
                }}>
                    <ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingBottom: 64}}>
                        <Header></Header>
                        <RecentSessionSummary unfinished={unfinishedRound !== null}></RecentSessionSummary>
                        {unfinishedRound !== null && (
                            <ResumeSession session={unfinishedRound}></ResumeSession>
                        )}
                        <SeeAllSessions/>
                        <PracticeModes newRealRoundRef={newRealRoundRef} newSessionRef={newSessionRef}></PracticeModes>
                    </ScrollView>
                </View>
                <View style={{position: "absolute", bottom: 0}}>
                    <BannerAd ref={bannerRef} unitId={bannerAdId} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />
                </View>
            </ScreenWrapper>
            <NewRound newSessionRef={newSessionRef}></NewRound>
            <NewRealRound newRealRoundRef={newRealRoundRef}></NewRealRound>
        </BottomSheetModalProvider>
    );
}