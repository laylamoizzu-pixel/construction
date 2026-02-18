"use server";

import { generateProductComparison } from "@/lib/llm-service";
import { getProduct, getProducts } from "@/lib/data";
import { Product } from "@/app/actions";

export async function getComparison(product1Id: string, product2Id: string) {
    try {
        const [p1, p2] = await Promise.all([
            getProduct(product1Id),
            getProduct(product2Id)
        ]);

        if (!p1 || !p2) {
            throw new Error("One or both products not found");
        }

        // Extract simplified data for LLM
        const formatForLLM = (p: Product) => ({
            name: p.name,
            price: p.price,
            description: p.description,
            features: p.tags || [] // map tags to features as fallback
        });

        return await generateProductComparison(formatForLLM(p1), formatForLLM(p2));
    } catch (error) {
        console.error("Comparison error:", error);
        throw new Error("Failed to generate comparison.");
    }
}

export async function getSimilarProducts(categoryId: string, currentProductId: string) {
    try {
        const products = await getProducts(categoryId, true, 10);
        // exclude current product
        return products.filter(p => p.id !== currentProductId);
    } catch (error) {
        console.error("Error fetching similar products:", error);
        return [];
    }
}
