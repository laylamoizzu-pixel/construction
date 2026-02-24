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
import { analyzeIntent, rankAndSummarize, handleMissingProduct } from "./llm-service";
import { getSearchCache, hashQuery } from "./search-cache";
import { getAIConfig } from "./ai-config";
import {
    RecommendationRequest,
    RecommendationResponse,
    IntentAnalysis,
    ProductMatch,
    LLMIntentResponse,
} from "@/types/assistant-types";

const DEFAULT_MAX_RESULTS = 5; // Fallback, overridden by admin config
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
        const config = await getAIConfig();
        const maxResults = request.maxResults || config.maxRecommendations || DEFAULT_MAX_RESULTS;

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
        const intentResponse = await analyzeIntent(query, categories, request.messages);
        console.log("[DEBUG] intentResponse:", JSON.stringify(intentResponse, null, 2));
        const intent = mapIntentResponse(intentResponse);

        // Handle general chat (greetings, etc.)
        if (intentResponse.isGeneralChat) {
            const { chatWithAssistant } = await import("./llm-service");
            const chatResponse = await chatWithAssistant(query, request.messages || []);

            return {
                success: true,
                intent,
                recommendations: [],
                summary: chatResponse.reply,
                processingTime: Date.now() - startTime,
            };
        }

        // Handle explicit product request (using new structure)
        if (intentResponse.productRequestData) {
            const { createProductRequest } = await import("@/app/actions/request-actions");

            // Check if we have enough info to submit immediately
            const decision = await handleMissingProduct(query, intentResponse, request.messages);

            if (decision.action === "request" && decision.requestData) {
                console.log("[RecommendationEngine] Auto-submitting explicit product request:", decision.requestData);
                await createProductRequest({
                    productName: decision.requestData.name,
                    brand: "",
                    description: `Category: ${decision.requestData.category || "N/A"}. Specs: ${decision.requestData.specifications?.join(", ") || "None"}`,
                    minPrice: 0,
                    maxPrice: decision.requestData.maxBudget || 0,
                    imageUrl: "",
                    contactInfo: "Auto-generated from recommendation engine"
                });

                return {
                    success: true,
                    intent,
                    recommendations: [],
                    summary: decision.response, // "I've sent your request..."
                    processingTime: Date.now() - startTime,
                };
            } else {
                // Determine we need more info
                return {
                    success: true,
                    intent,
                    recommendations: [],
                    summary: decision.response, // "What is your budget?"
                    processingTime: Date.now() - startTime,
                };
            }
        }

        // Step 3: Query relevant products (cached in getProducts)
        // CHECK: If the previous message was from the assistant asking for details about a missing product,
        // we should NOT fallback to general search if the current query is just a budget/detail.
        const lastAssistantMessage = request.messages?.filter(m => m.role === "assistant").slice(-1)[0];
        const isInMissingProductFlow = lastAssistantMessage?.content.includes("don't have") ||
            lastAssistantMessage?.content.includes("request");

        const products = await queryProducts(intent, {
            ...request.context,
            // If we are in a missing product flow and have no clear category, 
            // we should NOT do a general search. We pass a special flag or handle it in queryProducts.
            preventFallback: isInMissingProductFlow && !intent.category
        });

        if (products.length === 0) {
            // Check if this looks like a missing product scenario that we should handle
            const decision = await handleMissingProduct(query, intentResponse, request.messages);

            if (decision.action === "request" && decision.requestData) {
                console.log("[RecommendationEngine] Auto-submitting product request:", decision.requestData);
                const { createProductRequest } = await import("@/app/actions/request-actions");
                await createProductRequest({
                    productName: decision.requestData.name,
                    brand: "",
                    description: `Category: ${decision.requestData.category || "N/A"}. Specs: ${decision.requestData.specifications?.join(", ") || "None"}`,
                    minPrice: 0,
                    maxPrice: decision.requestData.maxBudget || 0,
                    imageUrl: "",
                    contactInfo: "Auto-generated from recommendation engine"
                });

                return {
                    success: true,
                    intent,
                    recommendations: [],
                    summary: decision.response,
                    processingTime: Date.now() - startTime,
                };
            }

            // Otherwise, just return the question/response from handleMissingProduct (or fallback to old one)
            return {
                success: true,
                intent,
                recommendations: [],
                summary: decision.response,
                processingTime: Date.now() - startTime,
            };
        }

        // Step 4: Rank products AND generate summary in single LLM call (2nd LLM call)
        let rankings: Array<{ productId: string; matchScore: number; highlights: string[]; whyRecommended: string }> = [];
        let summary = "";

        try {
            const result = await rankAndSummarize(
                query,
                products.slice(0, MAX_PRODUCTS_TO_ANALYZE),
                intentResponse
            );
            rankings = result.rankings;
            summary = result.summary;
        } catch (rankError) {
            console.warn("[RecommendationEngine] rankAndSummarize failed, using fallback:", rankError);
            // Graceful fallback: return top products without AI ranking
            rankings = products.slice(0, maxResults).map(p => ({
                productId: p.id,
                matchScore: 70,
                highlights: [p.description?.substring(0, 60) || p.name],
                whyRecommended: `This ${p.name} might be what you're looking for.`,
            }));
            summary = `I found ${products.length} products that might interest you. Here are my top picks:`;
        }

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
        isGeneralChat: response.isGeneralChat || false,
    };
}

async function queryProducts(
    intent: IntentAnalysis,
    context: RecommendationRequest["context"]
): Promise<Product[]> {
    // 1. Determine category to filter by
    let categoryId = context?.categoryId || intent.category || undefined;

    // If we have a subcategory, use that instead (it's more specific)
    if (intent.subcategory) {
        categoryId = intent.subcategory;
    }

    // 2. Strict Category Filtering
    // If a category IS specified, we MUST filter by it.
    // If that category has no products, we return ZERO products.
    // We do NOT fallback to "all products" as that causes hallucinations.

    let products: Product[] = [];

    if (categoryId) {
        // Option A: Use the searchProducts which has robust filtering
        // We pass empty query string to just get category items, or use the user's query if available?
        // Let's use getProducts with category filter directly for precision
        products = await getProducts(categoryId, true); // true = only available

        // If specific subcategory was requested but not found in the main getProducts call (which filters by catId),
        // we might need to filter in memory if getProducts doesn't support subcategory arg comfortably.
        // verified: getProducts supports subcategoryId as 5th arg. 
        // Let's rely on memory filtering for subcategory to be safe as getProducts signature is a bit complex.

        if (intent.subcategory) {
            products = products.filter(p => p.subcategoryId === intent.subcategory);
        }

    } else if (context?.preventFallback) {
        // We were told NOT to fallback if no category is found
        // This is usually because we are in a missing product request flow
        products = [];
    } else {
        // Option B: No category specified (General Search)
        // We should search by text using the user's requirements/keywords
        // We do NOT dump all products unless it's a "show me everything" query (which is rare).
        // Let's use the explicit requirements as search terms if possible, or just available products.

        // If we have no strong intent, we might want to default to "Featured" or "New Arrivals" rather than everything.
        // But for now, let's just get available products and let the text search (if any) refine it.
        products = (await getProducts()).filter(p => p.available);
    }

    // 3. Filter by budget if specified
    const budgetMax = context?.budget || intent.budget.max;
    const budgetMin = intent.budget.min;

    if (budgetMax !== null && budgetMax !== undefined) {
        products = products.filter(p => p.price <= budgetMax);
    }
    if (budgetMin !== null && budgetMin !== undefined) {
        products = products.filter(p => p.price >= budgetMin);
    }

    // 4. Exclude specific products if requested
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
