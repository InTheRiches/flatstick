const breaks = {
    45: "Left to Right",
    90: "Left to Right",
    135: "Left to Right",
    315: "Right to Left",
    270: "Right to Left",
    225: "Right to Left",
    0: "Straight",
    360: "Straight",
    180: "Straight",
    999: "Straight",
}

const slopes = {
    45: "Downhill",
    90: "Neutral",
    135: "Uphill",
    315: "Downhill",
    270: "Neutral",
    225: "Uphill",
    0: "Downhill",
    360: "Downhill",
    180: "Uphill",
    999: "Neutral",
}

const breakConversion = [
    "Left to Right",
    "Right to Left",
    "Straight",
]

const slopeConversion = [
    "Downhill",
    "Neutral",
    "Uphill"
]

const convertThetaToBreak = (theta) => {
    return [breakConversion.indexOf(breaks[theta]), slopeConversion.indexOf(slopes[theta])];
}

const normalizeVector = (vector) => {
    const length = Math.sqrt(vector[0] ** 2 + vector[1] ** 2);
    return [vector[0] / length, vector[1] / length];
  };

const getLargeMissPoint = (largeMissBy, largeMissDistance) => {
    const [dirX, dirY] = normalizeVector(largeMissBy);
    const missedX = dirX * largeMissDistance;
    const missedY = dirY * largeMissDistance;
    return {x: missedX, y: missedY};
};

const calculateDistanceMissedFeet = (center, point, width, height) => {
    if (center) return 0;
    const distanceX = width / 2 - point.x;
    const distanceY = height / 2 - point.y;
    const distanceMissed = Math.sqrt((distanceX * distanceX) + (distanceY * distanceY));
    const conversionFactor = 5 / width;
    return distanceMissed * conversionFactor;
};

const updatePuttsCopy = (putts, hole, distance, theta, missRead, largeMiss, totalPutts, distanceMissedFeet, largeMissDistance, point, getLargeMissPoint, largeMissBy) => {
    const puttsCopy = [...putts];

    puttsCopy[hole - 1] = {
        distance: distance,
        theta: theta,
        missRead: missRead,
        largeMiss: largeMiss,
        totalPutts: totalPutts,
        distanceMissed: largeMiss ? largeMissDistance : distanceMissedFeet,
        point: largeMiss ? getLargeMissPoint(largeMissBy, largeMissDistance) : point
    };
    return puttsCopy;
};

const roundTo = (num, decimalPlaces) => {
    const factor = Math.pow(10, decimalPlaces);
    return Math.round(num * factor) / factor;
};

const loadPuttData = (putt, updateField) => {
    if (putt.largeMiss) {
        updateField("point", {});
        updateField("largeMiss", true);
        updateField("largeMissBy", [putt.point.x, putt.point.y]);
    } else {
        updateField("point", putt.point);
        updateField("largeMiss", false);
        updateField("largeMissBy", [0, 0]);
    }
    updateField("missRead", putt.missRead);
    updateField("center", putt.distanceMissed === 0);
    if (putt.theta)
        updateField("theta", putt.theta);
    else
        updateField("puttBreak", putt.break);
    updateField("distance", putt.distance);
};

const calculateStats = (puttsCopy, width, height) => {
    let totalPutts = 0;
    let avgMiss = 0;
    let madePercent = 0;
    const trimmedPutts = [];

    puttsCopy.forEach((putt, index) => {
        if (putt !== undefined) {
            if (putt.totalPutts === -1) {
                if (putt.largeMiss) {
                    totalPutts += 3;
                } else if (putt.distanceMissed === 0) {
                    totalPutts++;
                    madePercent++;
                } else {
                    totalPutts += 2;
                }
            } else {
                totalPutts += putt.totalPutts;
            }

            if (putt.distanceMissed !== 0) {
                avgMiss += putt.distanceMissed;
                if (index !== 0) {
                    avgMiss /= 2;
                }
            }

            let xDistance = roundTo(-1 * (width / 2 - putt.point.x) * (5 / width), 2);
            let yDistance = roundTo((height / 2 - putt.point.y) * (5 / height), 2);

            if (putt.largeMiss) {
                xDistance = roundTo(putt.point.x, 2);
                yDistance = roundTo(putt.point.y, 2);
            }

            let puttBreak= putt.theta !== undefined ? convertThetaToBreak(putt.theta) : putt.break;

            trimmedPutts.push({
                distance: putt.distance,
                xDistance: xDistance,
                yDistance: yDistance,
                puttBreak: puttBreak,
                missRead: putt.missRead,
                distanceMissed: putt.distanceMissed,
                largeMiss: putt.largeMiss,
                totalPutts: putt.totalPutts,
                point: putt.point
            });
        }
    });

    avgMiss = roundTo(avgMiss, 1);
    madePercent /= puttsCopy.length;

    return { totalPutts, avgMiss, madePercent, trimmedPutts };
};

const dataSlopes = [
    "downhill",
    "neutral",
    "uphill"
]

