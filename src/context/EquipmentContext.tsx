// src/context/EquipmentContext.tsx
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import {
    collection,
    doc,
    getFirestore,
    onSnapshot,
    setDoc,
    Unsubscribe,
} from "@react-native-firebase/firestore"

import type { GripDoc, PutterDoc } from "@/models/equipment"
import type {ISODateString, UUID} from "@/models/common"
import { useUser } from "@/context/UserContext"
import {addPutterRecord, updatePutterRecord} from "@/services/firebase/equipment";

export interface EquipmentContextType {
    putters: PutterDoc[]
    grips: GripDoc[]
    selectedPutter: PutterDoc | null
    selectedGrip: GripDoc | null
    loading: boolean
    error: string | null
    setSelectedPutterId: (putterId: string | null) => Promise<void>
    setSelectedGripId: (gripId: string | null) => Promise<void>
    createPutter: (input: Partial<PutterDoc>) => Promise<UUID>
    updatePutter: (updates: Partial<PutterDoc>) => Promise<void>
    archivePutter: (id: string) => Promise<void>
    createGrip: (input: CreateGripInput) => Promise<string>
    updateGrip: (id: string, updates: Partial<GripDoc>) => Promise<void>
    archiveGrip: (id: string) => Promise<void>
}

export type CreatePutterInput = {
    brand: string
    model: string
    loftDeg?: number
    lieDeg?: number
    lastUsedAt?: ISODateString | null
    summary?: PutterDoc["summary"]
}

export type CreateGripInput = {
    name: string
    nameLower: string
    lastUsedAt?: ISODateString | null
    summary?: GripDoc["summary"]
}

const EquipmentContext = createContext<EquipmentContextType | undefined>(undefined)

interface EquipmentProviderProps {
    children: React.ReactNode,
    authInitializing?: boolean,
}

const nowIso = (): ISODateString => new Date().toISOString()

