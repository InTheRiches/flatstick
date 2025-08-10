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
    let { distance, distanceMissed, misReadLine, misReadSlope, misHit, missXDistance, missYDistance, puttBreak } = putt;

    distance = convertUnits(distance, sessionUnits, preferredUnits);
    distanceMissed = convertUnits(distanceMissed, sessionUnits, preferredUnits);
    missXDistance = convertUnits(missXDistance, sessionUnits, preferredUnits);
    missYDistance = convertUnits(missYDistance, sessionUnits, preferredUnits);

    // Categorize putt distance
    const category = categorizeDistance(distance, preferredUnits);

    // Update averages
    if (averaging) {
        updateSimpleStats(
            userData,
            newStats,
            { distance, distanceMissed, misReadLine, misReadSlope, misHit, puttBreak, missXDistance, missYDistance, totalPutts: putt.totalPutts }, // we do this and not just pass putt as this is now converted
            category
        );
    }

    if (session.player.putter !== "default") {
        const putter = newPutters.find((p) => p.type === session.player.putter);
        if (putter && putter.stats.rounds < 6) {
            updateSimpleStats(
                userData,
                putter.stats,
                { distance, distanceMissed, misReadLine, misReadSlope, misHit, puttBreak, missXDistance, missYDistance, totalPutts: putt.totalPutts },
                category
            );
        }
    }

    if (session.player.grip !== "default") {
        const grip = newGrips.find((g) => g.type === session.player.grip);
        if (grip && grip.stats.rounds < 6) {
            updateSimpleStats(
                userData,
                grip.stats,
                { distance, distanceMissed, misReadLine, misReadSlope, misHit, puttBreak, missXDistance, missYDistance, totalPutts: putt.totalPutts },
                category
            );
        }
    }
};

const processSession = (session, newStats, yearlyStats, newPutters, newGrips, userData) => {
    const averaging = newStats.rounds < 5 &&
        (session.meta.type === "sim" || session.meta.type === "real" || session.meta.type === "full") &&
        session.stats.holes > 3;

    const filteringHoles = session.stats.holesPlayed;
    if (averaging) {
        newStats.rounds++;
        newStats.holes += filteringHoles;

        if (newStats.avgPuttsARound === 0) newStats.avgPuttsARound = (session.stats.totalPutts * (18 / filteringHoles));
        else newStats.avgPuttsARound = (newStats.avgPuttsARound + (session.stats.totalPutts * (18 / filteringHoles))) / 2;
    }

    if (session.player.putter !== "default") {
        const putter = newPutters.find((putter) => putter.type === session.player.putter);
        if (putter !== undefined) {
            putter.stats.rounds++;
            putter.stats.holes += filteringHoles;

            if (putter.stats.avgPuttsARound === 0) putter.stats.avgPuttsARound = (session.stats.totalPutts * (18 / filteringHoles));
            else putter.stats.avgPuttsARound = (putter.stats.avgPuttsARound + (session.stats.totalPutts * (18 / filteringHoles))) / 2;

            if (putter.rounds < 6) {
                if (putter.stats.strokesGained.overall === 0) {
                    putter.stats.strokesGained.overall += session.stats.strokesGained;
                    return;
                }
                putter.stats.strokesGained.overall += session.stats.strokesGained;
                putter.stats.strokesGained.overall /= 2; // TODO this is not correct, we need to average the strokes gained over the rounds, not just divide by 2
            }
        }
    }

    if (session.player.grip !== "default") {
        const grip = newGrips.find((grip) => grip.type === session.player.grip);
        if (grip !== undefined) {
            grip.stats.rounds++;
            grip.stats.holes += filteringHoles;

            if (grip.stats.avgPuttsARound === 0) grip.stats.avgPuttsARound = (session.stats.totalPutts * (18 / filteringHoles));
            else grip.stats.avgPuttsARound = (grip.stats.avgPuttsARound + (session.stats.totalPutts * (18 / filteringHoles))) / 2;

            if (grip.rounds < 6) {
                if (grip.stats.strokesGained.overall === 0) {
                    grip.stats.strokesGained.overall += session.stats.strokesGained;
                    return;
                }
                grip.stats.strokesGained.overall += session.stats.strokesGained;
                grip.stats.strokesGained.overall /= 2; // TODO this is not correct, we need to average the strokes gained over the rounds, not just divide by 2
            }
        }
    }

    // if the session's date is within a year of the current date, console log the strokes gained
    const sessionDate = new Date(session.meta.date);
    const currentDate = new Date();
    const oneYearAgo = new Date().setFullYear(currentDate.getFullYear() - 1);

    if (sessionDate > oneYearAgo) {
        yearlyStats.strokesGained += session.stats.strokesGained;
        yearlyStats.puttsAHole += session.stats.totalPutts / filteringHoles;
        yearlyStats.makePercent += session.stats.makePercent;

        if (yearlyStats.strokesGained !== 0) yearlyStats.strokesGained /= 2; // TODO this is not correct, we need to average the strokes gained over the rounds, not just divide by 2
        if (yearlyStats.puttsAHole !== 0) yearlyStats.puttsAHole /= 2; // TODO this is not correct, we need to average the strokes gained over the rounds, not just divide by 2
        if (yearlyStats.makePercent !== 0) yearlyStats.makePercent /= 2; // TODO this is not correct, we need to average the strokes gained over the rounds, not just divide by 2

        // // find the month and update the stats
        const monthIndex = (currentDate.getMonth() - sessionDate.getMonth() + 12) % 12;

        if (yearlyStats.months[monthIndex].puttsAHole === -999 || yearlyStats.months[monthIndex].puttsAHole === 0)
            yearlyStats.months[monthIndex].puttsAHole = session.stats.totalPutts / filteringHoles;
        else {
            yearlyStats.months[monthIndex].puttsAHole += session.stats.totalPutts / filteringHoles;
            yearlyStats.months[monthIndex].puttsAHole /= 2; // TODO this is not correct, we need to average the strokes gained over the rounds, not just divide by 2
        }

        if (yearlyStats.months[monthIndex].makePercent === -999 || yearlyStats.months[monthIndex].makePercent === 0)
            yearlyStats.months[monthIndex].makePercent = session.stats.makePercent;
        else {
            yearlyStats.months[monthIndex].makePercent += session.stats.makePercent;
            yearlyStats.months[monthIndex].makePercent /= 2; // TODO this is not correct, we need to average the strokes gained over the rounds, not just divide by 2
        }

        if (yearlyStats.months[monthIndex].strokesGained === -999 || yearlyStats.months[monthIndex].strokesGained === 0)
            yearlyStats.months[monthIndex].strokesGained = session.stats.strokesGained;
        else {
            yearlyStats.months[monthIndex].strokesGained += session.stats.strokesGained;
            yearlyStats.months[monthIndex].strokesGained /= 2; // TODO this is not correct, we need to average the strokes gained over the rounds, not just divide by 2
        }
    }

    session.puttHistory.forEach(putt => {
        updateCategoryStats(putt, session, newStats, userData, newPutters, newGrips, averaging);
    });
};

export { processSession };