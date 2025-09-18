// hooks/useStats.js
import {useState} from 'react';
import {firestore, getAuth} from '@/utils/firebase';
import {calculateSpecificStats, getPreviousStats, updateFirebaseYearlyStats} from '@/services/statsService';
import {collection, doc, getDocs, query, setDoc} from "firebase/firestore";

export const useStats = (userData, puttSessions) => {
    const [byMonthStats, setByMonthStats] = useState({});
    const [yearlyStats, setYearlyStats] = useState({});
    const [sixMonthStats, setSixMonthStats] = useState({});
    const [threeMonthStats, setThreeMonthStats] = useState({});
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

        setByMonthStats(data);
        console.log("Fetched monthly stats:", Object.keys(data));
        // const stats = await getAllStats(auth.currentUser.uid, yearlyStats);
        //setCurrentStats(stats.currentStats);
        // setYearlyStats(stats.yearlyStats)
        // return stats;
        return data;
    };

    const fetchPreviousStats = async () => {
        const stats = await getPreviousStats(auth.currentUser.uid);
        setPreviousStats(stats);
        return stats;
    };

    const updateYearStats = async (newYearlyStats) => {
        setYearlyStats(newYearlyStats);
        await updateFirebaseYearlyStats(newYearlyStats);
    }

    return {
        byMonthStats,
        yearlyStats,
        sixMonthStats,
        threeMonthStats,
        previousStats,
        saveIndividualMonthStats,
        fetchAllStats,
        initializeStats,
        updateYearStats,
        getPreviousStats: fetchPreviousStats,
        calculateSpecificStats: (putters, grips, nonPersistentData) =>
            calculateSpecificStats(userData, puttSessions, putters, grips, nonPersistentData),
    };
};