import { PostShotModalResult } from "@/components/app/golf/modals/PostShotDetailsModal";
import { TeeSet } from "@/models/courses";
import type { LatLng } from "@/models/geo";
import type {
  HolePar,
  HoleSummaryCommit,
  LiveHoleState,
  LiveShotAttempt,
  TeeDirection,
} from "@/models/round.live.types";
import type {
  ClubType
} from "@/models/round.session.types";
import { haversineMeters } from "@/utils/courses/geometry/distance.utils";
import { clearPersistedRound, loadPersistedRound, saveRound } from "@/utils/round/roundPersistence";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// ── ID generation ─────────────────────────────────────────────────────────────
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 10);
}

// ── Persistence helpers ───────────────────────────────────────────────────────

export interface RoundPersistOptions {
  /** Course ID used to match a saved round to the current course. */
  courseId: string;
  courseName?: string;
}

interface InitialRoundState {
  roundId: string;
  activeHole: number;
  shots: LiveShotAttempt[];
  holes: Record<number, LiveHoleState>;
  /** True when state was restored from a prior session. */
  isRestored: boolean;
  /** ISO timestamp from the last save (only set when isRestored). */
  restoredAt?: string;
}

function computeInitialState(
  initialHole: number,
  totalHoles: number,
  teeSet: TeeSet | undefined,
  persistOptions: RoundPersistOptions | undefined,
): InitialRoundState {
  if (persistOptions?.courseId) {
    const saved = loadPersistedRound();
    if (saved && saved.courseId === persistOptions.courseId && saved.totalHoles === totalHoles) {
      return {
        roundId: saved.roundId,
        activeHole: saved.activeHole,
        shots: saved.shots,
        holes: saved.holes,
        isRestored: true,
        restoredAt: saved.savedAt,
      };
    }
  }
  return {
    roundId: generateId(),
    activeHole: initialHole,
    shots: [],
    holes: initHoles(totalHoles, teeSet),
    isRestored: false,
  };
}

// Helpers

/** Map a human-readable club label to the structured club object. */
function clubFromLabel(label: string): LiveShotAttempt["club"] {
  const lower = label.toLowerCase();
  let type: ClubType = "other";
  if (lower === "driver")                type = "driver";
  else if (lower.includes("wood"))      type = "wood";
  else if (lower.includes("hybrid"))    type = "hybrid";
  else if (/\d\s*iron/.test(lower))     type = "iron";
  else if (lower.includes("wedge"))     type = "wedge";
  else if (lower === "putter")          type = "putter";
  return { type, label };
}

/** Derive fairway hit from tee direction. */
function fairwayHitFromDirection(dir: TeeDirection | undefined): boolean | undefined {
  if (!dir) return undefined;
  return dir === "center" || dir === "long" || dir === "short";
}

/** Initialize all holes with sensible defaults. */
function initHoles(totalHoles: number, teeSet?: TeeSet): Record<number, LiveHoleState> {
  const record: Record<number, LiveHoleState> = {};
  for (let i = 1; i <= totalHoles; i++) {
    record[i] = {
      holeNumber: i,
      par: teeSet?.holes[i - 1]?.par ?? 4,
      status: "notStarted",
      shotIds: [],
      penaltyStrokes: 0,
      putts: 0,
    };
  }
  return record;
}

/**
 * Sentinel GeoPoint used for synthetic shots that have no GPS data.
 * The transformation layer checks for this and marks the shot as GPS-unknown.
 */
const UNKNOWN_POINT = { latitude: 0, longitude: 0 };

/**
 * Generate minimal synthetic ShotAttempts for a hole when no tracked shots exist.
 * Ordering: tee shot → approach shots → putt shots.
 * No drop events are created — penalties remain numeric only.
 */
