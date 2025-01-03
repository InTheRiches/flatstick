import {roundTo} from "../roundTo";
import {cleanAverageStrokesGained} from "../StrokesGainedUtils";
import {cleanMadePutts, cleanPuttsAHole, createSimpleRefinedStats} from "../PuttUtils";
import {doc, runTransaction} from "firebase/firestore";
import {auth, firestore} from "@/utils/firebase";

const finalizeStats = (newStats, strokesGained) => {
    newStats.avgMiss = roundTo(newStats.avgMiss / (newStats.rounds * 18), 1);
    newStats.totalDistance = roundTo(newStats.totalDistance / newStats.rounds, 1);
    newStats.puttsMisread = roundTo(newStats.puttsMisread / newStats.rounds, 1);
    newStats.onePutts = roundTo(newStats.onePutts / newStats.rounds, 1);
    newStats.twoPutts = roundTo(newStats.twoPutts / newStats.rounds, 1);
    newStats.threePutts = roundTo(newStats.threePutts / newStats.rounds, 1);
    newStats.leftRightBias = roundTo(newStats.leftRightBias / (newStats.rounds*18), 2);
    newStats.shortPastBias = roundTo(newStats.shortPastBias / (newStats.rounds*18), 2);
    newStats.strokesGained = cleanAverageStrokesGained(newStats, strokesGained.overall);
    newStats.puttsAHole = cleanPuttsAHole(newStats);
    newStats.madePutts = cleanMadePutts(newStats);
    newStats.avgMissDistance = newStats.avgMissDistance.map((val, idx) => {
        if (newStats.puttsByDistance[idx] === 0) return 0;
        return roundTo(val / newStats.puttsByDistance[idx], 1);
    });
};

const finalizePutters = (setPutters, newStats, newPutters, strokesGained) => {
    const cleanedPutters = [];

    newPutters.forEach((putter) => {
        if (putter.stats.rounds === 0) {
            // the newPutters contains non refined stats, so we need to get the default refined stats and replac eit
            putter.stats = createSimpleRefinedStats();
            cleanedPutters.push(putter);
            return;
        }

        const allPutts = putter.stats.rounds * 18;
        // if we are not counting mishits, then we need to remove them from the total putts
        if (putter.stats.totalMishits === 0) {
            putter.stats.totalPutts -= putter.stats.puttsMishits;
        }

        putter.stats.avgMiss = roundTo(putter.stats.avgMiss / allPutts, 1);
        putter.stats.totalDistance = roundTo(putter.stats.totalDistance / putter.stats.rounds, 1);
        putter.stats.puttsMisread = roundTo(putter.stats.puttsMisread / putter.stats.rounds, 1);
        putter.stats.onePutts = roundTo(putter.stats.onePutts / putter.stats.rounds, 1);
        putter.stats.twoPutts = roundTo(putter.stats.twoPutts / putter.stats.rounds, 1);
        putter.stats.threePutts = roundTo(putter.stats.threePutts / putter.stats.rounds, 1);
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

    setPutters([{type: "default", name: "No Putter", stats: newStats}, ...cleanedPutters]);
}

export {finalizeStats, finalizePutters};