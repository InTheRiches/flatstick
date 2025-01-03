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
        if (putter) {
            updateSimpleStats(
                userData,
                putter.stats,
                { distance, distanceMissed, misReadLine, misReadSlope, misHit, puttBreak, xDistance, yDistance, totalPutts: putt.totalPutts },
                category
            );
        }
    }
};

const processSession = (session, newStats, newPutters, userData) => {
    const averaging = newStats.rounds < 5 &&
        (session.type === "round-simulation" || session.type === "real-simulation") &&
        session.holes === 18;
    if (averaging) newStats.rounds++;

    if (session.putter !== "default") {
        const putter = newPutters.find((putter) => putter.type === session.putter);
        if (putter !== undefined)
            putter.stats.rounds += session.holes / 18;
    }

    session.putts.forEach(putt => {
        updateCategoryStats(putt, session, newStats, userData, newPutters, averaging);
    });

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