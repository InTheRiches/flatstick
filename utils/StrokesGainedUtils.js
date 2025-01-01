// Example usage:
import {roundTo} from "./roundTo";
import {convertUnits} from "@/utils/Conversions";

const sgBaselinePutts = [
    { distance: 1, strokesGained: 1.00 },
    { distance: 3, strokesGained: 1.04 },
    { distance: 4, strokesGained: 1.13 },
    { distance: 5, strokesGained: 1.23 },
    { distance: 6, strokesGained: 1.34 },
    { distance: 7, strokesGained: 1.42 },
    { distance: 8, strokesGained: 1.50 },
    { distance: 9, strokesGained: 1.56 },
    { distance: 10, strokesGained: 1.61 },
    { distance: 20, strokesGained: 1.795},
    { distance: 30, strokesGained: 1.98 },
    { distance: 50, strokesGained: 2.14 },
    { distance: 90, strokesGained: 2.40 }
];

function cleanAverageStrokesGained(averagePerformance, strokesGained = -999) {
    const refinedStrokesGained = {
        distance: [0, 0, 0, 0],
        overall: 0,
        slopes: {
            downhill: {
                straight: 0, // strokes gained
                leftToRight: 0,
                rightToLeft: 0
            },
            neutral: {
                straight: 0,
                leftToRight: 0,
                rightToLeft: 0
            },
            uphill: {
                straight: 0,
                leftToRight: 0,
                rightToLeft: 0
            }
        }
    }
    if (strokesGained !== -999)
        refinedStrokesGained.overall = strokesGained;
    else
        refinedStrokesGained.overall = averagePerformance.strokesGained.overall;
    refinedStrokesGained.distance = averagePerformance.strokesGained.distance.map((val, idx) => {
        if (averagePerformance.puttsByDistance[idx] === 0) return 0;
        return roundTo(val / averagePerformance.puttsByDistance[idx], 1);
    });
    // handle the slopes
    for (const slope of ["uphill", "neutral", "downhill"]) {
        for (const breakType of ["straight", "leftToRight", "rightToLeft"]) {
            if (averagePerformance.strokesGained.slopes[slope][breakType][1] === 0) continue;
            refinedStrokesGained.slopes[slope][breakType] = roundTo(averagePerformance.strokesGained.slopes[slope][breakType][0] / averagePerformance.strokesGained.slopes[slope][breakType][1], 1);
        }
    }

    return refinedStrokesGained;
}

function calculateBaselineStrokesGained(distance) {
    // Ensure the data points are sorted by distance
    sgBaselinePutts.sort((a, b) => a.distance - b.distance);

    let below;
    let above;

    // Find the nearest below and above distances
    for (let i = 0; i < sgBaselinePutts.length; i++) {
        if (sgBaselinePutts[i].distance < distance) {
            below = sgBaselinePutts[i];
        }
        if (sgBaselinePutts[i].distance === distance) {
            return sgBaselinePutts[i].strokesGained;
        }
        if (sgBaselinePutts[i].distance > distance) {
            above = sgBaselinePutts[i];
            break;
        }
    }

    // If distance is less than the smallest point or greater than the largest point
    if (!below) return above.strokesGained;
    if (!above) return below.strokesGained;

    // Calculate proportionally weighted value
    const weightAbove = (distance - below.distance) / (above.distance - below.distance);
    const weightBelow = 1 - weightAbove;

    return below.strokesGained * weightBelow + above.strokesGained * weightAbove;
}

function calculateSingleStrokesGained(totalPutts, distance) {
    const baselineStrokesGained = calculateBaselineStrokesGained(distance);
    return baselineStrokesGained - totalPutts;
}

function calculateTotalStrokesGained(userData, sessions) {
    let overallPutts = 0;
    let overallRounds = 0;

    let categories;
    categories = {
        distanceOne: {totalHoles: 0, totalBaselines: 0, totalActualPutts: 0},
        distanceTwo: {totalHoles: 0, totalBaselines: 0, totalActualPutts: 0},
        distanceThree: {totalHoles: 0, totalBaselines: 0, totalActualPutts: 0},
        distanceFour: {totalHoles: 0, totalBaselines: 0, totalActualPutts: 0}
    }

    sessions.slice(0, 5).forEach(session => {
        const {totalPutts, holes} = session;

        overallPutts += (18 / holes) * totalPutts;
        overallRounds++;

        session.putts.forEach(putt => {
            const {distance, totalPutts} = putt;

            const convertedDistance = convertUnits(distance, session.units, userData.preferences.units);

            let category;

            if (userData.preferences.units === 0) {
                if (convertedDistance < 6) category = "distanceOne";
                else if (convertedDistance < 12) category = "distanceTwo";
                else if (convertedDistance < 20) category = "distanceThree";
                else category = "distanceFour";
            } else {
                if (convertedDistance < 2) category = "distanceOne";
                else if (convertedDistance <= 4) category = "distanceTwo";
                else if (convertedDistance <= 7) category = "distanceThree";
                else category = "distanceFour";
            }

            const baselineStrokesGained = calculateBaselineStrokesGained(convertUnits(distance, session.units, 0));

            categories[category].totalHoles++;
            categories[category].totalBaselines += baselineStrokesGained;
            categories[category].totalActualPutts += totalPutts;
        });
    });

    const strokesGainedByDistance = {};

    strokesGainedByDistance["overall"] = roundTo(((29 * overallRounds) - overallPutts) / overallRounds, 1);

    for (const category in categories) {
        const {totalBaselines, totalActualPutts, totalHoles} = categories[category];
        const strokesGained = totalBaselines - totalActualPutts;

        if (totalHoles === 0) {
            strokesGainedByDistance[category] = 0;
            continue;
        }

        strokesGainedByDistance[category] = roundTo(strokesGained / totalHoles, 2);
    }
    return strokesGainedByDistance;
}

export { cleanAverageStrokesGained, calculateSingleStrokesGained, calculateBaselineStrokesGained, calculateTotalStrokesGained };