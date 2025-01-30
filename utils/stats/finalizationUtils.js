import {roundTo} from "../roundTo";
import {cleanAverageStrokesGained} from "../StrokesGainedUtils";
import {cleanMadePutts, cleanMisreads, cleanPuttsAHole, createSimpleRefinedStats} from "../PuttUtils";
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
    newStats.misreads = cleanMisreads(newStats)
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

        // if we are not counting mishits, then we need to remove them from the total putts
        if (putter.stats.totalMishits === 0) {
            putter.stats.totalPutts -= putter.stats.puttsMishits;
        }

        finalizeStats(putter.stats, strokesGained);

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

    setPutters([{type: "default", name: "Standard Putter", stats: newStats}, ...cleanedPutters]);
}

const finalizeGrips = (setGrips, newStats, newGrips, strokesGained) => {
    const cleanedGrips = [];

    newGrips.forEach((grip) => {
        if (grip.stats.rounds === 0) {
            // the newPutters contains non refined stats, so we need to get the default refined stats and replac eit
            grip.stats = createSimpleRefinedStats();
            cleanedGrips.push(grip);
            return;
        }

        // if we are not counting mishits, then we need to remove them from the total putts
        if (grip.stats.totalMishits === 0) {
            grip.stats.totalPutts -= grip.stats.puttsMishits;
        }

        finalizeStats(grip.stats, strokesGained);

        cleanedGrips.push(grip);

        const userDocRef = doc(firestore, `users/${auth.currentUser.uid}/grips/${grip.type}`);
        runTransaction(firestore, async (transaction) => {
            const userDoc = await transaction.get(userDocRef);
            if (!userDoc.exists()) {
                console.error("Grip " + grip.type + " Document does not exist!");
                return;
            }
            transaction.update(userDocRef, grip.stats);
        }).catch(error => {
            console.error("Set grip transaction failed:", error);
        });
    });

    setGrips([{type: "default", name: "Standard Method", stats: newStats}, ...cleanedGrips]);
}

export {finalizeStats, finalizePutters, finalizeGrips};