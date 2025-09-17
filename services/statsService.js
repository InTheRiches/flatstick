// services/statsService.js
import {collection, doc, getDoc, getDocs, query, runTransaction, setDoc} from 'firebase/firestore';
import {auth, deepMergeDefaults, firestore} from '@/utils/firebase';
import {calculateBaselineStrokesGained, calculateTotalStrokesGained} from '@/utils/StrokesGainedUtils';
import {createSimpleRefinedStats, createSimpleStats, createYearlyStats} from "@/utils/PuttUtils";
import {deepEqual} from "@/utils/RandomUtilities";
import {updateUserData} from "@/services/userService";
import {initializeBlankGrips, initializeBlankPutters} from "@/utils/stats/statsHelpers";
import {processSession} from "@/utils/stats/sessionUtils";
import {finalizeGrips, finalizePutters, finalizeStats} from "@/utils/stats/finalizationUtils";
import {createMonthAggregateStats, INTERP_BREAK_MAP, METERS_PER_DEGREE} from "@/constants/Constants";
import {getDistance, getElevationBilinear, getPuttGradient} from "@/utils/courses/gpsStatsEngine";

export const getAllStats = async (uid, yearlyStats) => {
    const docRef = doc(firestore, `users/${uid}/stats/current`);
    const document = await getDoc(docRef);
    if (!document.exists()) {
        return createSimpleRefinedStats();
    }
    const data = document.data();
    const updatedStats = deepMergeDefaults(data, createSimpleRefinedStats());
    if (!deepEqual(data, updatedStats)) {
        await setDoc(docRef, updatedStats);
    }

    let newYearlyStats = JSON.parse(JSON.stringify(yearlyStats || {}));

    // this is because yearly stats don't update often, so we just assume that we don't have to update it
    if (Object.keys(yearlyStats).length === 0) {
        const yearlyDocument = await getDoc(doc(firestore, `users/${uid}/stats/${new Date().getFullYear()}`));
        if (!yearlyDocument.exists()) {
            await updateFirebaseYearlyStats(createYearlyStats());
            return {currentStats: updatedStats, yearlyStats: newYearlyStats};
        }

        const yearlyData = yearlyDocument.data();

        // check to make sure it is updated and has all the necessary fields
        const updatedYearlyStats = deepMergeDefaults({ ...yearlyData }, createYearlyStats());

        newYearlyStats = updatedYearlyStats;

        // if they arent equal, update the stats in firebase
        if (yearlyData !== updatedYearlyStats)
            await updateFirebaseYearlyStats(updatedYearlyStats);
    }

    return {currentStats: updatedStats, yearlyStats: newYearlyStats};
};

