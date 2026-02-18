"use server";

import { generateSocialProof, generateDealInsight } from "@/lib/llm-service";

/**
 * Generate a social proof snippet for a product.
 * Returns a short string like "Trending in Mumbai!"
 */
export async function getSocialProof(
    product: { name: string; categoryId: string; tags: string[] },
    salesStats?: { salesInLastMonth: number; popularInCity?: string }
): Promise<{ success: boolean; proof?: string; error?: string }> {
    try {
        const result = await generateSocialProof(product, salesStats);
        return { success: true, proof: result };
    } catch (error) {
        console.error("Social Proof Error:", error);
        return { success: false, error: "Failed to generate social proof." };
    }
}

/**
 * Generate a deal insight snippet for a product.
 * Returns a short string like "🔥 Huge 40% drop!"
 */
export async function getDealInsight(
    product: { name: string; price: number; originalPrice?: number; description: string }
): Promise<{ success: boolean; insight?: string; error?: string }> {
    try {
        const result = await generateDealInsight(product);
        return { success: true, insight: result };
    } catch (error) {
        console.error("Deal Insight Error:", error);
        return { success: false, error: "Failed to generate deal insight." };
    }
}
