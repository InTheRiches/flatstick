import React, {useEffect, useRef} from 'react';
import useColors from "@/hooks/useColors";
import {NewRealRound, NewRound} from "@/components/tabs/home/popups";
import {Platform, ScrollView, View} from "react-native";
import {Header, PracticeModes, RecentSessionSummary, SeeAllSessions} from "@/components/tabs/home";
import {BottomSheetModalProvider} from "@gorhom/bottom-sheet";
import ScreenWrapper from "@/components/general/ScreenWrapper";
import {BannerAd, BannerAdSize, TestIds, useForeground} from "react-native-google-mobile-ads";
import {useAppContext} from "@/contexts/AppContext";

const bannerAdId = __DEV__ ? TestIds.BANNER : Platform.OS === "ios" ? "ca-app-pub-2701716227191721/1882654810" : "ca-app-pub-2701716227191721/3548415690";

export default function HomeScreen() {
    const colors = useColors();

    const newSessionRef = useRef(null);
    const newRealRoundRef = useRef(null);
    const bannerRef = useRef(null);

    const {updateStats} = useAppContext();

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
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 64}}>
                        <Header></Header>
                        <RecentSessionSummary unfinished={false}></RecentSessionSummary>
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