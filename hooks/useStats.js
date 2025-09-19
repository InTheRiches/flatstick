// hooks/useStats.js
import {useState} from 'react';
import {firestore, getAuth} from '@/utils/firebase';
import {getPreviousStats} from '@/services/statsService';
import {collection, doc, getDocs, query, setDoc} from "firebase/firestore";
import {createMonthAggregateStats} from "@/constants/Constants";

export const useStats = () => {
    const [byMonthStats, setByMonthStats] = useState({});
    const [previousStats, setPreviousStats] = useState([]);
    const auth = getAuth();

    const initializeStats = async () => {
        await fetchAllStats();
        await getPreviousStats();
    }

    const saveIndividualMonthStats = async (newStats, docId) => {
        console.log("Fetched monthly stats 1:", Object.keys(byMonthStats));
        const newByMonthStats = {...byMonthStats, [docId]: newStats};
        setByMonthStats(newByMonthStats);
        await setDoc(doc(firestore, `users/${auth.currentUser.uid}/monthlyStats/${docId}`), newStats);

        console.log("Fetched monthly stats 2:", Object.keys(newByMonthStats));
    }

    const fetchAllStats = async () => {
        const statsRef = collection(firestore, "users", auth.currentUser.uid, "monthlyStats");
        const snapshot = await getDocs(query(statsRef));

        const data = {};
        snapshot.forEach((doc) => {
            data[doc.id] = doc.data(); // doc.id is "2025-09"
        });

        if (Object.keys(data).length === 0) {
            console.log("No monthly stats found for user, initializing empty stats.");
            data[`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`] = createMonthAggregateStats();
        }

        setByMonthStats(data);

        return data;
    };

    const fetchPreviousStats = async () => {
        const stats = await getPreviousStats(auth.currentUser.uid);
        setPreviousStats(stats);
        return stats;
    };

    return {
        byMonthStats,
        previousStats,
        saveIndividualMonthStats,
        fetchAllStats,
        initializeStats,
        getPreviousStats: fetchPreviousStats,
    };
};