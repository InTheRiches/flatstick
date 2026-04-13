import { RoundSession } from '@/models/round.session.types';
import type { OverallStats } from '@/models/stats.types';
import { aggregateRoundIntoOverallStats, aggregateRoundsFromScratch, getEmptyOverallStats } from '@/services/stats/aggregation';
import { collection, doc, getFirestore, onSnapshot, orderBy, query } from '@react-native-firebase/firestore';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRoundsContext } from './RoundsProvider';

export interface StatsContextValue {
  /** All-time overall stats synced from Firestore */
  overallStats: OverallStats;
  
  /** Loading state for the all-time stats document */
  isLoading: boolean;
  
  /** Compute overall stats for a specific time range dynamically from loaded rounds */
  getStatsForPeriod: (startDate: Date, endDate?: Date) => OverallStats;
  
  /** Gets stats for standard filtering presets quickly */
  getStatsForLastNDays: (days: number) => OverallStats;
}

const StatsContext = createContext<StatsContextValue | undefined>(undefined);

export interface StatsProviderProps {
  children: React.ReactNode;
  userId: string;
}

export function StatsProvider({ children, userId }: StatsProviderProps) {
  const [overallStats, setOverallStats] = useState<OverallStats>(getEmptyOverallStats());
  const [isLoading, setIsLoading] = useState(true);
  
  const { rounds } = useRoundsContext();

  // 1. Sync the all-time Overall Stats strictly from Firestore
  useEffect(() => {
    if (!userId) return;

    const db = getFirestore();
    const overallRef = doc(db, 'users', userId, 'stats', 'overall');

    setIsLoading(true);
    const unsubscribe = onSnapshot(overallRef, (docSnap) => {
      if (docSnap.exists()) {
        setOverallStats(docSnap.data() as OverallStats);
      } else {
        setOverallStats(getEmptyOverallStats());
      }
      setIsLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [userId]);

  // 2. onCreate / onUpdate Listener for Rounds (Client-side proxy for Cloud Function)
  // Automatically process writes when we locally detect a created or modified round 
  // that executed from THIS client (hasPendingWrites).
  useEffect(() => {
    if (!userId) return;

    const db = getFirestore();
    const roundsRef = collection(db, 'users', userId, 'rounds');
    // Using onSnapshot with includesMetadataChanges to check for local writes
    const q = query(roundsRef, orderBy("createdAt", "desc"));
    
    // NOTE: This runs alongside RoundsProvider but strictly handles the aggregation side-effect
    const unsubscribe = onSnapshot(q, { includeMetadataChanges: true }, (snapshot) => {
      for (const change of snapshot.docChanges()) {
        // We only trigger aggregation if the write originated locally on this client session,
        // reducing redundant transactional writes on other downloading devices.
        if ((change.type === 'added' || change.type === 'modified') && snapshot.metadata.hasPendingWrites) {
           const round = change.doc.data() as RoundSession;
           // Delaying slightly allows RoundsProvider writes to clear first 
           // (if this app ever moves to pure Cloud Functions, remove this block altogether)
           setTimeout(() => {
             aggregateRoundIntoOverallStats(userId, round).catch(console.error);
           }, 2000);
        }
      }
    });

    return () => unsubscribe();
  }, [userId]);

  // 3. Time Filtering Helpers
  const getStatsForPeriod = (startDate: Date, endDate: Date = new Date()) => {
    const filteredRounds = rounds.filter((r) => {
      const d = new Date(r.createdAt);
      return d >= startDate && d <= endDate;
    });
    return aggregateRoundsFromScratch(filteredRounds);
  };

  const getStatsForLastNDays = (days: number) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    return getStatsForPeriod(startDate, new Date());
  };

  const value: StatsContextValue = {
    overallStats,
    isLoading,
    getStatsForPeriod,
    getStatsForLastNDays,
  };

  return (
    <StatsContext.Provider value={value}>
      {children}
    </StatsContext.Provider>
  );
}

export function useStats(): StatsContextValue {
  const ctx = useContext(StatsContext);
  if (!ctx) {
    throw new Error('useStats must be used within a StatsProvider');
  }
  return ctx;
}