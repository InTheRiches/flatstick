/**
 * roundPersistence.ts
 *
 * Typed helpers for saving and restoring an in-progress round to MMKV.
 * MMKV is synchronous and runs on the JS thread, so reads at hook-init
 * time are safe and instant (no async/await required).
 */

import type { LiveHoleState, LiveShotAttempt } from "@/models/round.live.types";
import { load, remove, save } from "@/utils/storage";

const STORAGE_KEY = "active_round_v1";

export interface PersistedRound {
    roundId: string;
    activeHole: number;
    shots: LiveShotAttempt[];
    holes: Record<number, LiveHoleState>;
    /** ISO timestamp of the last save. */
    savedAt: string;
    courseId: string;
    courseName?: string;
    totalHoles: number;
}

export function saveRound(state: PersistedRound): void {
    save(STORAGE_KEY, state);
}

export function loadPersistedRound(): PersistedRound | null {
    return load<PersistedRound>(STORAGE_KEY);
}

export function clearPersistedRound(): void {
    remove(STORAGE_KEY);
}