const dataBreaks = [
    "rightToLeft",
    "straight",
    "leftToRight"
]

const dataDistances = [
    "lessThanSix",
    "sixToTwelve",
    "twelveToTwenty",
    "twentyPlus"
]

function sumMisses(data, distance, slope, breakType) {
    let totalMisses = [0, 0, 0, 0, 0, 0, 0, 0];
    let totalPutts = 0;

    // Get all distances if 'all' is specified, otherwise just the specific one
    const distances = distance === -1 ? Object.keys(data) : [dataDistances[distance]];

    console.log("Distance: " + distances)

    distances.forEach(distanceKey => {
        // Check if the distance exists
        if (data[distanceKey]) {
            const slopeData = data[distanceKey].slopeAndBreakDistribution;

            // Get all slopes if 'all' is specified, otherwise just the specific one
            const slopes = slope === -1 ? Object.keys(slopeData) : [dataSlopes[slope]];

            console.log("slopes: " + slopes)

            slopes.forEach(slopeKey => {
                // Check if the slope exists
                if (slopeData[slopeKey]) {
                    const breakData = slopeData[slopeKey];

                    // Get all break types if 'all' is specified, otherwise just the specific one
                    const breakTypes = breakType === -1 ? Object.keys(breakData) : [dataBreaks[breakType]];

                    console.log("breakTypes: " + breakTypes)

                    breakTypes.forEach(breakKey => {
                        // Check if the break type exists
                        if (breakData[breakKey]) {
                            const misses = breakData[breakKey].misses;

                            // Add the misses to the totalMisses array
                            totalMisses = totalMisses.map((val, idx) => val + misses[idx]);
                            totalPutts += breakData[breakKey].putts;
                        }
                    });
                }
            });
        }
    });

    return [totalPutts, totalMisses];
}

function filterMissDistribution(currentStats, distance, slope, brek) {
    // if (brek === -1 && slope === -1) {
    //     console.log("sup dude")
    //     let arrays;
    //
    //     if (distance !== -1) {
    //         arrays = [currentStats[dataDistances[distance]].missDistribution];
    //     } else {
    //         arrays = [
    //             currentStats.lessThanSix.missDistribution,
    //             currentStats.sixToTwelve.missDistribution,
    //             currentStats.twelveToTwenty.missDistribution,
    //             currentStats.twentyPlus.missDistribution
    //         ];
    //     }
    //
    //     // Initialize an array of zeros with the same length as the arrays
    //     const combinedMissDistribution = Array(arrays[0].length).fill(0);
    //
    //     // Iterate through each array and sum up their corresponding indices
    //     arrays.forEach(array => {
    //         array.forEach((value, index) => {
    //             combinedMissDistribution[index] += value;
    //         });
    //     });
    //
    //     console.log("sup dude 2")
    //
    //     let totalPutts = 0;
    //     combinedMissDistribution.forEach(value => totalPutts += value);
    //
    //     if (totalPutts === 0) totalPutts = 1
    //
    //     // Calculate missDistribution
    //     const missDistribution = combinedMissDistribution.map((value) => value / totalPutts);
    //
    //     const maxPercentage = Math.max(...missDistribution) + 0.01;
    //
    //     console.log("sup dude 3")
    //
    //     return {
    //         "Long": missDistribution[0] / maxPercentage,
    //         "Long Right": missDistribution[1] / maxPercentage,
    //         "Right": missDistribution[2] / maxPercentage,
    //         "Short Right": missDistribution[3] / maxPercentage,
    //         "Short": missDistribution[4] / maxPercentage,
    //         "Short Left": missDistribution[5] / maxPercentage,
    //         "Left": missDistribution[6] / maxPercentage,
    //         "Long Left": missDistribution[7] / maxPercentage,
    //     };
    // }

    const [totalPutts, merged] = sumMisses(currentStats, distance, slope, brek);

    // Calculate missDistribution
    const missDistribution = merged.map((value) => value / totalPutts);

    const maxPercentage = Math.max(...missDistribution) + 0.01;

    // if missDistribution is empty (which means full of NaN), return an empty object
    if (missDistribution.every(isNaN)) {
        return {
            "Long": 0,
            "Long Right": 0,
            "Right": 0,
            "Short Right": 0,
            "Short": 0,
            "Short Left": 0,
            "Left": 0,
            "Long Left": 0,
        };
    }

    return {
        "Long": missDistribution[0] / maxPercentage,
        "Long Right": missDistribution[1] / maxPercentage,
        "Right": missDistribution[2] / maxPercentage,
        "Short Right": missDistribution[3] / maxPercentage,
        "Short": missDistribution[4] / maxPercentage,
        "Short Left": missDistribution[5] / maxPercentage,
        "Left": missDistribution[6] / maxPercentage,
        "Long Left": missDistribution[7] / maxPercentage,
    };
}

export { filterMissDistribution, normalizeVector, convertThetaToBreak, calculateStats, roundTo, getLargeMissPoint, calculateDistanceMissedFeet, updatePuttsCopy, loadPuttData };