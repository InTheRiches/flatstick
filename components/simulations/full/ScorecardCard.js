import React from "react";
import {Pressable, Text, View} from "react-native";
import Svg, {Circle, Rect} from "react-native-svg";
import useColors from "../../../hooks/useColors";
import {DarkTheme} from "@/constants/ModularColors"; // or define a local colors object

const ScorecardCard = ({scorecardRef, holes, setHoleNumber, front = true}) => {
    const colors = useColors();

    const data = holes;

    // find the + / - over par
    if (!holes || holes.length === 0) return <></>

    const totalScore = data.reduce((acc, hole) => hole.puttData ? acc + hole.score : acc, 0);
    const totalPar = data.reduce((acc, hole) => hole.puttData ? acc + hole.par : acc, 0);
    const toPar = totalScore - totalPar;

    const frontNineScore = data.slice(0, 9).reduce((acc, hole) => hole.puttData ? acc + hole.score : acc, 0);
    const backNineScore = data.length > 9 ? data.slice(9).reduce((acc, hole) => hole.puttData ? acc + hole.score : acc, 0) : 0;

    const padArray = (arr, length, padValue) =>
        arr.length >= length ? arr : [...arr, ...Array(length - arr.length).fill(padValue)];

    const frontNine = padArray(data.slice(0, 9), 9, { score: 0, par: 0});
    const backNine = data.length > 9 ? padArray(data.slice(9, 18), 9, { score: 0, par: 0}) : [];
    // const frontNine = data.slice(0, Math.min(9, data.length));
    // const backNine = data.length > 9 ? data.slice(9) : [];

    return (
        <View style={{
            backgroundColor: "#0B0B0B",
            borderRadius: 16,
            paddingHorizontal: 16,
            paddingVertical: 10,
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
                            if (!setHoleNumber || !scorecardRef.current) return;
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

export const BareScorecardCard = ({data, front = true, roundedBottom = false, roundedTop = true}) => {
    const colors = useColors();

    const totalScore = data.reduce((acc, hole) => hole.score !== -1 ? acc + hole.score : acc, 0);
    const totalPar = data.reduce((acc, hole) => hole.score !== -1 ? acc + hole.par : acc, 0);
    const toPar = totalScore - totalPar;

    const frontNineScore = data.slice(0, 9).reduce((acc, hole) => hole.score !== -1 ? acc + hole.score : acc, 0);
    const backNineScore = data.length > 9 ? data.slice(9).reduce((acc, hole) => hole.score !== -1 ? acc + hole.score : acc, 0) : 0;

    const frontNine = data.slice(0, Math.min(9, data.length));
    const backNine = data.length > 9 ? data.slice(9) : [];

    return (
        <View style={{
            backgroundColor: "#0B0B0B",
            borderTopRightRadius: roundedTop ? 16 : 0,
            borderTopLeftRadius: roundedTop ? 16 : 0,
            borderBottomRightRadius: roundedBottom ? 16 : 0,
            borderBottomLeftRadius: roundedBottom ? 16 : 0,
            paddingHorizontal: 16,
            paddingVertical: 10
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
                        <View key={i} style={{
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
                                <Text style={{ color: hole.score !== -1 ? "white" : DarkTheme.text.secondary, fontSize: 18, fontWeight: 600 }}>{hole.score === -1 ? "?" : hole.score}</Text>
                                { hole.score !== -1 && hole.score > hole.par && (
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
                                { hole.score !== -1 && hole.score < hole.par && (
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
                        </View>
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

export const PuttScorecardCard = ({data, strokesGained, totalPutts, front = true, roundedBottom = false, roundedTop = false}) => {
    const colors = useColors();

    // const totalPar = data.reduce((acc, hole) => hole.score !== -1 ? acc + hole.par : acc, 0);
    // const toPar = totalScore - totalPar;

    const frontNineScore = data.slice(0, 9).reduce((acc, hole) => acc + hole, 0);
    const backNineScore = data.length > 9 ? data.slice(9).reduce((acc, hole) => acc + hole, 0) : 0;

    const padArray = (arr, length, padValue) =>
        arr.length >= length ? arr : [...arr, ...Array(length - arr.length).fill(padValue)];

    const frontNine = padArray(data.slice(0, 9), 9, -1);
    const backNine = data.length > 9 ? padArray(data.slice(9, 18), 9, -1) : [];

    return (
        <View style={{
            backgroundColor: "#0B0B0B",
            borderTopRightRadius: roundedTop ? 16 : 0,
            borderTopLeftRadius: roundedTop ? 16 : 0,
            borderBottomRightRadius: roundedBottom ? 16 : 0,
            borderBottomLeftRadius: roundedBottom ? 16 : 0,
            paddingHorizontal: 16,
            paddingVertical: 10
        }}>
            {/* Top Row */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
                <View>
                    <Text style={{ color: DarkTheme.text.secondary, fontSize: 16, fontWeight: "bold" }}>Strokes Gained</Text>
                    <Text style={{ color: DarkTheme.text.primary, fontSize: 24, fontWeight: "bold" }}>{strokesGained > 0 ? `+${strokesGained}` : strokesGained}</Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                    <Text style={{ color: DarkTheme.text.secondary, fontSize: 16, fontWeight: "bold" }}>Gross Putts</Text>
                    <Text style={{ color: DarkTheme.text.primary, fontSize: 24, fontWeight: "bold" }}>{totalPutts}</Text>
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
                        <View key={i} style={{
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
                                <Text style={{ color: hole !== -1 ? "white" : DarkTheme.text.secondary, fontSize: 18, fontWeight: 600 }}>{hole === -1 ? "?" : hole}</Text>
                                {  hole !== -1 && hole > 2 && (
                                    Array.from({ length: Math.min(hole - 2, 3) }).map((_, i) => (
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
                                                strokeWidth={i === 2 && hole - 2 > 3 ? 2 : 1.5}
                                                fill="none"
                                            />
                                        </Svg>
                                    ))
                                )}
                                { hole !== -1 && hole < 2 && (
                                    Array.from({ length: 2-hole }).map((_, i) => (
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
                        </View>
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