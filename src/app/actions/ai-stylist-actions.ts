"use server";

import { generateStylistAdvice, generateGiftRecommendations } from "@/lib/llm-service";
import { getProducts } from "@/app/actions";

export async function getStylistAdvice(data: {
    gender: string;
    style: string;
    occasion: string;
    budget: string;
    colors: string[];
}) {
    try {
        const products = await getProducts(undefined, true, 100);
        return await generateStylistAdvice(data, products);
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
        const products = await getProducts(undefined, true, 100);
        return await generateGiftRecommendations(data, products);
    } catch (error) {
        console.error("Gift concierge error:", error);
        throw new Error("Failed to get gift recommendations.");
    }
}
