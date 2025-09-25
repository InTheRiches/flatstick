import {isPointInPolygonLatLon} from "./polygonUtils";

/** true if point is inside the bounding box */
const isInside = (p, b) =>
    p.latitude >= b.minLat && p.latitude <= b.maxLat &&
    p.longitude >= b.minLon && p.longitude <= b.maxLon;

const EPS = 1e-9;
const within = (v, a, b) =>
    v >= Math.min(a, b) - EPS && v <= Math.max(a, b) + EPS;

/**
 * First intersection point along segment p1->p2 with the rectangle bounds.
 * Returns the *earliest* hit (smallest t in [0,1]) if any.
 */
function firstIntersection(p1, p2, b) {
    const dx = p2.longitude - p1.longitude;
    const dy = p2.latitude - p1.latitude;
    const hits = [];

    if (Math.abs(dx) > EPS) {
        // left (minLon)
        let t = (b.minLon - p1.longitude) / dx;
        let y = p1.latitude + t * dy;
        if (t >= 0 && t <= 1 && within(y, b.minLat, b.maxLat)) hits.push({ t, x: b.minLon, y });

        // right (maxLon)
        t = (b.maxLon - p1.longitude) / dx;
        y = p1.latitude + t * dy;
        if (t >= 0 && t <= 1 && within(y, b.minLat, b.maxLat)) hits.push({ t, x: b.maxLon, y });
    }

    if (Math.abs(dy) > EPS) {
        // bottom (minLat)
        let t = (b.minLat - p1.latitude) / dy;
        let x = p1.longitude + t * dx;
        if (t >= 0 && t <= 1 && within(x, b.minLon, b.maxLon)) hits.push({ t, x, y: b.minLat });

        // top (maxLat)
        t = (b.maxLat - p1.latitude) / dy;
        x = p1.longitude + t * dx;
        if (t >= 0 && t <= 1 && within(x, b.minLon, b.maxLon)) hits.push({ t, x, y: b.maxLat });
    }

    if (!hits.length) return null;
    hits.sort((a, b2) => a.t - b2.t);
    const h = hits[0];
    return { pt: { latitude: h.y, longitude: h.x }, t: h.t };
}

/**
 * Replace outside endpoints with the boundary intersection when exactly one end is inside.
 * Ignore segments where both endpoints are outside. Works on open or closed polylines.
 *
 * @param points  input vertices (lat/lon)
 * @param bounds  clipping rectangle
 * @param closed  treat as closed polygon if true (wraps last->first)
 */
function clampLineToBounds(points, bounds, closed = true) {
    const clamped = [];

    for (const poly of points) {
        const out = [];
        const n = poly.coordinates.length;
        if (n === 0) continue;

        const segCount = closed ? n : n - 1;

        for (let i = 0; i < segCount; i++) {
            const a = poly.coordinates[i];
            const b = poly.coordinates[(i + 1) % n];

            const aIn = isInside(a, bounds);
            const bIn = isInside(b, bounds);

            if (aIn && bIn) {
                // keep a (b will be handled as next a)
                out.push(a);
            } else if (aIn && !bIn) {
                // inside -> outside: keep a, add exit intersection
                out.push(a);
                const hit = firstIntersection(a, b, bounds);
                if (hit && hit.t > EPS && hit.t < 1 + EPS) out.push(hit.pt);
            } else if (!aIn && bIn) {
                // outside -> inside: add entry intersection (do NOT keep a)
                const hit = firstIntersection(a, b, bounds);
                if (hit && hit.t > -EPS && hit.t < 1 - EPS) out.push(hit.pt);
                // b (inside) will be pushed next loop iteration when it is 'a'
            } else {
                // both outside -> ignore segment entirely (as requested)
            }
        }

        // For open polylines, include final inside vertex if needed
        if (!closed) {
            const last = poly.coordinates[n - 1];
            if (isInside(last, bounds)) out.push(last);
        }

        // // De-dup consecutive identical poly
        // const dedup = [];
        // for (const p of out) {
        //     const prev = dedup[dedup.length - 1];
        //     if (!prev || Math.abs(prev.latitude - p.latitude) > EPS || Math.abs(prev.longitude - p.longitude) > EPS) {
        //         dedup.push(p);
        //     }
        // }
        //there might be a missing corner, just check each four corners, if they are in the original polygon, add them using isPointInPolygon
        const corners = [
            { latitude: bounds.minLat, longitude: bounds.minLon },
            { latitude: bounds.minLat, longitude: bounds.maxLon },
            { latitude: bounds.maxLat, longitude: bounds.minLon },
            { latitude: bounds.maxLat, longitude: bounds.maxLon },
        ];
        for (const corner of corners) {
            if (isPointInPolygonLatLon(corner, poly.coordinates)) {
                out.push(corner);
            }
        }

        clamped.push(out);
    }

    return clamped;
}

const viewBounds = (greenCoords, holeBunkers) => {
    if (!greenCoords) return null;

    const greenLatLon = greenCoords.map(p => (
        // check for if it has lat/lon keys or y/x keys
        p.longitude !== undefined && p.longitude !== undefined
            ? { latitude: p.latitude, longitude: p.longitude }
            : { latitude: p.y, longitude: p.x }
    ));

    // 1. Combine all coordinates into one array
    const allPoints = [
        ...greenLatLon,
        ...holeBunkers.map(bunker => bunker.coordinates).flat()
    ];

    if (allPoints.length === 0) return null;

    // 2. Find the min/max latitude and longitude from the combined points
    const lats = allPoints.map(p => p.latitude);
    const lons = allPoints.map(p => p.longitude);
    const minLat = Math.min(...lats)-0.00005;
    const maxLat = Math.max(...lats)+0.00005; // add a tiny bit to avoid zero height
    const minLon = Math.min(...lons)-0.00005;
    const maxLon = Math.max(...lons)+0.00005;

    const latRange = maxLat - minLat;
    const lonRange = maxLon - minLon;

    // 3. To preserve aspect ratio, make the viewport square by using the larger range
    const maxRange = Math.max(latRange, lonRange);
    if (maxRange === 0) return null; // Avoid division by zero

    // 4. Center the content within the new square viewport
    const midLat = (minLat + maxLat) / 2;
    const midLon = (minLon + maxLon) / 2;

    return {
        minLat: midLat - maxRange / 2,
        maxLat: midLat + maxRange / 2,
        minLon: midLon - maxRange / 2,
        maxLon: midLon + maxRange / 2,
        range: maxRange, // Use this single range for scaling both axes
    };
};

export {isInside, firstIntersection, clampLineToBounds, viewBounds};