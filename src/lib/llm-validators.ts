/**
 * LLM Output Validators
 * 
 * Validation functions that sit between raw LLM output and consumers.
 * Prevents hallucinated product IDs, category IDs, and other data from
 * reaching the user.
 */

/**
 * Validates that product IDs in rankings actually exist in the provided product set.
 * Filters out any hallucinated/invalid product IDs and logs warnings.
 * 
 * @param rankings - Array of ranking objects from LLM
 * @param validProductIds - Set of real product IDs
 * @returns Filtered rankings with only valid product IDs
 */
export function validateProductIds<T extends { productId: string }>(
    rankings: T[],
    validProductIds: Set<string>
): T[] {
    const validated: T[] = [];
    const hallucinated: string[] = [];

    for (const rank of rankings) {
        if (validProductIds.has(rank.productId)) {
            validated.push(rank);
        } else {
            hallucinated.push(rank.productId);
        }
    }

    if (hallucinated.length > 0) {
        console.warn(
            `[LLMValidator] Filtered out ${hallucinated.length} hallucinated product ID(s):`,
            hallucinated
        );
    }

    return validated;
}

/**
 * Validates that a category ID exists in the valid category set.
 * Returns null if the category ID is invalid/hallucinated.
 * 
 * @param categoryId - Category ID returned by LLM
 * @param validCategoryIds - Set of real category IDs
 * @returns The category ID if valid, null otherwise
 */
export function validateCategoryId(
    categoryId: string | null | undefined,
    validCategoryIds: Set<string>
): string | null {
    if (!categoryId) return null;

    if (validCategoryIds.has(categoryId)) {
        return categoryId;
    }

    console.warn(
        `[LLMValidator] Filtered out hallucinated category ID: "${categoryId}"`
    );
    return null;
}

/**
 * Validates that a match score is within the expected range (0-100).
 * Clamps out-of-range values.
 */
export function validateMatchScore(score: number): number {
    if (typeof score !== "number" || isNaN(score)) return 50; // default to medium
    return Math.max(0, Math.min(100, score));
}

/**
 * Validates and sanitizes a full rankings array.
 * Combines productId validation, score clamping, and ensures required fields exist.
 */
export function validateRankings(
    rankings: Array<{ productId: string; matchScore: number; highlights: string[]; whyRecommended: string }>,
    validProductIds: Set<string>
): Array<{ productId: string; matchScore: number; highlights: string[]; whyRecommended: string }> {
    return validateProductIds(rankings, validProductIds).map(rank => ({
        ...rank,
        matchScore: validateMatchScore(rank.matchScore),
        highlights: Array.isArray(rank.highlights) ? rank.highlights : [],
        whyRecommended: typeof rank.whyRecommended === "string" ? rank.whyRecommended : "",
    }));
}
