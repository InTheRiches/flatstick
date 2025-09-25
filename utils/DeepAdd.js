export default function deepAdd(obj1, obj2) {
    // Both numbers → add
    if (typeof obj1 === "number" && typeof obj2 === "number") {
        return obj1 + obj2;
    }

    // Both arrays → add element-wise
    if (Array.isArray(obj1) && Array.isArray(obj2)) {
        const len = Math.max(obj1.length, obj2.length);
        const result = [];
        for (let i = 0; i < len; i++) {
            const v1 = obj1[i] ?? 0;
            const v2 = obj2[i] ?? 0;
            result[i] = (typeof v1 === "number" && typeof v2 === "number") ? v1 + v2 : v1 || v2;
        }
        return result;
    }

    // Both objects → recurse
    if (obj1 && obj2 && typeof obj1 === "object" && typeof obj2 === "object") {
        const result = Array.isArray(obj1) ? [] : {};
        const keys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);
        for (const key of keys) {
            result[key] = deepAdd(obj1[key], obj2[key]);
        }
        return result;
    }

    // Fallback → return whichever exists
    return obj1 !== undefined ? obj1 : obj2;
}