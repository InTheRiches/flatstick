import React, {memo} from "react";
import {BarChart} from "../../../../../charts";
import {Dimensions} from "react-native";
import useColors from "../../../../../hooks/useColors";
import {useAppContext} from "../../../../../contexts/AppContext";
import {roundTo} from "../../../../../utils/roundTo";

export const SGByDistanceChart = memo(({statsToUse}) => {
    const colors = useColors();
    const {userData} = useAppContext();
    const colorScheme = "light";

    const data = [
        // (statsToUse.expectedStrokes - statsToUse.totalPutts) / (statsToUse.holesPlayed / 18)
        statsToUse.holesByFirstPuttDistance[0] === 0 ? 0 : roundTo((statsToUse.strokesGained.expectedStrokesByDistance[0] - statsToUse.puttsAHole.byFirstPuttDistance[0]) / (statsToUse.holesByFirstPuttDistance[0] / 18), 1),
        statsToUse.holesByFirstPuttDistance[1] === 0 ? 0 : roundTo((statsToUse.strokesGained.expectedStrokesByDistance[1] - statsToUse.puttsAHole.byFirstPuttDistance[1]) / (statsToUse.holesByFirstPuttDistance[1] / 18), 1),
        statsToUse.holesByFirstPuttDistance[2] === 0 ? 0 : roundTo((statsToUse.strokesGained.expectedStrokesByDistance[2] - statsToUse.puttsAHole.byFirstPuttDistance[2]) / (statsToUse.holesByFirstPuttDistance[2] / 18), 1),
        statsToUse.holesByFirstPuttDistance[3] === 0 ? 0 : roundTo((statsToUse.strokesGained.expectedStrokesByDistance[3] - statsToUse.puttsAHole.byFirstPuttDistance[3]) / (statsToUse.holesByFirstPuttDistance[3] / 18), 1)
    ]

    // Calculate the range and interval size
    const maxValue = Math.ceil(Math.max(...data));
    const minValue = Math.floor(Math.min(...data));
    const range = maxValue - minValue;
    const intervalSize = Math.ceil(range / 2);

    // Calculate the min and max values for the y-axis
    const maxY = minValue + intervalSize * 2;
    const minY = minValue;

    return (
        <BarChart
            minNumber={minY}
            maxNumber={maxY}
            segments={(maxY - minY) > 2 ? 3 : 2}
            data={{
                labels: userData.preferences.units === 0 ? ['<6 ft', '6-12 ft', '12-20 ft', '>20 ft'] : ['<2 m', '2-4 m', '4-7 m', '>7 m'],
                datasets: [
                    {
                        data: data
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