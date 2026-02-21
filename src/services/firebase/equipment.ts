import {PutterDoc} from "@/models/equipment";
import {db} from "@/services/firebase/common";
import {collection, doc, setDoc} from "@react-native-firebase/firestore";

function putterRef(uid: string, putterId: string) {
    return doc(db, "users", uid, "putters", putterId);
}

function putterCol(uid: string) {
    return doc(collection(db, "users", uid, "putters"))
}

export async function addPutterRecord(uid: string, putter: Partial<PutterDoc>) {
    const now = new Date().toISOString()
    const docRef = putterCol(uid)
    const newDoc = {
        id: docRef.id,
        brand: putter.brand,
        model: putter.model,
        loftDeg: putter.loftDeg || null,
        lieDeg: putter.lieDeg || null,
        createdAt: now,
        updatedAt: now,
        archived: false,
        summary: {
            totalPutts: 0,
            totalRounds: 0,
            makePct_6ft: 0,
            avgMissFt: 0,
            updatedAt: now
        }
    }

    await setDoc(docRef, newDoc)
    return newDoc as PutterDoc
}

export async function updatePutterRecord(uid: string, putter: Partial<PutterDoc>) {
    if (!putter.id) throw new Error("Missing putter ID for update")
    const now = new Date().toISOString()
    await setDoc(
        putterRef(uid, putter.id),
        {
            ...putter,
            updatedAt: now,
        },
        { merge: true }
    )
}