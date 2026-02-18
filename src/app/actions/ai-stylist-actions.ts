"use server";

import { generateStylistAdvice, generateGiftRecommendations } from "@/lib/llm-service";

export async function getStylistAdvice(data: {
    gender: string;
    style: string;
    occasion: string;
    budget: string;
    colors: string[];
}) {
    try {
        return await generateStylistAdvice(data, []);
    } catch (error) {
        console.error("Stylist error:", error);
        throw new Error("Failed to get stylist advice.");
    }
}

export async function getGiftRecommendations(data: {
    relation: string;
    age: string;
    interests: string[];
    occasion: string;
    budget: string;
}) {
    try {
        return await generateGiftRecommendations(data);
    } catch (error) {
        console.error("Gift concierge error:", error);
        throw new Error("Failed to get gift recommendations.");
    }
}
