import {Image, View} from "react-native";
import React from "react";
import useColors from "../../../hooks/useColors";
import FontText from "../../general/FontText";

export function MissDistributionDiagram({missData, holes, alone = false, units = 0}) {
    const colors = useColors();
    const gridData = Array.from({length: 15}, (_, index) => index + 1);

    return (
        <View style={{
            backgroundColor: colors.background.secondary,
            flexDirection: "column",
            borderRadius: alone ? 16 : 0,
        }}>
            <View style={{width: "100%", flexDirection: "row", justifyContent: "center", alignContent: "center"}}>
                <Image source={units === 0 ? require("@/assets/images/recapBackground.png") : require("@/assets/images/recapBackgroundMetric.png")} style={{
                    width: "100%",
                    height: "auto",
                    aspectRatio: 4096 / 1835,
                    position: "absolute",
                    top: 0,
                    left: 0
                }}></Image>

                <View style={{
                    width: "75%",
                    height: "auto",
                    aspectRatio: 3072 / 1835,
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    alignItems: 'center',
                    columnGap: 9,
                    rowGap: 4,
                    paddingTop: 10
                }}>
                    {gridData.map((item, index) => {
                        let text = "";

                        if (index === 2) {
                            text = Math.floor((missData.long / holes) * 100) + "%";
                        }
                        if (index === 5) {
                            text = Math.floor((missData.farLeft / holes) * 100) + "%";
                        }
                        if (index === 6) {
                            text = Math.floor((missData.left / holes) * 100) + "%";
                        }
                        if (index === 7) {
                            text = Math.floor((missData.center / holes) * 100) + "%";
                        }
                        if (index === 8) {
                            text = Math.floor((missData.right / holes) * 100) + "%";
                        }
                        if (index === 9) {
                            text = Math.floor((missData.farRight / holes) * 100) + "%";
                        }
                        if (index === 12) {
                            text = Math.floor((missData.short / holes) * 100) + "%";
                        }

                        return (
                            <View key={index} style={{
                                paddingTop: index > 4 && index !== 7 ? index === 12 ? 14 : 6 : 4,
                                width: '16%',
                                aspectRatio: 1,
                                justifyContent: 'center',
                                alignItems: 'center',
                                borderRadius: 5
                            }}>
                                <FontText style={{
                                    fontSize: 16,
                                    fontWeight: "bold",
                                    color: index === 7 ? "black" : [5, 9].includes(index) ? "white" : "#0e450b"
                                }}>{text}</FontText>
                            </View>
                        )
                    })}
                </View>
            </View>
        </View>
    )
}