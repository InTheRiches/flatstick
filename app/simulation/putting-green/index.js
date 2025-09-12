import {ActivityIndicator, Animated, Pressable, Text, View} from "react-native";
import ScreenWrapper from "../../../components/general/ScreenWrapper";
import React, {useEffect, useState} from "react";
import {getOSMPuttingGreenByLatLon} from "../../../utils/courses/putting-greens/greenFetching";
import {PuttingGreenPolygon} from "../../../components/simulations/putting-green/PuttingGreenPolygon";
import {viewBounds} from "../../../utils/courses/boundsUtils";
import Svg, {Path} from "react-native-svg";
import FontText from "../../../components/general/FontText";
import useColors from "../../../hooks/useColors";
import {SecondaryButton} from "../../../components/general/buttons/SecondaryButton";
import {get3DEPElevationData} from "../../../utils/courses/courseFetching";
import {generatePracticeRound} from "../../../utils/courses/putting-greens/greenEngine";
import {PrimaryButton} from "../../../components/general/buttons/PrimaryButton";
import {ConfirmExit} from "../../../components/simulations/popups";
import {calculatePuttingGreenStats} from "../../../utils/courses/gpsStatsEngine";
import {auth, firestore} from "../../../utils/firebase";
import {useAppContext} from "../../../contexts/AppContext";
import generatePushID from "../../../components/general/utils/GeneratePushID";
import {SCHEMA_VERSION} from "../../../constants/Constants";
import {roundTo} from "../../../utils/roundTo";
import {newSession} from "../../../services/sessionService";
import {useLocalSearchParams, useRouter} from "expo-router";
import {doc, getDoc, setDoc} from "firebase/firestore";

