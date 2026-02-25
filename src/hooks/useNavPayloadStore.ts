// app/stores/navPayloadStore.ts
import { create } from "zustand"

type Payloads = Record<string, unknown>

type NavPayloadState = {
    payloads: Payloads
    setPayload: (key: string, value: unknown) => void
    takePayload: <T>(key: string) => T | null
}

export const useNavPayloadStore = create<NavPayloadState>((set, get) => ({
    payloads: {},
    setPayload: (key, value) => set((s) => ({ payloads: { ...s.payloads, [key]: value } })),
    takePayload: (key) => {
        const val = get().payloads[key]
        if (val == null) return null
        set((s) => {
            const next = { ...s.payloads }
            delete next[key]
            return { payloads: next }
        })
        return val as any
    },
}))