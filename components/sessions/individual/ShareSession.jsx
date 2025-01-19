import React, {useCallback, useRef} from "react";
import CustomBackdrop from "../../general/popups/CustomBackdrop";
import {BottomSheetModal, BottomSheetView} from "@gorhom/bottom-sheet";
import {Image, Text, View} from "react-native";
import useColors from "../../../hooks/useColors";
import {roundTo} from "../../../utils/roundTo";
import {useAppContext} from "../../../contexts/AppCtx";
import {convertUnits} from "../../../utils/Conversions";
import {SecondaryButton} from "../../general/buttons/SecondaryButton";
import Svg, {Path} from "react-native-svg";
import ViewShot from "react-native-view-shot";

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
                    <Text style={{
                        fontSize: 20,
                        fontWeight: 500,
                        color: colors.text.primary,
                    }}>
                        Share Session
                    </Text>
                    <ViewShot ref={ref} options={{ fileName: "Your-File-Name", format: "jpg", quality: 0.9 }}>
                        <View style={{borderWidth: 1, borderColor: colors.border.default, borderRadius: 12, paddingTop: 8, marginTop: 10}}>
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
                            <Text style={{color: colors.text.primary, fontSize: 18, fontWeight: 500}}>{session.type === "round-simulation" ? "18 Hole Simulation" : session.holes + " Hole Round"}</Text>
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
                                <Text style={{fontSize: 14, textAlign: "left", color: colors.text.secondary}}>1 Putts</Text>
                                <Text style={{
                                    fontSize: 20,
                                    color: colors.text.primary,
                                    fontWeight: "bold",
                                }}>{session.puttCounts[0]}</Text>
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
                                <Text style={{fontSize: 14, textAlign: "left", color: colors.text.secondary}}>2 Putts</Text>
                                <Text style={{
                                    fontSize: 20,
                                    color: colors.text.primary,
                                    fontWeight: "bold",
                                }}>{session.puttCounts[1]}</Text>
                            </View>
                            <View style={{
                                flexDirection: "column",
                                flex: 1,
                                paddingBottom: 12,
                                paddingTop: 6,
                                paddingLeft: 12
                            }}>
                                <Text style={{fontSize: 14, textAlign: "left", color: colors.text.secondary}}>3+ Putts</Text>
                                <Text style={{
                                    fontSize: 20,
                                    color: colors.text.primary,
                                    fontWeight: "bold",
                                }}>{session.puttCounts[2]}</Text>
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
                                <Text style={{fontSize: 14, textAlign: "left", color: colors.text.secondary}}>Avg. Miss</Text>
                                <Text style={{
                                    fontSize: 20,
                                    color: colors.text.primary,
                                    fontWeight: "bold",
                                    textAlign: "left"
                                }}>{convertUnits(session.avgMiss, session.units, userData.preferences.units)}{userData.preferences.units === 0 ? "ft" : "m"}</Text>
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
                                <Text style={{fontSize: 14, textAlign: "left", color: colors.text.secondary}}>Strokes Gained</Text>
                                <Text style={{
                                    fontSize: 20,
                                    color: colors.text.primary,
                                    fontWeight: "bold",
                                    textAlign: "left"
                                }}>{session.strokesGained > 0 ? "+" : ""}{session.strokesGained}</Text>
                            </View>
                            <View style={{
                                flexDirection: "column",
                                flex: 1,
                                paddingBottom: 12,
                                paddingTop: 6,
                                paddingLeft: 12
                            }}>
                                <Text style={{fontSize: 14, textAlign: "left", color: colors.text.secondary}}>Make %</Text>
                                <View style={{flexDirection: "row", alignItems: "center", justifyContent: "flex-start", gap: 8}}>
                                    <Text style={{
                                        fontSize: 20,
                                        color: colors.text.primary,
                                        fontWeight: "bold",
                                    }}>{roundTo(session.madePercent*100, 0)}%</Text>
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
                                <Text style={{fontSize: 14, textAlign: "left", color: colors.text.secondary}}>Left Right Bias</Text>
                                <Text style={{
                                    fontSize: 20,
                                    color: colors.text.primary,
                                    fontWeight: "bold",
                                }}>{session.leftRightBias > 0 ? "+" : ""}{convertUnits(session.leftRightBias, session.units, userData.preferences.units)}{userData.preferences.units === 0 ? "ft" : "m"}</Text>
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
                                <Text style={{fontSize: 14, textAlign: "left", color: colors.text.secondary}}>Short Past Bias</Text>
                                <Text style={{
                                    fontSize: 20,
                                    color: colors.text.primary,
                                    fontWeight: "bold",
                                }}>{session.shortPastBias > 0 ? "+" : ""}{convertUnits(session.shortPastBias, session.units, userData.preferences.units)}{userData.preferences.units === 0 ? "ft" : "m"}</Text>
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
                                <Text style={{fontSize: 14, textAlign: "left", color: colors.text.secondary}}>Total Distance</Text>
                                <Text style={{
                                    fontSize: 20,
                                    color: colors.text.primary,
                                    fontWeight: "bold",
                                    textAlign: "left"
                                }}>{convertUnits(session.totalDistance, session.units, userData.preferences.units)}{userData.preferences.units === 0 ? "ft" : "m"}</Text>
                            </View>
                        </View>
                    </View>
                    </ViewShot>
                    <View style={{width: "100%", justifyContent: "center", alignItems: "center", gap: 24, flexDirection: "row", marginTop: 12}}>
                        <SecondaryButton onPress={() => ref.current.capture().then(uri => {console.log("do something with ", uri);})} style={{borderRadius: 50, aspectRatio: 1, height: 48, paddingBottom: 3}}>
                            <Svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                                 stroke={colors.button.secondary.text} width={28} height={28}>
                                <Path strokeLinecap="round" strokeLinejoin="round"
                                      d="M9 8.25H7.5a2.25 2.25 0 0 0-2.25 2.25v9a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25H15m0-3-3-3m0 0-3 3m3-3V15"/>
                            </Svg>
                        </SecondaryButton>
                        <SecondaryButton style={{borderRadius: 50, aspectRatio: 1, height: 48, paddingBottom: 3}}>
                            <Svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                                 stroke={colors.button.secondary.text} width={28} height={28}>
                                <Path strokeLinecap="round" strokeLinejoin="round"
                                      d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"/>
                            </Svg>
                        </SecondaryButton>
                    </View>
                </View>
            </BottomSheetView>
        </BottomSheetModal>
    )
}