import React, {useCallback} from "react";
import CustomBackdrop from "../../general/popups/CustomBackdrop";
import {BottomSheetModal, BottomSheetView} from "@gorhom/bottom-sheet";
import {Image, Text, View} from "react-native";
import useColors from "../../../hooks/useColors";
import {roundTo} from "../../../utils/roundTo";
import {useAppContext} from "../../../contexts/AppCtx";
import {convertUnits} from "../../../utils/Conversions";

export default function ShareSession({shareSessionRef, session}) {
    const colors = useColors();
    const {userData} = useAppContext();

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
                </View>
            </BottomSheetView>
        </BottomSheetModal>
    )
}