// TODO DO WE EVEN NEED THIS?
export function generateSyntheticShots(
  holeNumber: number,
  par: HolePar,
  score: number,
  putts: number,
  penaltyStrokes: number,
  teeClubLabel: string,
  now: string,
): LiveShotAttempt[] {
  const totalHittingShots = Math.max(1, score - penaltyStrokes);
  const approachCount = Math.max(0, totalHittingShots - 1 - putts);
  const puttCount = Math.min(putts, totalHittingShots);

  const shots: LiveShotAttempt[] = [];
  let stroke = 1;

  // Tee shot
  shots.push({
    id: generateId(),
    hole: holeNumber,
    stroke: stroke++,
    par,
    category: "tee",
    club: clubFromLabel(teeClubLabel),
    lie: "tee",
    distance: {},
    start: { point: UNKNOWN_POINT, timestamp: now },
  });

  // Approach shots
  for (let i = 0; i < approachCount; i++) {
    shots.push({
      id: generateId(),
      hole: holeNumber,
      stroke: stroke++,
      par,
      category: i < approachCount - 1 || par >= 5 ? "approach" : "approach",
      club: { type: "iron", label: "7i" },
      lie: i === 0 ? "fairway" : "rough",
      distance: {},
      start: { point: UNKNOWN_POINT, timestamp: now },
    });
  }

  // Putt shots
  for (let i = 0; i < puttCount; i++) {
    shots.push({
      id: generateId(),
      hole: holeNumber,
      stroke: stroke++,
      par,
      category: "putt",
      club: { type: "putter", label: "P" },
      lie: "green",
      distance: {},
      start: { point: UNKNOWN_POINT, timestamp: now },
    });
  }

  return shots;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useRoundTracking(initialHole: number = 1, totalHoles: number = 18, teeSet?: TeeSet, persistOptions?: RoundPersistOptions) {
  // ── One-time restoration from MMKV (synchronous) ─────────────────────────
  // useState lazy initializer runs exactly once so loadPersistedRound is only
  // called once per hook mount, not on every render.
  const [[init]] = useState(() => [computeInitialState(initialHole, totalHoles, teeSet, persistOptions)]);

  /** Stable round ID — generated once at mount (or restored from storage). */
  const roundId = useRef(init.roundId).current;

  const [activeHole, setActiveHole] = useState(init.activeHole);

  /** All shots for the round, ordered chronologically. */
  const [shots, setShots] = useState<LiveShotAttempt[]>(init.shots);

  const [currentShot, setCurrentShot] = useState<LiveShotAttempt | null>(null);

  /** Per-hole state keyed by 1-based hole number. */
  const [holes, setHoles] = useState<Record<number, LiveHoleState>>(init.holes);

  const [trackingState, setTrackingState] = useState<"idle" | "tracking">("idle");
  const [currentShotStart, setCurrentShotStart] = useState<LatLng | null>(null);

  // ── Auto-save on every meaningful state change ─────────────────────────────
  // MMKV writes are synchronous and sub-millisecond, so saving in a useEffect
  // (which fires asynchronously after paint) keeps the UI responsive while
  // still guaranteeing the latest state is always on disk.
  useEffect(() => {
    if (!persistOptions?.courseId) return;
    saveRound({
      roundId,
      activeHole,
      shots,
      holes,
      savedAt: new Date().toISOString(),
      courseId: persistOptions.courseId,
      courseName: persistOptions.courseName,
      totalHoles,
    });
  }, [shots, holes, activeHole]);

  // ── Derived ───────────────────────────────────────────────────────────────
  /** Running score relative to par for all completed holes. */
  const runningScore = useMemo(() => {
    return Object.values(holes).reduce((acc, h) => {
      if (h.status !== "completed") return acc;
      const strokes = h.score ?? (h.shotIds.length > 0 ? h.shotIds.length : h.par);
      return acc + (strokes - h.par);
    }, 0);
  }, [holes]);

  // ── Navigation ────────────────────────────────────────────────────────────

  const nextHole = useCallback(() => {
    setActiveHole((prev) => Math.min(totalHoles, prev + 1));
  }, [totalHoles]);

  const prevHole = useCallback(() => {
    setActiveHole((prev) => Math.max(1, prev - 1));
  }, []);

  // ── Shot tracking state machine ───────────────────────────────────────────

  const startTracking = useCallback((location: LatLng) => {
    setTrackingState("tracking");
    setCurrentShotStart(location);
  }, []);

  const endTracking = useCallback(() => {
    setTrackingState("idle");
    setCurrentShotStart(null);
  }, []);

  // ── Shot mutations ────────────────────────────────────────────────────────

  const addShot = useCallback(
    (userLocation: LatLng, result?: PostShotModalResult) => {
      if (!currentShotStart) return;
      if (!currentShot) return;
      const now = new Date().toISOString();

      setShots((prev) => {
        const strokeOnHole = prev.filter((s) => s.hole === activeHole).length + 1;
        const shot: LiveShotAttempt = {
          id: generateId(),
          hole: activeHole,
          stroke: strokeOnHole,
          par: currentShot.par,
          category: currentShot.category,
          club: currentShot.club,
          lie: currentShot.lie,
          distance: {
              intendedToTargetM: currentShot.distance.intendedToTargetM,
              measuredM: haversineMeters(currentShotStart, userLocation),
          },
          start: { point: currentShotStart, timestamp: now },
          end: { point: userLocation, timestamp: now },
          intent: currentShot.intent,
          result: currentShot.result ?? result,
          notes: currentShot.notes,
        };
        // Sync shotIds into hole state
        setHoles((prev) => ({
          ...prev,
          [activeHole]: {
            ...prev[activeHole],
            status: "inProgress",
            shotIds: [...(prev[activeHole]?.shotIds ?? []), shot.id],
          },
        }));
        return [...prev, shot];
      });

      setCurrentShotStart(null);
      setCurrentShot(null);
    },
    [activeHole, currentShotStart],
  );

  /** Update fields on an already-committed shot (e.g. from the edit flow). */
  const updateShot = useCallback((shotId: string, updates: Partial<LiveShotAttempt>) => {
    setShots((prev) => prev.map((s) => s.id === shotId ? { ...s, ...updates } : s));
  }, []);

  // ── Hole summary commit (from HoleSummaryModal) ───────────────────────────

  const commitHoleSummary = useCallback((commit: HoleSummaryCommit) => {
    const { holeNumber, syntheticShots } = commit;
    const fairwayHit = commit.fairwayHit ?? fairwayHitFromDirection(commit.teeDirection);

    setHoles((prev) => ({
      ...prev,
      [holeNumber]: {
        ...prev[holeNumber],
        putts: commit.putts,
        penaltyStrokes: commit.penaltyStrokes,
        // Persist the committed score so the UI can restore it later
        score: commit.score,
        fairwayHit,
        greenInRegulation: commit.greenInRegulation,
        firstPuttDistanceYds: commit.firstPuttDistanceYds,
        // Persist tee summary fields so the modal can reload them later
        teeClubLabel: commit.teeClubLabel,
        teeDirection: commit.teeDirection,
        teeMishit: commit.teeMishit,
        status: "completed",
        shotIds: syntheticShots
          ? syntheticShots.map((s) => s.id)
          : prev[holeNumber]?.shotIds ?? [],
      },
    }));

    if (syntheticShots) {
      // Replace any partial shots for this hole with synthetic ones
      setShots((prev) => [
        ...prev.filter((s) => s.hole !== holeNumber),
        ...syntheticShots,
      ]);
    } else if (commit.teeClubLabel) {
      // Update existing tee shot's club if one exists
      setShots((prev) =>
        prev.map((s) =>
          s.hole === holeNumber && s.category === "tee"
            ? { ...s, club: clubFromLabel(commit.teeClubLabel!) }
            : s,
        ),
      );
    }

    // advance to next hole if not on last hole
    setActiveHole((prev) => (prev < totalHoles ? prev + 1 : prev));
  }, []);

  return {
    roundId,
    activeHole,
    setActiveHole,
    nextHole,
    prevHole,
    shots,
    holes,
    addShot,
    updateShot,
    commitHoleSummary,
    setCurrentShot,
    currentShot,
    runningScore,
    trackingState,
    startTracking,
    endTracking,
    currentShotStart,
    /** True when the round was restored from a previous session on this mount. */
    isRestored: init.isRestored,
    /** ISO timestamp of the last auto-save (only meaningful when isRestored). */
    restoredAt: init.restoredAt,
    /** Removes the persisted round from storage (call on explicit exit / round completion). */
    clearPersistedRound,
  };
}
