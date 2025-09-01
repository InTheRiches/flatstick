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

import {isPointInPolygon} from "./polygonUtils";

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
                console.log(`Found hole with ref ${el.tags['ref']}`);
                rawHoles.push({ref: el.tags['ref'], nodes: coordinates});
            }

            if (coordinates.length > 2) { // Polygons need at least 3 points
                if (el.tags?.['golf'] === 'green') rawGreens.push(coordinates);
                else if (el.tags?.['golf'] === 'bunker') rawBunkers.push(coordinates);
                else if (el.tags?.['golf'] === 'fairway') rawFairways.push(coordinates);
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
                        if (coordinates.length > 2) rawFairways.push(coordinates);
                    }
                }
            });
        }
    });

    // ... (rest of the green association logic is unchanged)
    const foundGreens = {};
    rawGreens.forEach(greenPolygon => {
        const associatedHole = rawHoles.find(hole => hole.nodes.some(node => isPointInPolygon(node, greenPolygon)));
        if (associatedHole && !foundGreens[associatedHole.ref]) {
            foundGreens[associatedHole.ref] = greenPolygon;
            console.log(`Found green for hole ${associatedHole.ref}`);
        }
    });

    courseData.elements.forEach(el => {
        if (el.type === 'way' && el.tags?.['golf'] === 'green' && el.tags?.['ref'] && el.nodes) {
            const holeNumber = el.tags['ref'];
            if (!foundGreens[holeNumber]) {
                const coordinates = el.nodes.map(nodeId => nodesMap.get(nodeId)).filter((coord) => coord !== undefined);
                if (coordinates.length > 2) foundGreens[holeNumber] = coordinates;
            }
        }
    });

    return {rawHoles, foundGreens, rawBunkers, rawFairways};
}

export {fetchCourseElements, processCourseData, getOSMIdByLatLon}