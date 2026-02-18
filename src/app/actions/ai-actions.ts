"use server";

import { generateSocialProof } from "@/lib/llm-service";

export async function fetchSocialProof(product: { name: string; categoryId: string; tags: string[] }) {
    try {
        // Mock stats for now
        const mockStats = {
            salesInLastMonth: Math.floor(Math.random() * 50) + 10,
            popularInCity: ["Mumbai", "Delhi", "Bangalore", "Pune"][Math.floor(Math.random() * 4)]
        };
        return await generateSocialProof(product, mockStats);
    } catch (error) {
        console.error("Error fetching social proof:", error);
        return null; // Fail silently in UI
    }
}
