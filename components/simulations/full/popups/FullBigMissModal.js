import React, {useCallback, useImperativeHandle, useRef, useState} from "react";
import {Keyboard, Platform, Pressable, TouchableWithoutFeedback, View} from "react-native";
import {BottomSheetModal, BottomSheetTextInput, BottomSheetView} from "@gorhom/bottom-sheet";
import useColors from "@/hooks/useColors";
import CustomBackdrop from "@/components/general/popups/CustomBackdrop";
import ArrowComponent from "@/components/general/icons/ArrowComponent";
import {PrimaryButton} from "@/components/general/buttons/PrimaryButton";
import Svg, {Path} from "react-native-svg";
import {useAppContext} from "@/contexts/AppContext";
import FontText from "@/components/general/FontText";
import {Exclamation} from "../../../../assets/svg/SvgComponents";
import {SecondaryButton} from "../../../general/buttons/SecondaryButton";

export function FullBigMissModal({bigMissRef, puttTrackingModalRef, largeMiss, setLargeMiss}) {
    const colors = useColors();
    const {userData} = useAppContext();

    const bottomSheetRef = useRef(null);

    const [open, setOpen] = useState(false);

    const [distanceFocused, setDistanceFocused] = useState(false);
    const [distanceInvalid, setDistanceInvalid] = useState(true);

    useImperativeHandle(bigMissRef, () => ({
        open: () => {
            bottomSheetRef.current?.present();
        },
        close: () => {
            bottomSheetRef.current?.dismiss();
        },
        setData: (data) => {

        },
        resetData: () => {
            setDistanceInvalid(false);
            setDistanceFocused(true);
        }
    }));

    const setMissDirection = (direction) => {
        setLargeMiss({
            ...largeMiss,
            dir: direction,
        });
    };

    const myBackdrop = useCallback(({animatedIndex, style}) => {
        return (<CustomBackdrop
            reference={bottomSheetRef}
            animatedIndex={animatedIndex}
            style={style}
        />);
    }, []);

    const isEqual = (arr, arr2) => Array.isArray(arr) && arr.length === arr2.length && arr.every((val, index) => val === arr2[index]);

    const close = () => {
        Keyboard.dismiss();
        // if the data isnt complete, clear it all
        if (largeMiss.dir === "" || largeMiss.distance === -1 || distanceInvalid) {
            setLargeMiss({
                distance: -1,
                dir: "",
            })
        } else {
            puttTrackingModalRef.current?.largeMiss();
        }
    };

    const updateDistance = (newDistance) => {
        if (newDistance === "") {
            setLargeMiss({
                ...largeMiss,
                distance: -1,
            })
            setDistanceInvalid(true);
            return;
        }
        if (newDistance.match(/[^0-9]/g)) {
            setDistanceInvalid(true);
            return;
        }

        let fixedDistance = parseInt(newDistance);
        setLargeMiss({
            ...largeMiss,
            distance: fixedDistance,
        })
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
                                if (largeMiss.distance === -1) updateDistance("98"); else if (largeMiss.distance <= (userData.preferences.units === 0 ? 3 : 1)) updateDistance("97"); else updateDistance((largeMiss.distance - 1).toString());
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
                    <View style={{flexDirection: "row", gap: 12}}>
                        <PrimaryButton
                            onPress={() => {
                                setDistanceInvalid(false);
                                setDistanceFocused(false);
                                setLargeMiss({
                                    distance: -1,
                                    dir: "",
                                });
                                bottomSheetRef.current?.close();
                            }}
                            title={"Cancel"}
                        ></PrimaryButton>
                        <SecondaryButton
                            onPress={() => {
                                if (largeMiss.dir !== "" && largeMiss.distance.length !== 0 && !distanceInvalid) {
                                    puttTrackingModalRef.current?.largeMiss();
                                    bottomSheetRef.current?.dismiss();
                                }
                            }}
                            disabled={largeMiss.dir === "" || largeMiss.distance === -1 || distanceInvalid}
                            title={"Save"}
                        ></SecondaryButton>
                    </View>
                </View>
            </BottomSheetView>
        </TouchableWithoutFeedback>
    </BottomSheetModal>);
}