// Example usage:
import {roundTo} from "@/utils/PuttUtils";

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
    { distance: 30, strokesGained: 1.98 },
    { distance: 50, strokesGained: 2.14 },
    { distance: 90, strokesGained: 2.40 }
];

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

function calculateTotalStrokesGained(sessions) {
    let overallPutts = 0;
    let overallRounds = 0;

    const categories = {
        'lessThanSix': {totalBaselines: 0, totalActualPutts: 0, totalHoles: 0},
        'sixToTwelve': {totalBaselines: 0, totalActualPutts: 0, totalHoles: 0},
        'twelveToTwenty': {totalBaselines: 0, totalActualPutts: 0, totalHoles: 0},
        'twentyPlus': {totalBaselines: 0, totalActualPutts: 0, totalHoles: 0}
    };

    sessions.slice(0, 5).forEach(session => {
        const {totalPutts, holes} = session;

        overallPutts += (18 / holes) * totalPutts;
        overallRounds++;

        session.putts.forEach(putt => {
            const {distance, totalPutts} = putt;

            let category;

            if (distance < 6) {
                category = 'lessThanSix';
            } else if (distance >= 6 && distance <= 12) {
                category = 'sixToTwelve';
            } else if (distance > 12 && distance <= 20) {
                category = 'twelveToTwenty';
            } else {
                category = 'twentyPlus';
            }

            const baselineStrokesGained = calculateBaselineStrokesGained(distance);

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

export { calculateTotalStrokesGained };