import React, {useCallback, useImperativeHandle, useRef, useState} from "react";
import {Pressable, View} from "react-native";
import {BottomSheetModal, BottomSheetView} from "@gorhom/bottom-sheet";
import useColors from "@/hooks/useColors";
import CustomBackdrop from "@/components/general/popups/CustomBackdrop";
import FontText from "../../../general/FontText";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Dimensions } from "react-native";
import {FullGreenVisual, GreenVisual} from "../../real";
import {SecondaryButton} from "../../../general/buttons/SecondaryButton";
import Svg, {Path} from "react-native-svg";
import {SvgClose} from "../../../../assets/svg/SvgComponents";
import {PrimaryButton} from "../../../general/buttons/PrimaryButton";
import {MisreadModal} from "../../popups/MisreadModal";
import {PuttingGreen} from "../../PuttingGreen";
import {BigMissModal} from "../../popups";

export function PuttTrackingModal({puttTrackingRef, updatePuttData}) {
    const colors = useColors();
    const bottomSheetRef = useRef(null);
    const misreadRef = useRef(null);

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
    const [largeMiss, setLargeMiss] = useState(false);
    const [largeMissBy, setLargeMissBy] = useState(0);

    const myBackdrop = useCallback(({animatedIndex, style}) => {
        return (<CustomBackdrop
            reference={puttTrackingRef}
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
            setTheta(data.theta || 999);
            setDistance(data.distance || 0);
            setDistanceInvalid(data.distanceInvalid || true);
            setPoint(data.point || {});
            setCenter(data.center || false);
            setMisHit(data.misHit || false);
            setHoledOut(data.holedOut || false);
            setMisReadLine(data.misReadLine || false);
            setMisReadSlope(data.misReadSlope || false);
            setHeight(data.height || 0);
            setWidth(data.width || 0);
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
                    updatePuttData({
                        theta,
                        distance: holedOut ? 0 : distance,
                        distanceInvalid,
                        misHit,
                        misReadLine,
                        misReadSlope,
                        center,
                        point,
                    })
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
                                         setDistanceInvalid={setDistanceInvalid}/>
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
                            <Pressable onPress={() => setHoledOut(!holedOut)} style={{
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
                                {holedOut && <View style={{
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
                                </View>}
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
                            <PuttingGreen center={center} setCenter={setCenter} setHeight={setHeight} setWidth={setWidth} setPoint={setPoint} height={height} width={width} point={point}></PuttingGreen>
                        </View>
                    </View>
                    <View>
                        {((distance < 1) || (Object.keys(point).length < 1 && !center)) && !holedOut && <View style={{flexDirection: "row", paddingHorizontal: 2, marginTop: 10, paddingRight: 24, alignItems: "center", marginBottom: 12}}>
                            <Svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                 strokeWidth={1.5} stroke="red" width={30} height={30}>
                                <Path strokeLinecap="round" strokeLinejoin="round"
                                      d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"/>
                            </Svg>
                            <FontText style={{color: "red", fontSize: 14, textAlign: "left", marginLeft: 6}}>Putt data is <FontText style={{fontWeight: 600}}>incomplete</FontText>, if you continue, this putt will be <FontText style={{fontWeight: 600}}>invalidated</FontText>.</FontText>
                        </View>}
                        <SecondaryButton title={"Save & Close"} onPress={() => bottomSheetRef.current.dismiss()}></SecondaryButton>
                    </View>
                </BottomSheetView>
            </BottomSheetModal>

            <BigMissModal updateField={updateField} hole={hole} bigMissRef={bigMissRef} allPutts={putts}
                          rawLargeMissBy={largeMissBy} nextHole={nextHole} lastHole={lastHole}/>
            <MisreadModal misreadRef={misreadRef} setMisreadSlope={setMisReadSlope} setMisreadLine={setMisReadLine} misreadSlope={misReadSlope} misreadLine={misReadLine}/>
        </View>
    );
}
