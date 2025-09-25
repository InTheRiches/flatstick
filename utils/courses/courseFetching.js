async function getOSMIdByLatLon(lat, lon, margin = 0.01) {
    const south = lat - margin;
    const north = lat + margin;
    const west = lon - margin;
    const east = lon + margin;

    const query = `
  [out:json][timeout:25];
  (
    way["leisure"="golf_course"](${south},${west},${north},${east});
    relation["leisure"="golf_course"](${south},${west},${north},${east});
  );
  out ids tags;
  `;

    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
    const res = await fetch(url);
    const data = await res.json();

    // Return list of candidates with id, type, and name tag
    return data.elements.map(el => ({
        id: el.id,
        type: el.type,
        name: el.tags?.name || null
    }));
}

export function isCoursePointInPolygon(point, polygon) {
    let inside = false;
    const x = point.longitude, y = point.latitude;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i].longitude, yi = polygon[i].latitude;
        const xj = polygon[j].longitude, yj = polygon[j].latitude;
        const intersect =
            (yi > y) !== (yj > y) &&
            x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
        if (intersect) inside = !inside;
    }
    return inside;
}

async function fetchCourseElements(courseRelationId) {
    // *** MODIFIED: Added "bunker" to the query ***
    const query = `
    [out:json][timeout:25];
      (
        way(${courseRelationId});
        relation(${courseRelationId});
      )->.course_geometry;
      .course_geometry map_to_area -> .course_area;
      (
        way["golf"="green"](area.course_area);
        way["golf"="hole"](area.course_area);
        way["golf"="bunker"](area.course_area);
        relation["golf"="fairway"](area.course_area);
        way["golf"="fairway"](area.course_area);
      );
      out body;
      >;
      out skel qt;`;

    try {
        const res = await fetch("https://overpass-api.de/api/interpreter", {
            method: "POST",
            headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
            body: `data=${encodeURIComponent(query)}`,
        });
        if (!res.ok) throw new Error(`Overpass API error: ${res.status} ${res.statusText}`);
        return await res.json();
    } catch (e) {
        throw new Error(`Network request failed: ${e.message}`);
    }
}

// ———————————————————————————————
// 3DEP direct sample query
async function get3DEPElevationData(bboxArr) {
    const {xmin, ymin, xmax, ymax} = bboxArr;
    const baseUrl = 'https://elevation.nationalmap.gov/arcgis/rest/services/3DEPElevation/ImageServer/getSamples';
    const geometry = { xmin, ymin, xmax, ymax, spatialReference: { wkid: 4326 } };
    const params = new URLSearchParams({
        geometry: JSON.stringify(geometry),
        geometryType: 'esriGeometryEnvelope',
        returnFirstValueOnly: false,
        f: 'json'
    });
    const fullUrl = `${baseUrl}?${params.toString()}`;

    try {
        const resp = await fetch(fullUrl);
        if (!resp.ok) throw new Error(`HTTP ${resp.status} - ${resp.statusText}`);
        const data = await resp.json();
        if (data.error) throw new Error(data.error.message || 'Unknown API error');
        return data.samples || [];
    } catch (err) {
        console.error("3DEP error:", err.message);
        return [];
    }
}

function processCourseData(courseData) {
    if (!courseData) return;

    const nodesMap = new Map();
    courseData.elements.forEach(el => {
        if (el.type === 'node' && el.lat && el.lon) {
            nodesMap.set(el.id, {latitude: el.lat, longitude: el.lon});
        }
    });

    // *** MODIFIED: Your new parsing logic is here ***
    const rawGreens = [];
    const rawHoles = [];
    const rawBunkers = [];
    const rawFairways = [];

    courseData.elements.forEach(el => {
        if (el.type === 'way' && el.nodes) {
            const coordinates = el.nodes
                .map(nodeId => nodesMap.get(nodeId))
                .filter((coord) => coord !== undefined);

            if (el.tags?.['golf'] === 'hole' && el.tags?.['ref']) {
                rawHoles.push({ref: el.tags['ref'], nodes: coordinates});
            }

            if (coordinates.length > 2) { // Polygons need at least 3 points
                if (el.tags?.['golf'] === 'green') rawGreens.push(coordinates);
                else if (el.tags?.['golf'] === 'bunker') rawBunkers.push({id: el.id, coordinates});
                else if (el.tags?.['golf'] === 'fairway') rawFairways.push({id: el.id, coordinates}); // Fairways can be polygons too
            }
        }
        if (el.type === 'relation' && el.tags?.['golf'] === 'fairway' && el.members) {
            // Fairways can be multipolygons; handle their members
            el.members.forEach(member => {
                if (member.type === 'way' && member.ref) {
                    const way = courseData.elements.find(e => e.type === 'way' && e.id === member.ref);
                    if (way && way.nodes) {
                        if (way.tags?.["golf"] === "green") return; // Skip cause they are handled elsewhere
                        if (way.tags?.["golf"] === "bunker") return; // Skip cause they are handled elsewhere
                        // Extract coordinates for the fairway way
                        const coordinates = way.nodes
                            .map(nodeId => nodesMap.get(nodeId))
                            .filter((coord) => coord !== undefined);
                        if (coordinates.length > 2) rawFairways.push({id: way.id, coordinates}); // Only add if it's a polygon
                    }
                }
            });
        }
    });

    // ... (rest of the green association logic is unchanged)
    const identifiedGreens = [];
    rawGreens.forEach(greenPolygon => {
        const associatedHole = rawHoles.find(hole => hole.nodes.some(node => isCoursePointInPolygon(node, greenPolygon)));

        if (associatedHole && !identifiedGreens.find(g => g.hole === associatedHole.ref)) {
            identifiedGreens.push({
                hole: associatedHole.ref,
                bbox: {
                    ymin: Math.min(...greenPolygon.map(pt => pt.latitude)),
                    ymax: Math.max(...greenPolygon.map(pt => pt.latitude)),
                    xmin: Math.min(...greenPolygon.map(pt => pt.longitude)),
                    xmax: Math.max(...greenPolygon.map(pt => pt.longitude)),
                },
                geojson: {type: "Polygon", coordinates: greenPolygon.map(pt => ({x: pt.longitude, y: pt.latitude}))}
            });
        }
    });

    return {identifiedGreens, rawBunkers, rawFairways};
}

export {fetchCourseElements, get3DEPElevationData, processCourseData, getOSMIdByLatLon}