export const addAggregateStats = async (uid, session, byMonthStats, greens) => {
    const sessionDate = new Date(session.meta.date);
    const monthKey = `${sessionDate.getFullYear()}-${String(sessionDate.getMonth() + 1).padStart(2, '0')}`;

    console.log("byMonthStats before update:", byMonthStats[monthKey]);

    const monthStats = createMonthAggregateStats(); // byMonthStats[monthKey] ||

    monthStats.holesPlayed += session.stats.holesPlayed;
    monthStats.rounds += 1;
    monthStats.totalPutts += session.stats.totalPutts;

    session.holeHistory.forEach((hole, index) => {
        if (!hole.puttData) return;
        if (!(hole.puttData.taps && hole.puttData.taps.length > 0)) return;

        let lidar = null;

        for (const g of greens) {
            if (g.hole === (index+1).toString()) {
                lidar = g.lidar;
                break;
            }
        }

        if (!lidar) {
            console.warn(`No lidar data found for hole ${hole.hole} in session ${session.id}`);
            return;
        }

        const pin = hole.puttData.pinLocation;
        let misreadHole = false;

        if (hole.puttData.taps.length > 2) monthStats.averageRound.threePlusPutts++;
        else if (hole.puttData.taps.length === 2) monthStats.averageRound.twoPutts++;
        else monthStats.averageRound.onePutts++;

        for (let i = 0; i < hole.puttData.taps.length; i++) {
            const putt = hole.puttData.taps[i];
            const isMadePutt = (i === hole.puttData.taps.length - 1);
            const endLoc = isMadePutt ? pin : hole.puttData.taps[i + 1];
            const distance = getDistance(putt, hole.puttData.pinLocation);
            const distanceCategory = distance.feet < 6 ? 0 : distance.feet < 12 ? 1 : distance.feet < 20 ? 2 : 3;

            const midPoint = { x: (putt.longitude + pin.longitude) / 2, y: (putt.latitude + pin.latitude) / 2 };
            const grad = getPuttGradient(midPoint.x, midPoint.y, lidar);

            const zTap = getElevationBilinear(putt.longitude, putt.latitude, lidar);
            const zPin = getElevationBilinear(pin.longitude, pin.latitude, lidar);
            const dz_m = zPin - zTap;

            const slope = dz_m / distance.meters;
            // Convert lat/long differences to meters
            const latDiffMeters = (pin.latitude - putt.latitude) * 111320;
            const lonDiffMeters = (pin.longitude - putt.longitude) * 111320 * Math.cos(putt.latitude * Math.PI / 180);
            const sideSlope = grad.dx * -latDiffMeters + grad.dy * lonDiffMeters;

            // thresholds (tune as needed, e.g. 0.01 = 1% slope)
            const SLOPE_THRESH = 0.01;
            const SIDE_THRESH = 0.01;

            console.log("Degree of slope:", slope * 100, "%, side slope:", sideSlope * 100, "%");

            let breakDirection = INTERP_BREAK_MAP.n; // default neutral

            if (Math.abs(slope) < SLOPE_THRESH && Math.abs(sideSlope) < SIDE_THRESH) {
                breakDirection = INTERP_BREAK_MAP.n; // flat enough, treat as neutral
            } else {
                // if side slope is negligible, use slope only
                if (Math.abs(sideSlope) < SIDE_THRESH) {
                    breakDirection = slope > 0 ? INTERP_BREAK_MAP.t : INTERP_BREAK_MAP.b;
                }
                // if slope is negligible, use side slope only
                else if (Math.abs(slope) < SLOPE_THRESH) {
                    breakDirection = sideSlope > 0 ? INTERP_BREAK_MAP.l : INTERP_BREAK_MAP.r;
                }
                // otherwise, use vector-based approach
                else {
                    const breakVec = { dx: -grad.dx, dy: -grad.dy };
                    if (breakVec.dx !== 0 || breakVec.dy !== 0) {
                        const breakAngle = Math.atan2(breakVec.dy, breakVec.dx) * (180 / Math.PI);
                        if (breakAngle >= -22.5 && breakAngle < 22.5) breakDirection = INTERP_BREAK_MAP.r;
                        else if (breakAngle >= 22.5 && breakAngle < 67.5) breakDirection = INTERP_BREAK_MAP.tr;
                        else if (breakAngle >= 67.5 && breakAngle < 112.5) breakDirection = INTERP_BREAK_MAP.t;
                        else if (breakAngle >= 112.5 && breakAngle < 157.5) breakDirection = INTERP_BREAK_MAP.tl;
                        else if (breakAngle >= 157.5 || breakAngle < -157.5) breakDirection = INTERP_BREAK_MAP.l;
                        else if (breakAngle >= -157.5 && breakAngle < -112.5) breakDirection = INTERP_BREAK_MAP.bl;
                        else if (breakAngle >= -112.5 && breakAngle < -67.5) breakDirection = INTERP_BREAK_MAP.b;
                        else if (breakAngle >= -67.5 && breakAngle < -22.5) breakDirection = INTERP_BREAK_MAP.br;
                    }
                }
            }

            if (i === 0) {
                const expectedStrokes = calculateBaselineStrokesGained(distance.feet);
                monthStats.strokesGained.expectedStrokes += expectedStrokes;
                monthStats.strokesGained.expectedStrokesByDistance[distanceCategory] += expectedStrokes;
                monthStats.strokesGained.expectedStrokesBySlope[breakDirection[1]][breakDirection[0]] += expectedStrokes;

                monthStats.holesByFirstPuttDistance[distanceCategory]++;
                monthStats.holesByFirstPuttSlope[breakDirection[1]][breakDirection[0]]++;

                monthStats.puttsAHole.byFirstPuttDistance[distanceCategory] += hole.puttData.taps.length;
                monthStats.puttsAHole.byFirstPuttSlope[breakDirection[1]][breakDirection[0]] += hole.puttData.taps.length;

                if (putt.misreadSlope || putt.misreadLine) {
                    monthStats.puttsAHole.whenMisread += hole.puttData.taps.length;
                }

                monthStats.averageRound.totalDistance += distance.feet;
            }

            monthStats.totalPuttsByDistance[distanceCategory]++;
            monthStats.totalPuttsBySlope[breakDirection[1]][breakDirection[0]]++;

            if (isMadePutt) {
                monthStats.madeData.totalMadePutts++;
                monthStats.madeData.byDistance[distanceCategory]++;
                monthStats.madeData.totalMadeDistance += distance.feet;
                monthStats.madeData.slopes[breakDirection[1]][breakDirection[0]]++;
            } else {
                const distanceMissed = getDistance(endLoc, pin);
                monthStats.missData.totalMissedPutts++;
                monthStats.missData.totalMissDistance += distanceMissed.feet;
                monthStats.missData.missedPuttsByDistance[distanceCategory]++;
                monthStats.missData.missByDistance[distanceCategory] += distanceMissed.feet;

                const dx = pin.longitude - putt.longitude, dy = pin.latitude - putt.latitude;
                const mx = endLoc.longitude - pin.longitude, my = endLoc.latitude - pin.latitude;
                const angle = Math.atan2(dy, dx), cos = Math.cos(-angle), sin = Math.sin(-angle);

                const rx = mx * cos - my * sin, ry = mx * sin + my * cos;
                const mPerLon = METERS_PER_DEGREE * Math.cos(putt.latitude * Math.PI / 180);

                const longIn = rx * mPerLon * 39.3701;
                const latIn  = ry * METERS_PER_DEGREE * 39.3701;

                monthStats.missData.totalLatMiss += latIn;
                monthStats.missData.totalLongMiss += longIn;

                // if short
                if (longIn < 0) monthStats.missData.totalShortMisses++;

                const breaksLeft = sideSlope > 0;
                const missedRight = latIn < 0;

                if ((breaksLeft && missedRight) || (!breaksLeft && !missedRight)) {
                    monthStats.missData.totalHighMisses++;
                }
            }

            if (putt.misreadSlope || putt.misreadLine) {
                if (!misreadHole) {
                    monthStats.puttsAHole.whenMisread += hole.puttData.taps.length;
                    misreadHole = true;
                }

                monthStats.missData.totalMisreads++;
                if (putt.misreadLine) {
                    monthStats.missData.totalLineMisreads++;
                    monthStats.missData.misreadLineByDistance[distanceCategory]++;
                    monthStats.missData.misreadLineBySlope[breakDirection[1]][breakDirection[0]]++;
                }
                if (putt.misreadSlope) {
                    monthStats.missData.totalSlopeMisreads++;
                    monthStats.missData.misreadSlopeByDistance[distanceCategory]++;
                    monthStats.missData.misreadSlopeBySlope[breakDirection[1]][breakDirection[0]]++;
                }
            }
        }
    });

    console.log("Updated month stats for", monthKey, monthStats);

    byMonthStats[monthKey] = monthStats;
    return byMonthStats;

    // strokesGained = (expectedPutts - totalPutts) / (holesPlayed / 18)
}

