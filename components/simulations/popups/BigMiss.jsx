import React, {useCallback, useImperativeHandle, useRef, useState} from "react";
import {Keyboard, Platform, Pressable, TouchableWithoutFeedback, View} from "react-native";
import {BottomSheetModal, BottomSheetTextInput, BottomSheetView} from "@gorhom/bottom-sheet";
import useColors from "@/hooks/useColors";
import CustomBackdrop from "@/components/general/popups/CustomBackdrop";
import ArrowComponent from "@/components/general/icons/ArrowComponent";
import {PrimaryButton} from "@/components/general/buttons/PrimaryButton";
import Svg, {Path} from "react-native-svg";
import {useAppContext} from "../../../contexts/AppContext";
import FontText from "../../general/FontText";
import {Exclamation} from "../../../assets/svg/SvgComponents";

export function BigMissModal({
                                         updateField, largeMiss, bigMissRef, puttTrackingModalRef, allPutts, hole,
                                     }) {
    const colors = useColors();
    const {userData} = useAppContext();
    const bottomSheetRef = useRef(null);

    const [open, setOpen] = useState(false);
    const [transitioningBack, setTransitioningBack] = useState(false);

    const [putts, setPutts] = useState(-1);
    const [puttsFocused, setPuttsFocused] = useState(false);
    const [invalid, setInvalid] = useState(false);

    const [distanceFocused, setDistanceFocused] = useState(false);
    const [distanceInvalid, setDistanceInvalid] = useState(false);

    useImperativeHandle(bigMissRef, () => ({
        open: () => {
            bottomSheetRef.current?.present();
        },
        close: () => {
            bottomSheetRef.current?.dismiss();
        },
        setData: (data) => {
            setPutts(data.putts);
        },
        resetData: () => {
            setDistanceInvalid(false);
            setDistanceFocused(true);
            setPutts(-1);
            setPuttsFocused(false);
            setInvalid(false);
        }
    }));

    const setMissDirection = (direction) => {
        updateField("largeMiss", {
            ...largeMiss,
            dir: direction
        });
    };

    const myBackdrop = useCallback(({animatedIndex, style}) => {
        return (<CustomBackdrop
            reference={bottomSheetRef}
            animatedIndex={animatedIndex}
            style={style}
        />);
    }, []);

    const close = () => {
        if (transitioningBack) {
            setTransitioningBack(false);
            return;
        }

        Keyboard.dismiss();

        // updateField("largeMissBy", [0, 0]);
        // updateField("largeMiss", false);

        setPutts(-1);
        // setDistance(-1);
        // setLargeMissBy([0, 0]);

        setPuttsFocused(false);
        setInvalid(false);
        setDistanceFocused(false);
        setDistanceInvalid(false);
    };

    const updatePutts = (newPutts) => {
        if (newPutts === "") {
            setPutts(-1);
            setInvalid(true);
            return;
        }
        if (newPutts.match(/[^0-9]/g)) {
            setInvalid(true);
            return;
        }

        let fixedPutts = parseInt(newPutts);
        setPutts(fixedPutts);
        setInvalid(fixedPutts < 2 || fixedPutts > 9)
    };

    const updateDistance = (newDistance) => {
        if (newDistance === "") {
            updateField("largeMiss", {
                ...largeMiss,
                distance: -1,
            });
            setDistanceInvalid(true);
            return;
        }
        if (newDistance.match(/[^0-9]/g)) {
            setDistanceInvalid(true);
            return;
        }

        let fixedDistance = parseInt(newDistance);
        updateField("largeMiss", {
            ...largeMiss,
            distance: fixedDistance,
        });
        setDistanceInvalid(fixedDistance < (userData.preferences.units === 0 ? 3 : 1) || fixedDistance > 99)
    }

    // renders
    return (<BottomSheetModal
        ref={bottomSheetRef}
        backdropComponent={myBackdrop}
        onChange={() => {
            if (open) {
                close();
            }
            setOpen(!open);
        }}
        stackBehavior={"push"}
        backgroundStyle={{backgroundColor: colors.background.secondary}}
        keyboardBlurBehavior={"restore"}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <BottomSheetView style={{
                    paddingBottom: 12, backgroundColor: colors.background.secondary,
                }}>
                <View style={{paddingHorizontal: 20, flexDirection: "column", alignItems: "center",}}>
                    <View style={{flexDirection: "row", gap: 12, alignItems: "center", marginBottom: 8,}}>
                        <Exclamation width={48} height={48}></Exclamation>
                        <FontText style={{fontSize: 26, fontWeight: 600, color: colors.text.primary, textAlign: "left"}}>
                            Miss &gt;{userData.preferences.units === 0 ? "3ft" : "1m"}
                        </FontText>
                    </View>
                    <FontText
                        style={{
                            fontSize: 14,
                            fontWeight: 400,
                            color: colors.text.secondary,
                            textAlign: "center",
                            marginBottom: 16,
                        }}>
                        Putting for the rough, are we? GPS might be a good idea for the next one.
                        Mark which direction you missed below.
                    </FontText>
                    <View style={{flexDirection: "row", gap: 12, marginBottom: 20, alignSelf: "center",}}>
                        <View style={{flexDirection: "column", gap: 12}}>
                            <Pressable
                                onPress={() => setMissDirection("tl")}
                                style={{
                                    aspectRatio: 1,
                                    padding: 20,
                                    backgroundColor: largeMiss.dir === "tl" ? colors.button.danger.background : "#f3bebe",
                                    justifyContent: "center",
                                    flexDirection: "row",
                                    alignItems: "center",
                                    borderRadius: 50,
                                }}>
                                <ArrowComponent
                                    horizontalBreak={1}
                                    verticalSlope={0}
                                    selected={largeMiss.dir === "tl"}
                                ></ArrowComponent>
                            </Pressable>
                            <Pressable
                                onPress={() => setMissDirection("ml")}
                                style={{
                                    aspectRatio: 1,
                                    padding: 20,
                                    backgroundColor: largeMiss.dir === "ml" ? colors.button.danger.background : "#f3bebe",
                                    justifyContent: "center",
                                    flexDirection: "row",
                                    alignItems: "center",
                                    borderRadius: 50,
                                }}>
                                <ArrowComponent
                                    horizontalBreak={1}
                                    verticalSlope={1}
                                    selected={largeMiss.dir === "ml"}
                                ></ArrowComponent>
                            </Pressable>
                            <Pressable
                                onPress={() => setMissDirection("bl")}
                                style={{
                                    aspectRatio: 1,
                                    padding: 20,
                                    backgroundColor: largeMiss.dir === "bl" ? colors.button.danger.background : "#f3bebe",
                                    justifyContent: "center",
                                    flexDirection: "row",
                                    alignItems: "center",
                                    borderRadius: 50,
                                }}>
                                <ArrowComponent
                                    horizontalBreak={1}
                                    verticalSlope={2}
                                    selected={largeMiss.dir === "bl"}
                                ></ArrowComponent>
                            </Pressable>
                        </View>
                        <View style={{ flexDirection: "column", justifyContent: "space-between",}}>
                            <Pressable
                                onPress={() => setMissDirection("t")}
                                style={{
                                    aspectRatio: 1,
                                    padding: 20,
                                    backgroundColor: largeMiss.dir === "t" ? colors.button.danger.background : "#f3bebe",
                                    justifyContent: "center",
                                    flexDirection: "row",
                                    alignItems: "center",
                                    borderRadius: 50,
                                }}>
                                <ArrowComponent
                                    horizontalBreak={2}
                                    verticalSlope={0}
                                    selected={largeMiss.dir === "t"}
                                ></ArrowComponent>
                            </Pressable>
                            <Pressable
                                onPress={() => setMissDirection("b")}
                                style={{
                                    aspectRatio: 1,
                                    padding: 20,
                                    backgroundColor: largeMiss.dir === "b" ? colors.button.danger.background : "#f3bebe",
                                    justifyContent: "center",
                                    flexDirection: "row",
                                    alignItems: "center",
                                    borderRadius: 50,
                                }}>
                                <ArrowComponent
                                    horizontalBreak={2}
                                    verticalSlope={2}
                                    selected={largeMiss.dir === "b"}
                                ></ArrowComponent>
                            </Pressable>
                        </View>
                        <View style={{flexDirection: "column", gap: 12}}>
                            <Pressable
                                onPress={() => setMissDirection("tr")}
                                style={{
                                    aspectRatio: 1,
                                    padding: 20,
                                    backgroundColor: largeMiss.dir === "tr" ? colors.button.danger.background : "#f3bebe",
                                    justifyContent: "center",
                                    flexDirection: "row",
                                    alignItems: "center",
                                    borderRadius: 50,
                                }}>
                                <ArrowComponent
                                    horizontalBreak={0}
                                    verticalSlope={0}
                                    selected={largeMiss.dir === "tr"}
                                ></ArrowComponent>
                            </Pressable>
                            <Pressable
                                onPress={() => setMissDirection("mr")}
                                style={{
                                    aspectRatio: 1,
                                    padding: 20,
                                    backgroundColor: largeMiss.dir === "mr" ? colors.button.danger.background : "#f3bebe",
                                    justifyContent: "center",
                                    flexDirection: "row",
                                    alignItems: "center",
                                    borderRadius: 50,
                                }}>
                                <ArrowComponent
                                    horizontalBreak={0}
                                    verticalSlope={1}
                                    selected={largeMiss.dir === "mr"}
                                ></ArrowComponent>
                            </Pressable>
                            <Pressable
                                onPress={() => setMissDirection("br")}
                                style={{
                                    aspectRatio: 1,
                                    padding: 20,
                                    backgroundColor: largeMiss.dir === "br" ? colors.button.danger.background : "#f3bebe",
                                    justifyContent: "center",
                                    flexDirection: "row",
                                    alignItems: "center",
                                    borderRadius: 50,
                                }}>
                                <ArrowComponent
                                    horizontalBreak={0}
                                    verticalSlope={2}
                                    selected={largeMiss.dir === "br"}
                                ></ArrowComponent>
                            </Pressable>
                        </View>
                    </View>
                    <View style={{
                        flexDirection: "column", width: "100%", alignItems: "center", justifyContent: "flex-end",
                        marginBottom: 8
                    }}>
                        <FontText style={{fontSize: 18, color: colors.text.primary, marginBottom: 10,}}>
                            Estimated distance missed ({userData.preferences.units === 0 ? "ft" : "m"}):
                        </FontText>
                        <View style={{
                            flexDirection: "row", gap: 12, marginBottom: 12, alignItems: "center",
                        }}>
                            <PrimaryButton style={{
                                aspectRatio: 1, paddingHorizontal: 4, paddingVertical: 4, borderRadius: 16, flex: 0
                            }} onPress={() => {
                                if (distance === -1) updateDistance("99"); else if (distance <= userData.preferences.units === 0 ? 3 : 1) updateDistance("99"); else updateDistance((distance - 1).toString());
                            }}>
                                <Svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={3}
                                    stroke={colors.button.primary.text}
                                    width={18}
                                    height={18}>
                                    <Path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14"/>
                                </Svg>
                            </PrimaryButton>
                            <BottomSheetTextInput
                                style={{
                                    width: 36,
                                    textAlign: "center",
                                    borderWidth: 1,
                                    borderColor: distanceFocused ? distanceInvalid ? colors.input.invalid.focusedBorder : colors.input.focused.border : distanceInvalid ? colors.input.invalid.border : colors.input.border,
                                    borderRadius: 10,
                                    paddingVertical: 6,
                                    fontSize: 16,
                                    color: colors.input.text,
                                    backgroundColor: distanceInvalid ? colors.input.invalid.background : distanceFocused ? colors.input.focused.background : colors.input.background,
                                }}
                                onFocus={() => setDistanceFocused(true)}
                                onBlur={() => setDistanceFocused(false)}
                                onChangeText={(text) => updateDistance(text)}
                                defaultValue={largeMiss.distance !== -1 ? largeMiss.distance.toString() : ""}
                                keyboardType={Platform.OS === 'android' ? "numeric" : "number-pad"}
                            />
                            <PrimaryButton style={{
                                aspectRatio: 1, paddingHorizontal: 4, paddingVertical: 4, borderRadius: 16, flex: 0
                            }} onPress={() => {
                                if (largeMiss.distance === -1) updateDistance(userData.preferences.units === 0 ? "3" : "1"); else if (largeMiss.distance >= 99) updateDistance(userData.preferences.units === 0 ? "3" : "1"); else updateDistance((largeMiss.distance + 1).toString());
                            }}>
                                <Svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={3}
                                    stroke={colors.button.primary.text}
                                    width={18}
                                    height={18}
                                >
                                    <Path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 4.5v15m7.5-7.5h-15"
                                    />
                                </Svg>
                            </PrimaryButton>
                        </View>
                    </View>
                    <View style={{
                        flexDirection: "column", width: "100%", alignItems: "center", justifyContent: "flex-end"
                    }}>
                        <FontText style={{fontSize: 18, color: colors.text.primary, marginBottom: 10}}>
                            Total putts to complete the hole:
                        </FontText>
                        <View style={{flexDirection: "row", gap: 12, marginBottom: 8, alignItems: "center",}}>
                            <PrimaryButton style={{
                                aspectRatio: 1, paddingHorizontal: 4, paddingVertical: 4, borderRadius: 16, flex: 0
                            }} onPress={() => {
                                if (putts === -1 || putts <= 2) setPutts(9);
                                else setPutts(putts - 1);
                            }}>
                                <Svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={3}
                                    stroke={colors.button.primary.text}
                                    width={18}
                                    height={18}
                                >
                                    <Path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14"/>
                                </Svg>
                            </PrimaryButton>
                            <BottomSheetTextInput
                                style={{
                                    width: 36,
                                    textAlign: "center",
                                    borderWidth: 1,
                                    borderColor: puttsFocused ? invalid ? colors.input.invalid.focusedBorder : colors.input.focused.border : invalid ? colors.input.invalid.border : colors.input.border,
                                    borderRadius: 10,
                                    paddingVertical: 6,
                                    fontSize: 16,
                                    color: colors.input.text,
                                    backgroundColor: invalid ? colors.input.invalid.background : puttsFocused ? colors.input.focused.background : colors.input.background,
                                }}
                                onFocus={() => setPuttsFocused(true)}
                                onBlur={() => setPuttsFocused(false)}
                                onChangeText={updatePutts}
                                defaultValue={putts !== -1 ? putts + "" : ""}
                                keyboardType={Platform.OS === 'android' ? "numeric" : "number-pad"}
                            />
                            <PrimaryButton style={{
                                aspectRatio: 1, paddingHorizontal: 4, paddingVertical: 4, borderRadius: 16, flex: 0
                            }} onPress={() => {
                                if (putts === -1) updatePutts("2"); else if (putts >= 9) updatePutts("2"); else updatePutts((putts + 1).toString());
                            }}>
                                <Svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={3}
                                    stroke={colors.button.primary.text}
                                    width={18}
                                    height={18}
                                >
                                    <Path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 4.5v15m7.5-7.5h-15"
                                    />
                                </Svg>
                            </PrimaryButton>
                        </View>
                    </View>
                    <View style={{flexDirection: "row", gap: 12}}>
                        <PrimaryButton
                            onPress={() => {
                                if (hole !== 1) {
                                    setTransitioningBack(true);
                                    lastHole();
                                }
                            }}
                            disabled={hole === 1}
                            title={"Back"}
                        ></PrimaryButton>
                        <PrimaryButton
                            onPress={() => {
                                if (largeMiss.dir !== "" && !invalid && putts.length !== 0 && largeMiss.distance > 0 && !distanceInvalid) {
                                    puttTrackingModalRef.current?.largeMiss();
                                    bottomSheetRef.current?.dismiss();
                                }
                            }}
                            disabled={largeMiss.dir === "" || invalid || putts === -1 || largeMiss.distance < 1 || distanceInvalid}
                            title={"Save"}
                        ></PrimaryButton>
                    </View>
                </View>
            </BottomSheetView>
        </TouchableWithoutFeedback>
    </BottomSheetModal>);
}
