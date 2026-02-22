// golfCourseSearch.ts
// Clean + optimized for a "Choose Course" screen:
// - debounced search friendly (AbortController)
// - groups by club_name
// - computes distance once per club (closest course location)
// - normalizes + filters tee sets (optional)
// - sorts results by distance when location is available

const GOLF_API_KEY = "P3YWERWFDOPBUUV66UDLRJDTLY" // TODO: move to env / server
const GOLF_API_URL = "https://api.golfcourseapi.com/v1/search"

export type LatLng = { latitude: number; longitude: number }

export type TeeSet = {
    name: string
    par: number
    rating: number
    slope: number
    yards: number
    number_of_holes: number
    holes: any[]
}

export type ParsedTees = { male: TeeSet[]; female: TeeSet[] }

export type CourseApiLocation = {
    address?: string
    city?: string
    state?: string
    country?: string
    latitude?: number
    longitude?: number
    [k: string]: any
}

export type CourseApiHole = {
    par?: number
    yardage?: number
    handicap?: number
    [k: string]: any
}

export type CourseApiTee = {
    tee_name?: string
    course_rating?: number
    slope_rating?: number
    bogey_rating?: number
    total_yards?: number
    total_meters?: number
    number_of_holes?: number
    par_total?: number
    front_course_rating?: number
    front_slope_rating?: number
    front_bogey_rating?: number
    back_course_rating?: number
    back_slope_rating?: number
    back_bogey_rating?: number
    holes?: CourseApiHole[]
    [k: string]: any
}

export type CourseApiTees = {
    female?: CourseApiTee[]
    male?: CourseApiTee[]
    [k: string]: any
}

export type CourseApiCourse = {
    id: string | number
    club_name: string
    course_name?: string
    location?: CourseApiLocation
    tees?: CourseApiTees
    // ...other fields from API
    [k: string]: any
}

export type GolfApiSearchResponse = {
    courses?: CourseApiCourse[]
}

export type ClubCourse = {
    id: string
    courseName?: string
    location?: { latitude: number; longitude: number }
    tees: ParsedTees
    raw: Omit<CourseApiCourse, "club_name" | "tees">
}

export type ClubResult = {
    clubName: string
    distanceKm?: number // undefined when no location
    distanceMi?: number
    id: string // representative id (first / closest)
    courses: ClubCourse[]
}

function safeNumber(n: any): number | undefined {
    const v = typeof n === "string" ? Number(n) : n
    return Number.isFinite(v) ? v : undefined
}

function toRad(deg: number) {
    return (deg * Math.PI) / 180
}

function haversineMeters(a: LatLng, b: LatLng) {
    const R = 6371e3
    const dLat = toRad(b.latitude - a.latitude)
    const dLon = toRad(b.longitude - a.longitude)

    const lat1 = toRad(a.latitude)
    const lat2 = toRad(b.latitude)

    const sinDLat = Math.sin(dLat / 2)
    const sinDLon = Math.sin(dLon / 2)

    const h =
        sinDLat * sinDLat +
        Math.cos(lat1) * Math.cos(lat2) * (sinDLon * sinDLon)

    return 2 * R * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
}

function metersToKm(m: number) {
    return m / 1000
}
function metersToMi(m: number) {
    return m / 1609.344
}

export function parseTees(teesData: CourseApiTees | undefined): ParsedTees {
    const parsed: ParsedTees = { male: [], female: [] }
    if (!teesData || typeof teesData !== "object") return parsed

    for (const gender of ["male", "female"] as const) {
        const genderTees = Array.isArray(teesData[gender]) ? teesData[gender] : []
        for (const tee of genderTees) {
            parsed[gender].push({
                name: String(tee?.tee_name ?? ""),
                par: safeNumber(tee?.par_total) ?? 0,
                rating: safeNumber(tee?.course_rating) ?? 0,
                slope: safeNumber(tee?.slope_rating) ?? 0,
                yards: safeNumber(tee?.total_yards) ?? 0,
                number_of_holes: safeNumber(tee?.number_of_holes) ?? 0,
                holes: Array.isArray(tee?.holes) ? tee.holes : [],
            })
        }
    }

    // Optional: sort tee sets by yards descending (often nicest UX)
    parsed.male.sort((a, b) => (b.yards ?? 0) - (a.yards ?? 0))
    parsed.female.sort((a, b) => (b.yards ?? 0) - (a.yards ?? 0))

    return parsed
}

/**
 * Search courses from golfcourseapi and group by club (club_name).
 * Pass an AbortSignal so you can cancel in-flight requests when user keeps typing.
 */
