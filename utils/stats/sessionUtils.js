import {categorizeDistance} from "./statsHelpers";
import {convertUnits} from "../Conversions";
import {updateSimpleStats} from "../PuttUtils";
import {calculateAngle} from "./categoryUtils";

const statBreaks = [
    "leftToRight",
    "rightToLeft",
    "straight",
]

const statSlopes = [
    "downhill",
    "neutral",
    "uphill"
]

export const updateCategoryStats = (putt, session, newStats, userData, newPutters, averaging) => {
    const { units: sessionUnits } = session;
    const { units: preferredUnits } = userData.preferences;

    // Destructure and convert units
    let { distance, distanceMissed, misReadLine, misReadSlope, misHit, xDistance, yDistance, puttBreak } = putt;

    distance = convertUnits(distance, sessionUnits, preferredUnits);
    distanceMissed = convertUnits(distanceMissed, sessionUnits, preferredUnits);
    xDistance = convertUnits(xDistance, sessionUnits, preferredUnits);
    yDistance = convertUnits(yDistance, sessionUnits, preferredUnits);

    // Categorize putt distance
    const category = categorizeDistance(distance, preferredUnits);
    const statCategory = newStats[category];
    statCategory.rawPutts++;

    // Update averages
    if (averaging) {
        updateSimpleStats(
            userData,
            newStats.averagePerformance,
            { distance, distanceMissed, misReadLine, misReadSlope, misHit, puttBreak, xDistance, yDistance, totalPutts: putt.totalPutts },
            category
        );
    }

    if (session.putter !== "default") {
        const putter = newPutters.find((p) => p.type === session.putter);
        if (putter) {
            updateSimpleStats(
                userData,
                putter.stats,
                { distance, distanceMissed, misReadLine, misReadSlope, misHit, puttBreak, xDistance, yDistance, totalPutts: putt.totalPutts },
                category
            );
        }
    }

    // Update total putts and average miss
    updatePuttStats(statCategory, distanceMissed, putt, userData, puttBreak);

    // Update slope and break stats
    const slopeBreakStats = statCategory.slopeAndBreakDistribution[statSlopes[puttBreak[1]]][statBreaks[puttBreak[0]]];

    const degrees = calculateAngle(xDistance, yDistance);

    updateDirectionalStats(statCategory, slopeBreakStats, degrees, distanceMissed, userData.preferences.units);
};

const updatePuttStats = (statCategory, distanceMissed, putt, userData, puttBreak) => {
    if (distanceMissed === 0) {
        statCategory.totalPutts++;
    } else {
        statCategory.totalPutts += putt.totalPutts;
        statCategory.avgMiss = statCategory.avgMiss
            ? (statCategory.avgMiss + distanceMissed) / 2
            : distanceMissed;
    }

    if (putt.misReadLine) {
        statCategory.totalMisreadLines++;
        statCategory.misreadLinesDistribution[puttBreak[1]][puttBreak[0]]++;
    }

    if (putt.misReadSlope) {
        statCategory.totalMisreadSlopes++;
        statCategory.misreadSlopesDistribution[puttBreak[1]][puttBreak[0]]++;
    }
};

const updateDirectionalStats = (statCategory, slopeBreakStats, degrees, distanceMissed, units) => {
    const longThreshold = units === 0 ? 2 : 0.75;

    if (distanceMissed === 0) {
        statCategory.percentMade++;
        slopeBreakStats.made++;
    } else if (degrees > -22.5 && degrees <= 22.5) {
        incrementMissStats(statCategory, slopeBreakStats, 2, distanceMissed);
    } else if (degrees > 22.5 && degrees <= 67.5) {
        incrementMissStats(statCategory, slopeBreakStats, 1, distanceMissed);
        updateLongStats(statCategory, distanceMissed, longThreshold);
    } else if (degrees > 67.5 && degrees <= 112.5) {
        incrementMissStats(statCategory, slopeBreakStats, 0, distanceMissed);
        updateLongStats(statCategory, distanceMissed, longThreshold);
    } else if (degrees > 112.5 && degrees <= 157.5) {
        incrementMissStats(statCategory, slopeBreakStats, 7, distanceMissed);
        updateLongStats(statCategory, distanceMissed, longThreshold);
    } else if (degrees > -67.5 && degrees <= -22.5) {
        incrementMissStats(statCategory, slopeBreakStats, 3, distanceMissed);
        statCategory.percentShort++;
    } else if (degrees > -112.5 && degrees <= -67.5) {
        incrementMissStats(statCategory, slopeBreakStats, 4, distanceMissed);
        statCategory.percentShort++;
    } else if (degrees > -157.5 && degrees <= -112.5) {
        incrementMissStats(statCategory, slopeBreakStats, 5, distanceMissed);
        statCategory.percentShort++;
    } else {
        incrementMissStats(statCategory, slopeBreakStats, 6, distanceMissed);
    }
};

const incrementMissStats = (statCategory, slopeBreakStats, direction, distanceMissed) => {
    statCategory.missDistribution[direction]++;
    slopeBreakStats.misses[direction]++;
    slopeBreakStats.missDistances[direction] += distanceMissed;
};

const updateLongStats = (statCategory, distanceMissed, threshold) => {
    if (distanceMissed <= threshold) statCategory.percentJustLong++;
    else statCategory.percentTooLong++;
};

const processSession = (session, newStats, newPutters, userData) => {
    const averaging = newStats.averagePerformance.rounds < 5 &&
        (session.type === "round-simulation" || session.type === "real-simulation") &&
        session.holes === 18;
    if (averaging) newStats.averagePerformance.rounds++;

    if (session.putter !== "default") {
        const putter = newPutters.find((putter) => putter.type === session.putter);
        if (putter !== undefined)
            putter.stats.rounds += session.holes / 18;
    }

    console.log("session.putts", session.putts)
    session.putts.forEach(putt => {
        updateCategoryStats(putt, session, newStats, userData, newPutters, averaging);
    });
    console.log("session.totalPutts", session.totalPutts)

    if (session.putter !== "default") {
        const putter = newPutters.find((putter) => putter.type === session.putter);
        if (putter !== undefined) {
            const puttStats = putter.stats;

            if (puttStats.strokesGained.overall === 0) {
                puttStats.strokesGained.overall += 29 - session.totalPutts;
                return;
            }
            puttStats.strokesGained.overall += 29 - session.totalPutts;
            puttStats.strokesGained.overall /= 2;
        }
    }
};

export { processSession };