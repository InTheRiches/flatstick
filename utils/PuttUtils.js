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

            let puttBreak = [];
            if (putt.theta) {
                puttBreak = convertThetaToBreak(putt.theta);
            } else {
                puttBreak = putt.break;
            }

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

export { normalizeVector, convertThetaToBreak, calculateStats, roundTo, getLargeMissPoint, calculateDistanceMissedFeet, updatePuttsCopy, loadPuttData };