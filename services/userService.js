// services/userService.js
import {collection, doc, getDoc, getDocs, query, runTransaction} from 'firebase/firestore';
import {deepMergeDefaults, firestore} from '@/utils/firebase';
import {getDefaultData} from '@/utils/userUtils';
import {deepEqual} from '@/utils/RandomUtilities';
import {SCHEMA_VERSION} from "@/constants/Constants";
import {isHolePuttDataInvalid} from "@/utils/sessions/SessionUtils";

export const fetchUserData = async (uid) => {
    const docRef = doc(firestore, `users/${uid}`);
    const data = await getDoc(docRef);
    if (!data.exists()) throw new Error('User document does not exist');
    const userData = data.data();
    const updatedUserData = deepMergeDefaults(userData, getDefaultData(userData.firstName, userData.lastName));
    if (!deepEqual(userData, updatedUserData)) {
        await updateUserData(uid, updatedUserData);
    }
    return updatedUserData;
};

export const updateUserData = async (uid, newData) => {
    const userDocRef = doc(firestore, `users/${uid}`);
    await runTransaction(firestore, async (transaction) => {
        const userDoc = await transaction.get(userDocRef);
        if (!userDoc.exists()) throw new Error('Document does not exist');
        transaction.update(userDocRef, newData);
    });
};


export const getUserDataByID = async (id) => {
    const profilesRef = collection(firestore, "users");
    const docRef = doc(profilesRef, id);

    try {
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) return null;

        const data = docSnap.data();
        if (data.deleted) return null;

        return { ...data, uid: docSnap.id };
    } catch (e) {
        console.error("Error fetching profile: " + e);
        return null;
    }
}

export const getUserStatsByID = async (id) => {
    const docRef = doc(firestore, `users/${id}/stats/current`);
    try {
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) return null;

        const data = docSnap.data();
        if (data.deleted) return null;

        return { ...data, id: docSnap.id };
    } catch (e) {
        console.error("Error fetching user stats: " + e);
        return null;
    }
}

export const getUserSessionsByID = async (id) => {
    let sessions = [];

    const sessionQuery = query(collection(firestore, `users/${id}/sessions`));

    try {
        const querySnapshot = await getDocs(sessionQuery);
        sessions = querySnapshot.docs.map((sessionDoc) => {
            let data = sessionDoc.data();
            if (!data.schemaVersion || data.schemaVersion < SCHEMA_VERSION) {
                data = adaptOldSession(data);
                // Update the session in the database to the new format
                runTransaction(firestore, async (transaction) => {
                    const sessionDocRef = doc(firestore, `users/${id}/sessions`, sessionDoc.ref.id);
                    transaction.set(sessionDocRef, removeNulls(data));
                }).catch((error) => {
                    console.error("Error updating session to new format:", error);
                });
            }

            return ({
                id: sessionDoc.ref.id,
                ...data
            })
        });
    } catch (error) {
        console.error("Error refreshing sessions:", error);
    }
    sessions = sessions.sort((a, b) => new Date(b.meta.date) - new Date(a.meta.date));

    return sessions;
}

function removeNulls(obj) {
    if (Array.isArray(obj)) {
        return obj
            .map(removeNulls) // clean inside arrays too
            .filter(v => v != null);
    } else if (obj !== null && typeof obj === "object") {
        return Object.fromEntries(
            Object.entries(obj)
                .filter(([_, v]) => v != null)
                .map(([k, v]) => [k, removeNulls(v)])
        );
    }
    return obj;
}

export function adaptOldSession(old) {
    // If the session is already in the new format, return it as is
    if (old.meta && old.meta.schemaVersion && old.meta.schemaVersion >= SCHEMA_VERSION) {
        return old;
    }

    // version 1 didn't have a meta field, so we know it is version 1 if it doesn't have one
    if (!old.meta) {
        let filteredHoles = 0;
        let totalHoles = 0;
        if (old.type && (old.type === "full-simulation" || old.type === "full")) {
            totalHoles = old.tee?.number_of_holes ?? old.holes?.length ?? 0;
            old.holes.forEach(hole => {
                if (!isHolePuttDataInvalid(hole.puttData)) filteredHoles++;
            });
        } else {
            totalHoles = old.holes ?? 0;
            filteredHoles = old.filteredHoles ?? old.holes ?? 0;
        }
        let newType = "unknown";
        if (old.type === "full-round") newType = "full";
        else if (old.type === "round-simulation") newType = "sim";
        else if (old.type === "real-simulation") newType = "real";

        const adaptedPuttHistory = old.putts?.map(putt => ({
            ...putt,
            missXDistance: putt.xDistance ?? 0,
            missYDistance: putt.yDistance ?? 0,
        }));

        console.log("Adapting old session: ", old.id, " to new format.");

        return {
            id: old.id,
            meta: {
                schemaVersion: SCHEMA_VERSION,
                type: newType,
                mode: old.mode ?? null,
                difficulty: old.difficulty ?? null,
                date: old.date || null,
                durationMs: old.duration || null,
                units: old.units ?? null,
                isSynced: old.synced ?? false,

                tee: old.tee || null,
                courseID: old.courseID || null,
                courseName: old.courseName || null,
                clubName: old.clubName || null,
            },
            player: {
                putter: old.putter || "default",
                grip: old.grip || "default"
            },
            stats: {
                holes: totalHoles,
                holesPlayed: filteredHoles,
                totalPutts: old.totalPutts ?? old.puttStats.totalPutts ?? 0,
                puttCounts: old.puttCounts ?? old.puttStats.puttCounts ?? [],
                madePercent: old.madePercent ?? old.puttStats.madePercent ?? null,
                avgMiss: old.avgMiss ?? old.puttStats.avgMiss ?? null,
                strokesGained: old.strokesGained ?? old.puttStats.strokesGained ?? null,
                missData: old.missData ?? old.puttStats.missData ?? {},
                percentShort: old.percentShort ?? old.puttStats.percentShort ?? null,
                percentHigh: old.percentHigh ?? old.puttStats.percentHigh ?? null,
                leftRightBias: old.leftRightBias ?? old.puttStats.leftRightBias ?? null,
                shortPastBias: old.shortPastBias ?? old.puttStats.shortPastBias ?? null,

                // Full-round–only stats if present
                score: old.score ?? null,
                penalties: old.penalties ?? null,
                pars: old.pars ?? null,
                birdies: old.birdies ?? null,
                eagles: old.eagles ?? null,
                shotPlacementData: old.shotPlacementData ?? null,
            },
            puttHistory: adaptedPuttHistory ?? null,
            holeHistory: (newType === "full" ? old.holes ?? null : null),
        };
    }

    return old; // TODO change this if there are new versions
}