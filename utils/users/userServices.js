import { firestore } from '../firebase'; // your Firebase config
import {
    doc,
    setDoc,
    deleteDoc,
    updateDoc,
    arrayUnion,
    getDoc,
    getDocs,
    query,
    where,
    collection,
    serverTimestamp, orderBy
} from 'firebase/firestore';

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