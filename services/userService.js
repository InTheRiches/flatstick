// services/userService.js
import {collection, doc, getDoc, getDocs, orderBy, query, runTransaction} from 'firebase/firestore';
import {deepMergeDefaults, firestore} from '@/utils/firebase';
import {getDefaultData} from '@/utils/userUtils';
import {deepEqual} from '@/utils/RandomUtilities';

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

        console.log("doc data: " + JSON.stringify(data));

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
    let fullRoundSessions = [];

    const sessionQuery = query(collection(firestore, `users/${id}/sessions`), orderBy("timestamp", "desc"));
    try {
        const querySnapshot = await getDocs(sessionQuery);
        sessions = querySnapshot.docs.map((doc) => {
            return ({
                id: doc.ref.id,
                ...doc.data()
            })
        });
    } catch (error) {
        console.error("Error refreshing sessions:", error);
    }

    const fullRoundSessionQuery = query(collection(firestore, `users/${id}/fullRoundSessions`), orderBy("timestamp", "desc"));
    try {
        const querySnapshot = await getDocs(fullRoundSessionQuery);
        fullRoundSessions = querySnapshot.docs.map((doc) => {
            return ({
                id: doc.ref.id,
                ...doc.data()
            })
        });
    } catch (error) {
        console.error("Error refreshing full round sessions:", error);
    }

    return {sessions, fullRoundSessions};
}