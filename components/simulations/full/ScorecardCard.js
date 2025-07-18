import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import Svg, {Circle, Path, Rect} from "react-native-svg";
import useColors from "../../../hooks/useColors";
import {DarkTheme} from "@/constants/ModularColors"; // or define a local colors object

const ScorecardCard = ({scorecardRef, holes, setHoleNumber, front = true}) => {
    const colors = useColors();

    const data = holes;

    // const holes = [
    //     {
    //         par: 4,
    //         score: 4,
    //     },
    //     {
    //         par: 3,
    //         score: 3,
    //     },
    //     {
    //         par: 5,
    //         score: 6,
    //     },
    //     {
    //         par: 4,
    //         score: 5,
    //     },
    //     {
    //         par: 4,
    //         score: 4,
    //     },
    //     {
    //         par: 3,
    //         score: 2,
    //     },
    //     {
    //         par: 5,
    //         score: 7,
    //     },
    //     {
    //         par: 4,
    //         score: 4,
    //     },
    //     {
    //         par: 3,
    //         score: 3,
    //     },
    //     {
    //         par: 4,
    //         score: 8,
    //     },
    //     {
    //         par: 4,
    //         score: 4,
    //     },
    //     {
    //         par: 5,
    //         score: 7,
    //     },
    //     {
    //         par: 4,
    //         score: 5,
    //     },
    //     {
    //         par: 4,
    //         score: 4,
    //     },
    //     {
    //         par: 3,
    //         score: 1
    //     },
    //     {
    //         par: 4,
    //         score: 4,
    //     },
    //     {
    //         par: 3,
    //         score: 2
    //     },
    //     {
    //         par: 3,
    //         score: 2
    //     }
    // ]
    // find the + / - over par
    if (!holes || holes.length === 0) return <></>

    const totalScore = data.reduce((acc, hole) => hole.puttData ? acc + hole.score : acc, 0);
    const totalPar = data.reduce((acc, hole) => hole.puttData ? acc + hole.par : acc, 0);
    const toPar = totalScore - totalPar;

    const frontNineScore = data.slice(0, 9).reduce((acc, hole) => hole.puttData ? acc + hole.score : acc, 0);
    const backNineScore = data.length > 9 ? data.slice(9).reduce((acc, hole) => hole.puttData ? acc + hole.score : acc, 0) : 0;

    const frontNine = data.slice(0, Math.min(9, data.length));
    const backNine = data.length > 9 ? data.slice(9) : [];

    return (
        <View style={{
            backgroundColor: "#0B0B0B",
            borderRadius: 16,
            padding: 16,
            marginTop: 20
        }}>
            {/* Top Row */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
                <View>
                    <Text style={{ color: DarkTheme.text.secondary, fontSize: 16, fontWeight: "bold" }}>To Par</Text>
                    <Text style={{ color: DarkTheme.text.primary, fontSize: 24, fontWeight: "bold" }}>{toPar > 0 ? `+${toPar}` : toPar === 0 ? "E" : toPar}</Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                    <Text style={{ color: DarkTheme.text.secondary, fontSize: 16, fontWeight: "bold" }}>Gross</Text>
                    <Text style={{ color: DarkTheme.text.primary, fontSize: 24, fontWeight: "bold" }}>{totalScore}</Text>
                </View>
            </View>

            {/* Score Rows */}
            {[frontNine, backNine].filter(nine => nine.length > 0).map((nine, index) => (
                <View key={index} style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 6,
                    justifyContent: "space-between"
                }}>
                    {nine.map((hole, i) => (
                        <Pressable onPress={() => {
                            setHoleNumber(data.length === 9 ? front ? i + 1 : i + 10 : i + 1 + (index === 0 ? 0 : 9));
                            scorecardRef.current.dismiss();
                        }} key={i} style={{
                            justifyContent: "center",
                            alignItems: "center",
                            gap: 4
                        }}>
                            <Text style={{ color: DarkTheme.text.secondary, fontSize: 12 }}>
                                {data.length === 9 ?
                                    front ? i + 1 : i + 10
                                    : i + 1 + (index === 0 ? 0 : 9)}
                            </Text>
                            <View style={{
                                width: 28,
                                height: 28,
                                justifyContent: "center",
                                alignItems: "center"
                            }}>
                                <Text style={{ color: hole.puttData ? "white" : colors.text.secondary, fontSize: 18, fontWeight: 600 }}>{hole.puttData ? hole.score : "?"}</Text>
                                { hole.score > hole.par && (
                                    Array.from({ length: Math.min(hole.score - hole.par, 3) }).map((_, i) => (
                                        <Svg
                                            key={`bogey-${i}`}
                                            width={40}
                                            height={40}
                                            style={{position: "absolute"}}
                                        >
                                            <Rect
                                                x={10 - (2.5 * i)}
                                                y={10 - (2.5 * i)}
                                                width={20 + (5 * i)}
                                                height={20 + (5 * i)}
                                                stroke={colors.border.default}
                                                strokeWidth={i === 2 && hole.score - hole.par > 3 ? 2 : 1.5}
                                                fill="none"
                                            />
                                        </Svg>
                                    ))
                                )}
                                { hole.score < hole.par && (
                                    Array.from({ length: hole.par-hole.score }).map((_, i) => (
                                        <Svg
                                            key={`birdie-${i}`}
                                            width={30}
                                            height={30}
                                            style={{ position: "absolute" }}
                                        >
                                            <Circle
                                                cx={15}
                                                cy={15}
                                                r={11 + (3 * i)}
                                                stroke={colors.border.default}
                                                strokeWidth={1.5}
                                                fill="none"
                                            />
                                        </Svg>
                                    ))
                                )}
                            </View>
                        </Pressable>
                    ))}
                    <Text style={{
                        color: "white",
                        fontWeight: "bold",
                        fontSize: 20,
                        marginLeft: 8,
                        width: 30,
                        textAlign: "center"
                    }}>{index === 0 ? frontNineScore : backNineScore}</Text>
                </View>
            ))}
        </View>
    );
};

export default ScorecardCard;