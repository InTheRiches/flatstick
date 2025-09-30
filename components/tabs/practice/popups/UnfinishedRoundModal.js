import React, {useCallback, useImperativeHandle, useRef, useState} from "react";
import {Pressable, View} from "react-native";
import {BottomSheetModal, BottomSheetView} from "@gorhom/bottom-sheet";
import useColors from "@/hooks/useColors";
import CustomBackdrop from "@/components/general/popups/CustomBackdrop";
import {PrimaryButton} from "@/components/general/buttons/PrimaryButton";
import {SecondaryButton} from "../../../general/buttons/SecondaryButton";
import FontText from "../../../general/FontText";
import {Exclamation} from "../../../../assets/svg/SvgComponents";
import {useRouter} from "expo-router";

// TODO maybe add a 4th button that automatically uploads the unfinished round as a partial to the db for ease of use
export function UnfinishedRoundModal({ unfinishedRoundRef,  onCancel}) {
    const colors = useColors();
    const bottomSheetRef = useRef(null);
    const colorScheme = "light";
    const router = useRouter();

    const [unfinishedRound, setUnfinishedRound] = useState({});

    useImperativeHandle(unfinishedRoundRef, () => ({
        present: () => {
            bottomSheetRef.current.present();
        },
        dismiss: () => {
            bottomSheetRef.current.dismiss();
        },
        setUnfinishedRound: (unfinishedRound) => {
            console.log("received unfinishedRound", Object.keys(unfinishedRound));
            setUnfinishedRound(unfinishedRound);
        }
    }))
    const myBackdrop = useCallback(({animatedIndex, style}) => {
        return (<CustomBackdrop
            reference={bottomSheetRef}
            animatedIndex={animatedIndex}
            style={style}
        />);
    }, []);

    const onFinish = () => {
        switch(unfinishedRound.type) {
            case "full":
                router.push({pathname: "simulation/full", params: {
                        stringHoles: unfinishedRound.stringHoles,
                        stringTee: unfinishedRound.stringTee,
                        stringFront: unfinishedRound.stringFront,
                        stringCourse: unfinishedRound.stringCourse,
                        stringCurrentHole: unfinishedRound.currentHole,
                        stringHoleHistory: unfinishedRound.holeHistory,
                        stringTimeElapsed: unfinishedRound.timeElapsed
                    }})
                break;
            case "real":
                router.push({pathname: "simulation/real", params: {
                    stringHoles: unfinishedRound.stringHoles,
                    stringFront: unfinishedRound.stringFront,
                    stringCourse: unfinishedRound.stringCourse,
                    stringCurrentHole: unfinishedRound.currentHole,
                    stringHoleHistory: unfinishedRound.holeHistory,
                    stringTimeElapsed: unfinishedRound.timeElapsed
                }});
                break;
        }
    }

    // renders
    return (<BottomSheetModal
        ref={bottomSheetRef}
        backdropComponent={myBackdrop}
        backgroundStyle={{backgroundColor: colors.background.secondary}}
        keyboardBlurBehavior={"restore"}>
        <BottomSheetView style={{paddingBottom: 20, backgroundColor: colors.background.secondary,}}>
            <View style={{
                paddingHorizontal: 32, flexDirection: "column", alignItems: "center",
            }}>
                <View style={{flexDirection: "row", gap: 12, alignItems: "center", marginBottom: 8,}}>
                    <Exclamation width={48} height={48}></Exclamation>
                    <FontText
                        style={{
                            fontSize: 26, fontWeight: 600, color: colors.text.primary, textAlign: "left",
                        }}>
                        Unfinished Session
                    </FontText>
                </View>
                <FontText
                    style={{
                        fontSize: 16,
                        fontWeight: 400,
                        color: colors.text.secondary,
                        textAlign: "center",
                        width: "70%",
                        marginBottom: 16,
                    }}>
                    You have an unfinished session! If you start a new one, that session will be deleted. Are you sure you want to continue?
                </FontText>
                {Object.keys(unfinishedRound).length > 0 && unfinishedRound.type === "full" && (
                    <View>
                        <View>
                            <FontText
                                style={{
                                    fontSize: 14,
                                    textAlign: "left",
                                    fontWeight: 700,
                                    color: colors.text.tertiary,
                                    marginBottom: -2,
                                }}>
                                Course
                            </FontText>
                            <FontText numberOfLines={1} ellipsizeMode="tail"
                                      style={{
                                          fontSize: 20,
                                          color: colors.text.primary,
                                          fontWeight: "bold",
                                          flexShrink: 1, // important for truncation
                                      }}>
                                {JSON.parse(unfinishedRound.stringCourse).course_name}
                            </FontText>
                        </View>
                        <FontText
                            style={{
                                fontSize: 14,
                                textAlign: "right",
                                color: colors.text.tertiary,
                                fontWeight: 700,
                            }}>
                            {new Date(unfinishedRound.timestamp).toLocaleDateString("en-US", {
                                year: "2-digit",
                                month: "2-digit",
                                day: "2-digit",
                            })}
                        </FontText>
                    </View>
                )}
                <View style={{
                    flexDirection: "column", width: "80%", alignItems: "center", justifyContent: "flex-end"
                }}>
                    <Pressable onPress={() => {
                        switch(unfinishedRound.type) {
                            case "full":
                                router.push({pathname: `/simulation/full/setup`})
                                break;
                            case "real":
                                router.push({pathname: `/simulation/real/setup`})
                                break;
                            case "green":
                                router.push({pathname: "/simulation/putting-green/demo", params: {justInfo: true}})
                                break;
                            default:
                                alert("Failed to resume session. Something went wrong.")
                        }
                    }} style={({pressed}) => [{
                        backgroundColor: pressed ? colors.button.danger.depressed : colors.button.danger.background,
                        paddingVertical: 10,
                        borderRadius: 10,
                        marginTop: 16,
                        width: "100%"
                    }]}>
                        <FontText style={{textAlign: "center", color: colors.button.danger.text, fontWeight: 500}}>New Session</FontText>
                    </Pressable>
                    {colorScheme === "light" ?
                        [
                            <PrimaryButton key={"secondary"} onPress={onFinish} title={"Resume Round"}
                                           style={{marginTop: 10, paddingVertical: 10, borderRadius: 10, width: "100%"}}></PrimaryButton>,
                            <PrimaryButton key={"primary"} onPress={onCancel} title={"Cancel"}
                                           style={{marginTop: 10, paddingVertical: 10, borderRadius: 10, width: "100%"}}></PrimaryButton>
                        ]
                        :
                        [
                            <SecondaryButton key={"secondary"} onPress={onFinish} title={"Resume Round"}
                                             style={{marginTop: 10, paddingVertical: 10, borderRadius: 10, width: "100%"}}></SecondaryButton>,
                            <SecondaryButton key={"primary"} onPress={onCancel} title={"Cancel"}
                                             style={{marginTop: 10, paddingVertical: 10, borderRadius: 10, width: "100%"}}></SecondaryButton>
                        ]
                    }
                </View>
            </View>
        </BottomSheetView>
    </BottomSheetModal>);
}
