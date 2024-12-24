import {BarChart} from "../../../../../charts";
import {Dimensions, useColorScheme} from "react-native";
import useColors from "../../../../../hooks/useColors";

// TODO mayeb make this a graph that shows the difference, where it starts in the middle and goes up /down
export const PuttsByDistance = ({statsToUse}) => {
    const colors = useColors();
    const colorScheme = useColorScheme();

    return (
        <BarChart
            data={{
                labels: ['<6 ft', '6-12 ft', '12-20 ft', '>20 ft'],
                datasets: [{
                    data: [
                        statsToUse.averagePerformance.puttsAHole.distance[0], statsToUse.averagePerformance.puttsAHole.distance[1], statsToUse.averagePerformance.puttsAHole.distance[2], statsToUse.averagePerformance.puttsAHole.distance[3]
                    ]},
                    {data: [1.34, 1.50, 1.70, 2]}],
            }}
            width={Dimensions.get('window').width - 16}
            height={220}
            fromZero={true}
            yAxisInterval={1}
            segments={3}
            showValuesOnTopOfBars={true}

            fromNumber={3}
            chartConfig={{
                backgroundColor: colors.background.primary,
                backgroundGradientFrom: colors.background.primary,
                backgroundGradientTo: colors.background.primary,
                decimalPlaces: 0,

                fillShadowGradientFromOpacity: 0.5,
                fillShadowGradientToOpacity: 0.3,
                textColor: colors.text.primary,
                secondaryCapColor: colorScheme === "light" ? "#0e4e75" : "white",
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
            yAxisSuffix={" putts"}
            hideLegend={true}
        />
    )
}