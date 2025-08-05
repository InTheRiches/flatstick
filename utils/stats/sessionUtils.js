import {categorizeDistance} from "./statsHelpers";
import {convertUnits} from "../Conversions";
import {updateSimpleStats} from "../PuttUtils";

export const updateCategoryStats = (putt, session, newStats, userData, newPutters, newGrips, averaging) => {
    // this means that they holed out
    if (putt.distance === 0) {
        return;
    }

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

const processSession = (session, newStats, yearlyStats, newPutters, newGrips, userData) => {
    const averaging = newStats.rounds < 5 &&
        (session.type === "round-simulation" || session.type === "real-simulation" || session.type === "full-round") &&
        session.holes > 3;

    const filteringHoles = session.filteredHoles !== undefined ? session.filteredHoles : session.holes;
    if (averaging) {
        newStats.rounds++;
        newStats.holes += filteringHoles;

        if (newStats.avgPuttsARound === 0) newStats.avgPuttsARound = (session.totalPutts * (18 / filteringHoles));
        else newStats.avgPuttsARound = (newStats.avgPuttsARound + (session.totalPutts * (18 / filteringHoles))) / 2;
    }

    if (session.putter !== "default") {
        const putter = newPutters.find((putter) => putter.type === session.putter);
        if (putter !== undefined) {
            putter.stats.rounds++;
            putter.stats.holes += filteringHoles;

            if (putter.stats.avgPuttsARound === 0) putter.stats.avgPuttsARound = (session.totalPutts * (18 / filteringHoles));
            else putter.stats.avgPuttsARound = (putter.stats.avgPuttsARound + (session.totalPutts * (18 / filteringHoles))) / 2;

            if (putter.rounds < 6) {
                if (putter.stats.strokesGained.overall === 0) {
                    putter.stats.strokesGained.overall += session.strokesGained;
                    return;
                }
                putter.stats.strokesGained.overall += session.strokesGained;
                putter.stats.strokesGained.overall /= 2;
            }
        }
    }

    if (session.grip !== "default") {
        const grip = newGrips.find((grip) => grip.type === session.grip);
        if (grip !== undefined) {
            grip.stats.rounds++;
            grip.stats.holes += filteringHoles;

            if (grip.stats.avgPuttsARound === 0) grip.stats.avgPuttsARound = (session.totalPutts * (18 / filteringHoles));
            else grip.stats.avgPuttsARound = (grip.stats.avgPuttsARound + (session.totalPutts * (18 / filteringHoles))) / 2;

            if (grip.rounds < 6) {
                if (grip.stats.strokesGained.overall === 0) {
                    grip.stats.strokesGained.overall += session.strokesGained;
                    return;
                }
                grip.stats.strokesGained.overall += session.strokesGained;
                grip.stats.strokesGained.overall /= 2;
            }
        }
    }

    // if the session's date is within a year of the current date, console log the strokes gained
    const sessionDate = new Date(session.date);
    const currentDate = new Date();
    const oneYearAgo = new Date().setFullYear(currentDate.getFullYear() - 1);

    if (sessionDate > oneYearAgo) {
        yearlyStats.strokesGained += session.strokesGained;
        yearlyStats.puttsAHole += session.totalPutts / filteringHoles;
        yearlyStats.makePercent += session.makePercent;

        if (yearlyStats.strokesGained !== 0) yearlyStats.strokesGained /= 2;
        if (yearlyStats.puttsAHole !== 0) yearlyStats.puttsAHole /= 2;
        if (yearlyStats.makePercent !== 0) yearlyStats.makePercent /= 2;

        // // find the month and update the stats
        const monthIndex = (currentDate.getMonth() - sessionDate.getMonth() + 12) % 12;

        if (yearlyStats.months[monthIndex].puttsAHole === -999 || yearlyStats.months[monthIndex].puttsAHole === 0)
            yearlyStats.months[monthIndex].puttsAHole = session.totalPutts / filteringHoles;
        else {
            yearlyStats.months[monthIndex].puttsAHole += session.totalPutts / filteringHoles;
            yearlyStats.months[monthIndex].puttsAHole /= 2;
        }

        if (yearlyStats.months[monthIndex].makePercent === -999 || yearlyStats.months[monthIndex].makePercent === 0)
            yearlyStats.months[monthIndex].makePercent = session.makePercent;
        else {
            yearlyStats.months[monthIndex].makePercent += session.makePercent;
            yearlyStats.months[monthIndex].makePercent /= 2;
        }

        if (yearlyStats.months[monthIndex].strokesGained === -999 || yearlyStats.months[monthIndex].strokesGained === 0)
            yearlyStats.months[monthIndex].strokesGained = session.strokesGained;
        else {
            yearlyStats.months[monthIndex].strokesGained += session.strokesGained;
            yearlyStats.months[monthIndex].strokesGained /= 2;
        }
    }

    session.putts.forEach(putt => {
        updateCategoryStats(putt, session, newStats, userData, newPutters, newGrips, averaging);
    });
};

export { processSession };