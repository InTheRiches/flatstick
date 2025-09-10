import {Pressable, Text, View} from "react-native";
import ScreenWrapper from "../../../components/general/ScreenWrapper";
import React, {useEffect, useState} from "react";
import {getOSMPuttingGreenIdByLatLon} from "../../../utils/courses/putting-greens/greenFetching";
import {PuttingGreenPolygon} from "../../../components/simulations/putting-green/PuttingGreenPolygon";
import {viewBounds} from "../../../utils/courses/boundsUtils";
import Svg, {Path} from "react-native-svg";
import FontText from "../../../components/general/FontText";
import useColors from "../../../hooks/useColors";
import {SecondaryButton} from "../../../components/general/buttons/SecondaryButton";
import {get3DEPElevationData} from "../../../utils/courses/courseFetching";
import {generatePracticeRound} from "../../../utils/courses/putting-greens/greenEngine";
import {PrimaryButton} from "../../../components/general/buttons/PrimaryButton";

// TODO use compass to align user to the green
export default function PuttingGreen() {
    const colors = useColors();
    const holes = 9;
    const difficulty = "medium";
    const mode = "practice";

    const userLocation = {latitude: 42.204920, longitude: -85.632782}; // replace with useLocation() when ready

    const [taps, setTaps] = useState([]);
    const [pinLocations, setPinLocations] = useState([]);
    const [greenCoords, setGreenCoords] = useState(null);
    const [lidarData, setLidarData] = useState(null);
    const [generatedHoles, setGeneratedHoles] = useState(null);
    const [holeNumber, setHoleNumber] = useState(1);
    const [roundData, setRoundData] = useState([]);

    const confirmExitRef = React.useRef();

    // load map data and LiDAR
    useEffect(() => {
        const fetchData = async () => {
            console.log("User Location:", userLocation);
            const greenData = await getOSMPuttingGreenIdByLatLon(userLocation.latitude, userLocation.longitude);
            setGreenCoords(greenData);

            const lidarData = await get3DEPElevationData({
                ymin: Math.min(...greenData.map(pt => pt.latitude)),
                ymax: Math.max(...greenData.map(pt => pt.latitude)),
                xmin: Math.min(...greenData.map(pt => pt.longitude)),
                xmax: Math.max(...greenData.map(pt => pt.longitude)),
            });
            setLidarData(lidarData);
        }

        fetchData().catch((error) => {
            console.error("Error fetching putting green data:", error);
        });
    }, []);

    const nextHole = () => {
        if (!generatedHoles) return;
        setRoundData((prev) => {
            const newData = [...prev];
            newData[holeNumber - 1] = {
                hole: holeNumber,
                pinLocation: generatedHoles[holeNumber-1].pin,
                startLocation: generatedHoles[holeNumber-1].start,
                categories: generatedHoles[holeNumber-1].categories,
                taps: taps,
            };
            return newData;
        });

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

        setTaps(roundData[holeNumber - 2]?.taps || []);
        setHoleNumber(holeNumber - 1);
    }

    return (
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
                    <View style={{flexDirection: "row", flex: 1}}>
                        <View style={{aspectRatio: 1, width: 14, borderWidth: 1, marginRight: 6, borderRadius: "50%", backgroundColor: "#76eeff", marginLeft: 48}}></View>
                        <Text style={{fontWeight: 500}}>Your Location</Text>
                    </View>
                    <View style={{flexDirection: "row", flex: 1}}>
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
                    <View style={{flexDirection: "row", flex: 1}}>
                        <View style={{aspectRatio: 1, width: 14, borderWidth: 1, marginRight: 6, borderRadius: "50%", backgroundColor: "#ff9800", marginLeft: 48}}></View>
                        <Text style={{fontWeight: 500}}>Start Location</Text>
                    </View>
                    <View style={{flexDirection: "row", flex: 1}}>
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
    )
}