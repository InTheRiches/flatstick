import type { LatLng } from "@/models/geo";

export interface MapLayoutSize {
    width: number;
    height: number;
}

export interface RoundTrackingSettings {
    gpsEnabled: boolean;
    showPreviousShots: boolean;
    showHolePath: boolean;
    highContrast: boolean;
    useMetric: boolean;
}

export type ShotEditTarget = "start" | "end";

export interface ShotEditState {
    shotId: string;
    activePoint: ShotEditTarget;
    draftStart: LatLng;
    draftEnd: LatLng;
}

export interface TargetEditState {
    draftCoordinate: LatLng;
}
