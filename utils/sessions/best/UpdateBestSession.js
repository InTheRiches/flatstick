import {doc, getDoc, getFirestore, setDoc} from "firebase/firestore";
import {getAuth} from "../../../utils/firebase"

export const updateBestSession = async (newSession) => {
    const firestore = getFirestore();
    const auth = getAuth();

    const bestSessionRef = doc(firestore, `users/${auth.currentUser.uid}/bestSession/bestSession`);
    const bestSessionDoc = await getDoc(bestSessionRef);

    if (!bestSessionDoc.exists() || newSession.strokesGained > bestSessionDoc.data().strokesGained) {
        await setDoc(bestSessionRef, newSession);
    }
    return true;
};