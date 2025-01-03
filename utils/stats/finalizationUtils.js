import {roundTo} from "../roundTo";
import {cleanAverageStrokesGained} from "../StrokesGainedUtils";
import {cleanMadePutts, cleanPuttsAHole, createSimpleRefinedStats} from "../PuttUtils";
import {doc, runTransaction} from "firebase/firestore";
import {auth, firestore} from "@/utils/firebase";

const finalizeStats = (newStats, strokesGained) => {
    Object.keys(newStats).forEach(category => {
        if (category === "averagePerformance") {
            if (newStats.averagePerformance["rounds"] > 0) {
                newStats.averagePerformance.avgMiss = roundTo(newStats.averagePerformance["avgMiss"] / (newStats.averagePerformance["rounds"] * 18), 1);
                newStats.averagePerformance.totalDistance = roundTo(newStats.averagePerformance["totalDistance"] / newStats.averagePerformance["rounds"], 1);
                newStats.averagePerformance.puttsMisread = roundTo(newStats.averagePerformance["puttsMisread"] / newStats.averagePerformance["rounds"], 1);
                newStats.averagePerformance.onePutts = roundTo(newStats.averagePerformance["onePutts"] / newStats.averagePerformance["rounds"], 1);
                newStats.averagePerformance.twoPutts = roundTo(newStats.averagePerformance["twoPutts"] / newStats.averagePerformance["rounds"], 1);
                newStats.averagePerformance.threePutts = roundTo(newStats.averagePerformance["threePutts"] / newStats.averagePerformance["rounds"], 1);
                newStats.averagePerformance.leftRightBias = roundTo(newStats.averagePerformance.leftRightBias / (newStats.averagePerformance["rounds"]*18), 2);
                newStats.averagePerformance.shortPastBias = roundTo(newStats.averagePerformance.shortPastBias / (newStats.averagePerformance["rounds"]*18), 2);
                newStats.averagePerformance.strokesGained = cleanAverageStrokesGained(newStats.averagePerformance, strokesGained["overall"]);
                newStats.averagePerformance.puttsAHole = cleanPuttsAHole(newStats.averagePerformance);
                newStats.averagePerformance.madePutts = cleanMadePutts(newStats.averagePerformance);
                newStats.averagePerformance.avgMissDistance = newStats.averagePerformance.avgMissDistance.map((val, idx) => {
                    if (newStats.averagePerformance.puttsByDistance[idx] === 0) return 0;
                    return roundTo(val / newStats.averagePerformance.puttsByDistance[idx], 1);
                });
            }

            return;
        }
        const statCategory = newStats[category];
        statCategory.strokesGained = strokesGained[category];

        finalizeMissDistances(statCategory);
        calculatePercentages(statCategory);
    });
};

const finalizeMissDistances = (statCategory) => {
    for (const slope of ["uphill", "neutral", "downhill"]) {
        for (const breakType of ["straight", "leftToRight", "rightToLeft"]) {
            const slopeBreakStats = statCategory.slopeAndBreakDistribution[slope][breakType];

            if (slopeBreakStats.putts <= 0)
                continue;

            slopeBreakStats.avgMiss /= slopeBreakStats.putts; // Avg miss distance
            slopeBreakStats.made += slopeBreakStats.putts;

            // Calculate average of missDistances
            slopeBreakStats.missDistances = slopeBreakStats.missDistances.map((val, idx) => val === 0 || slopeBreakStats.misses[idx] === 0 ? val : val / slopeBreakStats.misses[idx]);

            statCategory.slopeAndBreakDistribution[slope][breakType] = slopeBreakStats;
        }
    }
};

const calculatePercentages = (statCategory) => {
    if (statCategory.rawPutts > 0) {
        statCategory.percentMade = (statCategory.percentMade / statCategory.rawPutts) * 100;
        statCategory.percentShort = (statCategory.percentShort / statCategory.rawPutts) * 100;
        statCategory.percentTooLong = (statCategory.percentTooLong / statCategory.rawPutts) * 100;
        statCategory.percentJustLong = (statCategory.percentJustLong / statCategory.rawPutts) * 100;
    }
};

const finalizePutters = (setPutters, newStats, newPutters, strokesGained) => {
    const cleanedPutters = [];

    newPutters.forEach((putter) => {
        if (putter.stats["rounds"] === 0) {
            // the newPutters contains non refined stats, so we need to get the default refined stats and replac eit
            putter.stats = createSimpleRefinedStats();
            cleanedPutters.push(putter);
            return;
        }

        const allPutts = putter.stats["rounds"] * 18;
        // if we are not counting mishits, then we need to remove them from the total putts
        if (putter.stats["totalMishits"] === 0) {
            putter.stats.totalPutts -= putter.stats.puttsMishits;
        }

        putter.stats.avgMiss = roundTo(putter.stats["avgMiss"] / allPutts, 1);
        putter.stats.totalDistance = roundTo(putter.stats["totalDistance"] / putter.stats["rounds"], 1);
        putter.stats.puttsMisread = roundTo(putter.stats["puttsMisread"] / putter.stats["rounds"], 1);
        putter.stats.onePutts = roundTo(putter.stats["onePutts"] / putter.stats["rounds"], 1);
        putter.stats.twoPutts = roundTo(putter.stats["twoPutts"] / putter.stats["rounds"], 1);
        putter.stats.threePutts = roundTo(putter.stats["threePutts"] / putter.stats["rounds"], 1);
        putter.stats.leftRightBias = roundTo(putter.stats.leftRightBias / (putter.stats.rounds * 18), 2);
        putter.stats.shortPastBias = roundTo(putter.stats.shortPastBias / (putter.stats.rounds * 18), 2);

        putter.stats.strokesGained = cleanAverageStrokesGained(putter.stats);
        putter.stats.puttsAHole = cleanPuttsAHole(putter.stats);
        putter.stats.madePutts = cleanMadePutts(putter.stats);

        putter.stats.avgMissDistance = putter.stats.avgMissDistance.map((val, idx) => {
            if (putter.stats.puttsByDistance[idx] === 0) return 0;
            return roundTo(val / putter.stats.puttsByDistance[idx], 1);
        });

        cleanedPutters.push(putter);

        const userDocRef = doc(firestore, `users/${auth.currentUser.uid}/putters/${putter.type}`);
        runTransaction(firestore, async (transaction) => {
            const userDoc = await transaction.get(userDocRef);
            if (!userDoc.exists()) {
                console.error("Putter " + putter.type + " Document does not exist!");
                return;
            }
            transaction.update(userDocRef, putter.stats);
        }).catch(error => {
            console.error("Set putter transaction failed:", error);
        });
    });

    setPutters([{type: "default", name: "No Putter", stats: newStats.averagePerformance}, ...cleanedPutters]);
}

export {finalizeStats, finalizePutters};