// contexts/AppContext.js
import React, {createContext, useContext, useMemo, useState} from 'react';
import {useUser} from '@/hooks/useUser';
import {useSessions} from '@/hooks/useSessions';
import {useStats} from '@/hooks/useStats';
import {usePutters} from '@/hooks/usePutters';
import {useGrips} from '@/hooks/useGrips';
import {useAchievements} from "@/hooks/useAchievements";

const AppContext = createContext({
    userData: {},
    sessions: [],
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
    processSession: () => Promise.resolve(),
    refreshStats: () => Promise.resolve(),
    getAllStats: () => Promise.resolve(),
    newPutter: () => Promise.resolve(),
    newSession: () => Promise.resolve(),
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
    const { sessions, refreshData, newSession, deleteSession } = useSessions();
    const { currentStats, yearlyStats, sixMonthStats, threeMonthStats, rawRefreshStats, getAllStats, calculateSpecificStats, previousStats, getPreviousStats, initializeStats } = useStats(
        userData,
        sessions
    );
    const { putters, setPutters, newPutter, deletePutter, initializePutters } = usePutters();
    const { grips, setGrips, newGrip, deleteGrip, initializeGrips } = useGrips();
    const [isLoading, setIsLoading] = useState(true);

    const initialize = async () => {
        const newUserData = await initializeUser();
        await initializeStats();
        await initializePutters(currentStats);
        await initializeGrips(currentStats);

        const sessions = await refreshData();
        // // loop through full round sessions
        // for (const session of fullRoundSessions) {
        //     // if the session is a full round, check if it has putt sessions
        //     checkAchievements(session);
        // }
        // loop through full round sessions

        await rawRefreshStats(putters, grips, setPutters, setGrips, sessions, newUserData);

        console.log('AppContext initialized');
        setIsLoading(false);
    };

    const refreshStats = async (newUserData = undefined) => {
        await rawRefreshStats(putters, grips, setPutters, setGrips,undefined, newUserData)
    }

    const processSession = async (session) => {
        checkAchievements(session);
        await newSession(session);
    }

    const appContextValue = useMemo(
        () => ({
            userData,
            sessions,
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
            processSession,
            getPreviousStats,
            checkAchievements,
            deletePutter,
            deleteSession,
            newGrip,
            deleteGrip,
            calculateSpecificStats,
        }),
        [userData, sessions, currentStats, putters, grips, previousStats, nonPersistentData, yearlyStats, sixMonthStats, threeMonthStats, refreshData, updateData, setUserData, getAllStats, newPutter, newSession, getPreviousStats, deletePutter, deleteSession, newGrip, deleteGrip, calculateSpecificStats, isLoading, checkAchievements]
    );

    return <AppContext.Provider value={appContextValue}>{children}</AppContext.Provider>;
}