export function EquipmentProvider({ children, authInitializing = false }: EquipmentProviderProps) {
    const { authUser, userProfile, syncUserProfile } = useUser()
    const [putters, setPutters] = useState<PutterDoc[]>([])
    const [grips, setGrips] = useState<GripDoc[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

    const db = getFirestore()
    const puttersUnsubscribeRef = useRef<Unsubscribe | null>(null)
    const gripsUnsubscribeRef = useRef<Unsubscribe | null>(null)
    const initialLoadRef = useRef({ putters: false, grips: false })

    const requireAuthUid = useCallback((): string => {
        const uid = authUser?.uid
        if (!uid) {
            const message = "No authenticated user"
            setError(message)
            throw new Error(message)
        }
        return uid
    }, [authUser?.uid])

    const clearState = useCallback(() => {
        setPutters([])
        setGrips([])
        setLoading(false)
        setError(null)
        if (puttersUnsubscribeRef.current) {
            puttersUnsubscribeRef.current()
            puttersUnsubscribeRef.current = null
        }
        if (gripsUnsubscribeRef.current) {
            gripsUnsubscribeRef.current()
            gripsUnsubscribeRef.current = null
        }
        initialLoadRef.current = { putters: false, grips: false }
    }, [])

    useEffect(() => {
        // Wait for auth to finish initializing before touching Firestore
        if (authInitializing) {
            return
        }

        // We only depend on authUser here — authInitializing short-circuits above
        if (!authUser?.uid) {
            clearState()
            return
        }

        setLoading(true)
        setError(null)
        initialLoadRef.current = { putters: true, grips: true }

        const puttersRef = collection(db, "users", authUser.uid, "putters")
        const gripsRef = collection(db, "users", authUser.uid, "grips")

        if (puttersUnsubscribeRef.current) puttersUnsubscribeRef.current()
        if (gripsUnsubscribeRef.current) gripsUnsubscribeRef.current()

        puttersUnsubscribeRef.current = onSnapshot(
            puttersRef,
            (snapshot) => {
                const items = snapshot.docs.map((docSnap: any) => docSnap.data() as PutterDoc)
                setPutters(items)
                if (initialLoadRef.current.putters) {
                    initialLoadRef.current.putters = false
                    if (!initialLoadRef.current.grips) setLoading(false)
                }
            },
            (err) => {
                console.error("Error loading putters:", err)
                setError(err?.message ?? "Failed to load putters")
                initialLoadRef.current.putters = false
                if (!initialLoadRef.current.grips) setLoading(false)
            }
        )

        gripsUnsubscribeRef.current = onSnapshot(
            gripsRef,
            (snapshot) => {
                const items = snapshot.docs.map((docSnap: any) => docSnap.data() as GripDoc)
                setGrips(items)
                if (initialLoadRef.current.grips) {
                    initialLoadRef.current.grips = false
                    if (!initialLoadRef.current.putters) setLoading(false)
                }
            },
            (err) => {
                console.error("Error loading grips:", err)
                setError(err?.message ?? "Failed to load grips")
                initialLoadRef.current.grips = false
                if (!initialLoadRef.current.putters) setLoading(false)
            }
        )

        return () => {
            if (puttersUnsubscribeRef.current) {
                puttersUnsubscribeRef.current()
                puttersUnsubscribeRef.current = null
            }
            if (gripsUnsubscribeRef.current) {
                gripsUnsubscribeRef.current()
                gripsUnsubscribeRef.current = null
            }
        }
    }, [authInitializing, authUser?.uid, clearState, db])

    const selectedPutter = useMemo(() => {
        const selectedId = userProfile?.preferences?.selectedPutterId ?? null
        return selectedId ? putters.find((putter) => putter.id === selectedId) ?? null : null
    }, [putters, userProfile?.preferences?.selectedPutterId])

    const selectedGrip = useMemo(() => {
        const selectedId = userProfile?.preferences?.selectedGripId ?? null
        return selectedId ? grips.find((grip) => grip.id === selectedId) ?? null : null
    }, [grips, userProfile?.preferences?.selectedGripId])

    const setSelectedPutterId = useCallback(
        async (putterId: string | null) => {
            if (!userProfile) {
                const message = "No user profile available"
                setError(message)
                return
            }
            await syncUserProfile({
                preferences: {
                    ...userProfile.preferences,
                    selectedPutterId: putterId,
                },
            })
        },
        [syncUserProfile, userProfile]
    )

    const setSelectedGripId = useCallback(
        async (gripId: string | null) => {
            if (!userProfile) {
                const message = "No user profile available"
                setError(message)
                return
            }
            await syncUserProfile({
                preferences: {
                    ...userProfile.preferences,
                    selectedGripId: gripId,
                },
            })
        },
        [syncUserProfile, userProfile]
    )

    const createPutter = useCallback(
        async (input: Partial<PutterDoc>) => {
            const uid = requireAuthUid()
            try {
                const newPutter = await addPutterRecord(uid, input)
                return newPutter.id
            } catch (error: any) {
                console.error("Error creating putter:", error)
                setError(error?.message ?? "Failed to create putter")
                throw error
            }
        },
        [requireAuthUid]
    )

    const updatePutter = useCallback(
        async (updates: Partial<PutterDoc>) => {
            const uid = requireAuthUid()
            try {
                await updatePutterRecord(uid, updates)
                return;
            } catch (error: any) {
                console.error("Error updating putter:", error)
                setError(error?.message ?? "Failed to update putter")
                throw error
            }
        },
        [requireAuthUid]
    )

    const archivePutter = useCallback(
        async (id: string) => {
            await updatePutter({ id, archived: true })
        },
        [updatePutter]
    )

    const createGrip = useCallback(
        async (input: CreateGripInput) => {
            const uid = requireAuthUid()
            const now = nowIso()
            const docRef = doc(collection(db, "users", uid, "grips"))
            const data: GripDoc = {
                id: docRef.id,
                name: input.name,
                nameLower: input.nameLower,
                createdAt: now,
                updatedAt: now,
                archived: false,
                lastUsedAt: input.lastUsedAt ?? undefined,
                summary: input.summary,
            }

            await setDoc(docRef, data)
            return docRef.id
        },
        [db, requireAuthUid]
    )

    const updateGrip = useCallback(
        async (id: string, updates: Partial<GripDoc>) => {
            const uid = requireAuthUid()
            const docRef = doc(db, "users", uid, "grips", id)
            await setDoc(
                docRef,
                {
                    ...updates,
                    updatedAt: nowIso(),
                },
                { merge: true }
            )
        },
        [db, requireAuthUid]
    )

    const archiveGrip = useCallback(
        async (id: string) => {
            await updateGrip(id, { archived: true })
        },
        [updateGrip]
    )

    const value: EquipmentContextType = {
        putters,
        grips,
        selectedPutter,
        selectedGrip,
        loading,
        error,
        setSelectedPutterId,
        setSelectedGripId,
        createPutter,
        updatePutter,
        archivePutter,
        createGrip,
        updateGrip,
        archiveGrip,
    }

    return <EquipmentContext.Provider value={value}>{children}</EquipmentContext.Provider>
}

export function useEquipment(): EquipmentContextType {
    const context = useContext(EquipmentContext)
    if (!context) {
        throw new Error("useEquipment must be used within an EquipmentProvider")
    }
    return context
}
