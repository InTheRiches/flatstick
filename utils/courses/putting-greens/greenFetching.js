export async function getOSMPuttingGreenByLatLon(lat, lon, latMargin = 0.00014, longMargin = 0.00019) {
    const south = lat - latMargin;
    const north = lat + latMargin;
    const west = lon - longMargin;
    const east = lon + longMargin;

    // // hardcode a 1 second delay to avoid rate limiting
    // await new Promise(resolve => setTimeout(resolve, 1000));
    //
    // return {id: 909634548, greenCoords: [{"lat": 42.2050181, "lon": -85.6327692}, {"lat": 42.2050086, "lon": -85.6327946}, {
    //         "lat": 42.2049954,
    //         "lon": -85.6328321
    //     }, {"lat": 42.2049752, "lon": -85.6328679}, {"lat": 42.2049516, "lon": -85.6328942}, {
    //         "lat": 42.2049224,
    //         "lon": -85.6329147
    //     }, {"lat": 42.2048923, "lon": -85.6329325}, {"lat": 42.2048605, "lon": -85.6329451}, {
    //         "lat": 42.2048287,
    //         "lon": -85.632947
    //     }, {"lat": 42.204811, "lon": -85.6329274}, {"lat": 42.2047944, "lon": -85.6328919}, {
    //         "lat": 42.2047983,
    //         "lon": -85.6328515
    //     }, {"lat": 42.2048163, "lon": -85.6327907}, {"lat": 42.20483, "lon": -85.6327494}, {
    //         "lat": 42.2048521,
    //         "lon": -85.6326974
    //     }, {"lat": 42.2048737, "lon": -85.6326562}, {"lat": 42.2048972, "lon": -85.6326154}, {
    //         "lat": 42.2049255,
    //         "lon": -85.6325818
    //     }, {"lat": 42.2049578, "lon": -85.632555}, {"lat": 42.2049919, "lon": -85.6325411}, {
    //         "lat": 42.2050321,
    //         "lon": -85.6325552
    //     }, {"lat": 42.2050513, "lon": -85.6325927}, {"lat": 42.2050553, "lon": -85.6326282}, {
    //         "lat": 42.2050503,
    //         "lon": -85.6326783
    //     }, {"lat": 42.2050335, "lon": -85.6327321}, {"lat": 42.2050181, "lon": -85.6327692}]
    //         .map(node => {
    //             return {latitude: node.lat, longitude: node.lon};
    //         })};
//
    const query = `
    [out:json][timeout:25];
    (
      way["golf"="green"](${south},${west},${north},${east});
    );
    out geom;
    `;

    const res = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
        body: `data=${encodeURIComponent(query)}`,
    });
    const data = await res.json();

    const green = data.elements[0];
    if (!green) return null;

    if (!(green.type === 'way' && green.geometry)) {
        return null;
    }

    return {id: green.id, greenCoords: green.geometry.map(node => {
        return {latitude: node.lat, longitude: node.lon};
    })};
}

export async function getOSMPuttingGreenIdByLatLon(lat, lon, latMargin = 0.00014, longMargin = 0.00019) {
    const south = lat - latMargin;
    const north = lat + latMargin;
    const west = lon - longMargin;
    const east = lon + longMargin;

    const query = `
[out:json][timeout:25];
(
    way["golf"="green"](${south},${west},${north},${east});
);
out ids tags;
`;

    const res = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
        body: `data=${encodeURIComponent(query)}`,
    });
    const data = await res.json();
    if (data.elements.length === 0) return null;

    // Return the first matching green's id
    return data.elements[0].id;
}

export async function getOSMPuttingGreenById(osmId) {
    const query = `
[out:json][timeout:25];
(
    way(${osmId});
);
out geom;
`;

    const res = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
        body: `data=${encodeURIComponent(query)}`,
    });
    const data = await res.json();
    const green = data.elements[0];
    if (!green) return null;

    if (!(green.type === 'way' && green.geometry)) {
        return null;
    }

    return green.geometry.map(node => {
        return {latitude: node.lat, longitude: node.lon};
    });
}