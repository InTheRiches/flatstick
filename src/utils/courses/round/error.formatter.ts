import { CourseLoadError } from "@/services/courses/courseLoader";

export function formatCourseLoadError(error: CourseLoadError | undefined): { title: string; message: string; details?: string } {
    if (!error) {
        return { title: "Unknown error", message: "An unknown error occurred while loading the course." };
    }

    switch (error.type) {
        case "no_osm_result":
            return {
                title: "Course not found",
                message: "No OpenStreetMap course could be located near your position.",
                details: "No OSM candidates were returned for the given coordinates.",
            };
        case "osm_ambiguous":
            return {
                title: "Multiple courses found",
                message: `Multiple possible courses were found (${error.candidates.length}). The first candidate was used but it may be incorrect.`,
                details: `Candidates: ${JSON.stringify(error.candidates, null, 2)}`,
            };
        case "osm_fetch_failed":
            return {
                title: "OSM fetch failed",
                message: "Failed to fetch course geometry from OpenStreetMap.",
                details: `Cause: ${String((error as any).cause)}`,
            };
        case "no_greens_identified":
            return {
                title: "Course parsing failed",
                message: `No greens were identified in the OSM data (unmatched: ${error.unmatchedCount}).`,
                details: `Unmatched greens: ${error.unmatchedCount}`,
            };
        case "network_error":
            return {
                title: "Network error",
                message: "A network error occurred while loading course data.",
                details: `Cause: ${String((error as any).cause)}`,
            };
        default:
            return { title: "Load error", message: `Error type: ${(error as any).type}`, details: JSON.stringify(error) };
    }
}