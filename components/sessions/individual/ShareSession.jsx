import React, {useCallback, useRef} from "react";
import CustomBackdrop from "../../general/popups/CustomBackdrop";
import {BottomSheetModal, BottomSheetView} from "@gorhom/bottom-sheet";
import {Image, View} from "react-native";
import useColors from "../../../hooks/useColors";
import {roundTo} from "../../../utils/roundTo";
import {useAppContext} from "../../../contexts/AppContext";
import {convertUnits} from "../../../utils/Conversions";
import {SecondaryButton} from "../../general/buttons/SecondaryButton";
import Svg, {Path} from "react-native-svg";
import ViewShot from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import FontText from "../../general/FontText";

export default function ShareSession({shareSessionRef, session}) {
    const colors = useColors();
    const {userData} = useAppContext();
    const ref = useRef();

    const StatBox = ({ label, right, children }) => {
        const colors = useColors();
        return (
            <View
                style={{
                    flexDirection: "column",
                    flex: 1,
                    borderRightWidth: right ? 0 : 1,
                    borderColor: colors.border.default,
                    paddingBottom: 12,
                    paddingTop: 6,
                    paddingLeft: 12,
                }}
            >
                <FontText style={{ fontSize: 12, textAlign: "left", color: colors.text.secondary, opacity: 0.8, fontWeight: 700 }}>{label}</FontText>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>{children}</View>
            </View>
        );
    };

    const BreakBiasIcon = ({ value }) => {
        if (value === 0) return <></>;

        //if (value === 0) return <View style={{width: 24, height: 24, borderRadius: 50, backgroundColor: colors.button.secondary.background }}></View>
        const direction = value > 0 ? "right" : "left";
        const d = direction === "right" ? "M4 12h12m-6-6 6 6-6 6" : "M20 12H8m6-6-6 6 6 6";
        return (
            <View style={{backgroundColor: colors.button.secondary.background, borderRadius: 50}}>
                <Svg width={24} height={24} stroke={colors.button.secondary.text} viewBox="0 0 24 24" fill="none" style={{left: direction === "left" ? -1.5 : 2}}>
                    <Path d={d} strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} />
                </Svg>
            </View>
        );
    };

    const SpeedBiasIcon = ({ value }) => {
        if (value === 0) return <></>;
        const direction = value > 0 ? "up" : "down";
        const d = direction === "up" ? "M4 12h12m-6-6 6 6-6 6" : "M20 12H8m6-6-6 6 6 6";
        return (
            <View style={{transform: [{rotate: "-90deg"}], backgroundColor: colors.button.secondary.background, borderRadius: 50, width: 24, height: 24, alignItems: "center", justifyContent: "center"}}>
                <Svg width={24} height={24} stroke={colors.button.secondary.text} viewBox="0 0 24 24" fill="none" style={{left: direction === "up" ? 2 : -1.5}}>
                    <Path d={d} strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} />
                </Svg>
            </View>
        );
    };

    const myBackdrop = useCallback(
        ({ animatedIndex, style }) => {
            return (
                <CustomBackdrop
                    reference={shareSessionRef}
                    animatedIndex={animatedIndex}
                    style={style}
                />
            );
        }, []
    );

    const onShare = () => {
        ref.current.capture()
            .then(uri => {
                Sharing.shareAsync(uri).catch(console.error);
            }).catch(console.error);
    }

    return (
        <BottomSheetModal
            ref={shareSessionRef}
            backdropComponent={myBackdrop}
            android_keyboardInputMode={"adjustPan"}
            keyboardBlurBehavior={"restore"}
            backgroundStyle={{backgroundColor: colors.background.secondary}}>
            <BottomSheetView style={{
                paddingBottom: 12,
                backgroundColor: colors.background.secondary,
            }}>
                <View style={{marginHorizontal: 24, marginBottom: 8}}>
                    <FontText style={{
                        fontSize: 20,
                        fontWeight: 500,
                        color: colors.text.primary,
                    }}>
                        Share Session
                    </FontText>
                    <ViewShot style={{borderWidth: 1, borderColor: colors.border.default, borderRadius: 12, paddingTop: 8, marginTop: 10, backgroundColor: colors.background.secondary}} ref={ref} options={{ fileName: "SessionShare", format: "jpg", quality: 0.9 }}>
                        <View style={{
                            paddingLeft: 6,
                            paddingRight: 12,
                            borderBottomWidth: 1,
                            borderColor: colors.border.default,
                            paddingBottom: 6,
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center"
                        }}>
                            <Image
                                source={require("../../../assets/branding/FlatstickWithMallet.png")}
                                style={{width: 100, height: 18}}/>
                            <FontText style={{fontSize: 14, color: colors.text.primary, fontWeight: 800, flex: 1, textAlign: "right"}}>{session.type === "round-simulation" ? "18 HOLE SIMULATION" : session.holes + " HOLE ROUND"}</FontText>
                        </View>
                        <View style={{flexDirection: "row"}}>
                            <StatBox label={"1 PUTTS"}>
                                <FontText style={{
                                    fontSize: 20,
                                    color: colors.text.primary,
                                    fontWeight: "bold",
                                }}>{session.puttCounts[0]}</FontText>
                            </StatBox>
                            <StatBox label={"3+ PUTTS"}>
                                <FontText style={{
                                    fontSize: 20,
                                    color: colors.text.primary,
                                    fontWeight: "bold",
                                }}>{session.puttCounts[2]}</FontText>
                            </StatBox>
                            <StatBox label={"MAKE %"} right={true}>
                                <View style={{flexDirection: "row", alignItems: "center", justifyContent: "flex-start", gap: 8}}>
                                    <FontText style={{
                                        fontSize: 20,
                                        color: colors.text.primary,
                                        fontWeight: "bold",
                                    }}>{roundTo(session.madePercent*100, 0)}%</FontText>
                                </View>
                            </StatBox>
                        </View>
                        <View style={{flexDirection: "row", borderTopWidth: 1, borderTopColor: colors.border.default}}>
                            <StatBox label={"SG"}>
                                <FontText style={{
                                    fontSize: 20,
                                    color: colors.text.primary,
                                    fontWeight: "bold",
                                    textAlign: "left"
                                }}>{session.strokesGained > 0 ? "+" : ""}{session.strokesGained}</FontText>
                            </StatBox>
                            <StatBox label={"% HIGH"}>
                                <FontText style={{
                                    fontSize: 20,
                                    color: colors.text.primary,
                                    fontWeight: "bold",
                                    textAlign: "left"
                                }}>{session.percentHigh !== undefined ? roundTo(session.percentHigh*100, 0) + "%" : "N/A"}</FontText>
                            </StatBox>
                            <StatBox label={"% LONG"} right={true}>
                                <FontText style={{
                                    fontSize: 20,
                                    color: colors.text.primary,
                                    fontWeight: "bold",
                                    textAlign: "left"
                                }}>{session.percentShort !== undefined ? roundTo((1-session.percentShort)*100, 0) + "%" : "N/A"}</FontText>
                            </StatBox>
                        </View>
                        <View style={{flexDirection: "row", borderTopWidth: 1, borderTopColor: colors.border.default}}>
                            <StatBox label={"AVG MISS"}>
                                <FontText style={{
                                    fontSize: 20,
                                    color: colors.text.primary,
                                    fontWeight: "bold",
                                    textAlign: "left"
                                }}>{convertUnits(session.avgMiss, session.units, userData.preferences.units)}{userData.preferences.units === 0 ? "ft" : "m"}</FontText>
                            </StatBox>
                            <StatBox label={"BREAK BIAS"}>
                                <FontText style={{
                                    fontSize: 20,
                                    color: colors.text.primary,
                                    fontWeight: "bold",
                                    paddingRight: 5
                                }}>{session.leftRightBias > 0 ? "+" : ""}{convertUnits(session.leftRightBias, session.units, userData.preferences.units)}{userData.preferences.units === 0 ? "ft" : "m"}</FontText>
                                <BreakBiasIcon value={2.3} />
                            </StatBox>
                            <StatBox label={"SPEED BIAS"} right={true}>
                                <FontText style={{
                                    fontSize: 20,
                                    color: colors.text.primary,
                                    fontWeight: "bold",
                                    paddingRight: 5
                                }}>{session.shortPastBias > 0 ? "+" : ""}{convertUnits(session.shortPastBias, session.units, userData.preferences.units)}{userData.preferences.units === 0 ? "ft" : "m"}</FontText>
                                <SpeedBiasIcon value={session.shortPastBias} />
                            </StatBox>
                        </View>
                    </ViewShot>
                    <View style={{width: "100%", justifyContent: "center", alignItems: "center", gap: 24, flexDirection: "row", marginTop: 12}}>
                        <SecondaryButton onPress={onShare} style={{borderRadius: 50, aspectRatio: 1, height: 48, paddingBottom: 3}}>
                            <Svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                                 stroke={colors.button.secondary.text} width={28} height={28}>
                                <Path strokeLinecap="round" strokeLinejoin="round"
                                      d="M9 8.25H7.5a2.25 2.25 0 0 0-2.25 2.25v9a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25H15m0-3-3-3m0 0-3 3m3-3V15"/>
                            </Svg>
                        </SecondaryButton>
                    </View>
                </View>
            </BottomSheetView>
        </BottomSheetModal>
    )
}