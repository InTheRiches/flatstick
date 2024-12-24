import {Dimensions, View} from "react-native";
import {RadarChart} from "../../";
import {createPuttsMadeByBreak} from "../../../../../utils/GraphUtils";
import React from "react";
import {useAppContext} from "../../../../../contexts/AppCtx";

export const MakeByBreakSlope = () => {
    const {currentStats} = useAppContext();

    if (currentStats === undefined || Object.keys(currentStats).length === 0) {
        return <View></View>
    }

    return (
        <RadarChart graphSize={Dimensions.get("screen").width-36}
                    scaleCount={4}
                    numberInterval={0}
                    data={[createPuttsMadeByBreak(currentStats)]}
                    options={{
                        graphShape: 1,
                        showAxis: true,
                        showIndicator: true,
                        colorList: ["#24b2ff", "red"],
                        dotList: [false, true],
                    }}></RadarChart>
    )
}