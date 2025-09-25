import React, {useCallback, useEffect, useImperativeHandle, useRef, useState} from "react";
import {Dimensions, Pressable, Text, View} from "react-native";
import {BottomSheetModal, BottomSheetView} from "@gorhom/bottom-sheet";
import useColors from "@/hooks/useColors";
import CustomBackdrop from "@/components/general/popups/CustomBackdrop";
import FontText from "../../../general/FontText";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {SecondaryButton} from "../../../general/buttons/SecondaryButton";
import Svg, {Path} from "react-native-svg";
import {GreenPolygon} from "../GreenPolygon";
import useUserLocation from "../../../../hooks/useUserLocation";
import {viewBounds} from "../../../../utils/courses/boundsUtils";
import {isPointInPolygon} from "../../../../utils/courses/polygonUtils";
import {EditPuttModal} from "./EditPuttModal";
import {predictPutt} from "../../../../utils/courses/predictionUtils";
import {PuttPredictionModal} from "./PuttPredictionModal";

// TODO when someone long presses on a shot, give option to mark it as a misread (slope or line) or delete it
export function PuttTrackingModal({puttTrackingRef, updatePuttData, fairways, bunkers, greens, hole}) {
    const colors = useColors();
    const bottomSheetRef = useRef(null);
    const editPuttRef = useRef(null);
    const predictionRef = useRef(null);

    const screenHeight = Dimensions.get("window").height;
    const snapPoints = [`${((screenHeight - useSafeAreaInsets().top) / screenHeight) * 100}%`];

    const [taps, setTaps] = useState([]);
    const [tapMode, setTapMode] = useState('pin');
    const [pinLocation, setPinLocation] = useState(null);
    const userLocation = useUserLocation();

    const [misReadSlope, setMisReadSlope] = useState(false);
    const [misReadLine, setMisReadLine] = useState(false);
    const [holedOut, setHoledOut] = useState(false);
    const [greenCoords, setGreenCoords] = useState([]);
    const [greenLidar, setGreenLidar] = useState(null);

    const [prediction, setPrediction] = useState(null);

    useEffect(() => {
        if (!greens || (Array.isArray(greens) && greens.length === 0) || (Object.keys(greens).length === 0 && greens.constructor === Object)) {
            return;
        }
        for (const g of greens) {
            if (g.hole === hole.toString()) {
                setGreenCoords(g.geojson.coordinates);
                setGreenLidar(g.lidar);
                break;
            }
        }
    }, [hole, greens])

    const myBackdrop = useCallback(({animatedIndex, style}) => {
        return (<CustomBackdrop
            reference={bottomSheetRef}
            animatedIndex={animatedIndex}
            style={style}
        />);
    }, []);

    useImperativeHandle(puttTrackingRef, () => ({
        open: () => {
            bottomSheetRef.current?.present();
        },
        close: () => {
            bottomSheetRef.current?.dismiss();
        },
        setData: (data) => {
            setTaps(data.taps || []);
            setPinLocation(data.pinLocation || null);
            setTapMode("pin");
        },
        resetData: () => {
            setTaps([]);
            setPinLocation(null);
            setTapMode("pin");
        }
    }));

    useEffect(() => {
        const loadPrediction = async () => {
            if (taps.length > 0 && pinLocation) {
                const prediction = await predictPutt(greenLidar, taps[taps.length - 1], pinLocation);
                setPrediction(prediction);
            }
            else {
                setPrediction(null);
            }
        }

        loadPrediction().catch(console.error);
    }, [taps, pinLocation, greenLidar]);

    // renders
    return (
        <View>
            <BottomSheetModal
                ref={bottomSheetRef}
                snapPoints={snapPoints}
                enableHandlePanningGesture={false}
                enableOverDrag={false}
                enablePanDownToClose={false}
                enableDynamicSizing={false}
                onDismiss={() => {
                    updatePuttData({
                        taps: taps,
                        pinLocation: pinLocation,
                        holedOut: holedOut,
                    });
                }}
                backdropComponent={myBackdrop}
                backgroundStyle={{backgroundColor: colors.background.primary}}
                keyboardBlurBehavior={"restore"}>
                <BottomSheetView style={{width: "100%", flex: 1, paddingHorizontal: 24, justifyContent: "space-between"}}>
                    <View>
                        <View style={{flexDirection: "row", justifyContent: "space-around", gap: 8, marginTop: 12, paddingBottom: 8}}>
                            <Pressable onPress={() => {
                                setTapMode("pin");
                            }} style={{
                                paddingRight: 5,
                                paddingLeft: 0,
                                paddingVertical: 10,
                                borderRadius: 10,
                                borderWidth: 1,
                                flex: 1,
                                borderColor: tapMode === "pin" ? colors.button.radio.selected.border : colors.button.primary.border,
                                backgroundColor: tapMode === "pin" ? colors.button.radio.selected.background : colors.button.primary.background,
                                flexDirection: "row",
                                justifyContent: "center",
                                alignItems: 'center',
                            }}>
                                <Svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={colors.text.primary}
                                     width={18} height={18}>
                                    <Path fillRule="evenodd"
                                          d="M3 2.25a.75.75 0 0 1 .75.75v.54l1.838-.46a9.75 9.75 0 0 1 6.725.738l.108.054A8.25 8.25 0 0 0 18 4.524l3.11-.732a.75.75 0 0 1 .917.81 47.784 47.784 0 0 0 .005 10.337.75.75 0 0 1-.574.812l-3.114.733a9.75 9.75 0 0 1-6.594-.77l-.108-.054a8.25 8.25 0 0 0-5.69-.625l-2.202.55V21a.75.75 0 0 1-1.5 0V3A.75.75 0 0 1 3 2.25Z"
                                          clipRule="evenodd"/>
                                </Svg>
                                <FontText
                                    style={{color: colors.button.danger.disabled.text, marginLeft: 8, fontWeight: 500}}>Mark
                                    Pin</FontText>
                            </Pressable>
                            <Pressable onPress={() => {
                                if (pinLocation === null) return;
                                setTapMode("shot");
                            }} style={({pressed}) => [{
                                paddingHorizontal: 5,
                                flex: 1,
                                paddingVertical: 10,
                                borderRadius: 10,
                                borderWidth: 1,
                                borderColor: pinLocation === null ? colors.button.disabled.border : tapMode === "shot" ? colors.button.radio.selected.border : colors.button.primary.border,
                                backgroundColor: pinLocation === null ? colors.button.disabled.background : tapMode === "shot" ? colors.button.radio.selected.background : colors.button.primary.background,
                                flexDirection: "row",
                                justifyContent: "center",
                                alignItems: 'center',
                            }]}>
                                <FontText style={{color: pinLocation === null ? colors.button.disabled.text : colors.button.primary.text, marginLeft: 4, fontWeight: 500}}>Add Shots</FontText>
                            </Pressable>
                        </View>

                        <GreenPolygon
                            greenCoords={greenCoords}
                            bunkers={bunkers}
                            fairways={fairways}
                            taps={taps}
                            setTaps={setTaps}
                            onTap={(newTap) => {
                                if (tapMode === "pin") {
                                    setPinLocation(newTap);
                                    return;
                                }
                                setTaps(prevTaps => [...prevTaps, {...newTap, misreadLine: false, misreadSlope: false}]);
                            }}
                            bounds={viewBounds(greenCoords, bunkers)}
                            pinLocation={pinLocation}
                            userLocation={userLocation}
                            holedOut={holedOut}
                            setHoledOut={setHoledOut}
                            misreadRef={editPuttRef}
                        />

                        <View style={{flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: 12}}>
                            {prediction && prediction.puttDistanceFeet && (
                                <View style={{position: "absolute", left: 0}}>
                                    <Text style={{color: '#777'}}>📏 Distance</Text>
                                    <Text style={{fontSize: 18, fontWeight: '700', color: '#333',}}>{prediction.puttDistanceFeet.toFixed(1)} ft</Text>
                                </View>
                            )}
                            <View style={{flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 6}}>
                                <View style={{aspectRatio: 1, width: 14, borderWidth: 1, marginRight: 6, borderRadius: "50%", backgroundColor: "#76eeff"}}></View>
                                <Text style={{fontWeight: 500, fontSize: 14}}>Your Location</Text>
                            </View>
                        </View>

                        <View style={{flexDirection: "row", justifyContent: "space-around", gap: 8, marginTop: 12, borderBottomWidth: 1, borderBottomColor: colors.border.default, paddingBottom: 12}}>
                            <Pressable onPress={() => {
                                if (userLocation === null) return;
                                // check if the user is on the green
                                if (isPointInPolygon(userLocation, greenCoords)) {
                                    if (tapMode === "pin") {
                                        setPinLocation(userLocation);
                                        return;
                                    }
                                    setTaps(prevTaps => [...prevTaps, {...userLocation, misReadSlope: false, misReadLine: false}]);
                                }
                            }} style={{
                                paddingRight: 5,
                                paddingLeft: 0,
                                paddingVertical: 10,
                                borderRadius: 10,
                                borderWidth: 1,
                                flex: 1,
                                borderColor: userLocation === null ? colors.button.disabled.border : colors.button.primary.border,
                                backgroundColor: userLocation === null ? colors.button.disabled.background : colors.button.primary.background,
                                flexDirection: "row",
                                justifyContent: "center",
                                alignItems: 'center',
                            }}>
                                <Svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={userLocation === null ? colors.button.disabled.text : colors.button.primary.text} width={20} height={20}>
                                    <Path fillRule="evenodd" d="m11.54 22.351.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 0 0-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 0 0 2.682 2.282 16.975 16.975 0 0 0 1.145.742ZM12 13.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clipRule="evenodd" />
                                </Svg>
                                <FontText style={{color: userLocation === null ? colors.button.disabled.text : colors.button.primary.text, marginLeft: 4, fontWeight: 500}}>Mark From Location</FontText>
                            </Pressable>
                            <Pressable onPress={() => {
                                setPinLocation(null);
                                setTaps([]);
                                setTapMode("pin");
                            }} style={({pressed}) => [{
                                paddingHorizontal: 5,
                                flex: 0.5,
                                paddingVertical: 10,
                                borderRadius: 10,
                                borderWidth: 1,
                                borderColor: colors.button.danger.border,
                                backgroundColor:  colors.button.danger.background,
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

                        <Pressable onPress={() => {
                            if (!holedOut) {
                                setTaps([]);
                                setPinLocation(null);
                            }
                            setHoledOut(!holedOut);
                        }} style={{
                            marginTop: 12,
                            flexDirection: "row",
                            justifyContent: "center",
                            alignItems: 'center',
                        }}>
                            <FontText style={{color: colors.text.link, marginLeft: 4, fontSize: 16, fontWeight: 500, textAlign: "center"}}>Holed Out?</FontText>
                        </Pressable>
                    </View>
                    <View>
                        {(
                            (pinLocation === null || taps.length === 0)
                            && !holedOut
                        ) && (
                            <View style={{flexDirection: "row", paddingHorizontal: 2, marginTop: 10, paddingRight: 24, alignItems: "center", marginBottom: 12}}>
                                <Svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                     strokeWidth={1.5} stroke="red" width={30} height={30}>
                                    <Path strokeLinecap="round" strokeLinejoin="round"
                                          d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"/>
                                </Svg>
                                <FontText style={{color: "red", fontSize: 14, textAlign: "left", marginLeft: 6}}>
                                    Putt data is <FontText style={{fontWeight: 600}}>incomplete</FontText>, if you continue, this putt will be <FontText style={{fontWeight: 600}}>invalidated</FontText>.
                                </FontText>
                            </View>
                        )}
                        <View style={{flexDirection: "row", gap: 12, justifyContent: "center" }}>
                            <SecondaryButton title={"Save & Close"} onPress={() => {
                                bottomSheetRef.current.dismiss();
                            }}></SecondaryButton>
                        </View>
                    </View>
                </BottomSheetView>
            </BottomSheetModal>
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
        </View>
    );
}
