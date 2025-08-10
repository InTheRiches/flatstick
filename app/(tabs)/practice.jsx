import React, {useRef} from 'react';
import useColors from "@/hooks/useColors";
import {NewRealRound, NewRound} from "@/components/tabs/home/popups";
import {Platform, ScrollView, View} from "react-native";
import {Header, PracticeModes, RecentSessionSummary, SeeAllSessions} from "@/components/tabs/home";
import {BottomSheetModalProvider} from "@gorhom/bottom-sheet";
import ScreenWrapper from "@/components/general/ScreenWrapper";
import {BannerAd, BannerAdSize, TestIds, useForeground} from "react-native-google-mobile-ads";

const bannerAdId = __DEV__ ? TestIds.BANNER : Platform.OS === "ios" ? "ca-app-pub-2701716227191721/1882654810" : "ca-app-pub-2701716227191721/3548415690";

export default function HomeScreen() {
    const colors = useColors();

    const newSessionRef = useRef(null);
    const newRealRoundRef = useRef(null);
    const bannerRef = useRef(null);

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
                        <RecentSessionSummary unfinished={false}></RecentSessionSummary>
                        <SeeAllSessions/>
                        {/* TODO Consider making the modes no longer collapsable and make them one big button so it is easier to press them*/}
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