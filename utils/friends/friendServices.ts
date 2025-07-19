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
    serverTimestamp, arrayRemove
} from 'firebase/firestore';

export const sendFriendRequest = async (fromUid: string, toUid: string) => {
    const requestRef = doc(firestore, `users/${toUid}/friendRequests`, fromUid);
    await setDoc(requestRef, {
        from: fromUid,
        timestamp: serverTimestamp(),
        status: 'pending'
    });

    const requestRefLog = doc(firestore, `users/${fromUid}/friendRequests`, toUid);
    await setDoc(requestRefLog, {
        to: toUid,
        timestamp: serverTimestamp(),
        status: 'pending'
    });
};

export const getRawFriends = async (uid: string) => {
    const userDoc = await getDoc(doc(firestore, `users/${uid}`));
    if (!userDoc.exists()) {
        throw new Error('User not found');
    }

    const userData = userDoc.data();
    if (!userData || !userData.friends) {
        return [];
    }

    return userData.friends;
}

export const getFriends = async (uid: string) => {
    const userDoc = await getDoc(doc(firestore, `users/${uid}`));
    if (!userDoc.exists()) {
        throw new Error('User not found');
    }

    const userData = userDoc.data();
    if (!userData || !userData.friends) {
        return [];
    }

    const friends = userData.friends;
    const friendsData = await Promise.all(
        friends.map(async (friendUid: string) => {
            const friendDoc = await getDoc(doc(firestore, `users/${friendUid}`));
            return friendDoc.exists() ? { uid: friendUid, ...friendDoc.data() } : null;
        })
    );

    return friendsData.filter(friend => friend !== null);
}

export const isFriend = async (currentUid: string, otherUid: string) => {
    const userDoc = await getDoc(doc(firestore, `users/${currentUid}`));
    if (!userDoc.exists()) {
        throw new Error('User not found');
    }

    const userData = userDoc.data();
    return userData && userData.friends && userData.friends.includes(otherUid);
}

export const acceptFriendRequest = async (currentUid: string, requesterUid: string) => {
    await Promise.all([
        updateDoc(doc(firestore, `users/${currentUid}`), {
            friends: arrayUnion(requesterUid)
        }),
        updateDoc(doc(firestore, `users/${requesterUid}`), {
            friends: arrayUnion(currentUid)
        }),
        deleteDoc(doc(firestore, `users/${currentUid}/friendRequests/${requesterUid}`)),
        deleteDoc(doc(firestore, `users/${requesterUid}/friendRequests/${currentUid}`))
    ]);
};

export const cancelFriendRequest = async (currentUid: string, requestedUid: string) => {
    await deleteDoc(doc(firestore, `users/${currentUid}/friendRequests/${requestedUid}`));
    // make the requested user aware that the request was canceled
    await deleteDoc(doc(firestore, `users/${requestedUid}/friendRequests/${currentUid}`));
}

export const rejectFriendRequest = async (currentUid: string, requesterUid: string) => {
    await deleteDoc(doc(firestore, `users/${currentUid}/friendRequests/${requesterUid}`));
    // make the requester aware that the request was rejected
    await setDoc(doc(firestore, `users/${requesterUid}/friendRequests/${currentUid}`), {
        to: currentUid,
        timestamp: serverTimestamp(),
        status: 'rejected'
    });
};

// use async storage for the user's friend requests for simplicity and quicker results
export const getRequests = async (currentUid: string) => {
    const q = query(collection(firestore, `users/${currentUid}/friendRequests`), where('status', '==', 'pending'));
    const snapshot = await getDocs(q);

    const requests = snapshot.docs.map(doc => doc.data());

    const receivedRequests = requests.filter(request => request.from); // Requests with a 'from' field
    const sentRequests = requests.filter(request => request.to); // Requests with a 'to' field

    return { receivedRequests, sentRequests };
};

export const removeFriend = async (currentUid: string, friendUid: string) => {
    await Promise.all([
        updateDoc(doc(firestore, `users/${currentUid}`), {
            friends: arrayRemove(friendUid)
        }),
        updateDoc(doc(firestore, `users/${friendUid}`), {
            friends: arrayRemove(currentUid)
        })
    ]);
};
