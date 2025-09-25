// --- Break calculation along a putt line ---
import {getPolygonCentroid, isPointInPolygonLatLon} from "../polygonUtils";
import {getDistance, getPuttGradient} from "../gpsStatsEngine";

function calculateBreakAndSlope(line, lidar) {
    let totalDx = 0;
    let totalDy = 0;
    let segments = [];

    for (let i = 0; i < line.length - 1; i++) {
        const p1 = line[i];
        const p2 = line[i + 1];

        const slope = getPuttGradient(p1.longitude, p1.latitude, lidar);

        totalDx += slope.dx;
        totalDy += slope.dy;

        segments.push({
            from: p1,
            to: p2,
            slope
        });
    }

    const overall = {
        dx: totalDx,
        dy: totalDy
    };

    return { segments, overall };
}

function categorizePutt(breakData) {
    const { segments, overall } = breakData;
    const breakThreshold = 0.01; // tweak based on slope magnitude

    // detect double break
    let leftCount = 0;
    let rightCount = 0;
    for (const seg of segments) {
        if (seg.slope.dx > breakThreshold) rightCount++;
        if (seg.slope.dx < -breakThreshold) leftCount++;
    }

    const isDouble = leftCount > 0 && rightCount > 0;

    // overall direction
    let overallBreak = "straight";
    if (overall.dx > breakThreshold) overallBreak = "right";
    if (overall.dx < -breakThreshold) overallBreak = "left";

    let slope = "flat";
    if (overall.dy > breakThreshold) slope = "downhill";
    if (overall.dy < -breakThreshold) slope = "uphill";

    return {
        overallBreak,
        slope,
        isDouble
    };
}

function samplePuttLine(start, hole, n = 10) {
    const points = [];
    for (let i = 0; i <= n; i++) {
        const t = i / n;
        points.push({
            latitude: start.latitude + (hole.latitude - start.latitude) * t,
            longitude: start.longitude + (hole.longitude - start.longitude) * t
        });
    }
    return points;
}

function randomPointInPolygon(polygon) {
    // Compute bounding box
    const lats = polygon.map((p) => p.latitude);
    const lons = polygon.map((p) => p.longitude);

    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);

    let point;
    do {
        const latitude = minLat + Math.random() * (maxLat - minLat);
        const longitude = minLon + Math.random() * (maxLon - minLon);
        point = { latitude, longitude };
    } while (!isPointInPolygonLatLon(point, polygon));

    return point;
}

// Fisher-Yates shuffle
function shuffle(array) {
    let m = array.length, i;

    while (m) {
        i = Math.floor(Math.random() * m--);
        [array[m], array[i]] = [array[i], array[m]]; // swap
    }

    return array;
}

// --- Main function to simulate a practice round ---
export function generatePracticeRound(greenCoords, lidar, pins, options = {}) {
    const holes = [];
    const center = getPolygonCentroid(greenCoords);

    const minDist = options.minDist || 2;   // meters
    const maxDist = options.maxDist || 12;  // meters

    // target distribution (example)
    let targets = [
        "left", "left", "left", "left",
        "right", "right", "right", "right",
        "uphill", "uphill", "uphill", "uphill",
        "downhill", "downhill", "downhill", "downhill",
        "straight", "double"
    ];
    targets = shuffle(targets); // randomize order

    for (let i = 0; i < 18; i++) {
        const target = targets[i];
        let attempt = 0, putt = null;

        while (attempt < 30) { // cap attempts
            attempt++;

            const start = randomPointInPolygon(greenCoords);
            const pin = pins[Math.floor(Math.random() * pins.length)];

            const dist = getDistance(start, pin);

            if (dist < minDist || dist > maxDist) continue; // reject

            const puttLine = samplePuttLine(start, pin);
            const breakData = calculateBreakAndSlope(puttLine, lidar);
            const categories = categorizePutt(breakData);

            // match against target
            if (
                (target === "left" && categories.overallBreak === "left") ||
                (target === "right" && categories.overallBreak === "right") ||
                (target === "uphill" && categories.slope === "uphill") ||
                (target === "downhill" && categories.slope === "downhill") ||
                (target === "straight" && categories.overallBreak === "straight") ||
                (target === "double" && categories.isDouble)
            ) {
                putt = { holeNumber: i + 1, start, pin, puttLine, breakData, categories };
                break;
            }
        }

        if (!putt) {
            // fallback if we couldn’t satisfy target
            const start = randomPointInPolygon(greenCoords);
            const pin = pins[Math.floor(Math.random() * pins.length)];
            const puttLine = samplePuttLine(start, pin);
            const breakData = calculateBreakAndSlope(puttLine, lidar);
            const categories = categorizePutt(breakData);

            putt = { holeNumber: i + 1, start, pin, puttLine, breakData, categories };
        }

        holes.push(putt);
    }

    return holes;
}