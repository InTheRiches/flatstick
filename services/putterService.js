// services/putterService.js
import {collection, deleteDoc, doc, getDocs, setDoc} from 'firebase/firestore';
import {firestore} from '@/utils/firebase';
import {createMonthAggregateStats} from "@/constants/Constants";

export const fetchPutters = async (uid, stats) => {
    const puttersRef = collection(firestore, `users/${uid}/putters`);
    const puttersSnapshot = await getDocs(puttersRef);

    const puttersList = [
        { type: 'default', name: 'Standard Putter', stats }
    ]

    for (const putterDoc of puttersSnapshot.docs) {
        const putterId = putterDoc.id;

        // Now grab this putter's monthly stats
        const monthsRef = collection(firestore, `users/${uid}/putters/${putterId}/monthly`);
        const monthsSnapshot = await getDocs(monthsRef);

        const monthStats = {};
        monthsSnapshot.docs.forEach(doc => {
            const data = doc.data();
            if (!data || Object.keys(data).length === 0) {
                monthStats[doc.id] = createMonthAggregateStats();
            }
            else {
                monthStats[doc.id] = data;
            }
        });

        if (Object.keys(monthStats).length === 0) {
            const monthFormatted = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
            monthStats[monthFormatted] = createMonthAggregateStats();
        }

        puttersList.push({
            type: putterId,
            name: putterId
                .split('-')
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' '),
            stats: monthStats,
        })
    }

    return puttersList;
};

export const newPutter = async (uid, name) => {
    const id = name.toLowerCase().replace(/\s/g, '-');
    const monthFormatted = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    await setDoc(doc(firestore, `users/${uid}/putters/${id}/monthly/${monthFormatted}`), createMonthAggregateStats());

    const newPutterStats = {};
    newPutterStats[monthFormatted] = createMonthAggregateStats();

    return { type: id, name, stats: newPutterStats };
};

export const deletePutter = async (uid, type) => {
    await deleteDoc(doc(firestore, `users/${uid}/putters/${type}`));
};