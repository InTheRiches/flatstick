import {doc, getDoc, setDoc} from "firebase/firestore";
import {auth, firestore} from "../../firebase"

export const updateBestSession = async (newSession) => {
    const bestSessionRef = doc(firestore, `users/${auth.currentUser.uid}/bestSession/bestSession`);
    const bestSessionDoc = await getDoc(bestSessionRef);

    if (!bestSessionDoc.exists() || newSession.strokesGained > bestSessionDoc.data().strokesGained) {
        await setDoc(bestSessionRef, newSession);
    }
    return true;
};