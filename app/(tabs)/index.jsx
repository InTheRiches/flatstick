import React, {useRef} from 'react';
import {useRouter} from "expo-router";
import Svg, {Path} from "react-native-svg";
import useColors from "@/hooks/useColors";
import {useAppContext} from "@/contexts/AppCtx";
import {SecondaryButton} from "@/components/general/buttons/SecondaryButton";
import {NewRealRound, NewRound} from "@/components/tabs/home/popups";
import {ScrollView, Text, View} from "react-native";
import {Header, PracticeModes, RecentSessionSummary} from "@/components/tabs/home";
import PressureInfo from "@/components/general/popups/info/PressureInfo";
import {BottomSheetModalProvider} from "@gorhom/bottom-sheet";

export default function HomeScreen() {
    const colors = useColors();

    const router = useRouter();
    const {puttSessions} = useAppContext();

    const newSessionRef = useRef(null);
    const newRealRoundRef = useRef(null);
    const pressureInfoRef = useRef(null);

    return (
        <BottomSheetModalProvider>
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
                    <Header></Header>
                    <RecentSessionSummary unfinished={false}></RecentSessionSummary>
                    {puttSessions.length > 0 && <SecondaryButton onPress={() => router.push({pathname: "sessions"})} style={{
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
                        <View style={{borderRadius: 30, padding: 6, backgroundColor: colors.button.secondary.text}}>
                            <Svg width={20} height={20} xmlns="http://www.w3.org/2000/svg" fill="none"
                                 viewBox="0 0 24 24" strokeWidth={1.5}
                                 stroke={colors.button.secondary.background} className="size-6">
                                <Path strokeLinecap="round" strokeLinejoin="round"
                                      d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25"/>
                            </Svg>
                        </View>
                    </SecondaryButton>}
                    <PracticeModes newRealRoundRef={newRealRoundRef} newSessionRef={newSessionRef} pressureInfoRef={pressureInfoRef}></PracticeModes>
                </ScrollView>
                <NewRound newSessionRef={newSessionRef}></NewRound>
                <NewRealRound newRealRoundRef={newRealRoundRef}></NewRealRound>
                <PressureInfo pressureInfoRef={pressureInfoRef}></PressureInfo>
            </View>
        </BottomSheetModalProvider>
    );
}