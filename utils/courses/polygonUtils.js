/**
 * Calculates the approximate center (centroid) of a polygon.
 * @param polygon - An array of LatLon coordinates.
 * @returns A single LatLon object representing the center.
 */
const getPolygonCentroid = (polygon) => {
    if (!polygon || polygon.length === 0) return {y: 0, x: 0};
    const center = polygon.reduce(
        (acc, curr) => {
            acc.y += curr.y || curr.latitude;
            acc.x += curr.x || curr.longitude;
            return acc;
        },
        {y: 0, x: 0}
    );
    center.y /= polygon.length;
    center.x /= polygon.length;
    return {latitude: center.y, longitude: center.x};
};

function isPointInPolygon(point, polygon) {
    let inside = false;
    const x = point.longitude, y = point.latitude;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i].longitude, yi = polygon[i].latitude;
        const xj = polygon[j].longitude, yj = polygon[j].latitude;
        const intersect = ((yi > y) !== (yj > y)) &&
            (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}

export {getPolygonCentroid, isPointInPolygon};