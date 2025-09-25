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
    score += (stats.strokesGained.expectedStrokes - stats.totalPutts) * weights.strokesGained;
    score -= (stats.avgMiss / stats.totalPutts) * weights.avgMiss;
    score += (stats.averageRound.onePutts / (stats.holesPlayed)) * weights.makePercentage;

    score -= Math.abs((stats.missData.totalLongMiss / stats.missData.totalMissedPutts) / 12) * weights.leftRightBias;
    score -= Math.abs((stats.missData.totalLatMiss / stats.missData.totalMissedPutts) / 12) * weights.shortLongBias;
    score -= Math.abs(stats.misreadData.totalMisreads / (stats.holesPlayed / 18)) * weights.puttsMisread;
    score += (stats.averageRound.onePutts / (stats.holesPlayed / 18)) * weights.onePutts;
    score += (stats.averageRound.twoPutts / (stats.holesPlayed / 18)) * weights.twoPutts;
    score += (stats.averageRound.threePlusPutts / (stats.holesPlayed / 18)) * weights.threePutts;
    score += (stats.totalPutts / (stats.holesPlayed)) * weights.puttsAHole;
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