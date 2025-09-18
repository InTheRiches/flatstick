// services/gripService.js
import {collection, deleteDoc, doc, getDocs, setDoc} from 'firebase/firestore';
import {firestore} from '@/utils/firebase';
import {createMonthAggregateStats} from "@/constants/Constants";

export const fetchGrips = async (uid, stats) => {
    const gripsRef = collection(firestore, `users/${uid}/grips`);
    const gripsSnapshot = await getDocs(gripsRef);

    const gripsList = [
        { type: 'default', name: 'Standard Method', stats }
    ]

    for (const gripDoc of gripsSnapshot.docs) {
        const gripId = gripDoc.id;

        // Now grab this putter's monthly stats
        const monthsRef = collection(firestore, `users/${uid}/grips/${gripId}/monthly`);
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

        gripsList.push({
            type: gripId,
            name: gripId
                .split('-')
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' '),
            stats: monthStats,
        })
    }

    return gripsList;
};

export const newGrip = async (uid, name) => {
    const id = name.toLowerCase().replace(/\s/g, '-');
    const monthFormatted = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    await setDoc(doc(firestore, `users/${uid}/grips/${id}/monthly/${monthFormatted}`), createMonthAggregateStats());

    const newGripStats = {};
    newGripStats[monthFormatted] = createMonthAggregateStats();

    return { type: id, name, stats: newGripStats };
};

export const deleteGrip = async (uid, type) => {
    await deleteDoc(doc(firestore, `users/${uid}/grips/${type}`));
};