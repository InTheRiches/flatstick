import React, {memo} from "react";
import {BarChart} from "../../../../../charts";
import {Dimensions, useColorScheme} from "react-native";
import {useAppContext} from "../../../../../contexts/AppCtx";
import useColors from "../../../../../hooks/useColors";

export const SGByDistanceChart = memo(({}) => {
    const {currentStats} = useAppContext();
    const colors = useColors();
    const colorScheme = useColorScheme();

    return (
        <BarChart
            minNumber={-2}
            maxNumber={2}
            segments={4}
            data={{
                labels: ['<6 ft', '6-12 ft', '12-20 ft', '>20 ft'],
                datasets: [
                    {
                        data: [
                            currentStats.averagePerformance.strokesGained.distance[0], currentStats.averagePerformance.strokesGained.distance[1], currentStats.averagePerformance.strokesGained.distance[2], currentStats.averagePerformance.strokesGained.distance[3]
                        ]
                    }
                ],
            }}
            width={Dimensions.get('window').width - 16}
            height={220}
            autoShiftLabels
            showValuesOnTopOfBars={true}
            chartConfig={{
                backgroundColor: colors.background.primary,
                backgroundGradientFrom: colors.background.primary,
                backgroundGradientTo: colors.background.primary,
                decimalPlaces: 0,

                fillShadowGradientFromOpacity: colorScheme === "light" ? 0.4 : 0.5,
                fillShadowGradientToOpacity: colorScheme === "light" ? 0.1 : 0.2,

                textColor: colors.text.primary,

                capColor: colors.checkmark.background,

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
            yAxisSuffix={" strokes"}
            hideLegend={true}
        />
    )
});