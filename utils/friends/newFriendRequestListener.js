import {collection, onSnapshot, query, where} from "firebase/firestore";
import {firestore} from "../firebase";

// Listen for friend requests sent to the current user
export function listenForFriendRequests(userId, onNewRequest) {
    const requestsRef = query(
        collection(firestore, `users/${userId}/friendRequests`),
        where("status", "==", "pending")
    );
    
    // This function will be called whenever a new friend request is added
    return onSnapshot(requestsRef, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
            if (change.type === "added") {
                const newRequest = change.doc.data();
                onNewRequest(newRequest);
            }
        });
    }); // Call this to stop listening when the component unmounts
}