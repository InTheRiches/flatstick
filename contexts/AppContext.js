// contexts/AppContext.js
import React, {createContext, useContext, useMemo, useState} from 'react';
import {useUser} from '@/hooks/useUser';
import {useSessions} from '@/hooks/useSessions';
import {useStats} from '@/hooks/useStats';
import {usePutters} from '@/hooks/usePutters';
import {useGrips} from '@/hooks/useGrips';
import data from "@/assets/achievements.json";
import {useAchievements} from "@/services/achievementService";

const AppContext = createContext({
    userData: {},
    puttSessions: [],
    fullRoundSessions: [],
    currentStats: {},
    putters: [],
    grips: [],
    previousStats: [],
    nonPersistentData: {},
    yearlyStats: {},
    sixMonthStats: {},
    threeMonthStats: {},
    isLoading: true,
    setIsLoading: () => {},
    setNonPersistentData: () => {},
    initialize: () => {},
    refreshData: () => Promise.resolve(),
    updateData: () => Promise.resolve(),
    setUserData: () => {},
    refreshStats: () => Promise.resolve(),
    getAllStats: () => Promise.resolve(),
    newPutter: () => Promise.resolve(),
    newSession: () => Promise.resolve(),
    newFullRound: () => Promise.resolve(),
    getPreviousStats: () => Promise.resolve(),
    deleteSession: () => Promise.resolve(),
    checkAchievements: () => {},
    deletePutter: () => {},
    newGrip: () => Promise.resolve(),
    deleteGrip: () => {},
    calculateSpecificStats: () => {},
});

export const useAppContext = () => useContext(AppContext);

export function AppContextProvider({ children }) {
    const [nonPersistentData, setNonPersistentData] = useState({
        filtering: { putter: 0, grip: 0 },
    });

    const { userData, setUserData, updateData, initialize: initializeUser } = useUser();
    const { checkAchievements } = useAchievements({
        userData,
        updateData
    });
    const { puttSessions, fullRoundSessions, refreshData, newSession, newFullRound, deleteSession } = useSessions();
    const { currentStats, yearlyStats, sixMonthStats, threeMonthStats, updateStats, getAllStats, calculateSpecificStats, previousStats, getPreviousStats, initializeStats } = useStats(
        userData,
        puttSessions,
        fullRoundSessions
    );
    const { putters, setPutters, newPutter, deletePutter, initializePutters } = usePutters();
    const { grips, setGrips, newGrip, deleteGrip, initializeGrips } = useGrips();
    const [isLoading, setIsLoading] = useState(true);

    const initialize = async () => {
        await initializeUser();
        await initializeStats();
        await initializePutters(currentStats);
        await initializeGrips(currentStats);
        await updateStats(putters, grips, setPutters, setGrips); // TODO remove this
        await refreshData();

        console.log('AppContext initialized');
        setIsLoading(false);
    };

    const refreshStats = async () => {
        await updateStats(putters, grips, setPutters, setGrips)
    }

    const processFullRound = async (session) => {
        checkAchievements(session);
        await newFullRound(session);
    }

    const appContextValue = useMemo(
        () => ({
            userData,
            puttSessions,
            fullRoundSessions,
            currentStats,
            putters,
            grips,
            previousStats,
            nonPersistentData,
            setNonPersistentData,
            yearlyStats,
            sixMonthStats,
            threeMonthStats,
            isLoading,
            setIsLoading,
            initialize,
            refreshData,
            updateData,
            setUserData,
            refreshStats,
            getAllStats,
            newPutter,
            newSession,
            newFullRound: processFullRound,
            getPreviousStats,
            checkAchievements,
            deletePutter,
            deleteSession,
            newGrip,
            deleteGrip,
            calculateSpecificStats,
        }),
        [userData, puttSessions, fullRoundSessions, currentStats, putters, grips, previousStats, nonPersistentData, yearlyStats, sixMonthStats, threeMonthStats, refreshData, updateData, setUserData, getAllStats, newPutter, newSession, newFullRound, getPreviousStats, deletePutter, deleteSession, newGrip, deleteGrip, calculateSpecificStats, isLoading]
    );

    return <AppContext.Provider value={appContextValue}>{children}</AppContext.Provider>;
}