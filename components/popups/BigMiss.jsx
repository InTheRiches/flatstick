import React, {useCallback, useEffect, useState} from "react";
import {Keyboard, Platform, Pressable, Text, TextInput, View} from "react-native";
import {BottomSheetModal, BottomSheetTextInput, BottomSheetView} from "@gorhom/bottom-sheet";
import useColors from "@/hooks/useColors";
import CustomBackdrop from "@/components/popups/CustomBackdrop";
import ArrowComponent from "@/components/icons/ArrowComponent";
import {PrimaryButton} from "@/components/buttons/PrimaryButton";
import Svg, {Path} from "react-native-svg";

export default function BigMissModal({
                                         updateField, rawLargeMissBy, bigMissRef, nextHole, lastHole, allPutts, hole,
                                     }) {
    const colors = useColors();

    const [open, setOpen] = useState(false);
    const [transitioningBack, setTransitioningBack] = useState(false);

    const [putts, setPutts] = useState(-1);
    const [puttsFocused, setPuttsFocused] = useState(false);
    const [invalid, setInvalid] = useState(false);

    const [distance, setDistance] = useState(-1);
    const [distanceFocused, setDistanceFocused] = useState(false);
    const [distanceInvalid, setDistanceInvalid] = useState(false);

    const [largeMissBy, setLargeMissBy] = useState([0, 0]);

    const [intervalId, setIntervalId] = useState(null);

    useEffect(() => {
        if (allPutts[hole - 1] && allPutts[hole - 1].largeMiss) {
            setPutts(allPutts[hole - 1].totalPutts);
            setDistance(allPutts[hole - 1].distanceMissed);

            bigMissRef.current.present();

            // rawLargeMissBy can be like [~,0], [0,-~] with ~ being any number, so we need to convert it to [0,0] or [1,1] etc
            let fixedLargeMissBy = [0, 0];
            if (rawLargeMissBy[0] > 0) {
                fixedLargeMissBy[0] = 1;
            } else if (rawLargeMissBy[0] < 0) {
                fixedLargeMissBy[0] = -1;
            }

            if (rawLargeMissBy[1] > 0) {
                fixedLargeMissBy[1] = 1;
            } else if (rawLargeMissBy[1] < 0) {
                fixedLargeMissBy[1] = -1;
            }

            setLargeMissBy(fixedLargeMissBy);
        } else if (allPutts[hole - 1] && !allPutts[hole - 1].largeMiss) {
            bigMissRef.current.dismiss();
            close();
        } else if (!allPutts[hole - 1]) {
            setPutts(-1);
            setDistance(-1);
            bigMissRef.current.dismiss();
        }
    }, [hole]);

    const setMissDirection = (direction) => {
        setLargeMissBy(direction);
        updateField("largeMissBy", direction);
    };

    const myBackdrop = useCallback(({animatedIndex, style}) => {
        return (<CustomBackdrop
            open={true}
            reference={bigMissRef}
            animatedIndex={animatedIndex}
            style={style}
        />);
    }, []);

    const isEqual = (arr, arr2) => Array.isArray(arr) && arr.length === arr2.length && arr.every((val, index) => val === arr2[index]);

    const close = () => {
        if (transitioningBack) {
            setTransitioningBack(false);
            return;
        }

        Keyboard.dismiss();

        updateField("largeMissBy", [0, 0]);
        updateField("largeMiss", false);

        setPutts(-1);
        setDistance(-1);
        setLargeMissBy([0, 0]);

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

        let fixedPutts = parseInt(newPutts.replace(/[^0-9]/g, ""));
        setInvalid(fixedPutts < 2 || fixedPutts > 9)
        setPutts(fixedPutts);
    };

    const updateDistance = (newDistance) => {
        if (newDistance === "") {
            setPutts(-1);
            setInvalid(true);
            return;
        }
        if (newDistance.match(/[^0-9]/g)) {
            setInvalid(true);
            return;
        }

        let fixedDistance = parseInt(newDistance.replace(/[^0-9]/g, ""));
        setDistanceInvalid(fixedDistance < 3 || fixedDistance > 99)
        setDistance(fixedDistance);
    }

    // renders
    return (<BottomSheetModal
        ref={bigMissRef}
        backdropComponent={myBackdrop}
        onChange={() => {
            if (open) {
                close();
            }
            setOpen(!open);
        }}
        backgroundStyle={{backgroundColor: colors.background.secondary}}
    >
        <BottomSheetView
            style={{
                paddingBottom: 12, backgroundColor: colors.background.secondary,
            }}
        >
            <View
                style={{
                    paddingHorizontal: 24, flexDirection: "column", alignItems: "center",
                }}
            >
                <View
                    style={{
                        flexDirection: "row", gap: 12, alignItems: "center", marginBottom: 8,
                    }}
                >
                    <View
                        style={{
                            height: 32,
                            aspectRatio: 1,
                            alignItems: "center",
                            flexDirection: "row",
                            justifyContent: "center",
                            borderRadius: 50,
                            backgroundColor: colors.button.danger.background,
                        }}
                    >
                        <Text style={{color: "white", fontWeight: 600, fontSize: 24}}>
                            !
                        </Text>
                    </View>
                    <Text
                        style={{
                            fontSize: 26, fontWeight: 600, color: colors.text.primary, textAlign: "left",
                        }}
                    >
                        Miss &gt;3ft
                    </Text>
                </View>
                <Text
                    style={{
                        fontSize: 16,
                        fontWeight: 400,
                        color: colors.text.secondary,
                        textAlign: "center",
                        width: "70%",
                        marginBottom: 16,
                    }}
                >
                    Putting for the rough, are we? You might need GPS for the next one.
                    Mark where you missed below.
                </Text>
                <View
                    style={{
                        flexDirection: "row", gap: 12, marginBottom: 20, alignSelf: "center",
                    }}
                >
                    <View style={{flexDirection: "column", gap: 12}}>
                        <Pressable
                            onPress={() => setMissDirection([1, 1])}
                            style={{
                                aspectRatio: 1,
                                padding: 20,
                                backgroundColor: isEqual(largeMissBy, [1, 1]) ? colors.button.danger.background : colors.button.danger.disabled.background,
                                justifyContent: "center",
                                flexDirection: "row",
                                alignItems: "center",
                                borderRadius: 50,
                            }}
                        >
                            <ArrowComponent
                                horizontalBreak={1}
                                verticalSlope={0}
                                selected={isEqual(largeMissBy, [1, 1])}
                            ></ArrowComponent>
                        </Pressable>
                        <Pressable
                            onPress={() => setMissDirection([1, 0])}
                            style={{
                                aspectRatio: 1,
                                padding: 20,
                                backgroundColor: isEqual(largeMissBy, [1, 0]) ? colors.button.danger.background : colors.button.danger.disabled.background,
                                justifyContent: "center",
                                flexDirection: "row",
                                alignItems: "center",
                                borderRadius: 50,
                            }}
                        >
                            <ArrowComponent
                                horizontalBreak={1}
                                verticalSlope={1}
                                selected={isEqual(largeMissBy, [1, 0])}
                            ></ArrowComponent>
                        </Pressable>
                        <Pressable
                            onPress={() => setMissDirection([1, -1])}
                            style={{
                                aspectRatio: 1,
                                padding: 20,
                                backgroundColor: isEqual(largeMissBy, [1, -1]) ? colors.button.danger.background : colors.button.danger.disabled.background,
                                justifyContent: "center",
                                flexDirection: "row",
                                alignItems: "center",
                                borderRadius: 50,
                            }}
                        >
                            <ArrowComponent
                                horizontalBreak={1}
                                verticalSlope={2}
                                selected={isEqual(largeMissBy, [1, -1])}
                            ></ArrowComponent>
                        </Pressable>
                    </View>
                    <View
                        style={{
                            flexDirection: "column", justifyContent: "space-between",
                        }}
                    >
                        <Pressable
                            onPress={() => setMissDirection([0, 1])}
                            style={{
                                aspectRatio: 1,
                                padding: 20,
                                backgroundColor: isEqual(largeMissBy, [0, 1]) ? colors.button.danger.background : colors.button.danger.disabled.background,
                                justifyContent: "center",
                                flexDirection: "row",
                                alignItems: "center",
                                borderRadius: 50,
                            }}
                        >
                            <ArrowComponent
                                horizontalBreak={2}
                                verticalSlope={0}
                                selected={isEqual(largeMissBy, [0, 1])}
                            ></ArrowComponent>
                        </Pressable>
                        <Pressable
                            onPress={() => setMissDirection([0, -1])}
                            style={{
                                aspectRatio: 1,
                                padding: 20,
                                backgroundColor: isEqual(largeMissBy, [0, -1]) ? colors.button.danger.background : colors.button.danger.disabled.background,
                                justifyContent: "center",
                                flexDirection: "row",
                                alignItems: "center",
                                borderRadius: 50,
                            }}
                        >
                            <ArrowComponent
                                horizontalBreak={2}
                                verticalSlope={2}
                                selected={isEqual(largeMissBy, [0, -1])}
                            ></ArrowComponent>
                        </Pressable>
                    </View>
                    <View style={{flexDirection: "column", gap: 12}}>
                        <Pressable
                            onPress={() => setMissDirection([-1, 1])}
                            style={{
                                aspectRatio: 1,
                                padding: 20,
                                backgroundColor: isEqual(largeMissBy, [-1, 1]) ? colors.button.danger.background : colors.button.danger.disabled.background,
                                justifyContent: "center",
                                flexDirection: "row",
                                alignItems: "center",
                                borderRadius: 50,
                            }}
                        >
                            <ArrowComponent
                                horizontalBreak={0}
                                verticalSlope={0}
                                selected={isEqual(largeMissBy, [-1, 1])}
                            ></ArrowComponent>
                        </Pressable>
                        <Pressable
                            onPress={() => setMissDirection([-1, 0])}
                            style={{
                                aspectRatio: 1,
                                padding: 20,
                                backgroundColor: isEqual(largeMissBy, [-1, 0]) ? colors.button.danger.background : colors.button.danger.disabled.background,
                                justifyContent: "center",
                                flexDirection: "row",
                                alignItems: "center",
                                borderRadius: 50,
                            }}
                        >
                            <ArrowComponent
                                horizontalBreak={0}
                                verticalSlope={1}
                                selected={isEqual(largeMissBy, [-1, 0])}
                            ></ArrowComponent>
                        </Pressable>
                        <Pressable
                            onPress={() => setMissDirection([-1, -1])}
                            style={{
                                aspectRatio: 1,
                                padding: 20,
                                backgroundColor: isEqual(largeMissBy, [-1, -1]) ? colors.button.danger.background : colors.button.danger.disabled.background,
                                justifyContent: "center",
                                flexDirection: "row",
                                alignItems: "center",
                                borderRadius: 50,
                            }}
                        >
                            <ArrowComponent
                                horizontalBreak={0}
                                verticalSlope={2}
                                selected={isEqual(largeMissBy, [-1, -1])}
                            ></ArrowComponent>
                        </Pressable>
                    </View>
                </View>
                <View style={{
                    flexDirection: "column", width: "100%", alignItems: "center", justifyContent: "flex-end"
                }}>
                    <Text
                        style={{
                            fontSize: 18, color: colors.text.primary, marginBottom: 10,
                        }}
                    >
                        Total putts to complete the hole:
                    </Text>
                    <View
                        style={{
                            flexDirection: "row", gap: 12, marginBottom: 8, alignItems: "center",
                        }}
                    >
                        <PrimaryButton style={{
                            aspectRatio: 1, paddingHorizontal: 4, paddingVertical: 4, borderRadius: 16, flex: 0
                        }} onPress={() => {
                            if (putts === -1) setPutts(9);
                            else if (putts === 2) setPutts(9);
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
                            onChangeText={(text) => updatePutts(text)}
                            value={putts !== -1 ? putts.toString() : ""}
                            defaultValue={putts !== -1 ? putts.toString() : ""}
                            keyboardType={Platform.OS === 'android' ? "numeric" : "number-pad"}
                        />
                        <PrimaryButton style={{
                            aspectRatio: 1, paddingHorizontal: 4, paddingVertical: 4, borderRadius: 16, flex: 0
                        }} onPress={() => {
                            if (putts === -1) setPutts(2); else if (putts === 9) setPutts(2); else setPutts(putts + 1);
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
                    flexDirection: "column", width: "100%", alignItems: "center", justifyContent: "flex-end",
                    marginBottom: 8
                }}>
                    <Text
                        style={{
                            fontSize: 18, color: colors.text.primary, marginBottom: 10,
                        }}
                    >
                        Estimated distance missed (ft):
                    </Text>
                    <View
                        style={{
                            flexDirection: "row", gap: 12, marginBottom: 12, alignItems: "center",
                        }}
                    >
                        <PrimaryButton style={{
                            aspectRatio: 1, paddingHorizontal: 4, paddingVertical: 4, borderRadius: 16, flex: 0
                        }} onPress={() => {
                            if (distance === -1) updateDistance("99"); else if (distance === 2) updateDistance("99"); else updateDistance((distance - 1).toString());
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
                        <TextInput
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
                            value={distance !== -1 ? distance.toString() : ""}
                            defaultValue={distance !== -1 ? distance.toString() : ""}
                            keyboardType={Platform.OS === 'android' ? "numeric" : "number-pad"}
                        />
                        <PrimaryButton style={{
                            aspectRatio: 1, paddingHorizontal: 4, paddingVertical: 4, borderRadius: 16, flex: 0
                        }} onPress={() => {
                            if (distance === -1) updateDistance("2"); else if (distance === 99) updateDistance("2"); else updateDistance((distance + 1).toString());
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
                            if (!isEqual(largeMissBy, [0, 0]) && !invalid && putts.length !== 0 && distance.length !== 0 && !distanceInvalid) {
                                nextHole(parseInt(putts), parseInt(distance));
                                console.log("running")
                            }
                        }}
                        disabled={isEqual(largeMissBy, [0, 0]) || invalid || putts === -1 || distance === -1 || distanceInvalid}
                        title={"Submit"}
                    ></PrimaryButton>
                </View>
            </View>
        </BottomSheetView>
    </BottomSheetModal>);
}
