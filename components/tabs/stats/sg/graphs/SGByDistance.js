import React, {memo} from "react";
import {BarChart} from "../../../../../charts";
import {Dimensions} from "react-native";
import useColors from "../../../../../hooks/useColors";
import {useAppContext} from "../../../../../contexts/AppCtx";

export const SGByDistanceChart = memo(({statsToUse}) => {
    const colors = useColors();
    const {userData} = useAppContext();
    const colorScheme = "light";

    // Calculate the range and interval size
    const maxValue = Math.ceil(Math.max(...Object.values(statsToUse.strokesGained.distance)));
    const minValue = Math.floor(Math.min(...Object.values(statsToUse.strokesGained.distance)));
    const range = maxValue - minValue;
    const intervalSize = Math.ceil(range / 2);

    // Calculate the min and max values for the y-axis
    const maxY = minValue + intervalSize * 2;
    const minY = minValue;

    console.log("SGByDistance data", minY, maxY)

    return (
        <BarChart
            minNumber={minY}
            maxNumber={maxY}
            segments={(maxY - minY) > 2 ? 3 : 2}
            data={{
                labels: userData.preferences.units === 0 ? ['<6 ft', '6-12 ft', '12-20 ft', '>20 ft'] : ['<2 m', '2-4 m', '4-7 m', '>7 m'],
                datasets: [
                    {
                        data: [
                            statsToUse.strokesGained.distance[0], statsToUse.strokesGained.distance[1], statsToUse.strokesGained.distance[2], statsToUse.strokesGained.distance[3]
                        ]
                    }
                ],
            }}
            width={Dimensions.get('window').width - 48}
            height={220}
            autoShiftLabels
            showValuesOnTopOfBars={true}
            yAxisTextOffset={60}
            chartConfig={{
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