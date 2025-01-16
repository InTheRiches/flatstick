import useColors from "../../../hooks/useColors";
import {useLocalSearchParams, useNavigation} from "expo-router";
import {Text, View} from "react-native";
import React, {useEffect, useState} from "react";
import {roundTo} from "../../../utils/roundTo";
import {SecondaryButton} from "../../../components/general/buttons/SecondaryButton";
import Svg, {Path} from "react-native-svg";
import {useAppContext} from "../../../contexts/AppCtx";
import {LeftRightBias, ShortPastBias} from "../../../components/sessions/individual";
import {MissDistributionDiagram} from "../../../components/simulations/recap";
import Loading from "../../../components/general/popups/Loading";
import {getBestSession} from "../../../utils/sessions/best";
import {convertUnits} from "../../../utils/Conversions";
import {SafeAreaView} from "react-native-safe-area-context";
import {AdEventType, InterstitialAd, TestIds} from "react-native-google-mobile-ads";

export default function IndividualSession({}) {
    const colors = useColors();
    const navigation = useNavigation();
    const {deleteSession, userData} = useAppContext();

    const {jsonSession, recap} = useLocalSearchParams();
    const session = JSON.parse(jsonSession);
    const isRecap = recap === "true";

    const adUnitId = __DEV__ ? TestIds.INTERSTITIAL : TestIds.INTERSTITIAL;

    const interstitial = InterstitialAd.createForAdRequest(adUnitId);

    useEffect(() => {
        const unsubscribeLoaded = interstitial.addAdEventListener(AdEventType.LOADED, () => {
            interstitial.show();
            console.log("Interstitial loaded");
        });

        if (isRecap) {
            // Start loading the interstitial straight away
            interstitial.load();
        }

        // Unsubscribe from events on unmount
        return () => {
            unsubscribeLoaded();
        };
    }, []);

    const [loading, setLoading] = useState(false);
    const [bestSession, setBestSession] = useState({strokesGained: "~"});

    useEffect(() => {
        getBestSession().then((session) => {
            setBestSession(session);
        });
    }, []);

    const formatTimestamp = () => {
        const date = new Date(session.startedAtTimestamp);
        const options = { month: '2-digit', day: '2-digit', hour: 'numeric', minute: '2-digit', hour12: true };
        return date.toLocaleString('en-US', options);
    };

    return loading ? <Loading></Loading> : (
        <SafeAreaView style={{paddingHorizontal: 24, justifyContent: "space-between", flex: 1, backgroundColor: colors.background.primary}}>
            <View>
                <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center"}}>
                    <Text style={{fontSize: 24, fontWeight: 500, color: colors.text.primary, textAlign: "left"}}>18 Hole Simulation</Text>
                    <Text style={{color: colors.text.secondary, fontSize: 18, fontWeight: 400, textAlign: "right"}}>{formatTimestamp()}</Text>
                </View>

                <View style={{flexDirection: "row", gap: 24, marginTop: 20}}>
                    <View style={{alignItems: "center", flex: 0.5}}>
                        <Text style={{color: colors.text.secondary, fontSize: 14, fontWeight: 400, textAlign: "center"}}>Strokes Gained</Text>
                        <Text style={{color: colors.text.primary, fontSize: session.strokesGained < -10 ? 40 : 48, fontWeight: 600, textAlign: "center"}}>{session.strokesGained > 0 ? "+" : ""}{session.strokesGained}</Text>
                        <Text style={{color: colors.text.secondary, fontSize: 14, fontWeight: 400, textAlign: "center"}}>(Best: {bestSession.totalPutts && bestSession.strokesGained > 0 ? "+" : ""}{bestSession.strokesGained})</Text>
                    </View>
                    <View style={{backgroundColor: colors.background.secondary, borderRadius: 12, paddingTop: 8, flex: 1}}>
                        <View style={{
                            paddingHorizontal: 12,
                            borderBottomWidth: 1,
                            borderColor: colors.border.default,
                            paddingBottom: 6,
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center"
                        }}>
                            <Text style={{fontSize: 16, textAlign: "left", color: colors.text.primary, fontWeight: "bold", flex: 1}}>Performance</Text>
                        </View>
                        <View style={{flexDirection: "row"}}>
                            <View style={{
                                flexDirection: "column",
                                flex: 1,
                                borderRightWidth: 1,
                                borderColor: colors.border.default,
                                paddingBottom: 6,
                                paddingTop: 6,
                                paddingLeft: 12,
                            }}>
                                <Text style={{fontSize: 14, textAlign: "left", color: colors.text.secondary}}>1 Putts</Text>
                                <View style={{flexDirection: "row", alignItems: "center", justifyContent: "flex-start", gap: 8}}>
                                    <Text style={{fontSize: 20, color: colors.text.primary, fontWeight: "bold"}}>{session.puttCounts[0]}</Text>
                                    <Text style={{color: colors.text.secondary, fontWeight: 400, fontSize: 14}}>({roundTo((session.puttCounts[0]/session.totalPutts) * 100, 0)}%)</Text>
                                </View>
                            </View>
                            <View style={{flexDirection: "column", flex: 1, paddingBottom: 6, paddingTop: 6, paddingLeft: 12}}>
                                <Text style={{fontSize: 14, textAlign: "left", color: colors.text.secondary}}>2 Putts</Text>
                                <View style={{flexDirection: "row", alignItems: "center", justifyContent: "flex-start", gap: 8}}>
                                    <Text style={{fontSize: 20, color: colors.text.primary, fontWeight: "bold",}}>{session.puttCounts[1]}</Text>
                                    <Text style={{color: colors.text.secondary, fontWeight: 400, fontSize: 14}}>({roundTo((session.puttCounts[1]/session.totalPutts) * 100, 0)}%)</Text>
                                </View>
                            </View>
                        </View>
                        <View style={{flexDirection: "row", borderTopWidth: 1, borderTopColor: colors.border.default}}>
                            <View style={{
                                flexDirection: "column",
                                flex: 1,
                                borderRightWidth: 1,
                                borderColor: colors.border.default,
                                paddingBottom: 6,
                                paddingTop: 6,
                                paddingLeft: 12,
                            }}>
                                <Text style={{fontSize: 14, textAlign: "left", color: colors.text.secondary}}>3+ Putts</Text>
                                <View style={{flexDirection: "row", alignItems: "center", justifyContent: "flex-start", gap: 8}}>
                                    <Text style={{fontSize: 20, color: colors.text.primary, fontWeight: "bold"}}>{session.puttCounts[2]}</Text>
                                    <Text style={{color: colors.text.secondary, fontWeight: 400, fontSize: 14}}>({roundTo((session.puttCounts[2]/session.totalPutts) * 100, 0)}%)</Text>
                                </View>
                            </View>
                            <View style={{flexDirection: "column", flex: 1, paddingBottom: 6, paddingTop: 6, paddingLeft: 12}}>
                                <Text style={{fontSize: 14, textAlign: "left", color: colors.text.secondary}}>Avg. Miss</Text>
                                <Text style={{fontSize: 20, color: colors.text.primary, fontWeight: "bold"}}>{convertUnits(session.avgMiss, session.units, userData.preferences.units)}{userData.preferences.units === 0 ? "ft" : "m"}</Text>
                            </View>
                        </View>
                    </View>
                </View>
                <Text style={{fontSize: 18, fontWeight: 600, color: colors.text.primary, marginTop: 20, marginBottom: 8}}>1st Putt Distribution</Text>
                <MissDistributionDiagram missData={session.missData} holes={session.holes} alone={true} units={userData.preferences.units}></MissDistributionDiagram>
                <LeftRightBias session={session}></LeftRightBias>
                <ShortPastBias session={session}></ShortPastBias>
            </View>
            <View style={{width: "100%", paddingBottom: 24, paddingHorizontal: 48, flexDirection: "row", alignItems: "center", gap: 12}}>
                <SecondaryButton onPress={() => {
                    if (isRecap) {
                        navigation.navigate("(tabs)");
                    } else navigation.goBack();
                }}
                               title={isRecap ? "Continue" : "Back"}
                               style={{paddingVertical: 10, borderRadius: 10, flex: 1}}></SecondaryButton>
                {!isRecap && <SecondaryButton onPress={() => {
                    setLoading(true);
                    deleteSession(session.id).then(() => {
                        navigation.goBack();
                    });
                }} style={{position: "absolute", right: 0, top: 0, aspectRatio: 1, height: 42, borderRadius: 50}}>
                    <Svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                         stroke={colors.button.secondary.text} width={24} height={24}>
                        <Path strokeLinecap="round" strokeLinejoin="round"
                              d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"/>
                    </Svg>
                </SecondaryButton>}
            </View>
        </SafeAreaView>
    )
}