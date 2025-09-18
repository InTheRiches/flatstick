// services/statsService.js
import {collection, getDocs, query, setDoc} from 'firebase/firestore';
import {deepMergeDefaults, firestore} from '@/utils/firebase';
import {calculateBaselineStrokesGained} from '@/utils/StrokesGainedUtils';
import {deepEqual} from "@/utils/RandomUtilities";
import {createMonthAggregateStats, INTERP_BREAK_MAP, METERS_PER_DEGREE} from "@/constants/Constants";
import {getDistance, getElevationBilinear, getPuttGradient} from "@/utils/courses/gpsStatsEngine";
import deepAdd from "@/utils/DeepAdd";

export const getAllStats = async (uid) => {
    const statsRef = collection(firestore, "users", uid, "monthlyStats");
    const snapshot = await getDocs(query(statsRef));

    const data = {};
    snapshot.forEach(async (doc) => {
        const monthData = doc.data();
        const updatedMonth = deepMergeDefaults(monthData, createMonthAggregateStats());
        data[doc.id] = updatedMonth; // doc.id is "2025-09"

        if (!deepEqual(data, updatedMonth)) {
            await setDoc(doc(firestore, "users", uid, "monthlyStats", doc.id), updatedMonth);
        }
    });

    return data;
};

export const addAggregateStats = async (uid, session, byMonthStats, setPutters, setGrips, greens=[], greenLidar = []) => {
    const sessionDate = new Date(session.meta.date);
    const monthKey = `${sessionDate.getFullYear()}-${String(sessionDate.getMonth() + 1).padStart(2, '0')}`;

    const monthStats = createMonthAggregateStats();

    monthStats.holesPlayed += session.stats.holesPlayed;
    monthStats.rounds += 1;
    monthStats.totalPutts += session.stats.totalPutts;

    session.holeHistory.forEach((hole, index) => {
        if (!hole.puttData) return;
        if (!(hole.puttData.taps && hole.puttData.taps.length > 0)) return;

        let lidar = null;

        if (greenLidar && greenLidar.length > 0) {
            lidar = greenLidar;
        } else {
            for (const g of greens) {
                if (g.hole === (index+1).toString()) {
                    lidar = g.lidar;
                    break;
                }
            }
        }

        if (!lidar) {
            console.warn(`No lidar data found for hole ${hole.hole} in session ${session.id}`);
            return;
        }

        const pin = hole.puttData.pinLocation;

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
                    monthStats.misreadData.totalHolesMisread++;
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

                // find the distance using latIn and longIn to see if it matches distanceMissed
                const checkDist = Math.sqrt(longIn * longIn + latIn * latIn);
                if (Math.abs((checkDist/12) - distanceMissed.feet) > 1) {
                    console.warn(`Distance mismatch on miss calculation. Calculated: ${(checkDist/12).toFixed(2)} ft, Actual: ${distanceMissed.feet.toFixed(2)} ft`);
                }

                // if short
                if (longIn < 0) monthStats.missData.totalShortMisses++;

                const breaksLeft = sideSlope > 0;
                const missedRight = latIn < 0;

                if ((breaksLeft && missedRight) || (!breaksLeft && !missedRight)) {
                    monthStats.missData.totalHighMisses++;
                }
            }

            if (putt.misreadSlope || putt.misreadLine) {
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

    byMonthStats[monthKey] = byMonthStats[monthKey] ? deepAdd(byMonthStats[monthKey], monthStats) : monthStats;

    setGrips((prevGrips) =>
        prevGrips.map((g) => {
            if (g.type !== session.player.grip)
                return g;
            return {
                ...g,
                stats: {
                    ...g.stats,
                    [monthKey]: g.stats[monthKey]
                        ? deepAdd(g.stats[monthKey], monthStats)
                        : monthStats,
                },
            };
        })
    );

    setPutters((prevPutters) =>
        prevPutters.map((p) => {
            if (p.type !== session.player.putter)
                return p;
            return {
                ...p,
                stats: {
                    ...p.stats,
                    [monthKey]: p.stats[monthKey]
                        ? deepAdd(p.stats[monthKey], monthStats)
                        : monthStats,
                },
            };
        })
    );

    return byMonthStats;

    // strokesGained = (expectedPutts - totalPutts) / (holesPlayed / 18)
}

export const getPreviousStats = async (uid) => {
    const statsQuery = query(collection(firestore, `users/${uid}/stats`));
    const querySnapshot = await getDocs(statsQuery);
    return querySnapshot.docs
        .filter((doc) => doc.id !== 'current' && doc.id.length > 4)
        .map((doc) => doc.data());
};