import {calculateBaselineStrokesGained} from "@/utils/StrokesGainedUtils";
import {roundTo} from "./roundTo";
import {convertUnits} from "@/utils/Conversions";

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
    const conversionFactor = 5 / width; // 5 is the entire width of the green in feet
    return distanceMissed * conversionFactor;
};

const calculateDistanceMissedMeters = (center, point, width, height) => {
    if (center) return 0;
    const distanceX = width / 2 - point.x;
    const distanceY = height / 2 - point.y;
    const distanceMissed = Math.sqrt((distanceX * distanceX) + (distanceY * distanceY));
    const conversionFactor = 2 / width; // 2 is the entire width of the green in meters
    return distanceMissed * conversionFactor;
};

const updatePuttsCopy = (putts, hole, distance, theta, misReadLine, misReadSlope, misHit, largeMiss, totalPutts, distanceMissed, largeMissDistance, point, getLargeMissPoint, largeMissBy) => {
    const puttsCopy = [...putts];

    puttsCopy[hole - 1] = {
        distance: distance,
        theta: theta,
        misReadLine: misReadLine,
        misReadSlope: misReadSlope,
        misHit: misHit,
        largeMiss: largeMiss,
        totalPutts: totalPutts,
        distanceMissed: largeMiss ? largeMissDistance : distanceMissed,
        point: largeMiss ? getLargeMissPoint(largeMissBy, largeMissDistance) : point
    };
    return puttsCopy;
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
    updateField("misReadLine", putt.misReadLine);
    updateField("misReadSlope", putt.misReadSlope);
    updateField("misHit", putt.misHit);
    updateField("center", putt.distanceMissed === 0);
    updateField("currentPutts", putt.totalPutts);
    if (putt.theta)
        updateField("theta", putt.theta);
    else
        updateField("puttBreak", putt.break);
    updateField("distance", putt.distance);

    updateField("distanceInvalid", putt.distance < 1 || putt.distance > 99);
};

const calculateStats = (puttsCopy, width, height) => {
    let totalPutts = 0;
    let avgMiss = 0;
    let madePercent = 0;
    const trimmedPutts = [];
    let strokesGained = 0;
    let leftRightBias = 0;
    let shortPastBias = 0;
    let puttCounts = [0, 0, 0]
    let totalDistance = 0;

    let farLeft = 0
    let left = 0;
    let center = 0;
    let right = 0;
    let farRight = 0;
    let long = 0;
    let short = 0;

    puttsCopy.forEach((putt, index) => {
        if (putt === undefined || putt.distance === -1 || putt.point.x === undefined)
            return;

        // calculate strokes gained
        if (putt.totalPutts !== -1) {
            const strokesGainedForPutt = calculateBaselineStrokesGained(putt.distance) - putt.totalPutts;
            strokesGained += strokesGainedForPutt;
        }

        if (putt.totalPutts === -1) {
            if (putt.largeMiss) {
                totalPutts += 3;
                puttCounts[2]++;
            }
            else if (putt.distanceMissed === 0) {
                totalPutts++;
                madePercent++;
                puttCounts[0]++;
            } else {
                totalPutts += 2;
                puttCounts[1]++;
            }
        } else {
            if (putt.totalPutts === 1 || putt.distanceMissed === 0)
                madePercent++;
            totalPutts += putt.totalPutts;
            // add the totalPutts into the puttCount array, if the putt was > 3 strokes, add it to the 3 putt count
            if (putt.totalPutts > 3)
                puttCounts[2]++;
            else
                puttCounts[putt.totalPutts - 1]++;
        }
        if (putt.distanceMissed !== 0) {
            avgMiss += putt.distanceMissed;
            if (index !== 0)
                avgMiss /= 2;
        }
        let xDistance = roundTo(-1 * (width / 2 - putt.point.x) * (5 / width), 2);
        let yDistance = roundTo((height / 2 - putt.point.y) * (5 / height), 2);
        if (putt.largeMiss) {
            xDistance = roundTo(putt.point.x, 2);
            yDistance = roundTo(putt.point.y, 2);
        }
        leftRightBias += xDistance;
        shortPastBias += yDistance;

        const angle = Math.atan2(yDistance, xDistance); // atan2 handles dx = 0 cases
        const degrees = (angle * 180) / Math.PI; // Convert radians to degrees

        // Check the quadrant based on the rotated ranges
        if (putt.distanceMissed === 0 && !putt.largeMiss) {
            center++
        } else if (degrees > -45 && degrees <= 45) {
            if (putt.distanceMissed <= 2 && !putt.largeMiss) right++;
            else farRight++;
        } else if (degrees > 45 && degrees <= 135) {
            long++;
        } else if (degrees > -135 && degrees <= -45) {
            short++;
        } else {
            if (putt.distanceMissed <= 2 && !putt.largeMiss) left++;
            else farLeft++;
        }

        let puttBreak = putt.theta !== undefined ? convertThetaToBreak(putt.theta) : putt.break;
        trimmedPutts.push({
            distance: putt.distance,
            xDistance: xDistance,
            yDistance: yDistance,
            puttBreak: puttBreak,
            misReadLine: putt.misReadLine,
            misReadSlope: putt.misReadSlope,
            misHit: putt.misHit,
            distanceMissed: roundTo(putt.distanceMissed, 2),
            largeMiss: putt.largeMiss,
            totalPutts: putt.totalPutts,
            point: putt.point
        });

        totalDistance += putt.distance;
    });

    avgMiss = roundTo(avgMiss, 1);
    madePercent /= puttsCopy.length;

    leftRightBias /= puttsCopy.length;
    shortPastBias /= puttsCopy.length;

    return { totalPutts, avgMiss, madePercent, trimmedPutts, strokesGained, leftRightBias: roundTo(leftRightBias, 1), shortPastBias: roundTo(shortPastBias, 1), puttCounts, missData: {farLeft, left, center, right, farRight, long, short}, totalDistance: roundTo(totalDistance, 1)};
};

