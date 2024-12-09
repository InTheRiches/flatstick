import React, {useState} from 'react';
import {View, Text, Pressable} from 'react-native';
import {
    BottomSheetModal,
    BottomSheetView,
} from '@gorhom/bottom-sheet';
import useColors from "@/hooks/useColors";
import {useRouter} from "expo-router";
import Svg, {Path} from "react-native-svg";
import {PrimaryButton} from "@/components/buttons/PrimaryButton";

export default function BreakPopup({breakRef, brek, setBrek}) {
    const colors = useColors();

    // renders
    return (
        <BottomSheetModal enableDismissOnClose={true}
                          stackBehavior={"replace"}
                          ref={breakRef}
                          backgroundStyle={{backgroundColor: colors.background.secondary}}>
            <BottomSheetView
                style={{
                    paddingBottom: 12,
                    marginHorizontal: 24,
                    backgroundColor: colors.background.secondary,
                    gap: 12
                }}>
                <Text style={{
                    marginTop: 12,
                    fontSize: 18,
                    color: colors.text.primary,
                }}>Filter By Break</Text>
                <View style={{flexDirection: "row", gap: 12}}>
                    <Pressable onPress={() => setBrek(-1)} style={{
                        flex: 1,
                        borderWidth: 1,
                        borderColor: brek === -1 ? colors.toggleable.toggled.border : colors.toggleable.border,
                        borderRadius: 12,
                        paddingHorizontal: 8,
                        paddingVertical: 10,
                        backgroundColor: brek === -1 ? colors.toggleable.toggled.background : colors.toggleable.background
                    }}>
                        {brek === -1 && <View style={{
                            position: "absolute",
                            right: -7,
                            top: -7,
                            backgroundColor: "#40C2FF",
                            padding: 3,
                            borderRadius: 50
                        }}>
                            <Svg width={18} height={18} stroke={colors.checkmark.color}
                                 xmlns="http://www.w3.org/2000/svg"
                                 fill="none"
                                 viewBox="0 0 24 24" strokeWidth="3">
                                <Path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5"/>
                            </Svg>
                        </View>}
                        <Text style={{textAlign: "center", color: colors.text.primary, fontSize: 16}}>All</Text>
                    </Pressable>
                    <Pressable onPress={() => setBrek(0)} style={{
                        flex: 1,
                        borderWidth: 1,
                        borderColor: brek === 0 ? colors.toggleable.toggled.border : colors.toggleable.border,
                        borderRadius: 12,
                        paddingHorizontal: 8,
                        paddingVertical: 10,
                        backgroundColor: brek === 0 ? colors.toggleable.toggled.background : colors.toggleable.background
                    }}>
                        {brek === 0 && <View style={{
                            position: "absolute",
                            right: -7,
                            top: -7,
                            backgroundColor: "#40C2FF",
                            padding: 3,
                            borderRadius: 50
                        }}>
                            <Svg width={18} height={18} stroke={colors.checkmark.color}
                                 xmlns="http://www.w3.org/2000/svg"
                                 fill="none"
                                 viewBox="0 0 24 24" strokeWidth="3">
                                <Path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5"/>
                            </Svg>
                        </View>}
                        <Text style={{textAlign: "center", color: colors.text.primary, fontSize: 16}}>Right to
                            Left</Text>
                    </Pressable>
                </View>
                <View style={{flexDirection: "row", gap: 12}}>
                    <Pressable onPress={() => setBrek(1)} style={{
                        flex: 1,
                        borderWidth: 1,
                        borderColor: brek === 1 ? colors.toggleable.toggled.border : colors.toggleable.border,
                        borderRadius: 12,
                        paddingHorizontal: 8,
                        paddingVertical: 10,
                        backgroundColor: brek === 1 ? colors.toggleable.toggled.background : colors.toggleable.background
                    }}>
                        {brek === 1 && <View style={{
                            position: "absolute",
                            right: -7,
                            top: -7,
                            backgroundColor: colors.toggleable.toggled.border,
                            padding: 3,
                            borderRadius: 50
                        }}>
                            <Svg width={18} height={18} stroke={colors.checkmark.color}
                                 xmlns="http://www.w3.org/2000/svg"
                                 fill="none"
                                 viewBox="0 0 24 24" strokeWidth="3">
                                <Path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5"/>
                            </Svg>
                        </View>}
                        <Text style={{textAlign: "center", color: colors.text.primary, fontSize: 16}}>Straight</Text>
                    </Pressable>
                    <Pressable onPress={() => setBrek(2)} style={{
                        flex: 1,
                        borderWidth: 1,
                        borderColor: brek === 2 ? colors.toggleable.toggled.border : colors.toggleable.border,
                        borderRadius: 12,
                        paddingHorizontal: 8,
                        paddingVertical: 10,
                        backgroundColor: brek === 2 ? colors.toggleable.toggled.background : colors.toggleable.background
                    }}>
                        {brek === 2 && <View style={{
                            position: "absolute",
                            right: -7,
                            top: -7,
                            backgroundColor: "#40C2FF",
                            padding: 3,
                            borderRadius: 50
                        }}>
                            <Svg width={18} height={18} stroke={colors.checkmark.color}
                                 xmlns="http://www.w3.org/2000/svg"
                                 fill="none"
                                 viewBox="0 0 24 24" strokeWidth="3">
                                <Path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5"/>
                            </Svg>
                        </View>}
                        <Text style={{textAlign: "center", color: colors.text.primary, fontSize: 16}}>Left to
                            Right</Text>
                    </Pressable>
                </View>
                <PrimaryButton title={"Close"} onPress={() => breakRef.current.close()}/>
            </BottomSheetView>
        </BottomSheetModal>
    );
};