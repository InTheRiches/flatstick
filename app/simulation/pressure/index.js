import {useRouter} from 'expo-router';
import {View} from 'react-native';
import React, {useState} from 'react';
import Svg, {Path} from 'react-native-svg';
import useColors from "@/hooks/useColors";
import {SecondaryButton} from "../../../components/general/buttons/SecondaryButton";
import {GreenBreakSelector} from '../../../components/simulations/real';
import FontText from "../../../components/general/FontText";

export default function PressurePuttingSetup() {
    const colors = useColors();
    const router = useRouter();

    const [theta, setTheta] = useState(0);

    return (
        <View style={{backgroundColor: colors.background.primary, flexGrow: 1}}>
            <View style={{paddingHorizontal: 24, gap: 32}}>
                <View style={{flexDirection: "col", alignItems: "flex-start", flex: 0, marginBottom: -12}}>
                    <FontText style={{color: colors.text.secondary, fontSize: 16}}>Pressure Putting</FontText>
                    <FontText style={{fontSize: 24, fontWeight: 500, color: colors.text.primary}}>Setup</FontText>
                </View>
                <View>
                    <View style={{flexDirection: "row", justifyContent: "flex-start"}}>
                        <View style={{alignSelf: 'flex-start', paddingRight: 14}}>
                            <FontText style={{
                                fontSize: 20,
                                fontWeight: 500,
                                color: colors.text.primary,
                            }}>Initial
                                Setup</FontText>
                        </View>
                        <View style={{
                            paddingHorizontal: 10,
                            paddingVertical: 2,
                            backgroundColor: colors.stepMarker.background,
                            justifyContent: "center",
                            alignItems: "center",
                            borderRadius: 16,
                        }}>
                            <FontText style={{color: colors.stepMarker.text, fontWeight: 500, fontSize: 12}}>STEP
                                1</FontText>
                        </View>
                    </View>
                    <FontText style={{marginTop: 4, color: colors.text.primary}}>Find a putt, 5ft long, and place 8
                        balls in a circle around the hole.</FontText>
                </View>
                <View>
                    <View style={{flexDirection: "row", justifyContent: "flex-start"}}>
                        <View style={{alignSelf: 'flex-start', paddingRight: 14}}>
                            <FontText style={{
                                fontSize: 20,
                                fontWeight: 500,
                                color: colors.text.primary,
                            }}>Finish
                                Setup</FontText>
                        </View>
                        <View style={{
                            paddingHorizontal: 10,
                            paddingVertical: 2,
                            backgroundColor: colors.stepMarker.background,
                            justifyContent: "center",
                            alignItems: "center",
                            borderRadius: 16,
                        }}>
                            <FontText style={{color: colors.stepMarker.text, fontWeight: 500, fontSize: 12}}>STEP
                                2</FontText>
                        </View>
                    </View>
                    <FontText style={{marginTop: 4, color: colors.text.primary}}>Add two balls to each end, like the
                        picture. It will look like a hurricane.</FontText>
                </View>
                <View style={{
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    marginBottom: 16,
                    backgroundColor: colors.background.secondary,
                    borderRadius: 16,
                    flexDirection: "row", // Ensures horizontal alignment
                }}>
                    <View style={{flex: 1, paddingRight: 8}}>
                        <FontText style={{color: "#D0C597", fontWeight: "500"}}>STEP 4</FontText>
                        <FontText style={{fontSize: 20, fontWeight: "500", color: colors.text.primary}}>
                            Identify Break
                        </FontText>
                        <FontText style={{marginTop: 2, color: colors.text.primary}}>
                            Pick a ball in the initial circle, and rotate the green until it matches the given
                            break. You will
                            start from this ball for the remainder of the simulation. After each putt, move
                            counter-clockwise around the circle.
                        </FontText>
                    </View>
                    <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
                        <GreenBreakSelector theta={theta} setTheta={setTheta}/>
                    </View>
                </View>
                <SecondaryButton onPress={() => {
                    router.push({
                        pathname: `/simulation/pressure`, params: {
                            firstBreak: theta,
                        }
                    })
                }} style={{
                    borderRadius: 50,
                    flexDirection: "row",
                    alignSelf: "center",
                    paddingLeft: 12,
                    gap: 12,
                    paddingRight: 8,
                    paddingVertical: 6
                }}>
                    <FontText style={{color: colors.button.secondary.text, fontSize: 18}}>Continue</FontText>
                    <View style={{
                        borderRadius: 30,
                        padding: 6,
                        backgroundColor: colors.button.secondary.text
                    }}>
                        <Svg width={20} height={20} xmlns="http://www.w3.org/2000/svg" fill="none"
                             viewBox="0 0 24 24" strokeWidth={1.5}
                             stroke={colors.button.secondary.background} className="size-6">
                            <Path strokeLinecap="round" strokeLinejoin="round"
                                  d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25"/>
                        </Svg>
                    </View>
                </SecondaryButton>
            </View>
        </View>
    )
}