// TODO use compass to align user to the green
export default function PuttingGreen() {
    const colors = useColors();
    const router = useRouter();
    const {userData, putters, grips} = useAppContext();
    const {stringHoles, difficulty, mode} = useLocalSearchParams();

    const holes = parseInt(stringHoles); //9;
    // const difficulty = "medium";
    // const mode = "practice";

    const userLocation = {latitude: 42.204920, longitude: -85.632782}; // replace with useLocation() when ready

    const [taps, setTaps] = useState([]);
    const [pinLocations, setPinLocations] = useState([]);
    const [greenCoords, setGreenCoords] = useState(null);
    const [osmGreenId, setOsmGreenId] = useState(null);
    const [lidarData, setLidarData] = useState(null);
    const [generatedHoles, setGeneratedHoles] = useState(null);
    const [holeNumber, setHoleNumber] = useState(1);
    const [roundData, setRoundData] = useState([]);
    const [startTime] = useState(new Date());

    const [loadingAnim] = useState(new Animated.Value(0));

    const confirmExitRef = React.useRef(null);

    // load map data and LiDAR
    useEffect(() => {
        let intervalId;

        const fetchData = async () => {
            try {
                const result = await getOSMPuttingGreenByLatLon(
                    userLocation.latitude,
                    userLocation.longitude
                );

                // If nothing was found, just return and let the loop try again
                if (!result || !result.id || !result.greenCoords) return;

                const { id, greenCoords: greenData } = result;
                setGreenCoords(greenData);
                setOsmGreenId(id);
                Animated.timing(loadingAnim, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }).start();

                // check the firebase first
                const document = await getDoc(doc(firestore, "greens/" + id.toString()));
                if (!document.exists()) {
                    const lidarData = await get3DEPElevationData({
                        ymin: Math.min(...greenData.map((pt) => pt.latitude)),
                        ymax: Math.max(...greenData.map((pt) => pt.latitude)),
                        xmin: Math.min(...greenData.map((pt) => pt.longitude)),
                        xmax: Math.max(...greenData.map((pt) => pt.longitude)),
                    });
                    setLidarData(lidarData);
                    setDoc(doc(firestore, "greens/" + id.toString()), {
                        lidar: lidarData,
                        timestamp: new Date().getTime()
                    }).catch((error) => {
                        console.error("Error saving LiDAR data:", error);
                    })
                    clearInterval(intervalId);

                    return;
                }

                const data = document.data();
                if (data && data.lidar) {
                    setLidarData(data.lidar);
                    clearInterval(intervalId);

                    return;
                }

                console.error("Found firebase document but no LiDAR data.");
                alert("Error loading LiDAR data. Please try again later. Contact support if the issue persists.");
                clearInterval(intervalId);

                router.replace('/practice');
            } catch (error) {
                alert("Error fetching putting green data. Please try again later. Contact support if the issue persists.");
                console.error("Error fetching putting green data:", error);
                router.replace('/practice');
            }
        };

        // Try immediately, then retry every 5 seconds
        fetchData();
        intervalId = setInterval(fetchData, 5000);

        return () => clearInterval(intervalId); // cleanup
    }, []);

    const nextHole = () => {
        if (!generatedHoles) return;

        if (taps.length !== 0) { // this is so that when you go back and forth it doesn't overwrite with empty data
            setRoundData((prev) => {
                const newData = [...prev];
                newData[holeNumber - 1] = {
                    hole: holeNumber,
                    pinLocation: generatedHoles[holeNumber - 1].pin,
                    startLocation: generatedHoles[holeNumber - 1].start,
                    categories: generatedHoles[holeNumber - 1].categories,
                    taps: taps,
                };
                return newData;
            });
        }

        // see if there is data already for the next hole
        if (roundData[holeNumber] && roundData[holeNumber].taps) {
            setTaps(roundData[holeNumber].taps);
        } else {
            setTaps([]);
        }

        setHoleNumber(holeNumber + 1);
    }

    const lastHole = () => {
        if (!generatedHoles) return;
        if (holeNumber < 2) return;

        if (taps.length !== 0) {
            // save current hole data
            setRoundData((prev) => {
                const newData = [...prev];
                newData[holeNumber - 1] = {
                    hole: holeNumber,
                    pinLocation: generatedHoles[holeNumber - 1].pin,
                    startLocation: generatedHoles[holeNumber - 1].start,
                    categories: generatedHoles[holeNumber - 1].categories,
                    taps: taps,
                };
                return newData;
            });
        }

        setTaps(roundData[holeNumber - 2]?.taps || []);
        setHoleNumber(holeNumber - 1);
    }

    const submit = () => {
        if (!generatedHoles) return;
        // save current hole data
        const finalRoundData = [...roundData];
        if (taps.length !== 0) {
            finalRoundData[holeNumber - 1] = {
                hole: holeNumber,
                pinLocation: generatedHoles[holeNumber - 1].pin,
                startLocation: generatedHoles[holeNumber - 1].start,
                categories: generatedHoles[holeNumber - 1].categories,
                taps: taps,
            }
            setRoundData(finalRoundData);
        }

        const {totalPutts, totalMisses, totalMadePutts, madePercent, strokesGained, leftRightBiasInches, shortPastBiasInches, puttCounts, totalDistanceFeet, holesPlayed, percentHigh, percentShort, missDistribution, avgMissFeet, detailedPutts} = calculatePuttingGreenStats(finalRoundData, lidarData, userData.preferences.units);

        const scorecard = finalRoundData.map((hole, index) => (hole.taps.length+1));

        const newData = {
            id: generatePushID(),
            meta: {
                schemaVersion: SCHEMA_VERSION,
                type: "green",
                date: startTime.toISOString(),
                durationMs: new Date().getTime() - startTime.getTime(),
                units: userData.preferences.units,
                synced: true, // TODO set this to false if not synced (if offline mode is ever added)
                difficulty: difficulty,
                mode: mode,
                osmGreenId
            },
            "player": {
                "putter": putters[userData.preferences.selectedPutter].type,
                "grip": grips[userData.preferences.selectedGrip].type
            },
            "stats": {
                "holes": holes,
                "holesPlayed": holesPlayed,
                "totalPutts": totalPutts,
                "puttCounts": puttCounts,
                "madePercent": madePercent,
                "avgMiss": avgMissFeet,
                "strokesGained": roundTo(strokesGained, 1),
                "missData": missDistribution,
                "leftRightBias": leftRightBiasInches,
                "shortPastBias": shortPastBiasInches,
                "totalDistance": totalDistanceFeet,
                "percentShort": percentShort,
                "percentHigh": percentHigh,
            },
            holeHistory: detailedPutts,
            scorecard,
        }
        newSession(auth.currentUser.uid, newData).then(() => {
            router.push({
                pathname: `/sessions/individual`,
                params: {
                    jsonSession: JSON.stringify(newData),
                    recap: "true"
                }
            });
        }).catch(error => {
            console.error("Error saving session:", error);
            alert("Failed to save session. Please try again later.");
        });
    }

    return !lidarData ? (
        <ScreenWrapper style={{justifyContent: "center", alignItems: "center", paddingHorizontal: 20}}>
            {!greenCoords ? (
                // Waiting for green screen
                <>
                    <Text style={{fontSize: 22,fontWeight: "600",textAlign: "center",marginBottom: 10}}>Searching for a Putting Green...</Text>
                    <ActivityIndicator size="large" color="#43ac0a" style={{ marginTop: 20 }} />
                    <Text style={{fontSize: 16, color: "#8e8e8e", textAlign: "center", marginTop: 15, maxWidth: 300}}>Please wait while we locate the nearest green.</Text>
                </>
            ) : (
                // Found green → transition
                <Animated.View
                    style={{
                        opacity: loadingAnim,
                        alignItems: "center",
                    }}
                >
                    <Text style={{fontSize: 22,fontWeight: "600",textAlign: "center",marginBottom: 10}}>Green Found!</Text>
                    <ActivityIndicator size="large" color="#1E90FF" style={{ marginTop: 20 }} />
                    <Text style={{fontSize: 16, color: "#8e8e8e", textAlign: "center", marginTop: 15, maxWidth: 300}}>Loading LiDAR and elevation data...</Text>
                </Animated.View>
            )}
        </ScreenWrapper>
    ) : (
        <>
            <ScreenWrapper style={{paddingHorizontal: 20, justifyContent:"space-between"}}>
                <View style={{flexDirection: "row", justifyContent: "space-between"}}>
                    {generatedHoles ? (
                        <>
                            <View style={{flexDirection: "row", marginTop: -12}}>
                                <FontText style={{fontSize: 40, color: colors.text.primary, fontWeight: 800}} type="title">{holeNumber}</FontText>
                                <FontText style={{fontSize: 18, fontWeight: 700, marginTop: 6}}>{holeNumber === 1 ? "ST" : holeNumber === 2 ? "ND" : holeNumber === 3 ? "RD" : "TH"}</FontText>
                            </View>
                        </>
                    ) : (
                        <FontText style={{fontSize: 24, fontWeight: "800", marginTop: -1}}>SETUP</FontText>
                    )}
                    <View style={{flexDirection: "row", gap: 10, alignItems: "center"}}>
                        <FontText style={{fontSize: 16}}>{holes} Holes</FontText>
                        <View style={{width: 4, height: 4, borderRadius: "50%", backgroundColor: "black"}}></View>
                        <FontText style={{fontSize: 16}}>Medium Difficulty</FontText>
                    </View>
                    <Pressable onPress={() => confirmExitRef.current.present()}>
                        <Svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                             strokeWidth={2}
                             stroke={colors.text.primary} width={32} height={32}>
                            <Path strokeLinecap="round" strokeLinejoin="round"
                                  d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15M12 9l3 3m0 0-3 3m3-3H2.25"/>
                        </Svg>
                    </Pressable>
                </View>
                <View>
                    {generatedHoles ? <FontText style={{fontSize: 16, marginBottom: 10, marginTop: 32, color: colors.text.secondary}}>Tap on the green to mark each putt for the simulated hole.</FontText> : <FontText style={{fontSize: 16, marginBottom: 10, marginTop: 32, color: colors.text.secondary}}>Tap on the green to mark where the pins are. Tap again to remove them.</FontText>}
                    <FontText style={{fontSize: 16, marginBottom: 10, color: colors.text.secondary}}>Drag the green to pan, pinch to zoom.</FontText>
                    {(greenCoords) && (
                        <PuttingGreenPolygon
                            userLocation={userLocation}
                            taps={taps}
                            greenCoords={greenCoords}
                            setTaps={setTaps}
                            onTap={(tap) => {
                                if (!generatedHoles) setPinLocations([...pinLocations, tap]);
                                else {
                                    setTaps([...taps, tap]);
                                }
                            }}
                            selectedHole={generatedHoles ? generatedHoles[holeNumber-1] : null}
                            pinLocations={pinLocations}
                            setPinLocations={setPinLocations}
                            bounds={viewBounds(greenCoords, [])}
                        />
                    )}
                    <View style={{flexDirection: "row", alignItems: "center", marginTop: 6}}>
                        <View style={{flexDirection: "row", flex: 1, alignItems: "center"}}>
                            <View style={{aspectRatio: 1, width: 14, borderWidth: 1, marginRight: 6, borderRadius: "50%", backgroundColor: "#76eeff", marginLeft: 48}}></View>
                            <Text style={{fontWeight: 500}}>Your Location</Text>
                        </View>
                        <View style={{flexDirection: "row", flex: 1, alignItems: "center"}}>
                            <View style={{aspectRatio: 1, width: 16, borderWidth: 1, marginRight: 6, borderRadius: "50%", backgroundColor: "white", marginLeft: 16, justifyContent: "center", alignItems: "center"}}>
                                <Svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" width={10} height={10}>
                                    <Path fill={"black"} fillRule="evenodd"
                                          d="M3 2.25a.75.75 0 0 1 .75.75v.54l1.838-.46a9.75 9.75 0 0 1 6.725.738l.108.054A8.25 8.25 0 0 0 18 4.524l3.11-.732a.75.75 0 0 1 .917.81 47.784 47.784 0 0 0 .005 10.337.75.75 0 0 1-.574.812l-3.114.733a9.75 9.75 0 0 1-6.594-.77l-.108-.054a8.25 8.25 0 0 0-5.69-.625l-2.202.55V21a.75.75 0 0 1-1.5 0V3A.75.75 0 0 1 3 2.25Z"
                                          clipRule="evenodd"/>
                                </Svg>

                            </View>
                            <Text style={{fontWeight: 500}}>Pin Location</Text>
                        </View>
                    </View>
                    <View style={{flexDirection: "row", alignItems: "center", marginTop: 6}}>
                        <View style={{flexDirection: "row", flex: 1, alignItems: "center"}}>
                            <View style={{aspectRatio: 1, width: 14, borderWidth: 1, marginRight: 6, borderRadius: "50%", backgroundColor: "#ff9800", marginLeft: 48}}></View>
                            <Text style={{fontWeight: 500}}>Start Location</Text>
                        </View>
                        <View style={{flexDirection: "row", flex: 1, alignItems: "center"}}>
                            <View style={{aspectRatio: 1, width: 16, marginRight: 6, borderRadius: "50%", backgroundColor: "#ef4343", marginLeft: 16, justifyContent: "center", alignItems: "center"}}>
                                <Svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" width={10} height={10}>
                                    <Path fill={"white"} fillRule="evenodd"
                                          d="M3 2.25a.75.75 0 0 1 .75.75v.54l1.838-.46a9.75 9.75 0 0 1 6.725.738l.108.054A8.25 8.25 0 0 0 18 4.524l3.11-.732a.75.75 0 0 1 .917.81 47.784 47.784 0 0 0 .005 10.337.75.75 0 0 1-.574.812l-3.114.733a9.75 9.75 0 0 1-6.594-.77l-.108-.054a8.25 8.25 0 0 0-5.69-.625l-2.202.55V21a.75.75 0 0 1-1.5 0V3A.75.75 0 0 1 3 2.25Z"
                                          clipRule="evenodd"/>
                                </Svg>
                            </View>
                            <Text style={{fontWeight: 500}}>Target Pin</Text>
                        </View>
                    </View>
                </View>
                { generatedHoles ? (
                    <Text>Slope: {generatedHoles[holeNumber-1].categories.slope} Break: {generatedHoles[holeNumber-1].categories.overallBreak}</Text>
                ) : (
                    <SecondaryButton onPress={() => {
                        if (!greenCoords || !lidarData || pinLocations.length === 0) return;
                        setGeneratedHoles(generatePracticeRound(greenCoords, lidarData, pinLocations));
                    }} style={{
                        borderRadius: 50,
                        flexDirection: "row",
                        alignSelf: "center",
                        paddingLeft: 20,
                        gap: 12,
                        paddingRight: 8,
                        paddingVertical: 6,
                        marginTop: 12,
                    }}>
                        <FontText style={{color: colors.button.secondary.text, fontSize: 18, fontWeight: 500}}>FINISH SETUP</FontText>
                        <View style={{borderRadius: 30, padding: 6, backgroundColor: colors.button.secondary.text}}>
                            <Svg width={20} height={20} xmlns="http://www.w3.org/2000/svg" fill="none"
                                 viewBox="0 0 24 24" strokeWidth={3}
                                 stroke={colors.button.secondary.background} className="size-6">
                                <Path strokeLinecap="round" strokeLinejoin="round"
                                      d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25"/>
                            </Svg>
                        </View>
                    </SecondaryButton>
                )
                }
                <View style={{flexDirection: "row", justifyContent: "space-between", gap: 4, paddingHorizontal: 16, opacity: generatedHoles ? 1 : 0}}>
                    <PrimaryButton style={{borderRadius: 12, paddingVertical: 12, flex: 1, maxWidth: 128}}
                                   title="Back"
                                   disabled={holeNumber === 1} onPress={lastHole}></PrimaryButton>
                    <PrimaryButton style={{borderRadius: 12, paddingVertical: 12, flex: 1, maxWidth: 128}}
                                   title={holeNumber === holes ? "Submit" : "Next"}
                                   disabled={false}
                                   onPress={nextHole}></PrimaryButton>
                </View>
            </ScreenWrapper>
            <ConfirmExit confirmExitRef={confirmExitRef} cancel={() => confirmExitRef.current.dismiss()} canPartial={holeNumber > 1} partial={() => {
                try {
                    submit();
                    confirmExitRef.current.dismiss();
                } catch(e) {
                    console.error("Error submitting partial round: " + e);
                }
            }} end={() => {
                router.replace("/");
            }}></ConfirmExit>
        </>
    )
}