import {Dimensions, View} from "react-native";
import {roundTo} from "../../../../../utils/roundTo";
import {RadarChart} from "../../";
import {getEmptySlopeBreakData} from "../../../../../constants/Constants";

export const SGByBreakSlope = ({statsToUse}) => {
    if (statsToUse === undefined || Object.keys(statsToUse).length === 0) {
        return <View></View>
    }

    return (
        <RadarChart graphSize={Dimensions.get("screen").width-36}
                    scaleCount={4}
                    numberInterval={0}
                    data={[createStrokesGainedByBreak(statsToUse)]}
                    options={{
                        graphShape: 1,
                        showAxis: true,
                        showIndicator: true,
                        colorList: ["#24b2ff", "red"],
                        dotList: [false, true],
                    }}></RadarChart>
    )
};

function createStrokesGainedByBreak(currentStats) {
    // copy the object
    const expectedBySlope = currentStats.strokesGained.expectedStrokesBySlope;
    const puttsAHoleBySlope = currentStats.puttsAHole.byFirstPuttSlope;

    let max = -999;
    let min = 999;

    // find the highest value, and take all of those out of that (as a percent)
    for (let slope of ["downhill", "neutral", "uphill"]) {
        for (let brek of ["leftToRight", "rightToLeft", "straight"]) {
            if (((expectedBySlope[slope][brek] - puttsAHoleBySlope[slope][brek]) / ((currentStats.holesByFirstPuttSlope[slope][brek] / 18)))+1 > max) {
                max = ((expectedBySlope[slope][brek] - puttsAHoleBySlope[slope][brek]) / ((currentStats.holesByFirstPuttSlope[slope][brek] / 18)))+1;
            }
            if (((expectedBySlope[slope][brek] - puttsAHoleBySlope[slope][brek]) / ((currentStats.holesByFirstPuttSlope[slope][brek] / 18)))+1 < min) {
                min = ((expectedBySlope[slope][brek] - puttsAHoleBySlope[slope][brek]) / ((currentStats.holesByFirstPuttSlope[slope][brek] / 18)))+1;
            }
        }
    }

    max += 0.1; // push it back from the edges

    const rawNumbers = getEmptySlopeBreakData();
    const data = getEmptySlopeBreakData();

    // make another copy of mySlopes
    for (let slope of ["downhill", "neutral", "uphill"]) {
        for (let brek of ["leftToRight", "rightToLeft", "straight"]) {
            if (slope === "neutral" && brek === "straight")
                continue; // don't include neutral straight

            data[slope][brek] = currentStats.holesByFirstPuttSlope[slope][brek] === 0 ? -999 : ((expectedBySlope[slope][brek] - puttsAHoleBySlope[slope][brek]) / ((currentStats.holesByFirstPuttSlope[slope][brek] / 18)))+2+(min < 0 ? Math.abs(min) : 0);
            rawNumbers[slope][brek] = currentStats.holesByFirstPuttSlope[slope][brek] === 0 ? -999 : ((expectedBySlope[slope][brek] - puttsAHoleBySlope[slope][brek]) / ((currentStats.holesByFirstPuttSlope[slope][brek] / 18)))+1;

            if (data[slope][brek] === -999) continue;

            data[slope][brek] = roundTo(data[slope][brek] / (max+(min < 0 ? Math.abs(min) : 0)), 2);
        }
    }

    return {
        "Downhill\nStraight": [data.downhill.straight === -999 ? 0 : data.downhill.straight, (rawNumbers.downhill.straight > 0 ? "+" : "" ) + (data.downhill.straight === -999 ? "?" : roundTo(rawNumbers.downhill.straight, 1)) + " Strokes"],
        "Downhill\nLeft to Right": [data.downhill.leftToRight === -999 ? 0 : data.downhill.leftToRight, (rawNumbers.downhill.leftToRight > 0 ? "+" : "" ) + (data.downhill.leftToRight === -999 ? "?" : roundTo(rawNumbers.downhill.leftToRight, 1)) + " Strokes"],
        "Neutral\nLeft to Right": [data.neutral.leftToRight === -999 ? 0 : data.neutral.leftToRight, (rawNumbers.neutral.leftToRight > 0 ? "+" : "" ) + (data.neutral.leftToRight === -999 ? "?" : roundTo(rawNumbers.neutral.leftToRight, 1)) + " Strokes"],
        "Uphill\nLeft to Right": [data.uphill.leftToRight === -999 ? 0 : data.uphill.leftToRight, (rawNumbers.uphill.leftToRight > 0 ? "+" : "" ) + (data.uphill.leftToRight === -999 ? "?" : roundTo(rawNumbers.uphill.leftToRight, 1)) + " Strokes"],
        "Uphill\nStraight": [data.uphill.straight === -999 ? 0 : data.uphill.straight, (rawNumbers.uphill.straight > 0 ? "+" : "" ) + (data.uphill.straight === -999 ? "?" : roundTo(rawNumbers.uphill.straight, 1)) + " Strokes"],
        "Uphill\nRight to Left": [data.uphill.rightToLeft === -999 ? 0 : data.uphill.rightToLeft, (rawNumbers.uphill.rightToLeft > 0 ? "+" : "" ) + (data.uphill.rightToLeft === -999 ? "?" : roundTo(rawNumbers.uphill.rightToLeft, 1)) + " Strokes"],
        "Neutral\nRight to Left": [data.neutral.rightToLeft === -999 ? 0 : data.neutral.rightToLeft, (rawNumbers.neutral.rightToLeft > 0 ? "+" : "" ) + (data.neutral.rightToLeft === -999 ? "?" : roundTo(rawNumbers.neutral.rightToLeft, 1)) + " Strokes"],
        "Downhill\nRight to Left": [data.downhill.rightToLeft === -999 ? 0 : data.downhill.rightToLeft, (rawNumbers.downhill.rightToLeft > 0 ? "+" : "" ) + (data.downhill.rightToLeft === -999 ? "?" : roundTo(rawNumbers.downhill.rightToLeft, 1)) + " Strokes"],
    }
}