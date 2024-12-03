import React, {useState} from 'react';
import {View, Text, Pressable} from 'react-native';
import {
    BottomSheetModal,
    BottomSheetView,
} from '@gorhom/bottom-sheet';
import useColors from "@/hooks/useColors";
import Svg, {Path} from "react-native-svg";
import {PrimaryButton} from "@/components/buttons/PrimaryButton";

const SlopePopup = ({slopeRef, slope, setSlope}) => {
    const colors = useColors();

    // renders
    return (
        <BottomSheetModal enableDismissOnClose={true}
                          stackBehavior={"replace"}
                          ref={slopeRef}
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
                }}>Filter By Slope</Text>
                <View style={{flexDirection: "row", gap: 12}}>
                    <Pressable onPress={() => setSlope(-1)} style={{
                        flex: 1,
                        borderWidth: 1,
                        borderColor: slope === -1 ? colors.toggleable.toggled.border : colors.toggleable.border,
                        borderRadius: 12,
                        paddingHorizontal: 8,
                        paddingVertical: 10,
                        backgroundColor: slope === -1 ? colors.toggleable.toggled.background : colors.toggleable.background
                    }}>
                        {slope === -1 && <View style={{
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
                    <Pressable onPress={() => setSlope(0)} style={{
                        flex: 1,
                        borderWidth: 1,
                        borderColor: slope === 0 ? colors.toggleable.toggled.border : colors.toggleable.border,
                        borderRadius: 12,
                        paddingHorizontal: 8,
                        paddingVertical: 10,
                        backgroundColor: slope === 0 ? colors.toggleable.toggled.background : colors.toggleable.background
                    }}>
                        {slope === 0 && <View style={{
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
                        <Text style={{textAlign: "center", color: colors.text.primary, fontSize: 16}}>Downhill</Text>
                    </Pressable>
                </View>
                <View style={{flexDirection: "row", gap: 12}}>
                    <Pressable onPress={() => setSlope(1)} style={{
                        flex: 1,
                        borderWidth: 1,
                        borderColor: slope === 1 ? colors.toggleable.toggled.border : colors.toggleable.border,
                        borderRadius: 12,
                        paddingHorizontal: 8,
                        paddingVertical: 10,
                        backgroundColor: slope === 1 ? colors.toggleable.toggled.background : colors.toggleable.background
                    }}>
                        {slope === 1 && <View style={{
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
                        <Text style={{textAlign: "center", color: colors.text.primary, fontSize: 16}}>Neutral</Text>
                    </Pressable>
                    <Pressable onPress={() => setSlope(2)} style={{
                        flex: 1,
                        borderWidth: 1,
                        borderColor: slope === 2 ? colors.toggleable.toggled.border : colors.toggleable.border,
                        borderRadius: 12,
                        paddingHorizontal: 8,
                        paddingVertical: 10,
                        backgroundColor: slope === 2 ? colors.toggleable.toggled.background : colors.toggleable.background
                    }}>
                        {slope === 2 && <View style={{
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
                        <Text style={{textAlign: "center", color: colors.text.primary, fontSize: 16}}>Uphill</Text>
                    </Pressable>
                </View>
                <PrimaryButton title={"Close"} onPress={() => slopeRef.current.close()}/>
            </BottomSheetView>
        </BottomSheetModal>
    );
};

export default SlopePopup;