// hooks/useStats.js
import {useState} from 'react';
import {getAuth} from '@/utils/firebase';
import {
    calculateSpecificStats,
    getAllStats,
    getPreviousStats,
    updateFirebaseYearlyStats,
    updateStats
} from '@/services/statsService';

export const useStats = (userData, puttSessions, fullRoundSessions) => {
    const [currentStats, setCurrentStats] = useState({});
    const [yearlyStats, setYearlyStats] = useState({});
    const [sixMonthStats, setSixMonthStats] = useState({});
    const [threeMonthStats, setThreeMonthStats] = useState({});
    const [previousStats, setPreviousStats] = useState([]);
    const auth = getAuth();

    const initializeStats = async () => {
        await fetchAllStats();
        await getPreviousStats();
    }

    const refreshStats = async (putters, grips, setPutters, setGrips) => {
        return await updateStats(
            auth.currentUser.uid,
            userData,
            puttSessions,
            fullRoundSessions,
            putters,
            grips,
            setCurrentStats,
            setYearlyStats,
            setPutters,
            setGrips
        );
    };

    const fetchAllStats = async () => {
        const stats = await getAllStats(auth.currentUser.uid, yearlyStats);
        setCurrentStats(stats.currentStats);
        setYearlyStats(stats.yearlyStats)
        return stats;
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
        currentStats,
        yearlyStats,
        sixMonthStats,
        threeMonthStats,
        previousStats,
        updateStats: refreshStats,
        fetchAllStats,
        initializeStats,
        updateYearStats,
        getPreviousStats: fetchPreviousStats,
        calculateSpecificStats: (putters, grips, nonPersistentData) =>
            calculateSpecificStats(userData, puttSessions, putters, grips, nonPersistentData),
    };
};