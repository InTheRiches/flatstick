import {ActivityIndicator, Animated, Pressable, Text, View} from "react-native";
import ScreenWrapper from "../../../components/general/ScreenWrapper";
import React, {useEffect, useRef, useState} from "react";
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
import {firestore} from "../../../utils/firebase";
import {useAppContext} from "../../../contexts/AppContext";
import generatePushID from "../../../components/general/utils/GeneratePushID";
import {SCHEMA_VERSION} from "../../../constants/Constants";
import {roundTo} from "../../../utils/roundTo";
import {useLocalSearchParams, useRouter} from "expo-router";
import {doc, getDoc, setDoc} from "firebase/firestore";
import {EditPuttModal} from "../../../components/simulations/full/popups/EditPuttModal";
import {PuttPredictionModal} from "../../../components/simulations/full/popups/PuttPredictionModal";
import {predictPutt} from "../../../utils/courses/predictionUtils";
import {isPointInPolygon} from "../../../utils/courses/polygonUtils";

// TODO use compass to align user to the green
export default function PuttingGreen() {
    const colors = useColors();
    const router = useRouter();
    const {userData, putters, grips, processSession} = useAppContext();
    const {stringHoles, difficulty, mode} = useLocalSearchParams();

    const holes = parseInt(stringHoles); //9;
    // const difficulty = "medium";
    // const mode = "practice";

    const userLocation = {latitude: 42.204930, longitude: -85.632782}; // useUserLocation(() => router.replace("/practice"));

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
    const [greenFound, setGreenFound] = useState(false);
    const [prediction, setPrediction] = useState(null);

    const confirmExitRef = React.useRef(null);
    const editPuttRef = useRef(null);
    const predictionRef = useRef(null);

    // load map data and LiDAR
    // TODO make this try a few times, and then stop, and give them a button to try again
    useEffect(() => {
        if (greenFound) return; // already found a green
        if (!userLocation) return; // wait for location

        let intervalId;

        console.log("Starting to look for putting greens near:", userLocation);

        const fetchData = async () => {
            console.log("Fetching putting green data...");
            try {
                if (!userLocation) return; // wait for location

                const result = await getOSMPuttingGreenByLatLon(
                    userLocation.latitude,
                    userLocation.longitude
                );

                // If nothing was found, just return and let the loop try again
                if (!result || !result.id || !result.greenCoords) return;
                clearInterval(intervalId);

                console.log("Found putting green:", result.id);

                setGreenFound(true);

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
                    });

                    console.log("Fetched new LiDAR data from 3DEP.");

                    return;
                }

                const data = document.data();
                if (data && data.lidar) {
                    setLidarData(data.lidar);
                    console.log("Fetched existing LiDAR data from 3DEP.");
                    return;
                }

                console.error("Found firebase document but no LiDAR data.");
                alert("Error loading LiDAR data. Please try again later. Contact support if the issue persists.");

                router.replace('/practice');
            } catch (error) {
                alert("Error fetching putting green data. Please try again later. Contact support if the issue persists.");
                console.error("Error fetching putting green data:", error);
                router.replace('/practice');
            }
        };

        fetchData();
        intervalId = setInterval(fetchData, 5000);

        return () => clearInterval(intervalId); // cleanup
    }, [userLocation]);

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
        processSession(newData, null, lidarData).then(() => {
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

    useEffect(() => {
        const loadPrediction = async () => {
            if (generatedHoles && lidarData) {
                const prediction = await predictPutt(lidarData, taps.length > 0 ? taps[taps.length - 1] : generatedHoles[holeNumber - 1].start, generatedHoles[holeNumber-1].pin);
                setPrediction(prediction);
            }
            else {
                setPrediction(null);
            }
        }

        loadPrediction().catch(console.error);
    }, [taps, generatedHoles, holeNumber]);

    return !lidarData ? (
        <ScreenWrapper style={{justifyContent: "center", alignItems: "center", paddingHorizontal: 20}}>
            {!greenCoords ? (
                // Waiting for green screen
                <>
                    <Text style={{fontSize: 22,fontWeight: "600",textAlign: "center",marginBottom: 10}}>Searching for a Putting Green...</Text>
                    <ActivityIndicator size="large" color="#43ac0a" style={{ marginTop: 20 }} />
                    <Text style={{fontSize: 16, color: "#8e8e8e", textAlign: "center", marginTop: 15, maxWidth: 300}}>Please wait while we locate the nearest green.</Text>
                    <SecondaryButton title={"Cancel"} onPress={() => router.replace("/practice")} style={{marginTop: 48, borderRadius: 50, paddingHorizontal: 48, paddingVertical: 10}}></SecondaryButton>
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
                    {generatedHoles && <FontText style={{fontSize: 16, marginBottom: 10, color: colors.text.secondary}}>Long press on any putt to mark it as misread.</FontText>}
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
                                    setTaps([...taps, {...tap, misreadLine: false, misreadSlope: false}]);
                                }
                            }}
                            selectedHole={generatedHoles ? generatedHoles[holeNumber-1] : null}
                            pinLocations={pinLocations}
                            setPinLocations={setPinLocations}
                            bounds={viewBounds(greenCoords, [])}
                            misreadRef={editPuttRef}
                        />
                    )}
                    <View style={{flexDirection: "row", alignItems: "center", marginTop: 6}}>
                        <View style={{flexDirection: "row", flex: 1, alignItems: "center"}}>
                            <View style={{
                                aspectRatio: 1,
                                width: 14,
                                borderWidth: 1,
                                marginRight: 6,
                                borderRadius: "50%",
                                backgroundColor: "#76eeff",
                                marginLeft: 48
                            }}>
                                <Svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" style={{marginLeft: -2, marginTop: -2}}
                                     viewBox="0 0 24 24">
                                    <Path d="M12 2l6.5 18.5L12 16l-6.5 4.5L12 2z"/>
                                </Svg>
                            </View>
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
                {generatedHoles && prediction && (
                    <View style={{justifyContent: "center", alignItems: "center"}}>
                        <Text style={{color: '#777'}}>📏 Distance</Text>
                        <Text style={{fontSize: 18, fontWeight: '700', color: '#333',}}>{prediction.puttDistanceFeet.toFixed(1)} ft</Text>
                    </View>
                )}
                <View style={{flexDirection: "row", justifyContent: "space-around", gap: 8, marginTop: 8, borderBottomWidth: 1, borderBottomColor: colors.border.default, paddingBottom: 12}}>
                    <Pressable onPress={() => {
                        if (userLocation === null) return;
                        // check if the user is on the green
                        if (isPointInPolygon(userLocation, greenCoords)) {
                            setTaps(prevTaps => [...prevTaps, {...userLocation, misReadSlope: false, misReadLine: false}]);
                        }
                    }} style={({pressed}) => ({
                        paddingRight: 5,
                        paddingLeft: 0,
                        paddingVertical: 10,
                        borderRadius: 10,
                        borderWidth: 1,
                        flex: 1,
                        borderColor: userLocation === null ? colors.button.disabled.border : colors.button.primary.border,
                        backgroundColor: userLocation === null ? colors.button.disabled.background : pressed ? colors.button.primary.depressed : colors.button.primary.background,
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: 'center',
                    })}>
                        <Svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={userLocation === null ? colors.button.disabled.text : colors.button.primary.text} width={20} height={20}>
                            <Path fillRule="evenodd" d="m11.54 22.351.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 0 0-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 0 0 2.682 2.282 16.975 16.975 0 0 0 1.145.742ZM12 13.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clipRule="evenodd" />
                        </Svg>
                        <FontText style={{color: userLocation === null ? colors.button.disabled.text : colors.button.primary.text, marginLeft: 4, fontWeight: 500}}>Mark From Location</FontText>
                    </Pressable>
                    <Pressable onPress={() => {
                        setTaps([]);
                    }} style={({pressed}) => [{
                        paddingHorizontal: 5,
                        flex: 0.5,
                        paddingVertical: 10,
                        borderRadius: 10,
                        borderWidth: 1,
                        borderColor: colors.button.danger.border,
                        backgroundColor:  pressed ? colors.button.danger.depressed : colors.button.danger.background,
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: 'center',
                    }]}>
                        <FontText style={{color: colors.button.danger.text, fontWeight: 500}}>Clear Shots</FontText>
                    </Pressable>
                    <Pressable style={({pressed}) => ({alignItems: "center", justifyContent: "center", padding: 10, borderRadius: 10, borderWidth: 1, borderColor: colors.button.primary.border, backgroundColor: pressed ? colors.button.primary.depressed : colors.button.primary.background})} onPress={() => {
                        predictionRef.current.open(prediction);
                    }}>
                        <Svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={"black"} width={24} height={24}>
                            <Path fillRule="evenodd"
                                  d="M9 4.5a.75.75 0 0 1 .721.544l.813 2.846a3.75 3.75 0 0 0 2.576 2.576l2.846.813a.75.75 0 0 1 0 1.442l-2.846.813a3.75 3.75 0 0 0-2.576 2.576l-.813 2.846a.75.75 0 0 1-1.442 0l-.813-2.846a3.75 3.75 0 0 0-2.576-2.576l-2.846-.813a.75.75 0 0 1 0-1.442l2.846-.813A3.75 3.75 0 0 0 7.466 7.89l.813-2.846A.75.75 0 0 1 9 4.5ZM18 1.5a.75.75 0 0 1 .728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 0 1 0 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 0 1-1.456 0l-.258-1.036a2.625 2.625 0 0 0-1.91-1.91l-1.036-.258a.75.75 0 0 1 0-1.456l1.036-.258a2.625 2.625 0 0 0 1.91-1.91l.258-1.036A.75.75 0 0 1 18 1.5ZM16.5 15a.75.75 0 0 1 .712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 0 1 0 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 0 1-1.422 0l-.395-1.183a1.5 1.5 0 0 0-.948-.948l-1.183-.395a.75.75 0 0 1 0-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0 1 16.5 15Z"
                                  clipRule="evenodd"/>
                        </Svg>
                    </Pressable>
                </View>
                { !(generatedHoles && prediction && prediction.puttDistanceFeet) && (
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
                    <Pressable style={({pressed}) => ({alignItems: "center", justifyContent: "center", padding: 10, borderRadius: 10, borderWidth: 1, borderColor: colors.button.primary.border, backgroundColor: pressed ? colors.button.primary.depressed : colors.button.primary.background})} onPress={() => {
                        predictionRef.current.open(prediction);
                    }}>
                        <Svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={"black"} width={24} height={24}>
                            <Path fillRule="evenodd"
                                  d="M9 4.5a.75.75 0 0 1 .721.544l.813 2.846a3.75 3.75 0 0 0 2.576 2.576l2.846.813a.75.75 0 0 1 0 1.442l-2.846.813a3.75 3.75 0 0 0-2.576 2.576l-.813 2.846a.75.75 0 0 1-1.442 0l-.813-2.846a3.75 3.75 0 0 0-2.576-2.576l-2.846-.813a.75.75 0 0 1 0-1.442l2.846-.813A3.75 3.75 0 0 0 7.466 7.89l.813-2.846A.75.75 0 0 1 9 4.5ZM18 1.5a.75.75 0 0 1 .728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 0 1 0 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 0 1-1.456 0l-.258-1.036a2.625 2.625 0 0 0-1.91-1.91l-1.036-.258a.75.75 0 0 1 0-1.456l1.036-.258a2.625 2.625 0 0 0 1.91-1.91l.258-1.036A.75.75 0 0 1 18 1.5ZM16.5 15a.75.75 0 0 1 .712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 0 1 0 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 0 1-1.422 0l-.395-1.183a1.5 1.5 0 0 0-.948-.948l-1.183-.395a.75.75 0 0 1 0-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0 1 16.5 15Z"
                                  clipRule="evenodd"/>
                        </Svg>
                    </Pressable>
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
                router.replace("/practice");
            }}></ConfirmExit>
            <EditPuttModal editPuttRef={editPuttRef} setMisreadSlope={(index) => {
                setTaps(prev => {
                    const newTaps = [...prev];
                    newTaps[index].misreadSlope = !newTaps[index].misreadSlope;
                    return newTaps;
                });
            }} setMisreadLine={index => {
                setTaps(prev => {
                    const newTaps = [...prev];
                    newTaps[index].misreadLine = !newTaps[index].misreadLine;
                    return newTaps;
                });
            }} deletePutt={index => {
                setTaps(prev => {
                    const newTaps = [];
                    for (let i = 0; i < prev.length; i++) {
                        if (i === index) continue;
                        newTaps.push(prev[i]);
                    }
                    return newTaps;
                });
            }}/>
            <PuttPredictionModal puttPredictionRef={predictionRef}/>
        </>
    )
}