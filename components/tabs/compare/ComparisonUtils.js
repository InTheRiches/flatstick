function calculateWeightedScore(stats) {
    if (stats === {}) return -999;

    const weights = {
        strokesGained: 0.4,
        avgMiss: 0.2,
        makePercentage: 0.2,
        leftRightBias: 0.05,
        shortLongBias: 0.05,
        puttsMisread: 0.05,
        puttsMishits: 0.05,
        onePutts: 0.05,
        twoPutts: 0.01,
        threePutts: 0.01,
        puttsAHole: 0.01
    };

    let score = 0;
    score += stats.strokesGained.overall * weights.strokesGained;
    score -= stats.avgMiss * weights.avgMiss;
    score += (stats.onePutts / 18) * 10 * weights.makePercentage;

    score -= Math.abs(stats.leftRightBias) * weights.leftRightBias;
    score -= Math.abs(stats.shortPastBias) * weights.shortLongBias;
    score -= Math.abs(stats.puttsMisread) * weights.puttsMisread;
    score -= Math.abs(stats.puttsMishits) * weights.puttsMishits;
    score += stats.onePutts * weights.onePutts;
    score += stats.twoPutts * weights.twoPutts;
    score += stats.threePutts * weights.threePutts;
    score += stats.puttsAHole.puttsAHole * weights.puttsAHole;
    return score;
}

function compareStats(stats1, stats2) {
    const score1 = calculateWeightedScore(stats1);
    const score2 = calculateWeightedScore(stats2);

    if (score1 - score2 > 0.1) {
        return 1;
    } else if (score1 - score2 < -0.1) {
        return 2;
    } else {
        return 0;
    }
}

export { compareStats };