export const updateStats = async (uid, userData, sessions, putters, grips, setCurrentStats, setYearlyStats, setPutters, setGrips) => {
    const newStats = createSimpleStats();
    const newYearlyStats = createYearlyStats();
    const strokesGained = calculateTotalStrokesGained(userData, sessions);
    const newPutters = initializeBlankPutters(putters);
    const newGrips = initializeBlankGrips(grips);

    sessions.forEach((session) => processSession(session, newStats, newYearlyStats, newPutters, newGrips, userData));

    if (newStats.rounds > 0) finalizeStats(newStats, strokesGained);

    let totalPutts = 0; // TODO Implement calculation
    await updateUserData(uid, { totalPutts, sessions: sessions.length, strokesGained: strokesGained.overall });
    await setDoc(doc(firestore, `users/${uid}/stats/current`), newStats);

    newYearlyStats.months.forEach((month, index) => {
        if (index === newYearlyStats.months.length - 1) return;
        if (month.strokesGained === -999 && newYearlyStats.months[index + 1].strokesGained !== -999) {
            newYearlyStats.months[index] = index > 0 ? { ...newYearlyStats.months[index - 1] } : { ...month, strokesGained: 0 };
        }
        if (month.puttsAHole === -999 && newYearlyStats.months[index + 1].puttsAHole !== -999) {
            newYearlyStats.months[index].puttsAHole = index > 0 ? { ...newYearlyStats.months[index - 1].puttsAHole } : createSimpleRefinedStats().puttsAHole;
        }
    });

    await setDoc(doc(firestore, `users/${uid}/stats/${new Date().getFullYear()}`), newYearlyStats);

    setCurrentStats(newStats);
    setYearlyStats(newYearlyStats);
    finalizePutters(setPutters, newStats, newPutters, strokesGained);
    finalizeGrips(setGrips, newStats, newGrips, strokesGained);

    return newStats;
};

export const getPreviousStats = async (uid) => {
    const statsQuery = query(collection(firestore, `users/${uid}/stats`));
    const querySnapshot = await getDocs(statsQuery);
    return querySnapshot.docs
        .filter((doc) => doc.id !== 'current' && doc.id.length > 4)
        .map((doc) => doc.data());
};

export const updateFirebaseYearlyStats = async (yearly) => {
    const yearlyDocRef = doc(firestore, `users/${auth.currentUser.uid}/stats/` + new Date().getFullYear());
    try {
        await runTransaction(firestore, async (transaction) => {
            transaction.update(yearlyDocRef, yearly);
        });
    } catch (error) {
        console.warn("Update yearly stats transaction failed, attempting alternative:", error);
        try {
            await setDoc(yearlyDocRef, yearly);
        } catch (error) {
            console.error("Update yearly stats failed:", error)
        }
    }
}

export const calculateSpecificStats = (userData, puttSessions, putters, grips, nonPersistentData) => {
    const stats = createSimpleStats();
    const filteredSessions = puttSessions.filter(
        (session) =>
            (nonPersistentData.filtering.putter === 0 || session.putter === putters[nonPersistentData.filtering.putter].type) &&
            (nonPersistentData.filtering.grip === 0 || session.grip === grips[nonPersistentData.filtering.grip].type)
    );
    const strokesGained = calculateTotalStrokesGained(userData, filteredSessions);
    const newPutters = initializeBlankPutters(putters);
    const newGrips = initializeBlankGrips(grips);

    filteredSessions.forEach((session) => processSession(session, stats, newPutters, newGrips, userData));

    return stats.rounds > 0 ? finalizeStats(stats, strokesGained) : createSimpleRefinedStats();
};