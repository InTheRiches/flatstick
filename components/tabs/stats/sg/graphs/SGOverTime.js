import {Dimensions, View} from "react-native";
import {LineChart} from "../../../../../charts";
import useColors from "../../../../../hooks/useColors";

export default function SGOverTime({statsToUse}) {
    if (statsToUse === undefined || Object.keys(statsToUse).length === 0) {
        return <View></View>
    }

    let data = statsToUse.months.map(month => month.strokesGained);
    let labels = ["Jan.", "", "Mar.", "", "May", "", "July", "", "Sept.", "", "Nov.", ""];
    let bigLabels = ["Jan.", "Feb.", "Mar.", "Apr.", "May", "Jun.", "Jul.", "Aug.", "Sept.", "Oct.", "Nov.", "Dec."];

    // Remove -999 values from the end
    while (data.length > 0 && data[data.length - 1] === -999) {
        data.pop();
        labels.pop();
        bigLabels.pop();
    }

    // find the multiple of 2 to use for the y-axis
    const maxValue = Math.max(...data);
    const maxY = Math.ceil(maxValue / 2) * 2;
    const minValue = Math.min(...data);
    const minY = Math.floor(minValue / 2) * 2;

    console.log(data)

    // when you implement this, only include the months that you have data for (or go into last year, decide later)
    return (
        <LineChart
            data={{
                labels: labels.length < 8 ? bigLabels : labels,
                datasets: [
                    {
                        data: data
                    }
                ]
            }}
            minNumber={minY}
            maxNumber={maxY}
            segments={3}
            width={Dimensions.get("window").width-48} // from react-native
            height={220}
            yAxisLabel=""
            yAxisSuffix=" strokes"
            yAxisInterval={1} // optional, defaults to 1
            chartConfig={{
                decimalPlaces: 0, // optional, defaults to 2dp
                color: (opacity = 1) => `rgba(64, 194, 255, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                fillShadowGradientFromOpacity: 0.4,
                fillShadowGradientToOpacity: 0.1,
                style: {
                    borderRadius: 16
                },
                propsForDots: {
                    r: "5",
                    fill: "black"
                }
            }}
            bezier
            style={{
                marginVertical: 8,
                borderRadius: 16
            }}
        />
    )
}