// TODO make the text red when negative
import {useAppContext} from "../../../../../contexts/AppCtx";
import {Dimensions, View} from "react-native";
import {roundTo} from "../../../../../utils/roundTo";
import {RadarChart} from "../../";

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
    const mySlopes = currentStats.averagePerformance.strokesGained.slopes;

    let max = -999;

    // find the highest value, and take all of those out of that (as a percent)
    for (let slope of ["downhill", "neutral", "uphill"]) {
        for (let brek of ["leftToRight", "rightToLeft", "straight"]) {
            if (mySlopes[slope][brek]+1 > max) {
                max = mySlopes[slope][brek]+1;
            }
        }
    }

    max += 0.1; // push it back from the edges

    // make another copy of mySlopes
    const mySlopesCopy = JSON.parse(JSON.stringify(mySlopes));
    for (let slope of ["downhill", "neutral", "uphill"]) {
        for (let brek of ["leftToRight", "rightToLeft", "straight"]) {
            mySlopesCopy[slope][brek] += 1; // this stuff makes it never less than 0, and since its a web graph, thats good :)

            if (mySlopesCopy[slope][brek] < 0) {
                mySlopesCopy[slope][brek] = 0;
            }

            mySlopesCopy[slope][brek] = roundTo(mySlopesCopy[slope][brek] / max, 2);
        }
    }

    return {
        "Downhill\nStraight": [mySlopesCopy.downhill.straight, mySlopes.downhill.straight + " Strokes"],
        "Downhill\nLeft to Right": [mySlopesCopy.downhill.leftToRight, mySlopes.downhill.leftToRight + " Strokes"],
        "Neutral\nLeft to Right": [mySlopesCopy.neutral.leftToRight, mySlopes.neutral.leftToRight + " Strokes"],
        "Uphill\nLeft to Right": [mySlopesCopy.uphill.leftToRight, mySlopes.uphill.leftToRight + " Strokes"],
        "Uphill\nStraight": [mySlopesCopy.uphill.straight, mySlopes.uphill.straight + " Strokes"],
        "Uphill\nRight to Left": [mySlopesCopy.uphill.rightToLeft, mySlopes.uphill.rightToLeft + " Strokes"],
        "Neutral\nRight to Left": [mySlopesCopy.neutral.rightToLeft, mySlopes.neutral.rightToLeft + " Strokes"],
        "Downhill\nRight to Left": [mySlopesCopy.downhill.rightToLeft, mySlopes.downhill.rightToLeft + " Strokes"],
    }
}