// contexts/AppContext.js
import React, {createContext, useContext, useMemo, useState} from 'react';
import {useUser} from '@/hooks/useUser';
import {useSessions} from '@/hooks/useSessions';
import {useStats} from '@/hooks/useStats';
import {usePutters} from '@/hooks/usePutters';
import {useGrips} from '@/hooks/useGrips';
import {useAchievements} from "@/hooks/useAchievements";
import {addAggregateStats} from "@/services/statsService";
import {auth} from "@/utils/firebase";

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
    const { currentStats, byMonthStats, yearlyStats, sixMonthStats, threeMonthStats, rawRefreshStats, saveIndividualMonthStats, getAllStats, calculateSpecificStats, previousStats, getPreviousStats, initializeStats } = useStats(
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

        //await rawRefreshStats(putters, grips, setPutters, setGrips, sessions, newUserData);

        // TODO remove this
        // const document = await getDoc(doc(firestore, "courses/265778472"));
        // const data = document.data();
        // await processSession(sessions[0], data.greens);

        setIsLoading(false);
    };

    const refreshStats = async (newUserData = undefined) => {
        await rawRefreshStats(putters, grips, setPutters, setGrips,undefined, newUserData)
    }

    const processSession = async (session, greens) => {
        //checkAchievements(session);
        //await newSession(session);
        const updatedByMonthlyStats = await addAggregateStats(auth.currentUser.uid, session, byMonthStats, greens);
        const sessionDate = new Date(session.meta.date);
        const monthKey = `${sessionDate.getFullYear()}-${String(sessionDate.getMonth() + 1).padStart(2, '0')}`;
        await saveIndividualMonthStats(updatedByMonthlyStats[monthKey], monthKey);
    }

    const appContextValue = useMemo(
        () => ({
            userData,
            sessions,
            currentStats,
            byMonthStats,
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
        [userData, sessions, currentStats, putters, grips, previousStats, nonPersistentData, yearlyStats, sixMonthStats, threeMonthStats, refreshData, updateData, setUserData, getAllStats, newPutter, newSession, getPreviousStats, deletePutter, deleteSession, newGrip, deleteGrip, calculateSpecificStats, isLoading, checkAchievements, byMonthStats]
    );

    return <AppContext.Provider value={appContextValue}>{children}</AppContext.Provider>;
}