import { useCallback, useEffect, useRef } from "react";

interface UseReticleSyncOptions<T> {
    value: T | null;
    syncFromReticle: () => Promise<void>;
}

export function useReticleSync<T>({ value, syncFromReticle }: UseReticleSyncOptions<T>) {
    const valueRef = useRef<T | null>(value);
    const panRef = useRef(false);
    const syncRafRef = useRef<number | null>(null);
    const syncInFlightRef = useRef(false);
    const syncQueuedRef = useRef(false);

    useEffect(() => {
        valueRef.current = value;
    }, [value]);

    useEffect(() => {
        if (value) return;

        panRef.current = false;
        syncQueuedRef.current = false;

        if (syncRafRef.current !== null) {
            cancelAnimationFrame(syncRafRef.current);
            syncRafRef.current = null;
        }
    }, [value]);

    const flushSync = useCallback(async () => {
        if (!valueRef.current || !panRef.current) return;

        if (syncInFlightRef.current) {
            syncQueuedRef.current = true;
            return;
        }

        syncInFlightRef.current = true;

        try {
            await syncFromReticle();
        } finally {
            syncInFlightRef.current = false;

            if (syncQueuedRef.current && panRef.current) {
                syncQueuedRef.current = false;

                if (syncRafRef.current === null) {
                    syncRafRef.current = requestAnimationFrame(() => {
                        syncRafRef.current = null;
                        void flushSync();
                    });
                }
            } else {
                syncQueuedRef.current = false;
            }
        }
    }, [syncFromReticle]);

    const requestSync = useCallback(() => {
        if (!valueRef.current || !panRef.current) return;
        if (syncRafRef.current !== null) return;

        syncRafRef.current = requestAnimationFrame(() => {
            syncRafRef.current = null;
            void flushSync();
        });
    }, [flushSync]);

    const handlePanDrag = useCallback(() => {
        if (!valueRef.current) return false;

        panRef.current = true;
        requestSync();
        return true;
    }, [requestSync]);

    const handleRegionChange = useCallback(() => {
        if (!valueRef.current || !panRef.current) return false;

        requestSync();
        return true;
    }, [requestSync]);

    const handleRegionChangeComplete = useCallback(() => {
        if (!valueRef.current || !panRef.current) return false;

        panRef.current = false;
        syncQueuedRef.current = false;

        if (syncRafRef.current !== null) {
            cancelAnimationFrame(syncRafRef.current);
            syncRafRef.current = null;
        }

        void syncFromReticle();
        return true;
    }, [syncFromReticle]);

    useEffect(() => {
        return () => {
            if (syncRafRef.current !== null) {
                cancelAnimationFrame(syncRafRef.current);
            }
        };
    }, []);

    return {
        handlePanDrag,
        handleRegionChange,
        handleRegionChangeComplete,
    };
}
