import {Dimensions, View} from "react-native";
import {RadarChart} from "../../";
import React from "react";
import {roundTo} from "../../../../../utils/roundTo";

export const MakeByBreakSlope = ({statsToUse}) => {
    if (statsToUse === undefined || Object.keys(statsToUse).length === 0) {
        return <View></View>
    }

    return (
        <RadarChart graphSize={Dimensions.get("screen").width - 36}
                    scaleCount={4}
                    numberInterval={0}
                    data={[createPuttsMadeByBreak(statsToUse)]}
                    options={{
                        graphShape: 1,
                        showAxis: true,
                        showIndicator: true,
                        colorList: ["#24b2ff", "red"],
                        dotList: [false, true],
                    }}></RadarChart>
    )
}

function createPuttsMadeByBreak(currentStats) {
    // copy the object
    const mySlopes = JSON.parse(JSON.stringify(currentStats.madeData.slopes));
    const myPutts = JSON.parse(JSON.stringify(currentStats.totalPuttsBySlope));

    let max = -999;

    // find the highest value, and take all of those out of that (as a percent)
    for (let slope of ["downhill", "neutral", "uphill"]) {
        for (let brek of ["leftToRight", "rightToLeft", "straight"]) {
            if (slope === "neutral" && brek === "straight")
                continue; // don't include neutral straight

            if (myPutts[slope][brek] === 0) {
                myPutts[slope][brek] = 1;
                continue;
            }

            if ((mySlopes[slope][brek] / myPutts[slope][brek]) > max) {
                max = (mySlopes[slope][brek] / myPutts[slope][brek]);
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

    max += .05;

    // make another copy of mySlopes
    const mySlopesCopy = JSON.parse(JSON.stringify(mySlopes));
    const dataForText = JSON.parse(JSON.stringify(mySlopes));
    for (let slope of ["downhill", "neutral", "uphill"]) {
        for (let brek of ["leftToRight", "rightToLeft", "straight"]) {
            if (mySlopesCopy[slope][brek] === 0) {
                mySlopesCopy[slope][brek] = 0.03;
            }
            mySlopesCopy[slope][brek] = roundTo(((mySlopes[slope][brek] / myPutts[slope][brek])) / max, 2);
            dataForText[slope][brek] = roundTo((mySlopes[slope][brek] / myPutts[slope][brek]), 2);
        }
    }

    return {
        "Downhill\nStraight": [mySlopesCopy.downhill.straight,  roundTo(dataForText.downhill.straight*100, 0) + "%"],
        "Downhill\nLeft to Right": [mySlopesCopy.downhill.leftToRight, roundTo(dataForText.downhill.leftToRight*100, 0) + "%"],
        "Neutral\nLeft to Right": [mySlopesCopy.neutral.leftToRight, roundTo(dataForText.neutral.leftToRight*100, 0) + "%"],
        "Uphill\nLeft to Right": [mySlopesCopy.uphill.leftToRight, roundTo(dataForText.uphill.leftToRight*100, 0) + "%"],
        "Uphill\nStraight": [mySlopesCopy.uphill.straight, roundTo(dataForText.uphill.straight*100, 0) + "%"],
        "Uphill\nRight to Left": [mySlopesCopy.uphill.rightToLeft, roundTo(dataForText.uphill.rightToLeft*100, 0) + "%"],
        "Neutral\nRight to Left": [mySlopesCopy.neutral.rightToLeft, roundTo(dataForText.neutral.rightToLeft*100, 0) + "%"],
        "Downhill\nRight to Left": [mySlopesCopy.downhill.rightToLeft, roundTo(dataForText.downhill.rightToLeft*100, 0) + "%"],
    }
}