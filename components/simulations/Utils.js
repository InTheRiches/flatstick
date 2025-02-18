const dataSlopes = [
    "downhill",
    "neutral",
    "uphill"
]

const dataBreaks = [
    "leftToRight",
    "rightToLeft",
    "straight",
]

function createRollProbabilities(currentStats) {
    const { strokesGained } = currentStats;

    // Assign weights based on user stats
    const weights = [];
    for (const slope in strokesGained.slopes) {
        for (const breakType in strokesGained.slopes[slope]) {
            const strokesGainedValue = strokesGained.slopes[slope][breakType];
            // Weight is inverse of performance (e.g., worse performance = higher weight)
            const weight = Math.max(0, -strokesGainedValue) + 1; // Ensure weight > 0
            weights.push({
                slope: dataSlopes.indexOf(slope),
                break: dataBreaks.indexOf(breakType),
                weight
            });
        }
    }

    const totalWeight = weights.reduce((sum, item) => sum + item.weight, 0);
    return weights.map(item => ({
        ...item,
        probability: item.weight / totalWeight
    }));
}

function createDistanceProbabilities(currentStats) {
    const { strokesGained } = currentStats;

    // Assign weights based on user stats
    const weights = [];
    for (let i = 0; i < strokesGained.distance.length; i++) {
        const strokesGainedValue = strokesGained.distance[i];
        // Weight is inverse of performance (e.g., worse performance = higher weight)
        const weight = Math.max(0, -strokesGainedValue) + 1; // Ensure weight > 0
        weights.push({
            distance: i,
            weight
        });
    }

    const totalWeight = weights.reduce((sum, item) => sum + item.weight, 0);
    return weights.map(item => ({
        ...item,
        probability: item.weight / totalWeight
    }));
}

function pickWeightedRandom(probabilities) {
    const rand = Math.random();
    let cumulativeProbability = 0;
    for (const item of probabilities) {
        cumulativeProbability += item.probability;
        if (rand <= cumulativeProbability) {
            return item;
        }
    }
    return probabilities[probabilities.length - 1]; // Fallback to last item
}

function generateBreak() {
    // Generate a random break
    return [Math.floor(Math.random() * 3), Math.floor(Math.random() * 3)];
}

function generateTargetedDistance(target, units) {
    if (units === 0) {
        switch (target) {
            case 0:
                // generate a number less than 6 ft
                return Math.round(Math.random() * 6);
            case 1:
                // generate a number between 6 and 12 ft
                return Math.round(Math.random() * 6) + 6;
            case 2:
                // generate a number between 12 and 20 ft
                return Math.round(Math.random() * 8) + 12;
            default:
                // generate a number over 20, less than 40
                return Math.round(Math.random() * 20) + 20;
        }
    }
    else {
        switch (target) {
            case 0:
                // generate a number less than 2 m
                return Math.round(Math.random() * 2);
            case 1:
                // generate a number between 2 and 4 m
                return Math.round(Math.random() * 2) + 2;
            case 2:
                // generate a number between 4 and 7 m
                return Math.round(Math.random() * 3) + 4;
            default:
                // generate a number over 7, less than 13
                return Math.round(Math.random() * 5) + 7;
        }
    }
}

function generateDistance(difficulty, units) {
    let minDistance, maxDistance;

    if (units === 0) {
        if (difficulty === "easy") {
            minDistance = 3; // Easy: Minimum 3 ft
            maxDistance = 15; // Easy: Maximum 15 ft
        } else if (difficulty === "medium") {
            minDistance = 8; // Medium: Minimum 8 ft
            maxDistance = 25; // Medium: Maximum 25 ft
        } else if (difficulty === "hard") {
            minDistance = 10; // Hard: Minimum 10 ft
            maxDistance = 40; // Hard: Maximum 40 ft
        }
    }
    else {
        if (difficulty === "easy") {
            minDistance = 1; // Easy: Minimum 1 m
            maxDistance = 5; // Easy: Maximum 5 m
        } else if (difficulty === "medium") {
            minDistance = 3; // Medium: Minimum 3 m
            maxDistance = 8; // Medium: Maximum 8 m
        } else if (difficulty === "hard") {
            minDistance = 3; // Hard: Minimum 3 m
            maxDistance = 13; // Hard: Maximum 13 m
        }
    }

    // Generate random distance between minDistance and maxDistance
    if (units === 0) {
        return Math.floor(Math.random() * (maxDistance - minDistance + 1)) + minDistance;
    } else {
        return (Math.floor(Math.random() * ((maxDistance - minDistance) * 2 + 1)) + minDistance * 2) / 2;
    }
}

export {createRollProbabilities, createDistanceProbabilities, pickWeightedRandom, generateTargetedDistance, generateBreak, generateDistance};