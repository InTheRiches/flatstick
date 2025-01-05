// TODO eventually make this hold all of the "best" stats, not just the best session
import {doc, getDoc, getFirestore} from "firebase/firestore";
import {getAuth} from "firebase/auth";

// Function to get the best session at load time
export const getBestSession = async () => {
    const firestore = getFirestore();
    const auth = getAuth();

    const bestSessionRef = doc(firestore, `users/${auth.currentUser.uid}/bestSession/bestSession`);
    const bestSessionDoc = await getDoc(bestSessionRef);

    if (bestSessionDoc.exists()) {
        return bestSessionDoc.data();
    }
    console.error("No best session found");
    return null;
};