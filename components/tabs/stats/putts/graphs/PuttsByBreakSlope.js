import {Dimensions, View} from "react-native";
import {RadarChart} from "../../";
import {roundTo} from "../../../../../utils/roundTo";

export const PuttsByBreakSlope = ({statsToUse}) => {
    if (statsToUse === undefined || Object.keys(statsToUse).length === 0) {
        return <View></View>
    }

    return (
        <RadarChart graphSize={Dimensions.get("screen").width - 36}
                    scaleCount={4}
                    numberInterval={0}
                    data={[createPuttsByBreak(statsToUse)]}
                    options={{
                        graphShape: 1,
                        showAxis: true,
                        showIndicator: true,
                        colorList: ["#24b2ff", "red"],
                        dotList: [false, true],
                    }}></RadarChart>
    )
}

function createPuttsByBreak(currentStats) {
    // copy the object
    const mySlopes = currentStats.puttsAHole.slopes;

    let max = 0;

    // find the highest value, and take all of those out of that (as a percent)
    for (let slope of ["downhill", "neutral", "uphill"]) {
        for (let brek of ["leftToRight", "rightToLeft", "straight"]) {
            if (slope === "neutral" && brek === "straight")
                continue; // don't include neutral straight

            if (mySlopes[slope][brek] > max) {
                max = mySlopes[slope][brek];
            }
        }
    }

    if (max === 0) {
        return {
            "Downhill\nStraight": [0, "0%"],
            "Downhill\nLeft to Right": [0, "0%"],
            "Neutral\nLeft to Right": [0, "0%"],
            "Uphill\nLeft to Right": [0, "0%"],
            "Uphill\nStraight": [0, "0%"],
            "Uphill\nRight to Left": [0, "0%"],
            "Neutral\nRight to Left": [0, "0%"],
            "Downhill\nRight to Left": [0, "0%"],
        };
    }

    max += 0.2;

    return {
        "Downhill\nStraight": [roundTo(mySlopes.downhill.straight / max, 2), mySlopes.downhill.straight + " Putts"],
        "Downhill\nLeft to Right": [roundTo(mySlopes.downhill.leftToRight / max, 2), mySlopes.downhill.leftToRight + " Putts"],
        "Neutral\nLeft to Right": [roundTo(mySlopes.neutral.leftToRight / max, 2), mySlopes.neutral.leftToRight + " Putts"],
        "Uphill\nLeft to Right": [roundTo(mySlopes.uphill.leftToRight / max, 2), mySlopes.uphill.leftToRight + " Putts"],
        "Uphill\nStraight": [roundTo(mySlopes.uphill.straight / max, 2), mySlopes.uphill.straight + " Putts"],
        "Uphill\nRight to Left": [roundTo(mySlopes.uphill.rightToLeft / max, 2), mySlopes.uphill.rightToLeft + " Putts"],
        "Neutral\nRight to Left": [roundTo(mySlopes.neutral.rightToLeft / max, 2), mySlopes.neutral.rightToLeft + " Putts"],
        "Downhill\nRight to Left": [roundTo(mySlopes.downhill.rightToLeft / max, 2), mySlopes.downhill.rightToLeft + " Putts"],
    }
}