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
    n: [2, 1] // Neutral slope, neutral break
};

export const INTERP_BREAK_MAP = {
    r: ["leftToRight", "neutral"],   // Left to Right + Neutral
    tr: ["leftToRight", "downhill"],  // Left to Right + Downhill
    t: ["straight", "downhill"],   // Straight + Downhill
    tl: ["rightToLeft", "downhill"],  // Right to Left + Downhill
    l: ["rightToLeft", "neutral"],   // Right to Left + Neutral
    bl: ["rightToLeft", "uphill"],  // Right to Left + Uphill
    b: ["straight", "uphill"],   // Straight + Uphill
    br: ["leftToRight", "uphill"],  // Left to Right + Uphill
    n: ["straight", "neutral"] // Neutral slope, neutral break
};

export const getEmptySlopeBreakData = () => ({
    downhill: {
        straight: 0, // made putts, putts
        leftToRight: 0,
        rightToLeft: 0
    },
    neutral: {
        straight: 0,
        leftToRight: 0,
        rightToLeft: 0
    },
    uphill: {
        straight: 0,
        leftToRight: 0,
        rightToLeft: 0
    }
})

export function createMonthAggregateStats() {
    return {
        rounds: 0,
        holesPlayed: 0,
        totalPuttsBySlope: getEmptySlopeBreakData(),
        totalPuttsByDistance: [0, 0, 0, 0], // 0-5ft, 5-10ft, 10-20ft, 20+ft
        holesByFirstPuttSlope: getEmptySlopeBreakData(),
        holesByFirstPuttDistance: [0, 0, 0, 0], // 0-5ft, 5-10ft, 10-20ft, 20+ft
        totalPutts: 0,
        averageRound: {
            onePutts: 0,
            twoPutts: 0,
            threePlusPutts: 0,
            totalDistance: 0,
        },
        missData: {
            totalMissDistance: 0,
            totalMissedPutts: 0,
            missedPuttsByDistance: [0, 0, 0, 0], // 0-5ft, 5-10ft, 10-20ft, 20+ft
            missByDistance: [0, 0, 0, 0], // 0-5ft, 5-10ft, 10-20ft, 20+ft
            totalLongMiss: 0, // along line of putt (short/long)
            totalLatMiss: 0, // perpendicular to line of putt (left/right)
            totalShortMisses: 0,
            totalHighMisses: 0,
        },
        madeData: {
            totalMadePutts: 0, // percent = madePutts / totalPutts
            byDistance: [0, 0, 0, 0], // 0-5ft, 5-10ft, 10-20ft, 20+ft
            totalMadeDistance: 0, // used to calculate average made distance
            slopes: getEmptySlopeBreakData()
        },
        misreadData: {
            totalHolesMisread: 0, // percent = holesMisread / holesPlayed
            totalMisreads: 0,
            misreadLineByDistance: [0, 0, 0, 0], // 0-5ft, 5-10ft, 10-20ft, 20+ft (percentage of misreads that were line)
            misreadSlopeByDistance: [0, 0, 0, 0], // 0-5ft, 5-10ft, 10-20ft, 20+ft
            misreadLineBySlope: getEmptySlopeBreakData(),
            misreadSlopeBySlope: getEmptySlopeBreakData(),
            totalLineMisreads: 0,
            totalSlopeMisreads: 0
        },
        puttsAHole: {
            byFirstPuttDistance: [0, 0, 0, 0], // 0-5ft, 5-10ft, 10-20ft, 20+ft
            byFirstPuttSlope: getEmptySlopeBreakData(),
            whenMisread: 0,
        },
        strokesGained: {
            expectedStrokes: 0,
            expectedStrokesByDistance: [0, 0, 0, 0], // 0-5ft, 5-10ft, 10-20ft, 20+ft
            expectedStrokesBySlope: getEmptySlopeBreakData(),
        }
    };
}
