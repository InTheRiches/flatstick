import {useLocalSearchParams, useNavigation} from "expo-router";
import useColors from "../../../hooks/useColors";
import ScreenWrapper from "../../../components/general/ScreenWrapper";
import {Pressable, View} from "react-native";
import FontText from "../../../components/general/FontText";
import ElapsedTimeClock from "../../../components/simulations/ElapsedTimeClock";
import Svg, {Line, Path} from "react-native-svg";
import React, {useRef, useState} from "react";
import {ConfirmExit} from "../../../components/simulations/popups";
import {PrimaryButton} from "../../../components/general/buttons/PrimaryButton";
import DangerButton from "../../../components/general/buttons/DangerButton";
import {useAppContext} from "../../../contexts/AppCtx";

export default function FullRound() {
    const colors = useColors();
    const navigation = useNavigation();
    const {stringHoles, stringTee, stringFront, stringCourse} = useLocalSearchParams();
    const {userData} = useAppContext();
    const tee = JSON.parse(stringTee);
    // parse stringHoles into a int
    const holes = parseInt(stringHoles);

    const [hole, setHole] = useState(1);
    const [startTime, setStartTime] = useState(new Date().getTime());
    const [holeStartTime, setHoleStartTime] = useState(new Date().getTime());
    const confirmExitRef = useRef(null);

    const [score, setScore] = useState(tee.holes[hole-1].par);
    const [strokes, setStrokes] = useState(0);
    const [parStrokes, setParStrokes] = useState(2);
    const [putts, setPutts] = useState(2);

    const submit = () => {

    };

    const fullReset = () => {
        navigation.goBack();
    };

    return (
        <>
            <ScreenWrapper style={{
                width: "100%",
                flex: 1,
                paddingHorizontal: 20,
                flexDirection: "column",
                marginBottom: 18,
            }}>
                <View style={{flexDirection: "row", justifyContent: "space-between"}}>
                    <View style={{flexDirection: "row", marginBottom: 6}}>
                        <FontText style={{fontSize: 32, color: colors.text.primary, fontWeight: 700}} type="title">{hole}</FontText>
                        <FontText style={{fontSize: 16, fontWeight: 700, marginTop: 3}}>{hole === 1 ? "ST" : hole === 2 ? "ND" : "TH"}</FontText>
                    </View>
                    <View style={{flexDirection: "row", gap: 10, alignItems: "center"}}>
                        <FontText style={{fontSize: 16}}>Par {tee.holes[hole-1].par}</FontText>
                        <View style={{width: 4, height: 4, borderRadius: "50%", backgroundColor: "black"}}></View>
                        <FontText style={{fontSize: 16}}>{tee.holes[hole-1].yardage} yds</FontText>
                        <View style={{width: 4, height: 4, borderRadius: "50%", backgroundColor: "black"}}></View>
                        <FontText style={{fontSize: 16}}>{tee.holes[hole-1].handicap}</FontText>
                    </View>
                    <Pressable onPress={() => confirmExitRef.current.present()}>
                        <Svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                             strokeWidth={1.5}
                             stroke={colors.text.primary} width={32} height={32}>
                            <Path strokeLinecap="round" strokeLinejoin="round"
                                  d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15M12 9l3 3m0 0-3 3m3-3H2.25"/>
                        </Svg>
                    </Pressable>
                </View>
                <View style={{width: "100%", paddingBottom: 12, flexDirection: "row"}}>
                    <View style={{flexDirection: "row", width: 150}}>
                        <FontText style={{fontVariant: ["tabular-nums"], fontWeight: 600, fontSize: 16}}>Round: </FontText>
                        <ElapsedTimeClock startTime={startTime} styles={{fontSize: 16}}></ElapsedTimeClock>
                    </View>
                    <View style={{flexDirection: "row"}}>
                        <FontText style={{marginLeft: 12, fontSize: 16, fontWeight: 600, fontVariant: ["tabular-nums"]}}>Hole: </FontText>
                        <ElapsedTimeClock startTime={holeStartTime} styles={{fontSize: 16}}></ElapsedTimeClock>
                    </View>
                </View>
                <View style={{backgroundColor: colors.background.secondary, borderRadius: 16, paddingHorizontal: 16, width: "100%", paddingVertical: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between"}}>
                    <View>
                        <FontText style={{fontSize: 18, fontWeight: 600}}>{userData.firstName} {userData.lastName === "Unknown" ? "" : userData.lastName}</FontText>
                        <FontText style={{color: colors.text.secondary, fontWeight: 500}}>Handicap: {userData.strokesGained}</FontText>
                    </View>
                    <View style={{backgroundColor: colors.button.secondary.background, width: 48, height: 48, borderRadius: 32, justifyContent: "center", alignItems: "center"}}>
                        <FontText style={{fontSize: (strokes-parStrokes) === 0 ? 24 : (strokes-parStrokes) > 9 || (strokes-parStrokes) < -9 ? 20 : 22, fontWeight: 600, color: colors.button.secondary.text, textAlign: "center"}}>{strokes-parStrokes > 0 ? "+" : ""}{strokes - parStrokes === 0 ? "E" : (strokes - parStrokes)}</FontText>
                    </View>
                </View>
                <View style={{flexDirection: "row", gap: 32, flex: 1}}>
                    <View style={{alignItems: "center"}}>
                        <FontText style={{fontSize: 18, fontWeight: 500, marginTop: 12, marginBottom: 8}}>Score</FontText>
                        <View style={{borderWidth: 1, borderColor: colors.border.default, padding: 10, borderRadius: 64, backgroundColor: colors.background.secondary, flexDirection: "col", gap: 16, alignSelf: "flex-start"}}>
                            <Pressable onPress={() => setScore(score >= 9 ? 1 : score+1)} style={({pressed}) => [{width: 48, height: 48, borderRadius: 32, backgroundColor: pressed ? colors.border.default : colors.background.primary, alignItems: "center", justifyContent: "center"}]}>
                                <Svg width={32} height={32} viewBox="0 0 24 24">
                                    <Line x1="12" y1="5" x2="12" y2="19" stroke={colors.button.primary.text} strokeWidth="2" />
                                    <Line x1="5" y1="12" x2="19" y2="12" stroke={colors.button.primary.text} strokeWidth="2" />
                                </Svg>
                            </Pressable>
                            <FontText style={{fontSize: 32, fontWeight: 600, textAlign: "center"}}>{score}</FontText>
                            <Pressable onPress={() => setScore(score <= 1 ? 9 : score-1)} style={({pressed}) => [{width: 48, height: 48, borderRadius: 32, backgroundColor: pressed ? colors.border.default : colors.background.primary, alignItems: "center", justifyContent: "center"}]}>
                                <Svg width={32} height={32} viewBox="0 0 24 24">
                                    <Line x1="5" y1="12" x2="19" y2="12" stroke={colors.button.primary.text} strokeWidth="3" />
                                </Svg>
                            </Pressable>
                        </View>
                    </View>
                    <View style={{alignItems: "center"}}>
                        <FontText style={{fontSize: 18, fontWeight: 500, marginTop: 12, marginBottom: 8}}>Putts</FontText>
                        <View style={{borderWidth: 1, borderColor: colors.border.default, padding: 10, borderRadius: 64, backgroundColor: colors.background.secondary, flexDirection: "col", gap: 16, alignSelf: "flex-start"}}>
                            <Pressable onPress={() => setPutts(putts >= 9 ? 0 : putts+1)} style={({pressed}) => [{width: 48, height: 48, borderRadius: 32, backgroundColor: pressed ? colors.border.default : colors.background.primary, alignItems: "center", justifyContent: "center"}]}>
                                <Svg width={32} height={32} viewBox="0 0 24 24">
                                    <Line x1="12" y1="5" x2="12" y2="19" stroke={colors.button.primary.text} strokeWidth="2" />
                                    <Line x1="5" y1="12" x2="19" y2="12" stroke={colors.button.primary.text} strokeWidth="2" />
                                </Svg>
                            </Pressable>
                            <FontText style={{fontSize: 32, fontWeight: 600, textAlign: "center"}}>{putts}</FontText>
                            <Pressable onPress={() => setPutts(putts <= 0 ? 9 : putts-1)} style={({pressed}) => [{width: 48, height: 48, borderRadius: 32, backgroundColor: pressed ? colors.border.default : colors.background.primary, alignItems: "center", justifyContent: "center"}]}>
                                <Svg width={32} height={32} viewBox="0 0 24 24">
                                    <Line x1="5" y1="12" x2="19" y2="12" stroke={colors.button.primary.text} strokeWidth="3" />
                                </Svg>
                            </Pressable>
                        </View>
                    </View>
                </View>

                <View style={{flexDirection: "row", justifyContent: "space-between", gap: 4}}>
                    <PrimaryButton style={{borderRadius: 8, paddingVertical: 9, flex: 1, maxWidth: 96}}
                                   title="Back"
                                   disabled={hole === 1} onPress={() => {}}></PrimaryButton>
                    <DangerButton onPress={() => {
                        // updateField("largeMiss", true);
                        // bigMissRef.current.present();
                    }}
                                  title={`Miss > ${userData.preferences.units === 0 ? "3ft" : "1m"}?`}></DangerButton>
                    {<PrimaryButton style={{borderRadius: 8, paddingVertical: 9, flex: 1, maxWidth: 96}}
                                    title={hole === holes ? "Submit" : "Next"}
                                    disabled={false}
                                    onPress={() => {

                                    }}></PrimaryButton>}
                </View>

            </ScreenWrapper>
            <ConfirmExit confirmExitRef={confirmExitRef} cancel={() => confirmExitRef.current.dismiss()} canPartial={hole > 1} partial={() => submit()} end={fullReset}></ConfirmExit>
        </>
    )
}