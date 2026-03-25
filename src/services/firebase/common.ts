import type { FirebaseFirestoreTypes } from "@react-native-firebase/firestore"
import firestore from "@react-native-firebase/firestore"

export const db = firestore()
export const serverTimestamp = firestore.FieldValue.serverTimestamp

/**
 * Deep-remove undefined so nested objects don't crash writes.
 * Firestore rejects undefined anywhere in the payload.
 */
export function removeUndefinedDeep<T>(value: T): T {
    if (Array.isArray(value)) {
        // keep arrays, but clean each element
        return value.map(removeUndefinedDeep) as unknown as T
    }

    if (value && typeof value === "object") {
        const obj = value as Record<string, unknown>
        const out: Record<string, unknown> = {}

        for (const [k, v] of Object.entries(obj)) {
            if (v === undefined) continue
            out[k] = removeUndefinedDeep(v)
        }

        return out as T
    }

    return value
}

export async function safeSet(
    ref: FirebaseFirestoreTypes.DocumentReference,
    data: Record<string, any>,
    options?: FirebaseFirestoreTypes.SetOptions,
) {
    return ref.set(removeUndefinedDeep(data), options)
}

export async function safeUpdate(
    ref: FirebaseFirestoreTypes.DocumentReference,
    data: Record<string, any>,
) {
    return ref.update(removeUndefinedDeep(data))
}