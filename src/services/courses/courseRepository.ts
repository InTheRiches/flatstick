/**
 * Course Firestore repository.
 *
 * Adapter layer between the loader pipeline and Firestore persistence.
 * Firestore is injected as a parameter rather than imported from a global
 * singleton — this keeps the module testable and removes implicit coupling
 * to the Firebase initialisation order.
 *
 * Responsibilities:
 *   - Read and write `CourseData` and `PuttingGreenData` documents.
 *   - Determine whether a cached record is stale.
 *
 * What this module does NOT do:
 *   - Fetch from the network.
 *   - Transform data shapes (that is the normalizer's job).
 *   - Hold any state.
 */

import type { CourseData, PuttingGreenData } from "@/models/course"
import {
    doc,
    getDoc,
    setDoc,
    type Firestore,
} from "firebase/firestore"

// ---------------------------------------------------------------------------
// Collection paths
// ---------------------------------------------------------------------------

const COURSES_COLLECTION = "courses"
const PUTTING_GREENS_COLLECTION = "puttingGreens"

// ---------------------------------------------------------------------------
// Cache staleness
// ---------------------------------------------------------------------------

/**
 * Returns true when `lastFetchedAt` is older than `maxAgeMs`.
 *
 * @param lastFetchedAt - Unix epoch ms stored in the document.
 * @param maxAgeMs      - Maximum acceptable age in milliseconds.
 */
export function isCacheStale(lastFetchedAt: number, maxAgeMs: number): boolean {
  return Date.now() - lastFetchedAt > maxAgeMs
}

// ---------------------------------------------------------------------------
// Full course cache
// ---------------------------------------------------------------------------

/**
 * Retrieve a cached `CourseData` document by OSM course id.
 * Returns `null` when no document exists.
 *
 * @param db    - Injected Firestore instance.
 * @param osmId - OSM way/relation id of the course.
 */
export async function getCachedCourse(
  db: Firestore,
  osmId: number,
): Promise<CourseData | null> {
  const ref = doc(db, COURSES_COLLECTION, String(osmId))
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  return snap.data() as CourseData
}

/**
 * Persist a `CourseData` document to Firestore.
 * Overwrites any existing document for the same OSM id.
 *
 * @param db   - Injected Firestore instance.
 * @param data - The assembled course dataset to persist.
 */
export async function saveCourse(
  db: Firestore,
  data: CourseData,
): Promise<void> {
  const ref = doc(db, COURSES_COLLECTION, String(data.osmId))
  await setDoc(ref, data)
}

// ---------------------------------------------------------------------------
// Putting-green cache
// ---------------------------------------------------------------------------

/**
 * Retrieve a cached `PuttingGreenData` document by OSM green id.
 * Returns `null` when no document exists.
 *
 * @param db       - Injected Firestore instance.
 * @param osmGreenId - OSM way id of the putting green.
 */
export async function getCachedPuttingGreen(
  db: Firestore,
  osmGreenId: number,
): Promise<PuttingGreenData | null> {
  const ref = doc(db, PUTTING_GREENS_COLLECTION, String(osmGreenId))
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  return snap.data() as PuttingGreenData
}

/**
 * Persist a `PuttingGreenData` document to Firestore.
 * Overwrites any existing document for the same OSM green id.
 *
 * @param db         - Injected Firestore instance.
 * @param osmGreenId - OSM way id of the putting green.
 * @param data       - The assembled putting-green dataset to persist.
 */
export async function savePuttingGreen(
  db: Firestore,
  osmGreenId: number,
  data: PuttingGreenData,
): Promise<void> {
  const ref = doc(db, PUTTING_GREENS_COLLECTION, String(osmGreenId))
  await setDoc(ref, data)
}
