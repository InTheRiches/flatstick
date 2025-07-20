// services/putterService.js
import {collection, deleteDoc, doc, getDocs, query, setDoc} from 'firebase/firestore';
import {firestore} from '@/utils/firebase';
import {createSimpleRefinedStats} from '@/utils/PuttUtils';

export const fetchPutters = async (uid, stats) => {
    const putterSessionQuery = query(collection(firestore, `users/${uid}/putters`));
    const querySnapshot = await getDocs(putterSessionQuery);
    return [
        { type: 'default', name: 'Standard Putter', stats },
        ...querySnapshot.docs.map((doc) => ({
            type: doc.id,
            name: doc.id
                .split('-')
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' '),
            stats: doc.data(),
        })),
    ];
};

export const newPutter = async (uid, name) => {
    const id = name.toLowerCase().replace(/\s/g, '-');
    await setDoc(doc(firestore, `users/${uid}/putters/${id}`), createSimpleRefinedStats());
    return { type: id, name, stats: createSimpleRefinedStats() };
};

export const deletePutter = async (uid, type) => {
    await deleteDoc(doc(firestore, `users/${uid}/putters/${type}`));
};