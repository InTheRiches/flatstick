import useColors from "../../hooks/useColors";
import {Animated, Pressable, View} from "react-native";
import {Gesture, GestureDetector} from "react-native-gesture-handler";
import {runOnJS} from "react-native-reanimated";
import Svg, {Path} from "react-native-svg";
import React, {useEffect, useMemo} from "react";
import FontText from "../general/FontText";

// Make sure there is a max of like 5 putters
export function GripSelector({id, name, stats, selectedGrip, setSelectedGrip, editing, setEditing, onDelete}) {
    const colors = useColors();
    const shakeAnimation = new Animated.Value(-1);
    const shakeSequence = Animated.loop(
        Animated.sequence([
            Animated.timing(shakeAnimation, {
                toValue: 1,
                duration: 100, // Animation duration in milliseconds
                useNativeDriver: true,
            }),
            Animated.timing(shakeAnimation, {
                toValue: -1,
                duration: 100, // Animation duration in milliseconds
                useNativeDriver: true,
            })
        ])
    );

    const combinedStats = useMemo(() => {
        if (!stats) return {holesPlayed: 18, totalPutts: 0, strokesGained: {expectedStrokes: 0}, rounds: 1};
        let combined = [];
        Object.keys(stats).forEach(m => {
            if (stats[m]) {
                combined = combined.concat(stats[m]);
            }
        });
        return combined[0];
    }, [stats]);

    // make a composite gesture
    const hold = Gesture.LongPress().onStart((data) => {
        runOnJS(setEditing)(!editing);
    });

    const tap = Gesture.Tap().onStart((data) => {
        if (editing) return;
        runOnJS(setSelectedGrip)(id)
    })

    const gesture = useMemo(() => {
        if (id === 0) return tap;
        else return Gesture.Race(hold, tap);
    }, [id]);

    useEffect(() => {
        if (editing && id !== 0) {
            startShake();
        } else {
            stopShake();
        }
    }, [editing]);

    const startShake = () => {
        shakeSequence.start();
    }

    const stopShake = () => {
        shakeSequence.stop();
    }

    return (
        <GestureDetector key={id + "_grip"} gesture={gesture}>
            <Animated.View style={{
                transform: [{translateX: shakeAnimation}],
                flexDirection: "row",
                width: "100%",
                gap: 12,
                borderWidth: 1,
                borderRadius: 10,
                borderColor: selectedGrip === id ? colors.checkmark.background : colors.toggleable.border,
                backgroundColor: colors.background.secondary,
                paddingHorizontal: 12,
                paddingVertical: 10,
                marginBottom: 12,
                alignItems: "center"}}>
                <View style={{flexDirection: "column", flex: 1}}>
                    <FontText style={{fontSize: id !== 0 ? 16 : 18, color: colors.text.primary, fontWeight: 500}}>{name}</FontText>
                    {   id !== 0 && (
                            <View style={{flexDirection: "row", width: "100%", justifyContent: "flex-start", alignItems: "center"}}>
                                <FontText style={{color: colors.text.secondary, width: "40%"}}>Rounds: {combinedStats.rounds}</FontText>
                                <FontText style={{color: colors.text.secondary}}>Strokes Gained: {combinedStats.holesPlayed === 0 ? "?" : (combinedStats.strokesGained.expectedStrokes - combinedStats.totalPutts) / (combinedStats.holesPlayed / 18)}</FontText>
                            </View>
                        )
                    }
                </View>
                <Svg style={{opacity: selectedGrip === id ? 1 : 0}} width={30} height={30} stroke={colors.checkmark.background} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="3">
                    <Path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5"/>
                </Svg>
                {
                    editing && id !== 0 && (
                        <Pressable onPress={() => onDelete(id)} style={{
                            position: "absolute",
                            right: -10,
                            top: -10,
                            backgroundColor: colors.button.danger.background,
                            padding: 3,
                            borderRadius: 50,
                        }}>
                            <Svg
                                width={24}
                                height={24}
                                stroke={colors.button.danger.text}
                                xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}>
                                <Path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12"/>
                            </Svg>
                        </Pressable>
                    )
                }
            </Animated.View>
        </GestureDetector>
    )
}