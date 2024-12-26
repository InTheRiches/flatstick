// TODO ADD DATE + # OF HOLES
import useColors from "../../../hooks/useColors";
import {Image, Text, View} from "react-native";
import {MissDistributionDiagram} from "./MissDistributionDiagram";

export function RecapVisual({holes, totalPutts, avgDistance, makeData, makePercent}) {
    const colors = useColors();

    return (
        <View style={{
            backgroundColor: colors.background.secondary,
            flexDirection: "column",
            paddingTop: 12,
            borderRadius: 16,
            elevation: 4
        }}>
            <View style={{
                width: "100%",
                paddingBottom: 12,
                borderBottomWidth: 1,
                borderColor: colors.border.default
            }}>
                <Text style={{fontSize: 16, textAlign: "center", color: colors.text.primary}}>Session Recap</Text>
                <View style={{position: "absolute", left: 12, flexDirection: "row", gap: 8}}>
                    <Image source={require('@/assets/images/PuttLabLogo.png')}
                           style={{width: 30, height: 30, top: -4}}/>
                    <Text style={{fontSize: 16, fontWeight: "bold", color: colors.text.primary}}>PuttLab</Text>
                </View>
            </View>
            <MissDistributionDiagram missData={makeData} holes={holes}></MissDistributionDiagram>
            <View style={{
                width: "100%",
                flexDirection: "column",
                borderTopWidth: 1,
                borderColor: colors.border.default
            }}>
                <Text style={{
                    fontSize: 16,
                    textAlign: "center",
                    color: colors.text.primary,
                    borderBottomWidth: 1,
                    borderColor: colors.border.default,
                    paddingVertical: 6
                }}>Stats</Text>
                <View style={{flexDirection: "row"}}>
                    <View style={{
                        flexDirection: "column",
                        flex: 0.7,
                        borderRightWidth: 1,
                        borderColor: colors.border.default,
                        paddingBottom: 12,
                        paddingTop: 6,
                        paddingLeft: 12
                    }}>
                        <Text style={{
                            fontSize: 14,
                            textAlign: "left",
                            color: colors.text.secondary
                        }}>Make %</Text>
                        <Text style={{
                            fontSize: 20,
                            textAlign: "left",
                            color: colors.text.primary,
                            fontWeight: "bold"
                        }}>{roundTo(makePercent*100, 0)}%</Text>
                    </View>
                    <View style={{
                        flexDirection: "column",
                        flex: 1,
                        borderRightWidth: 1,
                        borderColor: colors.border.default,
                        paddingBottom: 12,
                        paddingTop: 6,
                        paddingLeft: 12
                    }}>
                        <Text style={{
                            fontSize: 14,
                            textAlign: "left",
                            color: colors.text.secondary
                        }}>Avg. Miss Distance</Text>
                        <Text style={{
                            fontSize: 20,
                            textAlign: "left",
                            color: colors.text.primary,
                            fontWeight: "bold"
                        }}>{avgDistance}ft</Text>
                    </View>
                    <View style={{
                        flexDirection: "column",
                        flex: 0.7,
                        paddingBottom: 12,
                        paddingTop: 6,
                        paddingLeft: 12
                    }}>
                        <Text style={{
                            fontSize: 14,
                            textAlign: "left",
                            color: colors.text.secondary
                        }}>Putts</Text>
                        <Text style={{
                            fontSize: 20,
                            textAlign: "left",
                            color: colors.text.primary,
                            fontWeight: "bold"
                        }}>{totalPutts}</Text>
                    </View>
                </View>
            </View>
        </View>
    )
}