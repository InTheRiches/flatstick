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
import { useCallback, useMemo, useRef, useState } from "react";

// ── ID generation ─────────────────────────────────────────────────────────────
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 10);
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

export function useRoundTracking(initialHole: number = 1, totalHoles: number = 18, teeSet?: TeeSet) {
  /** Stable round ID — generated once at mount. */
  const roundId = useRef(generateId()).current;

  const [activeHole, setActiveHole] = useState(initialHole);

  /** All shots for the round, ordered chronologically. */
  const [shots, setShots] = useState<LiveShotAttempt[]>([]);

  const [currentShot, setCurrentShot] = useState<LiveShotAttempt | null>(null);

  /** Per-hole state keyed by 1-based hole number. */
  const [holes, setHoles] = useState<Record<number, LiveHoleState>>(() =>
    initHoles(totalHoles, teeSet),
  );

  const [trackingState, setTrackingState] = useState<"idle" | "tracking">("idle");
  const [currentShotStart, setCurrentShotStart] = useState<LatLng | null>(null);

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
    (userLocation: LatLng) => {
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
          result: currentShot.result,
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
    commitHoleSummary,
    setCurrentShot,
    currentShot,
    runningScore,
    trackingState,
    startTracking,
    endTracking,
    currentShotStart,
  };
}
