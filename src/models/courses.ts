import {LatLng} from "@/models/common";

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

// ---------------------------------------------------------------------------
// Overpass API types
// ---------------------------------------------------------------------------

export type OverpassElement = {
    type: "node" | "way" | "relation"
    id: number
    lat?: number   // present on nodes
    lon?: number   // present on nodes
    center?: { lat: number; lon: number } // present on ways/relations with "out center"
    tags?: Record<string, string>
}

export type OverpassResponse = {
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