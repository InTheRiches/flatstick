// services/gripService.js
import {collection, deleteDoc, doc, getDocs, query, setDoc} from 'firebase/firestore';
import {firestore} from '@/utils/firebase';
import {createSimpleRefinedStats} from '../utils/PuttUtils';

export const fetchGrips = async (uid, stats) => {
    const gripSessionQuery = query(collection(firestore, `users/${uid}/grips`));
    const querySnapshot = await getDocs(gripSessionQuery);
    return [
        { type: 'default', name: 'Standard Method', stats },
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

export const newGrip = async (uid, name) => {
    const id = name.toLowerCase().replace(/\s/g, '-');
    await setDoc(doc(firestore, `users/${uid}/grips/${id}`), createSimpleRefinedStats());
    return { type: id, name, stats: createSimpleRefinedStats() };
};

export const deleteGrip = async (uid, type) => {
    await deleteDoc(doc(firestore, `users/${uid}/grips/${type}`));
};