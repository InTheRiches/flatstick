// services/statsService.js
import {collection, doc, getDoc, getDocs, query, runTransaction, setDoc} from 'firebase/firestore';
import {auth, deepMergeDefaults, firestore} from '@/utils/firebase';
import {calculateTotalStrokesGained} from '@/utils/StrokesGainedUtils';
import {adaptFullRoundSession} from '@/utils/sessions/SessionUtils';
import {createSimpleRefinedStats, createSimpleStats, createYearlyStats} from "@/utils/PuttUtils";
import {deepEqual} from "@/utils/RandomUtilities";
import {updateUserData} from "@/services/userService";
import {initializeBlankGrips, initializeBlankPutters} from "@/utils/stats/statsHelpers";
import {processSession} from "@/utils/stats/sessionUtils";
import {finalizeGrips, finalizePutters, finalizeStats} from "@/utils/stats/finalizationUtils";

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

export const updateStats = async (uid, userData, puttSessions, fullRoundSessions, putters, grips, setCurrentStats, setYearlyStats, setPutters, setGrips) => {
    const newStats = createSimpleStats();
    const newYearlyStats = createYearlyStats();
    const strokesGained = calculateTotalStrokesGained(userData, puttSessions, fullRoundSessions);
    const newPutters = initializeBlankPutters(putters);
    const newGrips = initializeBlankGrips(grips);
    const sessions = [...puttSessions, ...fullRoundSessions.filter(session => session.puttStats.totalPutts > 0).map(adaptFullRoundSession)];

    sessions.forEach((session) => processSession(session, newStats, newYearlyStats, newPutters, newGrips, userData));

    if (newStats.rounds > 0) finalizeStats(newStats, strokesGained);

    let totalPutts = 0; // Implement calculation
    await updateUserData(uid, { totalPutts, sessions: puttSessions.length, strokesGained: strokesGained.overall });
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