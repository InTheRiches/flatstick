import {BarChart} from "../../../../../charts";
import {Dimensions} from "react-native";
import React from "react";
import useColors from "../../../../../hooks/useColors";
import {useAppContext} from "../../../../../contexts/AppContext";
import {roundTo} from "../../../../../utils/roundTo";

export const SlopeMisreadsByDistance = ({statsToUse}) => {
    const colors = useColors();
    const {userData} = useAppContext();
    const colorScheme = "light";

    const data = [
        statsToUse.totalPuttsByDistance[0] === 0 ? 0 : roundTo((statsToUse.misreadData.misreadSlopeByDistance[0] / statsToUse.totalPuttsByDistance[0])*100, 0),
        statsToUse.totalPuttsByDistance[1] === 0 ? 0 : roundTo((statsToUse.misreadData.misreadSlopeByDistance[1] / statsToUse.totalPuttsByDistance[1])*100, 0),
        statsToUse.totalPuttsByDistance[2] === 0 ? 0 : roundTo((statsToUse.misreadData.misreadSlopeByDistance[2] / statsToUse.totalPuttsByDistance[2])*100, 0),
        statsToUse.totalPuttsByDistance[3] === 0 ? 0 : roundTo((statsToUse.misreadData.misreadSlopeByDistance[3] / statsToUse.totalPuttsByDistance[3])*100, 0),
    ];

    const biggestMisread = Math.max(...data, 1);

    // find the nearest multiple of 4 & 5 to the biggest misread, but it has to be bigger than it
    let maxNumber = 0;
    for (let i = biggestMisread; i < 100; i++) {
        if (i < 20 && i % 4 === 0) {
            maxNumber = i;
            break;
        }
        if (i % 4 === 0 && i % 5 === 0) {
            maxNumber = i;
            break;
        }
    }

    return (
        <BarChart
            minNumber={0}
            maxNumber={maxNumber}
            data={{
                labels: userData.preferences.units === 0 ? ['<6 ft', '6-12 ft', '12-20 ft', '>20 ft'] : ['<2 m', '2-4 m', '4-7 m', '>7 m'],
                datasets: [{
                    data: data},
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