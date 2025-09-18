import {BarChart} from "../../../../../charts";
import {Dimensions} from "react-native";
import useColors from "../../../../../hooks/useColors";
import {useAppContext} from "../../../../../contexts/AppContext";

export const PuttsByDistance = ({statsToUse}) => {
    const colors = useColors();
    const {userData} = useAppContext();
    const colorScheme = "light";

    console.log(statsToUse.puttsAHole.byFirstPuttDistance[2], statsToUse.holesByFirstPuttDistance[2])

    const data = [
        statsToUse.holesByFirstPuttDistance[0] === 0 ? 0 : statsToUse.puttsAHole.byFirstPuttDistance[0] / statsToUse.holesByFirstPuttDistance[0],
        statsToUse.holesByFirstPuttDistance[1] === 0 ? 0 : statsToUse.puttsAHole.byFirstPuttDistance[1] / statsToUse.holesByFirstPuttDistance[1],
        statsToUse.holesByFirstPuttDistance[2] === 0 ? 0 : statsToUse.puttsAHole.byFirstPuttDistance[2] / statsToUse.holesByFirstPuttDistance[2],
        statsToUse.holesByFirstPuttDistance[3] === 0 ? 0 : statsToUse.puttsAHole.byFirstPuttDistance[3] / statsToUse.holesByFirstPuttDistance[3],
    ]

    // find the biggest value in the data
    const maxValue = Math.max(...data);

    return (
        <BarChart
            data={{
                labels: userData.preferences.units === 0 ? ['<6 ft', '6-12 ft', '12-20 ft', '>20 ft'] : ['<2 m', '2-4 m', '4-7 m', '>7 m'],
                datasets: [{
                    data: data
                }, {data: [1.34, 1.50, 1.70, 2]}],
            }}
            width={Dimensions.get('window').width - 16}
            height={220}
            fromZero={true}
            yAxisInterval={1}
            segments={maxValue > 3 ? 4 : 3}
            showValuesOnTopOfBars={true}
            yAxisTextOffset={64}
            fromNumber={maxValue > 3 ? 4 : 3}
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