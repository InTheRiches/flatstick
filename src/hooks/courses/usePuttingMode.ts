import type { LatLng } from '@/models/geo';
import type { LiveShotAttempt } from '@/models/round.live.types';
import { useCallback, useState } from 'react';

export function usePuttingMode() {
  const [isPuttingMode, setIsPuttingMode] = useState(false);
  const [putts, setPutts] = useState<LiveShotAttempt[]>([]);
  const [pendingPuttStart, setPendingPuttStart] = useState<LatLng | null>(null);

  const startPuttingMode = useCallback(() => {
    setIsPuttingMode(true);
    setPendingPuttStart(null);
  }, []);

  const exitPuttingMode = useCallback(() => {
    setIsPuttingMode(false);
    setPendingPuttStart(null);
    // Note: Putts might be persisted to external round state outside this hook.
  }, []);

  const addPutt = useCallback((putt: LiveShotAttempt) => {
    setPutts(prev => [...prev, putt]);
  }, []);

  const undoLastPutt = useCallback(() => {
    console.log('undoLastPutt called. pendingPuttStart:', pendingPuttStart);
    if (pendingPuttStart) {
      setPendingPuttStart(null);
      return;
    }

    setPutts(prev => prev.slice(0, -1));
  }, [pendingPuttStart]);

  const clearPendingPutt = useCallback(() => {
    setPendingPuttStart(null);
  }, []);

  return {
    isPuttingMode,
    startPuttingMode,
    exitPuttingMode,
    putts,
    addPutt,
    pendingPuttStart,
    setPendingPuttStart,
    clearPendingPutt,
    undoLastPutt,
  };
}
