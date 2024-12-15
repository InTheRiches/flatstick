import {roundTo} from "./PuttUtils";

function createPuttsByBreak(userData) {
    // copy the object
    const mySlopes = userData.averagePerformance.puttsAHole.slopes;

    console.log(Object.keys(mySlopes));

    let max = 0;

    // find the highest value, and take all of those out of that (as a percent)
    for (let slope of ["downhill", "neutral", "uphill"]) {
        for (let brek of ["leftToRight", "rightToLeft", "straight"]) {
            if (mySlopes[slope][brek] > max) {
                max = mySlopes[slope][brek];
            }
        }
    }

    return {
        "Downhill\nLeft to Right": [roundTo(mySlopes.downhill.leftToRight / max, 2), mySlopes.downhill.leftToRight + " Putts"],
        "Neutral\nLeft to Right": [roundTo(mySlopes.neutral.leftToRight / max, 2), mySlopes.neutral.leftToRight + " Putts"],
        "Uphill\nLeft to Right": [roundTo(mySlopes.uphill.leftToRight / max, 2), mySlopes.uphill.leftToRight + " Putts"],
        "Uphill\nStraight": [roundTo(mySlopes.uphill.straight / max, 2), mySlopes.uphill.straight + " Putts"],
        "Uphill\nRight to Left": [roundTo(mySlopes.uphill.rightToLeft / max, 2), mySlopes.uphill.rightToLeft + " Putts"],
        "Neutral\nRight to Left": [roundTo(mySlopes.neutral.rightToLeft / max, 2), mySlopes.neutral.rightToLeft + " Putts"],
        "Downhill\nRight to Left": [roundTo(mySlopes.downhill.rightToLeft / max, 2), mySlopes.downhill.rightToLeft + " Putts"],
        "Downhill\nStraight": [roundTo(mySlopes.downhill.straight / max, 2), mySlopes.downhill.straight + " Putts"],
    }
}

export {createPuttsByBreak};