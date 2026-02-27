import type { LatLng } from "@/models/geo";
import { useCallback, useState } from "react";

export type Shot = {
  id: string;
  holeNumber: number;
  shotNumber: number;
  startLocation: LatLng;
  endLocation: LatLng;
  distance: number; // in yards
  lie: "tee" | "fairway" | "rough" | "bunker" | "recovery" | "green" | "other";
  club: string;
  goal: "layup" | "green" | "recovery" | "other";
  shotShape: "draw" | "fade" | "straight" | "other";
  timestamp: number;
};

export function useRoundTracking(initialHole: number = 1, totalHoles: number = 18) {
  const [activeHole, setActiveHole] = useState(initialHole);
  const [shots, setShots] = useState<Shot[]>([]);
  const [trackingState, setTrackingState] = useState<"idle" | "tracking">("idle");
  const [currentShotStart, setCurrentShotStart] = useState<LatLng | null>(null);

  const nextHole = useCallback(() => {
    setActiveHole((prev) => Math.min(totalHoles, prev + 1));
  }, []);

  const prevHole = useCallback(() => {
    setActiveHole((prev) => Math.max(1, prev - 1));
  }, []);

  const startTracking = useCallback((location: LatLng) => {
    setTrackingState("tracking");
    setCurrentShotStart(location);
  }, []);

  const endTracking = useCallback(() => {
    setTrackingState("idle");
  }, []);

  const addShot = useCallback((shot: Omit<Shot, "id" | "timestamp">) => {
    const newShot: Shot = {
      ...shot,
      id: Math.random().toString(36).substring(7),
      timestamp: Date.now(),
    };
    setShots((prev) => [...prev, newShot]);
    setCurrentShotStart(null);
  }, []);

  return {
    activeHole,
    setActiveHole,
    nextHole,
    prevHole,
    shots,
    addShot,
    trackingState,
    startTracking,
    endTracking,
    currentShotStart,
  };
}
