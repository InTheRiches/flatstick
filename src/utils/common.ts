// make a function to generate a random UUID string
import {UUID} from "@/models/common";

export function generateUUID(): UUID {
    // Generate a random UUID (version 4)
    // This is a simple implementation and may not be suitable for production use
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

export const normalizeDecimalInput = (text: string) => {
    // Remove everything except digits and dot
    let cleaned = text.replace(/[^0-9.]/g, "")

    // Keep only first dot
    const firstDotIndex = cleaned.indexOf(".")
    if (firstDotIndex !== -1) {
        cleaned =
            cleaned.slice(0, firstDotIndex + 1) +
            cleaned
                .slice(firstDotIndex + 1)
                .replace(/\./g, "")
    }

    return cleaned
}

export const clampAngle = (value: number) => {
    if (value > 90) return 90
    if (value < 0) return 0
    return value
}