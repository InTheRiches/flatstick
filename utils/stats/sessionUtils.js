import {categorizeDistance} from "./statsHelpers";
import {convertUnits} from "../Conversions";
import {updateSimpleStats} from "../PuttUtils";

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

export const updateCategoryStats = (putt, session, newStats, userData, newPutters, newGrips, averaging) => {
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

    // Update averages
    if (averaging) {
        updateSimpleStats(
            userData,
            newStats,
            { distance, distanceMissed, misReadLine, misReadSlope, misHit, puttBreak, xDistance, yDistance, totalPutts: putt.totalPutts },
            category
        );
    }

    if (session.putter !== "default") {
        const putter = newPutters.find((p) => p.type === session.putter);
        if (putter && putter.stats.rounds < 6) {
            updateSimpleStats(
                userData,
                putter.stats,
                { distance, distanceMissed, misReadLine, misReadSlope, misHit, puttBreak, xDistance, yDistance, totalPutts: putt.totalPutts },
                category
            );
        }
    }

    if (session.grip !== "default") {
        const grip = newGrips.find((g) => g.type === session.grip);
        if (grip && grip.stats.rounds < 6) {
            updateSimpleStats(
                userData,
                grip.stats,
                { distance, distanceMissed, misReadLine, misReadSlope, misHit, puttBreak, xDistance, yDistance, totalPutts: putt.totalPutts },
                category
            );
        }
    }
};

const processSession = (session, newStats, newPutters, newGrips, userData) => {
    const averaging = newStats.rounds < 5 &&
        (session.type === "round-simulation" || session.type === "real-simulation") &&
        session.holes > 3;
    if (averaging) newStats.rounds++;

    if (session.putter !== "default") {
        const putter = newPutters.find((putter) => putter.type === session.putter);
        if (putter !== undefined) {
            putter.stats.rounds++;

            if (putter.rounds < 6) {
                if (putter.stats.strokesGained.overall === 0) {
                    putter.stats.strokesGained.overall += ((session.totalPutts / 18) * 29) - session.totalPutts;
                    return;
                }
                putter.stats.strokesGained.overall += ((session.totalPutts / 18) * 29) - session.totalPutts;
                putter.stats.strokesGained.overall /= 2;
            }
        }
    }

    if (session.grip !== "default") {
        const grip = newGrips.find((grip) => grip.type === session.grip);
        if (grip !== undefined) {
            grip.stats.rounds++;

            if (grip.rounds < 6) {
                if (grip.stats.strokesGained.overall === 0) {
                    grip.stats.strokesGained.overall += ((session.totalPutts / 18) * 29) - session.totalPutts;
                    return;
                }
                grip.stats.strokesGained.overall += ((session.totalPutts / 18) * 29) - session.totalPutts;
                grip.stats.strokesGained.overall /= 2;
            }
        }
    }

    session.putts.forEach(putt => {
        updateCategoryStats(putt, session, newStats, userData, newPutters, newGrips, averaging);
    });
};

export { processSession };