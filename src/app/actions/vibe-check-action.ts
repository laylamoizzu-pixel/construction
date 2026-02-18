"use server";

import { translateVibeToFilters } from "@/lib/llm-service";

export interface VibeResponse {
    success: boolean;
    filters?: {
        searchQuery?: string;
        category?: string;
        colors?: string[];
        priceRange?: { min?: number; max?: number };
        sort?: "price_asc" | "price_desc" | "newest" | "rating";
        reasoning: string;
    };
    error?: string;
}

export async function getVibeFilters(vibe: string): Promise<VibeResponse> {
    try {
        if (!vibe.trim()) {
            return { success: false, error: "Vibe cannot be empty." };
        }

        const filters = await translateVibeToFilters(vibe);

        return {
            success: true,
            filters
        };
    } catch (error) {
        console.error("Vibe Check Error:", error);
        return {
            success: false,
            error: "Failed to understand the vibe. Please try again."
        };
    }
}
