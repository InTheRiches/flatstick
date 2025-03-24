import {Dimensions, View} from "react-native";
import {LineChart} from "../../../../../charts";

export default function SGOverTime({statsToUse}) {
    if (statsToUse === undefined || Object.keys(statsToUse).length === 0) {
        return <View></View>
    }

    let data = statsToUse.months.map(month => month.strokesGained);
    let labels = ["Jan.", "", "Mar.", "", "May", "", "July", "", "Sept.", "", "Nov.", ""];
    let bigLabels = ["Jan.", "Feb.", "Mar.", "Apr.", "May", "Jun.", "Jul.", "Aug.", "Sept.", "Oct.", "Nov.", "Dec."];
    let evenBiggerLabels = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    // Remove -999 values from the end
    while (data.length > 0 && data[data.length - 1] === -999) {
        data.pop();
        labels.pop();
        bigLabels.pop();
        evenBiggerLabels.pop();
    }

    // Calculate the range and interval size
    const maxValue = Math.ceil(Math.max(...data));
    const minValue = Math.floor(Math.min(...data));

    // Calculate the min and max values for the y-axis
    const maxY = maxValue % 2 === 0 ? maxValue : maxValue + 1;
    const minY = minValue % 2 === 0 ? minValue : minValue - 1;

    // Calculate the number of segments
    const range = maxY - minY;
    const intervalSize = 2;
    const segments = Math.ceil(range / intervalSize);

    // when you implement this, only include the months that you have data for (or go into last year, decide later)
    return (
        <LineChart
            data={{
                labels: labels.length < 8 ? evenBiggerLabels : labels.length < 10 ? bigLabels : labels,
                datasets: [
                    {
                        data: data
                    }
                ]
            }}
            minNumber={minY}
            maxNumber={maxY}
            segments={segments-1}
            width={Dimensions.get("window").width-48} // from react-native
            height={220}
            yAxisLabel=""
            yLabelsOffset={5}
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
                },
            }}
            bezier
            style={{
                marginVertical: 8,
                borderRadius: 16
            }}
        />
    )
}