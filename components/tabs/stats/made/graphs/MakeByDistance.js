import {BarChart} from "../../../../../charts";
import {Dimensions} from "react-native";
import React from "react";
import useColors from "../../../../../hooks/useColors";
import {useAppContext} from "../../../../../contexts/AppCtx";

export const MakeByDistance = ({statsToUse}) => {
    const colors = useColors();
    const {userData} = useAppContext();
    const colorScheme = "light";

    return (
        <BarChart
            minNumber={0}
            maxNumber={100}
            data={{
                labels: userData.preferences.units === 0 ? ['<6 ft', '6-12 ft', '12-20 ft', '>20 ft'] : ['<2 m', '2-4 m', '4-7 m', '>7 m'],
                datasets: [{
                    data: [
                        statsToUse.madePutts.distance[0]*100, statsToUse.madePutts.distance[1]*100, statsToUse.madePutts.distance[2]*100, statsToUse.madePutts.distance[3]*100
                    ]},
                    {data: [75, 50, 20, 10]},
                ],
            }}
            width={Dimensions.get('window').width - 16}
            height={220}
            autoShiftLabels
            yAxisTextOffset={64}
            showValuesOnTopOfBars={true}
            chartConfig={{
                backgroundColor: colors.background.primary,
                backgroundGradientFrom: colors.background.primary,
                backgroundGradientTo: colors.background.primary,
                decimalPlaces: 0,

                fillShadowGradientFromOpacity: colorScheme === "light" ? 0.4 : 0.5,
                fillShadowGradientToOpacity: colorScheme === "light" ? 0.1 : 0.2,

                formatTopBarValue: (value) => value + "%",

                textColor: colors.text.primary,
                capColor: colors.checkmark.background,
                secondaryCapColor: colorScheme === "light" ? "#0e4e75" : "white",

                color: (opacity = 1) => {
                    if (opacity === 1) return colors.checkmark.background
                    return colorScheme === "light" ? `rgba(0, 0, 0, ${opacity})` : `rgba(255, 255, 255, ${opacity})`
                },
                style: {
                    borderRadius: 16,
                },
            }}
            style={{
                marginVertical: 8,
                borderRadius: 16,
            }}
            yAxisSuffix={"%"}
            hideLegend={true}
        />
    )
}