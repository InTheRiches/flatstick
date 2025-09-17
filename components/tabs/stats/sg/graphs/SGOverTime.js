import {Dimensions, View} from "react-native";
import {LineChart} from "../../../../../charts";

export default function SGOverTime({ statsToUse, months }) {
    if (!statsToUse || Object.keys(statsToUse).length === 0) return <View />;

    const currentMonth = new Date().getMonth(); // 0-11
    const currentYear = new Date().getFullYear();

    // --- 1. Extract months and data ---
    let monthKeys = Object.keys(statsToUse); // e.g., ["2025-09", "2025-10", ...]
    monthKeys.sort(); // sort ascending by string "YYYY-MM"

    // Map monthKeys to strokesGained values

    let data = monthKeys.map(m => ((statsToUse[m].strokesGained.expectedStrokes - statsToUse[m].totalPutts) / (statsToUse[m].holesPlayed / 18)) ?? -999);

    // --- 2. Labels ---
    const shortLabels = ["Jan.", "", "Mar.", "", "May", "", "July", "", "Sept.", "", "Nov.", ""];
    const medLabels = ["Jan.", "Feb.", "Mar.", "Apr.", "May", "Jun.", "Jul.", "Aug.", "Sept.", "Oct.", "Nov.", "Dec."];
    const longLabels = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const getMonthName = (monthIndex, labelsArray) => labelsArray[monthIndex];

    const labels = monthKeys.map(key => {
        const [yearStr, monthStr] = key.split("-");
        const monthIndex = parseInt(monthStr, 10) - 1;
        return getMonthName(monthIndex, medLabels);
    });

    // --- 3. Remove trailing -999 ---
    while (data.length > 0 && data[data.length - 1] === -999) {
        data.pop();
        labels.pop();
    }

    // --- 4. Slice to last `months` entries ---
    if (data.length > months) {
        data = data.slice(-months);
        labels = labels.slice(-months);
    }

    // --- 5. Y-axis calculations ---
    const maxValue = Math.ceil(Math.max(...data));
    const minValue = Math.floor(Math.min(...data));
    const maxY = maxValue % 2 === 0 ? maxValue : maxValue + 1;
    const minY = minValue % 2 === 0 ? minValue : minValue - 1;
    const range = maxY - minY;
    const intervalSize = range > 2 ? range > 8 ? 4 : 2 : 1;
    const segments = Math.ceil(range / intervalSize);

    // --- 6. Render chart ---
    return (
        <LineChart
            data={{
                labels: labels,
                datasets: [{ data }]
            }}
            minNumber={minY}
            maxNumber={maxY}
            segments={segments}
            width={Dimensions.get("window").width - 48}
            height={220}
            yAxisLabel=""
            yLabelsOffset={10}
            yAxisSuffix=" strokes"
            yAxisInterval={1}
            chartConfig={{
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(64, 194, 255, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                fillShadowGradientFromOpacity: 0.4,
                fillShadowGradientToOpacity: 0.1,
                style: { borderRadius: 16 },
                propsForDots: { r: "4", fill: "black" },
                paddingRight: 72,
            }}
            bezier
            style={{ marginVertical: 8, borderRadius: 16 }}
        />
    );
}