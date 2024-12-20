import {roundTo} from "./roundTo";

function createPuttsByBreak(currentStats) {
    // copy the object
    const mySlopes = currentStats.averagePerformance.puttsAHole.slopes;

    let max = 0;

    // find the highest value, and take all of those out of that (as a percent)
    for (let slope of ["downhill", "neutral", "uphill"]) {
        for (let brek of ["leftToRight", "rightToLeft", "straight"]) {
            if (mySlopes[slope][brek] > max) {
                max = mySlopes[slope][brek];
            }
        }
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

export {createPuttsMadeByBreak, createStrokesGainedByBreak, createPuttsByBreak};
