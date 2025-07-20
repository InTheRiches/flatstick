import {createSimpleStats} from "../PuttUtils";

const createCategory = () => ({
    totalPutts: 0,
    rawPutts: 0,
    avgMiss: 0, // in feet
    strokesGained: 0,
    percentShort: 0,
    percentTooLong: 0,
    percentJustLong: 0,
    percentMade: 0,
    totalMisreadSlopes: 0,
    totalMisreadLines: 0,
    misreadSlopesDistribution: { uphill: [0, 0, 0], neutral: [0, 0, 0], downhill: [0, 0, 0] },
    misreadLinesDistribution: { uphill: [0, 0, 0], neutral: [0, 0, 0], downhill: [0, 0, 0] },
    totalMishits: 0,
    missDistribution: [0, 0, 0, 0, 0, 0, 0, 0],
    slopeAndBreakDistribution: {
        uphill: { straight: initializeSlopeAndBreak(), leftToRight: initializeSlopeAndBreak(), rightToLeft: initializeSlopeAndBreak() },
        neutral: { straight: initializeSlopeAndBreak(), leftToRight: initializeSlopeAndBreak(), rightToLeft: initializeSlopeAndBreak() },
        downhill: { straight: initializeSlopeAndBreak(), leftToRight: initializeSlopeAndBreak(), rightToLeft: initializeSlopeAndBreak() }
    }
});

const initializeSlopeAndBreak = () => ({
    putts: 0,
    avgMiss: 0,
    misses: [0, 0, 0, 0, 0, 0, 0, 0], // past, past right, right, short right, short, short left, left, past left
    missDistances: [0, 0, 0, 0, 0, 0, 0, 0],
    made: 0
})

const initializeBlankPutters = (putters) => {
    return JSON.parse(JSON.stringify(putters)).slice(1).map((putter) => {
        putter.stats = createSimpleStats();
        return putter;
    });
}

const initializeBlankGrips = (grips) => {
    return JSON.parse(JSON.stringify(grips)).slice(1).map((grip) => {
        grip.stats = createSimpleStats();
        return grip;
    });
}

const categorizeDistance = (distance, units) => {
    if (units === 0) {
        if (distance < 6) return "distanceOne";
        else if (distance < 12) return "distanceTwo";
        else if (distance < 20) return "distanceThree";
        else return "distanceFour";
    } else {
        if (distance < 2) return "distanceOne";
        else if (distance <= 4) return "distanceTwo";
        else if (distance <= 7) return "distanceThree";
        else return "distanceFour";
    }
};

export {categorizeDistance, initializeBlankGrips, initializeBlankPutters};