import React, {useCallback, useImperativeHandle, useRef, useState} from "react";
import {Dimensions, Pressable, View} from "react-native";
import {BottomSheetModal, BottomSheetView} from "@gorhom/bottom-sheet";
import useColors from "@/hooks/useColors";
import CustomBackdrop from "@/components/general/popups/CustomBackdrop";
import FontText from "../../../general/FontText";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {FullGreenVisual} from "../../real";
import {SecondaryButton} from "../../../general/buttons/SecondaryButton";
import Svg, {Path} from "react-native-svg";
import {SvgClose} from "../../../../assets/svg/SvgComponents";
import {PrimaryButton} from "../../../general/buttons/PrimaryButton";
import {MisreadModal} from "../../popups/MisreadModal";
import {PuttingGreen} from "../../PuttingGreen";
import DangerButton from "../../../general/buttons/DangerButton";
import {useAppContext} from "@/contexts/AppContext";
import {FullBigMissModal} from "./FullBigMissModal";
import {calculateDistanceMissedFeet, calculateDistanceMissedMeters} from "../../../../utils/PuttUtils";

export function PuttTrackingModal({puttTrackingRef, updatePuttData}) {
    const colors = useColors();
    const bottomSheetRef = useRef(null);
    const misreadRef = useRef(null);
    const fullBigMissModalRef = useRef(null);
    const {userData} = useAppContext();

    const screenHeight = Dimensions.get("window").height;
    const snapPoints = [`${((screenHeight - useSafeAreaInsets().top) / screenHeight) * 100}%`];

    const [theta, setTheta] = React.useState(999);
    const [distance, setDistance] = React.useState(0);
    const [distanceInvalid, setDistanceInvalid] = React.useState(true);
    const [misHit, setMisHit] = useState(false);
    const [misReadSlope, setMisReadSlope] = useState(false);
    const [misReadLine, setMisReadLine] = useState(false);
    const [holedOut, setHoledOut] = useState(false);
    const [height, setHeight] = useState(0);
    const [width, setWidth] = useState(0);
    const [center, setCenter] = useState(false);
    const [point, setPoint] = useState({});
    const [largeMiss, setLargeMiss] = useState({
        dir: "",
        distance: -1
    });

    const CheckIcon = React.memo(() => (
        <View style={{
            position: "absolute",
            right: -7,
            top: -7,
            backgroundColor: "#40C2FF",
            padding: 3,
            borderRadius: 50,
        }}>
            <Svg
                width={18}
                height={18}
                stroke={colors.checkmark.color}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="3">
                <Path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5"/>
            </Svg>
        </View>
    ));

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
        largeMiss: () => {
            setPoint({});
            setCenter(false);
            setHoledOut(false);
        },
        getWidth: () => {
            return width;
        },
        getHeight: () => {
            return height;
        },
        setData: (data) => {
            setTheta(data.theta || 999);
            setDistance(data.distance || 0);
            setDistanceInvalid(data.distanceInvalid);
            setPoint(data.point || {});
            setCenter(data.center || false);
            setMisHit(data.misHit || false);
            setHoledOut(data.holedOut || false);
            setMisReadLine(data.misReadLine || false);
            setMisReadSlope(data.misReadSlope || false);
            setHeight(data.height || 0);
            setWidth(data.width || 0);
            setLargeMiss(data.largeMiss || {
                dir: "",
                distance: -1
            });
        },
        resetData: () => {
            setTheta(999);
            setDistance(0);
            setDistanceInvalid(true);
            setPoint({});
            setCenter(false);
            setHoledOut(false);
            setMisHit(false);
            setMisReadLine(false);
            setMisReadSlope(false);
            fullBigMissModalRef.current.resetData();
            setLargeMiss({
                dir: "",
                distance: -1
            });
        }
    }));

    // renders
    return (
        <View>
            <BottomSheetModal
                ref={bottomSheetRef}
                snapPoints={snapPoints}
                enableDynamicSizing={false}
                onDismiss={() => {
                    let distanceMissed = 0;
                    if (point.x !== undefined) {
                        distanceMissed = userData.preferences.units === 0 ? calculateDistanceMissedFeet(center, point, width, height) : calculateDistanceMissedMeters(center, point, width, height);
                    }
                    updatePuttData({
                        theta,
                        distance: holedOut ? 0 : distance === 0 ? -1 : distance,
                        distanceInvalid,
                        misHit,
                        misReadLine,
                        misReadSlope,
                        center,
                        point,
                        distanceMissed,
                        largeMiss,
                    });
                }}
                backdropComponent={myBackdrop}
                backgroundStyle={{backgroundColor: colors.background.primary}}
                keyboardBlurBehavior={"restore"}>
                <BottomSheetView style={{width: "100%", flex: 1, paddingHorizontal: 24, justifyContent: "space-between"}}>
                    <View>
                        <FullGreenVisual theta={theta}
                                         setTheta={setTheta}
                                         distance={distance}
                                         distanceInvalid={distanceInvalid}
                                         setDistance={setDistance}
                                         setDistanceInvalid={setDistanceInvalid}
                                         showDistance={!holedOut}/>

                        <View style={{flexDirection: "row", justifyContent: "space-around", gap: 8, marginTop: 12}}>
                            <Pressable onPress={() => setMisHit(!misHit)} style={{
                                paddingRight: 5,
                                paddingLeft: 0,
                                paddingVertical: 10,
                                borderRadius: 10,
                                borderWidth: 1,
                                flex: 1,
                                borderColor: misHit ? colors.button.danger.border : colors.button.danger.disabled.border,
                                backgroundColor: misHit ? colors.button.danger.background : colors.button.danger.disabled.background,
                                alignSelf: "center",
                                flexDirection: "row",
                                justifyContent: "center",
                                alignItems: 'center',
                            }}>
                                {misHit ?
                                    <Svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                         strokeWidth={2}
                                         width={20}
                                         height={20} stroke={colors.button.danger.text}>
                                        <Path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5"/>
                                    </Svg> :
                                    <SvgClose width={20} height={20} stroke={misHit ? colors.button.danger.text : colors.button.danger.disabled.text}></SvgClose>
                                }
                                <FontText style={{color: misHit ? colors.button.danger.text : colors.button.danger.disabled.text, marginLeft: 4, fontWeight: 400}}>Mishit</FontText>
                            </Pressable>
                            <Pressable onPress={() => {
                                if (!holedOut) {
                                    setCenter(false);
                                    setPoint({});
                                    setDistanceInvalid(false);
                                    setDistance(-1);
                                    setLargeMiss({
                                        dir: "",
                                        distance: -1
                                    })
                                }
                                setHoledOut(!holedOut);
                            }} style={{
                                paddingRight: 5,
                                paddingLeft: 0,
                                paddingVertical: 10,
                                borderRadius: 10,
                                borderWidth: 1,
                                flex: 1,
                                borderColor: holedOut ? colors.button.radio.selected.border : colors.button.danger.disabled.border,
                                backgroundColor: holedOut ? colors.button.radio.selected.background : colors.button.danger.disabled.background,
                                alignSelf: "center",
                                flexDirection: "row",
                                justifyContent: "center",
                                alignItems: 'center',
                            }}>
                                {holedOut && <CheckIcon></CheckIcon>}
                                <FontText style={{color: colors.button.radio.text, marginLeft: 4, fontWeight: 400, textAlign: "center"}}>Holed Out</FontText>
                            </Pressable>
                            <Pressable onPress={() => misreadRef.current.present()} style={({pressed}) => [{
                                paddingHorizontal: 5,
                                flex: 1,
                                paddingVertical: 10,
                                borderRadius: 10,
                                borderWidth: 1,
                                borderColor: misReadSlope || misReadLine ? colors.button.danger.border : colors.button.danger.disabled.border,
                                backgroundColor: misReadSlope || misReadLine ? colors.button.danger.background : pressed ? colors.button.primary.depressed : colors.button.danger.disabled.background,
                                alignSelf: "center",
                                flexDirection: "row",
                                justifyContent: "center",
                                alignItems: 'center',
                            }]}>
                                <FontText style={{color: misReadSlope || misReadLine ? colors.button.danger.text : colors.button.danger.disabled.text}}>Misread{misReadSlope && misReadLine ? ": Both" : misReadSlope ? ": Speed" : misReadLine ? ": Break" : ""}</FontText>
                            </Pressable>
                        </View>
                        <View style={{width: "100%", alignSelf: "flex-start", marginTop: 10}}>
                            <PuttingGreen holedOut={holedOut} setHoledOut={setHoledOut} largeMiss={largeMiss} setLargeMiss={setLargeMiss} center={center} setCenter={setCenter} setHeight={setHeight} setWidth={setWidth} setPoint={setPoint} height={height} width={width} point={point}></PuttingGreen>
                        </View>
                    </View>
                    <View>
                        {(
                            (distance < 1 ||
                                ((Object.keys(point).length < 1 && !center) && largeMiss.distance === -1))
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
                            { largeMiss.distance !== -1 ? (
                                <DangerButton onPress={() => {
                                    if (distance < 1) return;
                                    fullBigMissModalRef.current.open();
                                }} style={{paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8, opacity: distance < 1 ? 0.5 : 1}} children={<View style={{flexDirection: "row"}}>
                                    <Svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                         strokeWidth={2}
                                         width={20}
                                         height={20} stroke={colors.button.danger.text}>
                                        <Path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5"/>
                                    </Svg>
                                    <FontText style={{color: colors.button.danger.text, marginLeft: 4}}>Miss > {userData.preferences.units === 0 ? "3ft" : "1m"}</FontText>
                                </View>}></DangerButton>
                            ) : (
                                <PrimaryButton onPress={() => {
                                    if (distance < 1) return;
                                    fullBigMissModalRef.current.open();
                                }} title={`Miss > ${userData.preferences.units === 0 ? "3ft" : "1m"}?`} style={{paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8, opacity: distance < 1 ? 0.5 : 1}}></PrimaryButton>
                            )
                            }
                            <SecondaryButton title={"Save & Close"} onPress={() => {
                                bottomSheetRef.current.dismiss();
                                // we do this because if the person sets their big miss data, but then saves the hole with < 3ft data, we ignore the big miss data
                                if (largeMiss.distance !== -1 && (Object.keys(point).length > 0 || center)) {
                                    setLargeMiss({
                                        dir: "",
                                        distance: -1
                                    });
                                }
                            }}></SecondaryButton>
                        </View>
                    </View>
                </BottomSheetView>
            </BottomSheetModal>

            <FullBigMissModal bigMissRef={fullBigMissModalRef} puttTrackingModalRef={puttTrackingRef} largeMiss={largeMiss} setLargeMiss={setLargeMiss}/>
            <MisreadModal misreadRef={misreadRef} setMisreadSlope={setMisReadSlope} setMisreadLine={setMisReadLine} misreadSlope={misReadSlope} misreadLine={misReadLine}/>
        </View>
    );
}
