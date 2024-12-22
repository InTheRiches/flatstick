import useColors from "../../../hooks/useColors";
import {useLocalSearchParams, useNavigation} from "expo-router";
import {Image, Text, View} from "react-native";
import React, {useState} from "react";
import {roundTo} from "../../../utils/roundTo";
import {SecondaryButton} from "../../../components/buttons/SecondaryButton";
import Svg, {Path} from "react-native-svg";
import {useAppContext} from "../../../contexts/AppCtx";

export default function IndividualSession({}) {
    // use local params to get data
    const colors = useColors();
    const {jsonSession} = useLocalSearchParams();
    const session = JSON.parse(jsonSession);
    const navigation = useNavigation();
    const [horizontalBiasWidth, setHorizontalBiasWidth] = useState(1);
    const [verticalBiasWidth, setVerticalBiasWidth] = useState(1);
    const {deleteSession} = useAppContext();

    const gridData = Array.from({length: 15}, (_, index) => index + 1);

    const onHorizLayout = (event) => {
        setHorizontalBiasWidth(event.nativeEvent.layout.width-25);
    };

    const onVertiLayout = (event) => {
        setVerticalBiasWidth(event.nativeEvent.layout.width-25);
    };

    const ShortPastBias = () => {
        let left = session.shortPastBias / 2 * (verticalBiasWidth/2);
        left = left + (verticalBiasWidth/2);

        if (Math.abs(session.shortPastBias) < 0.2) {
            left = (verticalBiasWidth/2) + 2.5;
        }
        return (
            <>
                <Text style={{fontSize: 18, fontWeight: 600, color: colors.text.primary, marginTop: 20, marginBottom: 8}}>Short / Past Bias</Text>
                <View onLayout={onVertiLayout} style={{alignItems: "center", width: "100%", flexDirection: "row"}}>
                    <View style={{width: 2, height: 32, backgroundColor: colors.text.primary}}></View>
                    <View style={{flex: 1, height: 2, backgroundColor: colors.text.primary}}></View>
                    <View style={{width: 24, height: 24, borderRadius: 50, borderWidth: 1, borderColor: colors.text.primary, backgroundColor: "white"}}></View>
                    <View style={{flex: 1, height: 2, backgroundColor: colors.text.primary}}></View>
                    <View style={{width: 2, height: 32, backgroundColor: colors.text.primary}}></View>
                    <View style={{position: "absolute", left: left, width: 20, height: 20, borderRadius: 50, borderWidth: 1, borderColor: colors.text.primary, backgroundColor: colors.checkmark.background}}></View>
                </View>
                <View style={{width: "100%", justifyContent: "space-between", flexDirection: "row"}}>
                    <Text style={{color: colors.text.secondary, opacity: left > 40 ? 1 : 0}}>-2ft</Text>
                    <Text style={{color: colors.text.secondary, opacity: left < ((verticalBiasWidth/2) - 30) || left > ((verticalBiasWidth/2) + 30) ? 1 : 0}}>0ft</Text>
                    <Text style={{color: colors.text.secondary, opacity: left < (verticalBiasWidth-40) ? 1 : 0}}>+2ft</Text>
                    <Text style={{position: "absolute", left: left-10, color: colors.text.primary}}>{session.shortPastBias > 0 ? "+" : ""}{session.shortPastBias}ft</Text>
                </View>
                <View style={{width: "100%", justifyContent: "space-between", flexDirection: "row"}}>
                    <Text style={{color: colors.text.secondary, opacity: left > 40 ? 1 : 0}}>Short</Text>
                    <Text style={{color: colors.text.secondary, opacity: left < (verticalBiasWidth-40) ? 1 : 0}}>Past</Text>
                </View>
            </>
        )
    }

    const LeftRightBias = () => {
        let left = session.leftRightBias / 2 * (horizontalBiasWidth/2);
        left = left + (horizontalBiasWidth/2);

        if (Math.abs(session.leftRightBias) < 0.2) {
            left = (horizontalBiasWidth/2) + 2.5;
        }
        return (
            <>
                <Text style={{fontSize: 18, fontWeight: 600, color: colors.text.primary, marginTop: 20, marginBottom: 8}}>Left to Right Bias</Text>
                <View onLayout={onHorizLayout} style={{alignItems: "center", width: "100%", flexDirection: "row"}}>
                    <View style={{width: 2, height: 32, backgroundColor: colors.text.primary}}></View>
                    <View style={{flex: 1, height: 2, backgroundColor: colors.text.primary}}></View>
                    <View style={{width: 24, height: 24, borderRadius: 50, borderWidth: 1, borderColor: colors.text.primary, backgroundColor: "white"}}></View>
                    <View style={{flex: 1, height: 2, backgroundColor: colors.text.primary}}></View>
                    <View style={{width: 2, height: 32, backgroundColor: colors.text.primary}}></View>
                    <View style={{position: "absolute", left: left, width: 20, height: 20, borderRadius: 50, borderWidth: 1, borderColor: colors.text.primary, backgroundColor: colors.checkmark.background}}></View>
                </View>
                <View style={{width: "100%", justifyContent: "space-between", flexDirection: "row"}}>
                    <Text style={{color: colors.text.secondary, opacity: left > 40 ? 1 : 0}}>-2ft</Text>
                    <Text style={{color: colors.text.secondary, opacity: left < ((horizontalBiasWidth/2) - 30) || left > ((horizontalBiasWidth/2) + 30) ? 1 : 0}}>0ft</Text>
                    <Text style={{color: colors.text.secondary, opacity: left < (horizontalBiasWidth-40) ? 1 : 0}}>+2ft</Text>
                    <Text style={{position: "absolute", left: left-10, color: colors.text.primary}}>{session.leftRightBias > 0 ? "+" : ""}{session.leftRightBias}ft</Text>
                </View>
                <View style={{width: "100%", justifyContent: "space-between", flexDirection: "row"}}>
                    <Text style={{color: colors.text.secondary, opacity: left > 40 ? 1 : 0}}>Left</Text>
                    <Text style={{color: colors.text.secondary, opacity: left < (horizontalBiasWidth-40) ? 1 : 0}}>Right</Text>
                </View>
            </>
        )
    }

    return (
        <View style={{paddingHorizontal: 24, justifyContent: "space-between", flex: 1, backgroundColor: colors.background.primary}}>
            <View>
                <Text style={{
                    fontSize: 24,
                    fontWeight: 500,
                    color: colors.text.primary
                }}>18 Hole Simulation</Text>
                <View style={{flexDirection: "row", gap: 24, marginTop: 20}}>
                    <View style={{alignItems: "center", flex: 0.5}}>
                        <Text style={{color: colors.text.secondary, fontSize: 14, fontWeight: 400, textAlign: "center"}}>Strokes Gained</Text>
                        <Text style={{color: colors.text.primary, fontSize: 48, fontWeight: 600, textAlign: "center"}}>{session.strokesGained > 0 ? "+" : ""}{session.strokesGained}</Text>
                        <Text style={{color: colors.text.secondary, fontSize: 14, fontWeight: 400, textAlign: "center"}}>(Best: +8.4)</Text>
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
                            <Text style={{
                                fontSize: 16,
                                textAlign: "left",
                                color: colors.text.primary,
                                fontWeight: "bold",
                                flex: 1
                            }}>Performance</Text>
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
                                    <Text style={{
                                        fontSize: 20,
                                        color: colors.text.primary,
                                        fontWeight: "bold",
                                    }}>{session.puttCounts[0]}</Text>
                                    <Text style={{color: colors.text.secondary, fontWeight: 400, fontSize: 14}}>({roundTo((session.puttCounts[0]/session.totalPutts) * 100, 0)}%)</Text>
                                </View>
                            </View>
                            <View style={{
                                flexDirection: "column",
                                flex: 1,
                                paddingBottom: 6,
                                paddingTop: 6,
                                paddingLeft: 12
                            }}>
                                <Text style={{fontSize: 14, textAlign: "left", color: colors.text.secondary}}>2 Putts</Text>
                                <View style={{flexDirection: "row", alignItems: "center", justifyContent: "flex-start", gap: 8}}>
                                    <Text style={{
                                        fontSize: 20,
                                        color: colors.text.primary,
                                        fontWeight: "bold",
                                    }}>{session.puttCounts[1]}</Text>
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
                                    <Text style={{
                                        fontSize: 20,
                                        color: colors.text.primary,
                                        fontWeight: "bold",
                                    }}>{session.puttCounts[2]}</Text>
                                    <Text style={{color: colors.text.secondary, fontWeight: 400, fontSize: 14}}>({roundTo((session.puttCounts[2]/session.totalPutts) * 100, 0)}%)</Text>
                                </View>
                            </View>
                            <View style={{
                                flexDirection: "column",
                                flex: 1,
                                paddingBottom: 6,
                                paddingTop: 6,
                                paddingLeft: 12
                            }}>
                                <Text style={{fontSize: 14, textAlign: "left", color: colors.text.secondary}}>Avg. Miss</Text>
                                <Text style={{
                                    fontSize: 20,
                                    color: colors.text.primary,
                                    fontWeight: "bold",
                                }}>{session.avgMiss}ft</Text>
                            </View>
                        </View>
                    </View>
                </View>
                <Text style={{fontSize: 18, fontWeight: 600, color: colors.text.primary, marginTop: 20, marginBottom: 8}}>1st Putt Distribution</Text>
                <View style={{
                    backgroundColor: colors.background.secondary,
                    flexDirection: "column",
                    borderRadius: 16,
                    elevation: 5
                }}>
                    <View style={{width: "100%", flexDirection: "row", justifyContent: "center", alignContent: "center"}}>
                        <Image source={require("@/assets/images/recapBackground.png")} style={{
                            width: "100%",
                            height: "auto",
                            aspectRatio: 4096 / 1835,
                            position: "absolute",
                            top: 0,
                            left: 0
                        }}></Image>

                        <View style={{
                            width: "75%",
                            height: "auto",
                            aspectRatio: 3072 / 1835,
                            flexDirection: 'row',
                            flexWrap: 'wrap',
                            justifyContent: 'center',
                            alignItems: 'center',
                            columnGap: 9,
                            rowGap: 4,
                            paddingTop: 12
                        }}>
                            {gridData.map((item, index) => {
                                let text = "";

                                if (index === 2) {
                                    text = Math.floor((session.missData.long / session.holes) * 100) + "%";
                                }
                                if (index === 5) {
                                    text = Math.floor((session.missData.farLeft / session.holes) * 100) + "%";
                                }
                                if (index === 6) {
                                    text = Math.floor((session.missData.left / session.holes) * 100) + "%";
                                }
                                if (index === 7) {
                                    text = Math.floor((session.missData.center / session.holes) * 100) + "%";
                                }
                                if (index === 8) {
                                    text = Math.floor((session.missData.right / session.holes) * 100) + "%";
                                }
                                if (index === 9) {
                                    text = Math.floor((session.missData.farRight / session.holes) * 100) + "%";
                                }
                                if (index === 12) {
                                    text = Math.floor((session.missData.short / session.holes) * 100) + "%";
                                }

                                return (
                                    <View key={index} style={{
                                        paddingTop: index > 4 && index !== 7 ? index === 12 ? 14 : 6 : 4,
                                        width: '16%',
                                        aspectRatio: 1,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        borderRadius: 5
                                    }}>
                                        <Text style={{
                                            fontSize: 16,
                                            fontWeight: "bold",
                                            color: index === 7 ? "black" : [5, 9].includes(index) ? "white" : "#0e450b"
                                        }}>{text}</Text>
                                    </View>
                                )
                            })}
                        </View>
                    </View>
                </View>
                <LeftRightBias></LeftRightBias>
                <ShortPastBias></ShortPastBias>
            </View>
            <View style={{width: "100%", paddingBottom: 24, paddingHorizontal: 48, flexDirection: "row", alignItems: "center", gap: 12}}>
                <SecondaryButton onPress={() => navigation.goBack()}
                               title={"Back"}
                               style={{paddingVertical: 10, borderRadius: 10, flex: 1}}></SecondaryButton>
                <SecondaryButton onPress={() => {
                    // todo make this trigger a loading screen
                    deleteSession(session.id).then(() => {
                        navigation.goBack();
                    });
                }} style={{position: "absolute", right: 0, top: 0, aspectRatio: 1, height: 42, borderRadius: 50}}>
                    <Svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                         stroke={colors.button.secondary.text} width={24} height={24}>
                        <Path strokeLinecap="round" strokeLinejoin="round"
                              d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"/>
                    </Svg>
                </SecondaryButton>
            </View>
        </View>
    )
}