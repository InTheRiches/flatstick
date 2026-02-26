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
import {doc, FirebaseFirestoreTypes, getDoc} from "@react-native-firebase/firestore"
import {getFunctions, httpsCallable} from "@react-native-firebase/functions"

// Cloud Functions callable endpoints
const SAVE_COURSE_FN = "saveCourseData"
const SAVE_PUTTING_GREEN_FN = "savePuttingGreenData"

// Helper to call a Firebase callable function
async function callFunction(name: string, data: any): Promise<any> {
  // Use the react-native-firebase library
  const fn = httpsCallable(getFunctions(), name)
  return fn(data)
}

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
  db: FirebaseFirestoreTypes.Module,
  osmId: number,
): Promise<CourseData | null> {
  const ref = doc(db, COURSES_COLLECTION, String(osmId))
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  return snap.data() as CourseData
}

/**
 * Save a CourseData document via Cloud Function.
 * Only privileged backend services should be able to call this.
 *
 * @param _db
 * @param data - The assembled course dataset to persist.
 */
export async function saveCourse(
  _db: FirebaseFirestoreTypes.Module, // kept for API compatibility, not used
  data: CourseData,
): Promise<void> {
  await callFunction(SAVE_COURSE_FN, { courseData: data })
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
  db: FirebaseFirestoreTypes.Module,
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
/**
 * Save a PuttingGreenData document via Cloud Function.
 * Only privileged backend services should be able to call this.
 *
 * @param osmGreenId - OSM way id of the putting green.
 * @param data       - The assembled putting-green dataset to persist.
 */
export async function savePuttingGreen(
  _db: FirebaseFirestoreTypes.Module, // kept for API compatibility, not used
  osmGreenId: number,
  data: PuttingGreenData,
): Promise<void> {
  await callFunction(SAVE_PUTTING_GREEN_FN, { osmGreenId, greenData: data })
}