export async function searchGolfClubs(params: {
    query: string
    userLocation?: LatLng | null
    signal?: AbortSignal
    limit?: number // optional client-side cap after grouping
}): Promise<ClubResult[]> {
    const { query, userLocation, signal, limit } = params

    const q = query.trim()
    if (q.length < 2) return [] // better UX for search screens

    const res = await fetch(`${GOLF_API_URL}?search_query=${encodeURIComponent(q)}`, {
        headers: { Authorization: `Key ${GOLF_API_KEY}` },
        signal,
    })

    if (!res.ok) {
        // surface useful debugging
        const body = await res.text().catch(() => "")
        throw new Error(`Golf API ${res.status}: ${body || res.statusText}`)
    }

    const json: GolfApiSearchResponse = await res.json()
    const list: CourseApiCourse[] = Array.isArray(json?.courses) ? json.courses : []
    if (!list.length) return []

    const clubs = new Map<string, ClubResult>()

    for (const course of list) {
        const clubName = String(course?.club_name ?? "").trim().replace(/\s*\(\d+\)$/, "").replace("G&Cc", "Golf and Country Club").replace("G. & C. C.", "Golf and Country Club").replace("Gc", "Golf Club").replace("G.C.", "Golf Club").replace("Cc", "Country Club");
        if (!clubName) continue

        const { club_name, tees, ...raw } = course

        // distance per *course* (only if we have location + course location)
        const lat = safeNumber(course?.location?.latitude)
        const lng = safeNumber(course?.location?.longitude)
        const loc = lat != null && lng != null ? { latitude: lat, longitude: lng } : undefined

        const meters =
            userLocation && loc ? haversineMeters(userLocation, loc) : undefined

        const km = meters != null ? metersToKm(meters) : undefined
        const mi = meters != null ? metersToMi(meters) : undefined

        const existing = clubs.get(clubName)

        if (!existing) {
            clubs.set(clubName, {
                clubName,
                distanceKm: km != null ? Math.round(km) : undefined,
                distanceMi: mi != null ? Math.round(mi * 10) / 10 : undefined, // 0.1 mi precision feels nice
                id: String(course.id),
                courses: [
                    {
                        id: String(course.id),
                        courseName: course.course_name ? String(course.course_name) : undefined,
                        location: loc,
                        tees: parseTees(tees),
                        raw,
                    },
                ],
            })
        } else {
            existing.courses.push({
                id: String(course.id),
                courseName: course.course_name ? String(course.course_name) : undefined,
                location: loc,
                tees: parseTees(tees),
                raw,
            })

            // Keep the "representative" distance/id as the closest course within the club
            if (km != null) {
                const currentKm = existing.distanceKm
                if (currentKm == null || km < currentKm) {
                    existing.distanceKm = Math.round(km)
                    existing.distanceMi = Math.round(mi! * 10) / 10
                    existing.id = String(course.id)
                }
            }
        }
    }

    let results = Array.from(clubs.values())

    // Prefer nearer clubs first (if we have location); otherwise alphabetic
    if (userLocation) {
        results.sort((a, b) => (a.distanceMi ?? Infinity) - (b.distanceMi ?? Infinity))
    } else {
        results.sort((a, b) => a.clubName.localeCompare(b.clubName))
    }

    if (typeof limit === "number" && limit > 0) {
        results = results.slice(0, limit)
    }

    return results
}

// ---------------------------------------------------------------------------
// Overpass API types
// ---------------------------------------------------------------------------

type OverpassElement = {
    type: "node" | "way" | "relation"
    id: number
    lat?: number   // present on nodes
    lon?: number   // present on nodes
    center?: { lat: number; lon: number } // present on ways/relations with "out center"
    tags?: Record<string, string>
}

type OverpassResponse = {
    elements: OverpassElement[]
}

/** A lightweight result from Overpass – no Golf API data yet. */
export type OverpassResult = {
    /** Unique OSM element id (stringified for stable key use) */
    osmId: string
    name: string
    coordinate: LatLng
    distanceMi?: number
    distanceKm?: number
}

/** Extract the best display name from an Overpass element's tags. */
function overpassName(el: OverpassElement): string | undefined {
    const t = el.tags ?? {}
    return t["name"] || t["official_name"] || t["short_name"] || undefined
}

/** Get the representative lat/lon for an Overpass element. */
function overpassCenter(el: OverpassElement): LatLng | undefined {
    if (el.lat != null && el.lon != null) return { latitude: el.lat, longitude: el.lon }
    if (el.center) return { latitude: el.center.lat, longitude: el.center.lon }
    return undefined
}