function formatFeetAndInches(feet) {
    if (feet === 0) return `0' 0"`

    // Round to nearest whole number of inches
    const totalInches = roundTo(feet * 12, 0);

    const feetPart = Math.floor(totalInches / 12); // Extract the whole feet
    const inchesPart = totalInches % 12; // Extract the remaining inches

    let result = "";
    // Build the formatted string
    if (feetPart !== 0) {
        result += `${feetPart}'`;
    }
    if (inchesPart !== 0) {
        result += ` ${inchesPart}"`;
    }
    return result;
}

function cleanPuttsAHole(averagePerformance) {
    const refinedPuttsAHole = {
        distance: [0, 0, 0, 0],
        puttsAHole: 0,
        puttsAHoleWhenMisread: 0,
        puttsAHoleWhenMishit: 0,
        slopes: {
            downhill: {
                straight: 0, // putts a hole
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
        }
    };

    refinedPuttsAHole.puttsAHole = roundTo(averagePerformance.puttsAHole.puttsAHole / averagePerformance.puttsAHole.normalHoles, 1);
    if (averagePerformance.puttsAHole.mishitHoles > 0)
        refinedPuttsAHole.puttsAHoleWhenMishit = roundTo(averagePerformance.puttsAHole.puttsAHoleWhenMishit / averagePerformance.puttsAHole.mishitHoles, 1);
    if (averagePerformance.puttsAHole.misreadHoles > 0)
        refinedPuttsAHole.puttsAHoleWhenMisread = roundTo(averagePerformance.puttsAHole.misreadPuttsAHole / averagePerformance.puttsAHole.misreadHoles, 1);
    refinedPuttsAHole.distance = averagePerformance.puttsAHole.distance.map((val, idx) => {
        if (averagePerformance.puttsByDistance[idx] === 0) return 0;
        return roundTo(val / averagePerformance.puttsByDistance[idx], 1);
    });

    // handle the slopes
    for (const slope of ["uphill", "neutral", "downhill"]) {
        for (const breakType of ["straight", "leftToRight", "rightToLeft"]) {
            if (averagePerformance.puttsAHole.slopes[slope][breakType][1] === 0) continue;
            refinedPuttsAHole.slopes[slope][breakType] = roundTo(averagePerformance.puttsAHole.slopes[slope][breakType][0] / averagePerformance.puttsAHole.slopes[slope][breakType][1], 1);
        }
    }

    return refinedPuttsAHole;
}

const createSimpleStats = () => {
    return {
        onePutts: 0,
        twoPutts: 0,
        threePutts: 0,
        avgMiss: 0,
        avgMissDistance: [0, 0, 0, 0],
        puttsByDistance: [0, 0, 0, 0],
        totalDistance: 0,
        puttsMisread: 0,
        puttsMishits: 0,
        misreads: {
            misreadLineByDistance: [0, 0, 0, 0],
            misreadSlopeByDistance: [0, 0, 0, 0],
            misreadLinePercentage: 0,
            misreadSlopePercentage: 0,
            misreadLineBySlope: {
                downhill: {
                    straight: [0,0], // misreads, putts
                    leftToRight: [0,0],
                    rightToLeft: [0,0]
                },
                neutral: {
                    straight: [0,0],
                    leftToRight: [0,0],
                    rightToLeft: [0,0]
                },
                uphill: {
                    straight: [0,0],
                    leftToRight: [0,0],
                    rightToLeft: [0,0]
                }
            },
            misreadSlopeBySlope: {
                downhill: {
                    straight: [0,0], // misreads, putts
                    leftToRight: [0,0],
                    rightToLeft: [0,0]
                },
                neutral: {
                    straight: [0,0],
                    leftToRight: [0,0],
                    rightToLeft: [0,0]
                },
                uphill: {
                    straight: [0,0],
                    leftToRight: [0,0],
                    rightToLeft: [0,0]
                }
            }
        },
        strokesGained: {
            overall: 0,
            distance: [0, 0, 0, 0],
            slopes: {
                downhill: {
                    straight: [0, 0], // strokesGained, putts
                    leftToRight: [0, 0],
                    rightToLeft: [0, 0]
                },
                neutral: {
                    straight: [0, 0],
                    leftToRight: [0, 0],
                    rightToLeft: [0, 0]
                },
                uphill: {
                    straight: [0, 0],
                    leftToRight: [0, 0],
                    rightToLeft: [0, 0]
                }
            }
        },
        puttsAHole: {
            distance: [0, 0, 0, 0],
            puttsAHole: 0,
            normalHoles: 0,
            puttsAHoleWhenMishit: 0,
            mishitHoles: 0,
            misreadPuttsAHole: 0,
            misreadHoles: 0,
            slopes: {
                downhill: {
                    straight: [0, 0], // putts a hole, holes
                    leftToRight: [0, 0],
                    rightToLeft: [0, 0]
                },
                neutral: {
                    straight: [0, 0],
                    leftToRight: [0, 0],
                    rightToLeft: [0, 0]
                },
                uphill: {
                    straight: [0, 0],
                    leftToRight: [0, 0],
                    rightToLeft: [0, 0]
                }
            }
        },
        madePutts: {
            distance: [0, 0, 0, 0],
            slopes: {
                downhill: {
                    straight: [0, 0], // made putts, putts
                    leftToRight: [0, 0],
                    rightToLeft: [0, 0]
                },
                neutral: {
                    straight: [0, 0],
                    leftToRight: [0, 0],
                    rightToLeft: [0, 0]
                },
                uphill: {
                    straight: [0, 0],
                    leftToRight: [0, 0],
                    rightToLeft: [0, 0]
                }
            }
        },
        leftRightBias: 0,
        shortPastBias: 0,
        rounds: 0,
    }
}
const createSimpleRefinedStats = () => {
    return {
        onePutts: 0,
        twoPutts: 0,
        threePutts: 0,
        avgMiss: 0,
        avgMissDistance: [0, 0, 0, 0],
        totalDistance: 0,
        puttsMisread: 0,
        puttsMishits: 0,
        misreads: {
            misreadLineByDistance: [0, 0, 0, 0],
            misreadSlopeByDistance: [0, 0, 0, 0],
            misreadLinePercentage: 0,
            misreadSlopePercentage: 0,
            misreadLineBySlope: {
                downhill: {
                    straight: 0, // misreads, putts
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
            },
            misreadSlopeBySlope: {
                downhill: {
                    straight: 0, // misreads, putts
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
            }
        },
        strokesGained: {
            overall: 0,
            distance: [0, 0, 0, 0],
            slopes: {
                downhill: {
                    straight: 0, // strokesGained, putts
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
            }
        },
        puttsAHole: {
            distance: [0, 0, 0, 0],
            puttsAHole: 0,
            puttsAHoleWhenMishit: 0,
            puttsAHoleWhenMisread: 0,
            slopes: {
                downhill: {
                    straight: 0, // putts a hole, holes
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
            }
        },
        madePutts: {
            distance: [0, 0, 0, 0],
            slopes: {
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
            }
        },
        leftRightBias: 0,
        shortPastBias: 0,
        rounds: 0,
    }
}

function cleanMisreads(averagePerformance) {
    const refinedMisreads = {
            misreadLineByDistance: [0, 0, 0, 0],
            misreadSlopeByDistance: [0, 0, 0, 0],
            misreadLinePercentage: 0,
            misreadSlopePercentage: 0,
            misreadLineBySlope: {
                downhill: {
                    straight: 0, // misreads, putts
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
            },
            misreadSlopeBySlope: {
                downhill: {
                    straight: 0, // misreads, putts
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
            }
        };

    refinedMisreads.misreadLineByDistance = averagePerformance.misreads.misreadLineByDistance.map((val, idx) => {
        if (averagePerformance.puttsByDistance[idx] === 0) return 0;
        return roundTo(val / averagePerformance.puttsByDistance[idx], 2);
    });

    refinedMisreads.misreadSlopeByDistance = averagePerformance.misreads.misreadSlopeByDistance.map((val, idx) => {
        if (averagePerformance.puttsByDistance[idx] === 0) return 0;
        return roundTo(val / averagePerformance.puttsByDistance[idx], 2);
    });

    refinedMisreads.misreadSlopePercentage = roundTo(averagePerformance.misreads.misreadSlopePercentage / (averagePerformance.rounds * 18), 2);
    refinedMisreads.misreadLinePercentage = roundTo(averagePerformance.misreads.misreadSlopePercentage / (averagePerformance.rounds * 18), 2);

    // handle the slopes
    for (const slope of ["uphill", "neutral", "downhill"]) {
        for (const breakType of ["straight", "leftToRight", "rightToLeft"]) {
            if (averagePerformance.misreads.misreadLineBySlope[slope][breakType][1] !== 0)
                refinedMisreads.misreadLineBySlope[slope][breakType] = roundTo(averagePerformance.misreads.misreadLineBySlope[slope][breakType][0] / averagePerformance.misreads.misreadLineBySlope[slope][breakType][1], 2);
            if (averagePerformance.misreads.misreadSlopeBySlope[slope][breakType][1] !== 0)
                refinedMisreads.misreadSlopeBySlope[slope][breakType] = roundTo(averagePerformance.misreads.misreadSlopeBySlope[slope][breakType][0] / averagePerformance.misreads.misreadSlopeBySlope[slope][breakType][1], 2);
        }
    }

    return refinedMisreads;
}

function cleanMadePutts(averagePerformance) {
    const refinedMadePutts = {
        distance: [0, 0, 0, 0],
        slopes: {
            downhill: {
                straight: 0, // made putt percentage
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
        }
    };

    refinedMadePutts.distance = averagePerformance.madePutts.distance.map((val, idx) => {
        if (averagePerformance.puttsByDistance[idx] === 0) return 0;
        return roundTo(val / averagePerformance.puttsByDistance[idx], 1);
    });

    // handle the slopes
    for (const slope of ["uphill", "neutral", "downhill"]) {
        for (const breakType of ["straight", "leftToRight", "rightToLeft"]) {
            if (averagePerformance.madePutts.slopes[slope][breakType][1] === 0) continue;
            refinedMadePutts.slopes[slope][breakType] = roundTo(averagePerformance.madePutts.slopes[slope][breakType][0] / averagePerformance.madePutts.slopes[slope][breakType][1], 1);
        }
    }

    return refinedMadePutts;
}

function updateSimpleStats(userData, simpleStats, putt, category) {
    const {distance, distanceMissed, misReadLine, misReadSlope, misHit, puttBreak, xDistance, yDistance, totalPutts} = putt;

    const statBreaks = [
        "leftToRight",
        "rightToLeft",
        "straight",
    ]

    const statSlopes = [
        "downhill",
        "neutral",
        "uphill"
    ]

    const distanceIndex = category === "distanceOne" ? 0 : category === "distanceTwo" ? 1 : category === "distanceThree" ? 2 : 3;

    if (totalPutts === 1) {
        simpleStats.onePutts++;
        simpleStats.madePutts.slopes[statSlopes[puttBreak[1]]][statBreaks[puttBreak[0]]][0]++;

        simpleStats.madePutts.distance[distanceIndex]++;
    }
    else if (totalPutts === 2) simpleStats["twoPutts"]++;
    else simpleStats["threePutts"]++;

    simpleStats.madePutts.slopes[statSlopes[puttBreak[1]]][statBreaks[puttBreak[0]]][1]++;

    if (misReadLine || misReadSlope) {
        simpleStats.puttsAHole.misreadPuttsAHole += totalPutts;
        simpleStats.puttsAHole.misreadHoles++;
    }

    if (misReadLine) {
        simpleStats.misreads.misreadLineByDistance[distanceIndex]++;
        simpleStats.misreads.misreadLineBySlope[statSlopes[puttBreak[1]]][statBreaks[puttBreak[0]]][0]++;
        simpleStats.misreads.misreadLinePercentage++;
    }

    if (misReadSlope) {
        simpleStats.misreads.misreadSlopeByDistance[distanceIndex]++;
        simpleStats.misreads.misreadSlopeBySlope[statSlopes[puttBreak[1]]][statBreaks[puttBreak[0]]][0]++;
        simpleStats.misreads.misreadSlopePercentage++;
    }

    if (misHit) {
        simpleStats.puttsAHole.puttsAHoleWhenMishit += totalPutts;
        simpleStats.puttsAHole.mishitHoles++;
    } else {
        simpleStats.puttsAHole.puttsAHole += totalPutts;
        simpleStats.puttsAHole.normalHoles++;
    }

    const strokesGained = calculateBaselineStrokesGained(convertUnits(distance, userData.preferences.units, 0)) - totalPutts;

    if ((misHit && userData.preferences.countMishits) || !misHit) {
        simpleStats.puttsByDistance[distanceIndex]++;

        simpleStats.puttsAHole.distance[distanceIndex] += totalPutts;

        simpleStats.puttsAHole.slopes[statSlopes[puttBreak[1]]][statBreaks[puttBreak[0]]][0] += putt.totalPutts;
        simpleStats.puttsAHole.slopes[statSlopes[puttBreak[1]]][statBreaks[puttBreak[0]]][1]++;
        simpleStats.strokesGained.distance[distanceIndex] += strokesGained;
        simpleStats.strokesGained.slopes[statSlopes[puttBreak[1]]][statBreaks[puttBreak[0]]][0] += strokesGained;
        simpleStats.strokesGained.slopes[statSlopes[puttBreak[1]]][statBreaks[puttBreak[0]]][1]++;

        simpleStats.avgMiss += distanceMissed;
        simpleStats.avgMissDistance[distanceIndex] += distanceMissed;
    }

    simpleStats.leftRightBias += xDistance;
    simpleStats.shortPastBias += yDistance;

    simpleStats["totalDistance"] += distance;
    simpleStats["puttsMisread"] += misReadLine || misReadSlope ? 1 : 0;
    simpleStats["puttsMishits"] += misHit ? 1 : 0;

    simpleStats.misreads.misreadLineBySlope[statSlopes[puttBreak[1]]][statBreaks[puttBreak[0]]][1]++;
    simpleStats.misreads.misreadSlopeBySlope[statSlopes[puttBreak[1]]][statBreaks[puttBreak[0]]][1]++;
}

export { calculateDistanceMissedMeters, createSimpleStats, cleanMisreads, createSimpleRefinedStats, updateSimpleStats, cleanMadePutts, cleanPuttsAHole, formatFeetAndInches, normalizeVector, convertThetaToBreak, calculateStats, getLargeMissPoint, calculateDistanceMissedFeet, updatePuttsCopy, loadPuttData };