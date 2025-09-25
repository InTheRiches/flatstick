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
    const mySlopes = currentStats.puttsAHole.byFirstPuttSlope;
    const myHoles = {...currentStats.holesByFirstPuttSlope};

    let max = 0;

    // find the highest value, and take all of those out of that (as a percent)
    for (let slope of ["downhill", "neutral", "uphill"]) {
        for (let brek of ["leftToRight", "rightToLeft", "straight"]) {
            if (slope === "neutral" && brek === "straight")
                continue; // don't include neutral straight

            if (myHoles[slope][brek] === 0) {
                myHoles[slope][brek] = 1;
                continue;
            }

            if ((mySlopes[slope][brek] / myHoles[slope][brek]) > max) {
                max = (mySlopes[slope][brek] / myHoles[slope][brek]);
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
        "Downhill\nStraight": [(mySlopes.downhill.straight / myHoles.downhill.straight) / max, roundTo(mySlopes.downhill.straight / myHoles.downhill.straight, 1) + " Putts"],
        "Downhill\nLeft to Right": [(mySlopes.downhill.leftToRight / myHoles.downhill.leftToRight) / max, roundTo(mySlopes.downhill.leftToRight / myHoles.downhill.leftToRight, 1) + " Putts"],
        "Neutral\nLeft to Right": [(mySlopes.neutral.leftToRight / myHoles.neutral.leftToRight) / max, roundTo(mySlopes.neutral.leftToRight / myHoles.neutral.leftToRight, 1) + " Putts"],
        "Uphill\nLeft to Right": [(mySlopes.uphill.leftToRight / myHoles.uphill.leftToRight) / max, roundTo(mySlopes.uphill.leftToRight / myHoles.uphill.leftToRight, 1)+ " Putts"],
        "Uphill\nStraight": [(mySlopes.uphill.straight / myHoles.uphill.straight) / max, roundTo(mySlopes.uphill.straight / myHoles.uphill.straight, 1) + " Putts"],
        "Uphill\nRight to Left": [(mySlopes.uphill.rightToLeft / myHoles.uphill.rightToLeft) / max, roundTo(mySlopes.uphill.rightToLeft / myHoles.uphill.rightToLeft, 1) + " Putts"],
        "Neutral\nRight to Left": [(mySlopes.neutral.rightToLeft / myHoles.neutral.rightToLeft) / max, roundTo(mySlopes.neutral.rightToLeft / myHoles.neutral.rightToLeft, 1) + " Putts"],
        "Downhill\nRight to Left": [(mySlopes.downhill.rightToLeft / myHoles.downhill.rightToLeft) / max, roundTo(mySlopes.downhill.rightToLeft / myHoles.downhill.rightToLeft, 1) + " Putts"],
    }
}