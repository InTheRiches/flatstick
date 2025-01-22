import React, {useCallback, useRef} from "react";
import CustomBackdrop from "../../general/popups/CustomBackdrop";
import {BottomSheetModal, BottomSheetView} from "@gorhom/bottom-sheet";
import {Image, View} from "react-native";
import useColors from "../../../hooks/useColors";
import {roundTo} from "../../../utils/roundTo";
import {useAppContext} from "../../../contexts/AppCtx";
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
                            <FontText style={{color: colors.text.primary, fontSize: 18, fontWeight: 500}}>{session.type === "round-simulation" ? "18 Hole Simulation" : session.holes + " Hole Round"}</FontText>
                        </View>
                        <View style={{flexDirection: "row"}}>
                            <View style={{
                                flexDirection: "column",
                                flex: 1,
                                borderRightWidth: 1,
                                borderColor: colors.border.default,
                                paddingBottom: 12,
                                paddingTop: 6,
                                paddingLeft: 12,
                            }}>
                                <FontText style={{fontSize: 14, textAlign: "left", color: colors.text.secondary}}>1 Putts</FontText>
                                <FontText style={{
                                    fontSize: 20,
                                    color: colors.text.primary,
                                    fontWeight: "bold",
                                }}>{session.puttCounts[0]}</FontText>
                            </View>
                            <View style={{
                                flexDirection: "column",
                                flex: 1,
                                borderRightWidth: 1,
                                borderColor: colors.border.default,
                                paddingBottom: 12,
                                paddingTop: 6,
                                paddingLeft: 12
                            }}>
                                <FontText style={{fontSize: 14, textAlign: "left", color: colors.text.secondary}}>2 Putts</FontText>
                                <FontText style={{
                                    fontSize: 20,
                                    color: colors.text.primary,
                                    fontWeight: "bold",
                                }}>{session.puttCounts[1]}</FontText>
                            </View>
                            <View style={{
                                flexDirection: "column",
                                flex: 1,
                                paddingBottom: 12,
                                paddingTop: 6,
                                paddingLeft: 12
                            }}>
                                <FontText style={{fontSize: 14, textAlign: "left", color: colors.text.secondary}}>3+ Putts</FontText>
                                <FontText style={{
                                    fontSize: 20,
                                    color: colors.text.primary,
                                    fontWeight: "bold",
                                }}>{session.puttCounts[2]}</FontText>
                            </View>
                        </View>
                        <View style={{flexDirection: "row", borderTopWidth: 1, borderTopColor: colors.border.default}}>
                            <View style={{
                                flexDirection: "column",
                                flex: 1,
                                borderRightWidth: 1,
                                borderColor: colors.border.default,
                                paddingBottom: 12,
                                paddingTop: 6,
                                paddingLeft: 12,
                            }}>
                                <FontText style={{fontSize: 14, textAlign: "left", color: colors.text.secondary}}>Avg. Miss</FontText>
                                <FontText style={{
                                    fontSize: 20,
                                    color: colors.text.primary,
                                    fontWeight: "bold",
                                    textAlign: "left"
                                }}>{convertUnits(session.avgMiss, session.units, userData.preferences.units)}{userData.preferences.units === 0 ? "ft" : "m"}</FontText>
                            </View>
                            <View style={{
                                flexDirection: "column",
                                flex: 1,
                                borderRightWidth: 1,
                                borderColor: colors.border.default,
                                paddingBottom: 12,
                                paddingTop: 6,
                                paddingLeft: 12
                            }}>
                                <FontText style={{fontSize: 14, textAlign: "left", color: colors.text.secondary}}>Strokes Gained</FontText>
                                <FontText style={{
                                    fontSize: 20,
                                    color: colors.text.primary,
                                    fontWeight: "bold",
                                    textAlign: "left"
                                }}>{session.strokesGained > 0 ? "+" : ""}{session.strokesGained}</FontText>
                            </View>
                            <View style={{
                                flexDirection: "column",
                                flex: 1,
                                paddingBottom: 12,
                                paddingTop: 6,
                                paddingLeft: 12
                            }}>
                                <FontText style={{fontSize: 14, textAlign: "left", color: colors.text.secondary}}>Make %</FontText>
                                <View style={{flexDirection: "row", alignItems: "center", justifyContent: "flex-start", gap: 8}}>
                                    <FontText style={{
                                        fontSize: 20,
                                        color: colors.text.primary,
                                        fontWeight: "bold",
                                    }}>{roundTo(session.madePercent*100, 0)}%</FontText>
                                </View>
                            </View>
                        </View>
                        <View style={{flexDirection: "row", borderTopWidth: 1, borderTopColor: colors.border.default}}>
                            <View style={{
                                flexDirection: "column",
                                flex: 1,
                                borderRightWidth: 1,
                                borderColor: colors.border.default,
                                paddingBottom: 12,
                                paddingTop: 6,
                                paddingLeft: 12,
                            }}>
                                <FontText style={{fontSize: 14, textAlign: "left", color: colors.text.secondary}}>Left Right Bias</FontText>
                                <FontText style={{
                                    fontSize: 20,
                                    color: colors.text.primary,
                                    fontWeight: "bold",
                                }}>{session.leftRightBias > 0 ? "+" : ""}{convertUnits(session.leftRightBias, session.units, userData.preferences.units)}{userData.preferences.units === 0 ? "ft" : "m"}</FontText>
                            </View>
                            <View style={{
                                flexDirection: "column",
                                flex: 1,
                                borderRightWidth: 1,
                                borderColor: colors.border.default,
                                paddingBottom: 12,
                                paddingTop: 6,
                                paddingLeft: 12
                            }}>
                                <FontText style={{fontSize: 14, textAlign: "left", color: colors.text.secondary}}>Short Past Bias</FontText>
                                <FontText style={{
                                    fontSize: 20,
                                    color: colors.text.primary,
                                    fontWeight: "bold",
                                }}>{session.shortPastBias > 0 ? "+" : ""}{convertUnits(session.shortPastBias, session.units, userData.preferences.units)}{userData.preferences.units === 0 ? "ft" : "m"}</FontText>
                            </View>
                            <View style={{
                                flexDirection: "column",
                                flex: 1,
                                paddingBottom: 12,
                                paddingTop: 6,
                                paddingLeft: 12
                            }}>
                                <FontText style={{fontSize: 14, textAlign: "left", color: colors.text.secondary}}>Total Distance</FontText>
                                <FontText style={{
                                    fontSize: 20,
                                    color: colors.text.primary,
                                    fontWeight: "bold",
                                    textAlign: "left"
                                }}>{convertUnits(session.totalDistance, session.units, userData.preferences.units)}{userData.preferences.units === 0 ? "ft" : "m"}</FontText>
                            </View>
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