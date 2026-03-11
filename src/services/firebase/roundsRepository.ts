/**
 * roundsRepository.ts
 *
 * Firestore data-access layer for saved rounds.
 *
 * This is the ONLY file allowed to import from @react-native-firebase/firestore
 * within the rounds feature. All Firestore concerns are isolated here so that
 * the provider and hooks remain testable without a real database connection.
 *
 * Collection path: users/{userId}/rounds/{roundId}
 */

import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  type Unsubscribe,
} from "@react-native-firebase/firestore"

import type { RoundSession } from "@/models/round.session.types"

// ─── Path helpers ──────────────────────────────────────────────────────────────

function db() {
  return getFirestore()
}

function roundsCollection(userId: string) {
  return collection(db(), "users", userId, "rounds")
}

function roundDoc(userId: string, roundId: string) {
  return doc(db(), "users", userId, "rounds", roundId)
}

// ─── Subscription ──────────────────────────────────────────────────────────────

/**
 * Opens a real-time Firestore listener on the user's rounds collection.
 * Rounds are delivered sorted by `createdAt` descending.
 *
 * Firestore's offline cache means this will emit from cache immediately,
 * then re-emit when server data arrives — no extra offline handling needed.
 *
 * @returns An unsubscribe function. Call it when the owning component unmounts.
 */
export function subscribeToRounds(
  userId: string,
  callback: (rounds: RoundSession[]) => void,
): Unsubscribe {
  const q = query(roundsCollection(userId), orderBy("createdAt", "desc"))

  return onSnapshot(q, (snapshot) => {
    const rounds = (snapshot.docs as Array<{ data(): RoundSession }>).map((d) => d.data())
    callback(rounds)
  })
}

// ─── Writes ────────────────────────────────────────────────────────────────────

/**
 * Persists a RoundSession to Firestore.
 * Uses setDoc (upsert) so that re-saving an edited round is safe.
 * Firestore queues the write for sync when offline.
 */
export async function saveRound(userId: string, round: RoundSession): Promise<void> {
  await setDoc(roundDoc(userId, round.id), round)
}

/**
 * Permanently deletes a round document.
 * Queued for sync when offline.
 */
export async function deleteRound(userId: string, roundId: string): Promise<void> {
  await deleteDoc(roundDoc(userId, roundId))
}

// ─── Reads ─────────────────────────────────────────────────────────────────────

/**
 * Fetches a single round document once (not a listener).
 * Respects Firestore's cache — returns cached data when offline.
 *
 * @returns The RoundSession, or null if the document does not exist.
 */
export async function getRound(userId: string, roundId: string): Promise<RoundSession | null> {
  const snap = await getDoc(roundDoc(userId, roundId))
  if (!snap.exists()) return null
  return snap.data() as RoundSession
}
