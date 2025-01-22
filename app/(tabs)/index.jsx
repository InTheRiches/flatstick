import React, {useRef} from 'react';
import useColors from "@/hooks/useColors";
import {NewRealRound, NewRound} from "@/components/tabs/home/popups";
import {ScrollView, View} from "react-native";
import {Header, PracticeModes, RecentSessionSummary, SeeAllSessions} from "@/components/tabs/home";
import {BottomSheetModalProvider} from "@gorhom/bottom-sheet";
import ScreenWrapper from "@/components/general/ScreenWrapper";
import {useSafeAreaInsets} from "react-native-safe-area-context";

export default function HomeScreen() {
    const colors = useColors();
    const insets = useSafeAreaInsets();

    const newSessionRef = useRef(null);
    const newRealRoundRef = useRef(null);

    return (
        <BottomSheetModalProvider>
            <ScreenWrapper>
                <View style={{
                    height: "100%",
                    flex: 1,
                    overflow: "hidden",
                    flexDirection: "column",
                    alignContent: "center",
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border.default,
                    paddingHorizontal: 20,
                }}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <Header></Header>
                        <RecentSessionSummary unfinished={false}></RecentSessionSummary>
                        <SeeAllSessions/>
                        <PracticeModes newRealRoundRef={newRealRoundRef} newSessionRef={newSessionRef}></PracticeModes>
                    </ScrollView>
                </View>
            </ScreenWrapper>
            <NewRound newSessionRef={newSessionRef}></NewRound>
            <NewRealRound newRealRoundRef={newRealRoundRef}></NewRealRound>
        </BottomSheetModalProvider>
    );
}