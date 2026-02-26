export function normalizeUserQueryForGolfAPI(input: string): string {
    if (!input) return input

    let result = input.trim()

    // Normalize whitespace
    result = result.replace(/\s+/g, " ")

    // 1️⃣ Full long-form replacements → API abbreviations
    const replacements: Array<[RegExp, string]> = [
        // MOST specific first

        // Golf and Country Club
        [/\bGolf\s*(and|&)\s*Country\s*Club\b/gi, "G&Cc"],

        // Golf and Country
        [/\bGolf\s*(and|&)\s*Country\b/gi, "G&Cc"],

        // Golf and
        [/\bGolf\s*(and|&)\b/gi, "G&"],

        // Golf Club (only when Club follows)
        [/\bGolf\s+Club\b/gi, "Gc"],

        // Golf Course (only when Course follows)
        [/\bGolf\s+Course\b/gi, "Gc"],

        // Country Club
        [/\bCountry\s+Club\b/gi, "Cc"],

        // Standalone Golf
        [/\bGolf\b/gi, "G"],
        [/\bGol\b/gi, "G"],
        [/\bGo\b/gi, "G"],

        // Weird dotted formats
        [/\bG\.\s*&\s*C\.\s*C\.\b/gi, "G&Cc"],
        [/\bG\.\s*C\.\b/gi, "Gc"],
    ]

    for (const [pattern, replacement] of replacements) {
        result = result.replace(pattern, replacement)
    }

    // 2️⃣ If the user ends with just "Golf", assume Golf Club
    // Example: "California Golf" → "California Gc"
    result = result.replace(/\bGolf$/i, "Gc")

    return result
}

export function normalizeOSMGolfName(name: string): string {
    if (!name) return name

    let s = name.trim().replace(/\s+/g, " ")

    // 1) Remove trailing location suffixes: "of X", "in X", "at X"
    //    Example: "California Golf Club of San Francisco" → "California Golf Club"
    //    This is intentionally greedy to the end.
    s = s.replace(/\s+\b(of|in|at)\b\s+.+$/i, "")

    // 2) Remove trailing long forms entirely (for clean display)
    //    Example: "Pine Valley Golf Club" → "Pine Valley"
    const trailingRemove: RegExp[] = [
        /\s+Golf\s*(and|&)\s*Country\s*Club$/i,
        /\s+Golf\s*Club$/i,
        /\s+Country\s*Club$/i,
    ]

    for (const re of trailingRemove) {
        if (re.test(s)) {
            s = s.replace(re, "").trim()
            return s
        }
    }

    // 3) If not trailing, abbreviate in the middle
    //    Example: "Royal Golf Club Estates" → "Royal Gc Estates"
    const middleAbbrev: Array<[RegExp, string]> = [
        [/\bGolf\s*(and|&)\s*Country\s*Club\b/gi, "G&Cc"],
        [/\bGolf\s*Club\b/gi, "Gc"],
        [/\bCountry\s*Club\b/gi, "Cc"],
    ]

    for (const [re, rep] of middleAbbrev) {
        s = s.replace(re, rep)
    }

    return s.replace(/\s+/g, " ").trim()
}