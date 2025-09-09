export const METERS_PER_DEGREE = 111320; // Approximate, varies with latitude
export const FEET_PER_METER = 3.28084;
export const SCHEMA_VERSION = 2; // Increment this when making breaking changes to the data schema
export const STAT_BREAKS = [
    "leftToRight",
    "rightToLeft",
    "straight",
]

export const STAT_SLOPES = [
    "downhill",
    "neutral",
    "uphill"
]

export const BREAK_MAP = {
    r: [0, 1],   // Left to Right + Neutral
    tr: [0, 0],  // Left to Right + Downhill
    t: [2, 0],   // Straight + Downhill
    tl: [1, 0],  // Right to Left + Downhill
    l: [1, 1],   // Right to Left + Neutral
    bl: [1, 2],  // Right to Left + Uphill
    b: [2, 2],   // Straight + Uphill
    br: [0, 2],  // Left to Right + Uphill
};