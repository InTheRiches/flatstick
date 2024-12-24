import {roundTo} from "./roundTo";

function createPuttsMadeByBreak(currentStats) {
    // copy the object
    const mySlopes = currentStats.averagePerformance.madePutts.slopes;

    let max = -999;

    // find the highest value, and take all of those out of that (as a percent)
    for (let slope of ["downhill", "neutral", "uphill"]) {
        for (let brek of ["leftToRight", "rightToLeft", "straight"]) {
            if (mySlopes[slope][brek]*100 > max) {
                max = mySlopes[slope][brek]*100;
            }
        }
    }

    max += 0.1;

    // make another copy of mySlopes
    const mySlopesCopy = JSON.parse(JSON.stringify(mySlopes));
    for (let slope of ["downhill", "neutral", "uphill"]) {
        for (let brek of ["leftToRight", "rightToLeft", "straight"]) {
            if (mySlopesCopy[slope][brek] === 0) {
                mySlopesCopy[slope][brek] = 0.03;
            }
            mySlopesCopy[slope][brek] *= 100;
            mySlopesCopy[slope][brek] = roundTo(mySlopesCopy[slope][brek] / max, 2);
        }
    }

    return {
        "Downhill\nStraight": [mySlopesCopy.downhill.straight, mySlopes.downhill.straight + "%"],
        "Downhill\nLeft to Right": [mySlopesCopy.downhill.leftToRight, mySlopes.downhill.leftToRight + "%"],
        "Neutral\nLeft to Right": [mySlopesCopy.neutral.leftToRight, mySlopes.neutral.leftToRight + "%"],
        "Uphill\nLeft to Right": [mySlopesCopy.uphill.leftToRight, mySlopes.uphill.leftToRight + "%"],
        "Uphill\nStraight": [mySlopesCopy.uphill.straight, mySlopes.uphill.straight + "%"],
        "Uphill\nRight to Left": [mySlopesCopy.uphill.rightToLeft, mySlopes.uphill.rightToLeft + "%"],
        "Neutral\nRight to Left": [mySlopesCopy.neutral.rightToLeft, mySlopes.neutral.rightToLeft + "%"],
        "Downhill\nRight to Left": [mySlopesCopy.downhill.rightToLeft, mySlopes.downhill.rightToLeft + "%"],
    }
}

export {createPuttsMadeByBreak};