/** Shared Overpass fetch + dedup logic. Returns raw OverpassResult[]. */
async function fetchOverpassGolfCourses(params: {
    south: number
    west: number
    north: number
    east: number
    userLocation: LatLng
    signal?: AbortSignal
    limit?: number
}): Promise<OverpassResult[]> {
    const { south, west, north, east, userLocation, signal, limit = 60 } = params

    const overpassQuery = [
        `[out:json][timeout:25];`,
        `(`,
        `  nwr["leisure"="golf_course"](${south},${west},${north},${east});`,
        `);`,
        `out center ${limit};`,
    ].join("\n")

    const overpassRes = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "User-Agent": "Flatstick/1.0 (contact: support@flatstick.app)",
        },
        body: "data=" + encodeURIComponent(overpassQuery),
        signal,
    })

    if (!overpassRes.ok) {
        const text = await overpassRes.text().catch(() => "")
        console.warn("Overpass failed:", overpassRes.status, text.slice(0, 300))
        return []
    }

    const overpassJson: OverpassResponse = await overpassRes.json()
    const elements: OverpassElement[] = Array.isArray(overpassJson?.elements)
        ? overpassJson.elements
        : []

    if (!elements.length) return []

    // Deduplicate by name, keeping the element closest to the reference point
    const nameToEl = new Map<string, { el: OverpassElement; center: LatLng; dist: number }>()

    for (const el of elements) {
        const name = overpassName(el)?.trim()
        if (!name) continue
        const center = overpassCenter(el)
        if (!center) continue

        const dist = haversineMeters(userLocation, center)
        const existing = nameToEl.get(name)
        if (!existing || dist < existing.dist) {
            nameToEl.set(name, { el, center, dist })
        }
    }

    return Array.from(nameToEl.entries()).map(([name, { el, center, dist }]) => {
        const km = metersToKm(dist)
        const mi = metersToMi(dist)
        return {
            osmId: String(el.id),
            name,
            coordinate: center,
            distanceKm: Math.round(km),
            distanceMi: Math.round(mi * 10) / 10,
        }
    }).sort((a, b) => (a.distanceMi ?? Infinity) - (b.distanceMi ?? Infinity))
}

/**
 * Fast nearby-search using ONLY Overpass (no Golf API calls).
 * Returns lightweight OverpassResult[] suitable for map markers.
 * Call `searchGolfClubs` with the course name to enrich on demand.
 *
 * `params.south/west/north/east` – map bounding box coordinates.
 * `params.userLocation` – optional reference point (defaults to bbox centre).
 * `params.signal` – AbortSignal for cancellation.
 * `params.limit` – max Overpass elements to fetch (default 60).
 */
export async function searchNearbyGolfCourses(params: {
    south: number
    west: number
    north: number
    east: number
    userLocation?: LatLng | null
    signal?: AbortSignal
    limit?: number
}): Promise<OverpassResult[]> {
    const { south, west, north, east, signal, limit = 60 } = params

    const userLocation: LatLng = params.userLocation ?? {
        latitude: (south + north) / 2,
        longitude: (west + east) / 2,
    }

    return fetchOverpassGolfCourses({ south, west, north, east, userLocation, signal, limit })
}

/**
 * Full pipeline: Overpass → Golf Course API enrichment → ClubResult[].
 * Use this when you need tee/rating data up front (e.g. text search fallback).
 *
 * `params.south/west/north/east` – map bounding box coordinates.
 * `params.userLocation` – optional reference point (defaults to bbox centre).
 * `params.signal` – AbortSignal for cancellation.
 * `params.limit` – max Overpass elements to fetch (default 60).
 */
export async function searchNearbyGolfClubs(params: {
    south: number
    west: number
    north: number
    east: number
    userLocation?: LatLng | null
    signal?: AbortSignal
    limit?: number
}): Promise<ClubResult[]> {
    const { south, west, north, east, signal, limit = 60 } = params

    const userLocation: LatLng = params.userLocation ?? {
        latitude: (south + north) / 2,
        longitude: (west + east) / 2,
    }

    const overpassResults = await fetchOverpassGolfCourses({
        south, west, north, east, userLocation, signal, limit,
    })

    if (!overpassResults.length) return []

    // Fan-out: one Golf API call per unique Overpass name
    const searchPromises = overpassResults.map(({ name }) =>
        searchGolfClubs({
            query: name,
            userLocation,
            signal,
            limit: 10,
        }).catch((err: any) => {
            if (err?.name === "AbortError") throw err
            console.warn(`Golf API search failed for "${name}":`, err)
            return [] as ClubResult[]
        })
    )

    const allResultArrays = await Promise.all(searchPromises)

    // Merge + deduplicate by clubName
    const merged = new Map<string, ClubResult>()

    for (const results of allResultArrays) {
        for (const club of results) {
            const key = club.clubName.toLowerCase()
            if (!merged.has(key)) {
                merged.set(key, club)
            } else {
                const existing = merged.get(key)!
                const existingIds = new Set(existing.courses.map((c) => c.id))
                for (const course of club.courses) {
                    if (!existingIds.has(course.id)) {
                        existing.courses.push(course)
                        existingIds.add(course.id)
                    }
                }
                if (
                    club.distanceKm != null &&
                    (existing.distanceKm == null || club.distanceKm < existing.distanceKm)
                ) {
                    existing.distanceKm = club.distanceKm
                    existing.distanceMi = club.distanceMi
                    existing.id = club.id
                }
            }
        }
    }

    return Array.from(merged.values()).sort(
        (a, b) => (a.distanceMi ?? Infinity) - (b.distanceMi ?? Infinity)
    )
}

/**
 * Small helper for a course search screen:
 * Call this each time query changes; it cancels the previous request.
 */
export function makeCancelableCourseSearch() {
    let controller: AbortController | null = null

    return async (query: string, userLocation?: LatLng | null) => {
        controller?.abort()
        controller = new AbortController()

        try {
            return await searchGolfClubs({
                query,
                userLocation,
                signal: controller.signal,
                limit: 30,
            })
        } catch (e: any) {
            // Ignore abort errors (user typed again)
            if (e?.name === "AbortError") return []
            throw e
        }
    }
}