import FontText from "../../general/FontText";
import {Pressable, View} from "react-native";
import Svg, {Circle, Line, Rect} from "react-native-svg";
import React from "react";
import useColors from "../../../hooks/useColors";

export default function ScoreIncrementer({adjustScore, holeScore, hole, tee}) {
    const colors = useColors();

    return (
        <View style={{alignItems: "center", flex: 1}}>
            <FontText
                style={{
                    fontSize: 18,
                    fontWeight: 500,
                    marginTop: 12,
                    marginBottom: 8,
                    textAlign: "center",
                }}>
                Score
            </FontText>

            <View
                style={{
                    borderWidth: 1,
                    borderColor: colors.border.default,
                    padding: 12,
                    borderRadius: 64,
                    backgroundColor: colors.background.secondary,
                    flexDirection: "column",
                    gap: 16,
                    alignItems: "center",
                }}
            >
                {/* Plus Button */}
                <Pressable
                    onPress={() => adjustScore(1)}
                    style={({pressed}) => [
                        {
                            width: 48,
                            height: 48,
                            borderWidth: holeScore > 8 ? 1 : 0,
                            borderColor: colors.border.default,
                            borderRadius: 32,
                            backgroundColor: holeScore > 8 ? colors.background.secondary :
                                pressed
                                    ? colors.border.default
                                    : colors.background.primary,
                            alignItems: "center",
                            justifyContent: "center",
                        },
                    ]}
                >
                    <Svg width={32} height={32} viewBox="0 0 24 24">
                        <Line x1="12" y1="5" x2="12" y2="19" stroke="black" strokeWidth="2"/>
                        <Line x1="5" y1="12" x2="19" y2="12" stroke="black" strokeWidth="2"/>
                    </Svg>
                </Pressable>

                {/* Score with concentric indicators */}
                <View
                    style={{
                        position: "relative",
                        width: 40,
                        height: 40,
                        alignItems: "center",
                        justifyContent: "center"
                    }}
                >
                    {/* Background indicators */}
                    {(() => {
                        const par = tee.holes[hole - 1].par;
                        const diff = holeScore - par;
                        const absDiff = Math.abs(diff);
                        const baseSize = 40;
                        const capped = Math.min(absDiff, 3); // Only show 3 max

                        return Array.from({length: capped}).map((_, i) => {
                            const size = baseSize + i * 14;
                            const half = size / 2;
                            const isLast = i === 2 || (i === absDiff - 1 && absDiff < 3);

                            const strokeWidth = isLast && absDiff > 3 ? 4 : 2;

                            if (diff < 0) {
                                // Birdies — green concentric circles
                                return (
                                    <Svg
                                        key={`birdie-${i}`}
                                        width={size}
                                        height={size}
                                        style={{position: "absolute"}}
                                    >
                                        <Circle
                                            cx={half}
                                            cy={half}
                                            r={half - strokeWidth}
                                            stroke="#4CAF50"
                                            strokeWidth={strokeWidth}
                                            fill="none"
                                        />
                                    </Svg>
                                );
                            } else if (diff > 0) {
                                // Bogeys — red concentric squares
                                return (
                                    <Svg
                                        key={`bogey-${i}`}
                                        width={size}
                                        height={size}
                                        style={{position: "absolute"}}
                                    >
                                        <Rect
                                            x={strokeWidth}
                                            y={strokeWidth}
                                            width={size - strokeWidth * 2}
                                            height={size - strokeWidth * 2}
                                            stroke="#F44336"
                                            strokeWidth={strokeWidth}
                                            fill="none"
                                        />
                                    </Svg>
                                );
                            }

                            return null;
                        });
                    })()}

                    {/* Score Text */}
                    <FontText style={{fontSize: 32, fontWeight: 600, transform: [{ translateY: -1.5 }]}}>{holeScore}</FontText>
                </View>

                {/* Minus Button */}
                <Pressable
                    onPress={() => adjustScore(-1)}
                    style={({pressed}) => [
                        {
                            width: 48,
                            height: 48,
                            borderWidth: holeScore < 2 ? 1 : 0,
                            borderColor: colors.border.default,
                            borderRadius: 32,
                            backgroundColor: holeScore < 2 ? colors.background.secondary :
                                pressed
                                    ? colors.border.default
                                    : colors.background.primary,
                            alignItems: "center",
                            justifyContent: "center",
                        },
                    ]}
                >
                    <Svg width={32} height={32} viewBox="0 0 24 24">
                        <Line x1="5" y1="12" x2="19" y2="12" stroke="black" strokeWidth="3"/>
                    </Svg>
                </Pressable>
            </View>
        </View>
    )
}