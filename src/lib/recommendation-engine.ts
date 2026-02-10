/**
 * Recommendation Engine
 * 
 * Orchestrates the product recommendation flow:
 * 1. Analyze user intent
 * 2. Query relevant products
 * 3. Rank and filter products
 * 4. Generate recommendations with explanations
 */

import { getProducts, getCategories, Product } from "@/app/actions";
import { analyzeIntent, rankAndSummarize } from "./llm-service";
import { getSearchCache, hashQuery } from "./search-cache";
import {
    RecommendationRequest,
    RecommendationResponse,
    IntentAnalysis,
    ProductMatch,
    LLMIntentResponse,
} from "@/types/assistant-types";

const DEFAULT_MAX_RESULTS = 5;
const MAX_PRODUCTS_TO_ANALYZE = 20;

/**
 * Main recommendation function
 */
export async function getRecommendations(
    request: RecommendationRequest
): Promise<RecommendationResponse> {
    const startTime = Date.now();

    try {
        // Validate request
        if (!request.query || request.query.trim().length === 0) {
            return {
                success: false,
                error: "Query is required",
                recommendations: [],
                summary: "",
                processingTime: Date.now() - startTime,
            };
        }

        const query = request.query.trim();
        const maxResults = request.maxResults || DEFAULT_MAX_RESULTS;

        // Check cache for similar queries
        const cache = getSearchCache();
        const queryHash = hashQuery(query);
        const cacheKey = `recommendation:${queryHash}`;

        const cachedResult = cache.get<RecommendationResponse>(cacheKey);
        if (cachedResult) {
            return {
                ...cachedResult,
                processingTime: Date.now() - startTime,
            };
        }

        // Step 1: Get categories for intent analysis (cached in getCategories)
        const categories = await getCategories();

        // Step 2: Analyze user intent (1st LLM call)
        const intentResponse = await analyzeIntent(query, categories);
        const intent = mapIntentResponse(intentResponse);

        // Handle product request
        // @ts-ignore - requestProduct is added in extended interface in llm-service
        if (intentResponse.requestProduct) {
            const { createProductRequest } = await import("@/app/actions/product-requests");
            // @ts-ignore
            await createProductRequest(intentResponse.requestProduct.name, intentResponse.requestProduct.description);

            return {
                success: true,
                intent,
                recommendations: [],
                summary: `I've noted your request for "${// @ts-ignore
                    intentResponse.requestProduct.name}". I've sent this to our team, and we'll look into adding it to our inventory!`,
                processingTime: Date.now() - startTime,
            };
        }

        // Step 3: Query relevant products (cached in getProducts)
        const products = await queryProducts(intent, request.context);

        if (products.length === 0) {
            return {
                success: true,
                intent,
                recommendations: [],
                summary: "I couldn't find any products matching your criteria. Try broadening your search or exploring our categories.",
                processingTime: Date.now() - startTime,
            };
        }

        // Step 4: Rank products AND generate summary in single LLM call (2nd LLM call)
        const { rankings, summary } = await rankAndSummarize(
            query,
            products.slice(0, MAX_PRODUCTS_TO_ANALYZE),
            intentResponse
        );

        // Step 5: Build recommendations
        const recommendations = buildRecommendations(rankings, products, maxResults);

        const result: RecommendationResponse = {
            success: true,
            intent,
            recommendations,
            summary,
            processingTime: Date.now() - startTime,
        };

        // Cache the result for 2 minutes
        cache.set(cacheKey, result, 2 * 60 * 1000);

        return result;
    } catch (error) {
        console.error("[RecommendationEngine] Error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
            recommendations: [],
            summary: "",
            processingTime: Date.now() - startTime,
        };
    }
}

/**
 * Map LLM intent response to our IntentAnalysis type
 */
function mapIntentResponse(response: LLMIntentResponse): IntentAnalysis {
    return {
        category: response.category,
        subcategory: response.subcategory,
        requirements: response.requirements || [],
        budget: {
            min: response.budgetMin,
            max: response.budgetMax,
        },
        preferences: response.preferences || [],
        useCase: response.useCase || "",
        confidence: response.confidence || 0.5,
    };
}

/**
 * Query products based on intent and context
 */
async function queryProducts(
    intent: IntentAnalysis,
    context: RecommendationRequest["context"]
): Promise<Product[]> {
    // Determine category to filter by
    let categoryId = context?.categoryId || intent.category || undefined;

    // If we have a subcategory, use that instead
    if (intent.subcategory) {
        categoryId = intent.subcategory;
    }

    // Get all products (cached), filter available in-memory
    let products = (await getProducts()).filter(p => p.available);

    // Filter by category if specified
    if (categoryId) {
        const categoryFiltered = products.filter(p => p.categoryId === categoryId || p.subcategoryId === categoryId);
        if (categoryFiltered.length > 0) {
            products = categoryFiltered;
        }
        // If no products in specific category, keep all available products
    }

    // Filter by budget if specified
    const budgetMax = context?.budget || intent.budget.max;
    const budgetMin = intent.budget.min;

    if (budgetMax !== null && budgetMax !== undefined) {
        products = products.filter(p => p.price <= budgetMax);
    }
    if (budgetMin !== null && budgetMin !== undefined) {
        products = products.filter(p => p.price >= budgetMin);
    }

    // Exclude specific products if requested
    if (context?.excludeProductIds && context.excludeProductIds.length > 0) {
        const excludeSet = new Set(context.excludeProductIds);
        products = products.filter(p => !excludeSet.has(p.id));
    }

    return products;
}

/**
 * Build ProductMatch array from rankings
 */
function buildRecommendations(
    rankings: Array<{ productId: string; matchScore: number; highlights: string[]; whyRecommended: string }>,
    products: Product[],
    maxResults: number
): ProductMatch[] {
    const productMap = new Map(products.map(p => [p.id, p]));

    return rankings
        .filter(r => productMap.has(r.productId))
        .slice(0, maxResults)
        .map(r => ({
            product: productMap.get(r.productId)!,
            matchScore: r.matchScore,
            highlights: r.highlights,
            whyRecommended: r.whyRecommended,
        }));
}

/**
 * Get category name by ID
 */
export async function getCategoryName(categoryId: string): Promise<string | null> {
    const categories = await getCategories();
    const category = categories.find(c => c.id === categoryId);
    return category?.name || null;
}
