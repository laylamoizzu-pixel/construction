/**
 * LLM Service
 * 
 * Wrapper for LLM providers (Google, OpenAI, Anthropic) with automatic key rotation and error handling.
 */

import { getAPIKeyManager } from "./api-key-manager";
import {
    LLMIntentResponse,
    LLMServiceError,
    APIKeyExhaustedError,
    LLMProvider
} from "@/types/assistant-types";
import { Product, Category } from "@/app/actions";

// Extended intent response to include product requests
interface GenericIntentResponse extends LLMIntentResponse {
    requestProduct?: {
        name: string;
        description: string;
    } | null;
}

const MAX_RETRIES = 3;

const GROQ_API_BASE = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile"; // Meta model for better multi-language support (Hindi, Urdu, Hinglish)
const GROQ_MODEL_LIGHT = "llama-3.1-8b-instant";
const GROQ_MODEL_VISION = "llama-3.2-90b-vision-preview";

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const GEMINI_MODEL = "gemini-2.0-flash";

interface GroqResponse {
    choices?: Array<{
        message?: {
            content?: string;
        };
    }>;
    error?: {
        code: string | number;
        message: string;
    };
}

interface GeminiResponse {
    candidates?: Array<{
        content?: {
            parts?: Array<{
                text?: string;
            }>;
        };
    }>;
    choices?: Array<{
        message?: {
            content?: string;
        };
    }>;
    error?: {
        code: number;
        message: string;
    };
}

/**
 * Make a request to Groq API
 */
async function callGroqAPI(prompt: string, retryCount: number = 0): Promise<string> {
    const keyManager = getAPIKeyManager();
    let apiKey: string;

    try {
        apiKey = keyManager.getActiveKey("groq");
    } catch (error) {
        throw error;
    }

    try {
        const response = await fetch(GROQ_API_BASE, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: GROQ_MODEL,
                messages: [
                    { role: "user", content: prompt }
                ],
                temperature: 1, // Increased as requested in prompt snippet
                max_tokens: 2048,
                top_p: 1,
            }),
        });

        if (response.status === 429) {
            keyManager.markKeyRateLimited(apiKey);
            if (retryCount < MAX_RETRIES) {
                console.log(`[LLMService] Groq Rate limited, retrying (attempt ${retryCount + 1})`);
                return callGroqAPI(prompt, retryCount + 1);
            }
            throw new LLMServiceError("Rate limit exceeded on Groq keys", 429);
        }

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[LLMService] Groq Error Body: ${errorText}`);

            keyManager.markKeyFailed(apiKey);
            if (retryCount < MAX_RETRIES) {
                console.log(`[LLMService] Groq Request failed (${response.status}), retrying`);
                return callGroqAPI(prompt, retryCount + 1);
            }
            throw new LLMServiceError(`Groq API request failed: ${response.statusText} - ${errorText}`, response.status);
        }

        const data: GroqResponse = await response.json();

        if (data.error) {
            keyManager.markKeyFailed(apiKey);
            throw new LLMServiceError(data.error.message, typeof data.error.code === 'number' ? data.error.code : 500);
        }

        const text = data.choices?.[0]?.message?.content;
        if (!text) {
            throw new LLMServiceError("No response text from Groq");
        }

        keyManager.markKeySuccess(apiKey);
        return text;
    } catch (error) {
        if (error instanceof LLMServiceError || error instanceof APIKeyExhaustedError) throw error;

        keyManager.markKeyFailed(apiKey);
        if (retryCount < MAX_RETRIES) return callGroqAPI(prompt, retryCount + 1);

        throw new LLMServiceError(`Unexpected Groq error: ${error instanceof Error ? error.message : "Unknown"}`);
    }
}

/**
 * Make a request to Gemini API
 */
async function callGeminiAPI(prompt: string, retryCount: number = 0): Promise<string> {
    const keyManager = getAPIKeyManager();
    let apiKey: string;

    try {
        apiKey = keyManager.getActiveKey("google");
    } catch (error) {
        throw error;
    }

    const url = `${GEMINI_API_BASE}/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
            }),
        });

        if (response.status === 429) {
            keyManager.markKeyRateLimited(apiKey);
            if (retryCount < MAX_RETRIES) return callGeminiAPI(prompt, retryCount + 1);
            throw new LLMServiceError("Rate limit exceeded on Gemini keys", 429);
        }

        if (!response.ok) {
            keyManager.markKeyFailed(apiKey);
            if (retryCount < MAX_RETRIES) return callGeminiAPI(prompt, retryCount + 1);
            throw new LLMServiceError(`Gemini API request failed: ${response.statusText}`, response.status);
        }

        const data: GeminiResponse = await response.json();

        if (data.error) {
            keyManager.markKeyFailed(apiKey);
            throw new LLMServiceError(data.error.message, data.error.code);
        }

        // Handle both Gemini native and Groq/OpenAI style responses
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text ||
            data.choices?.[0]?.message?.content;

        if (!text) throw new LLMServiceError("No response text from LLM");

        keyManager.markKeySuccess(apiKey);
        return text;
    } catch (error) {
        if (error instanceof LLMServiceError || error instanceof APIKeyExhaustedError) throw error;
        keyManager.markKeyFailed(apiKey);
        if (retryCount < MAX_RETRIES) return callGeminiAPI(prompt, retryCount + 1);
        throw new LLMServiceError(`Unexpected Gemini error: ${error instanceof Error ? error.message : "Unknown"}`);
    }
}

/**
 * Main LLM call function that routes to available providers
 * Prioritizes Groq > Gemini
 */
async function callLLM(prompt: string, _preferredProvider: LLMProvider = "google"): Promise<string> {
    // Prevent eslint unused vars warning for _preferredProvider
    void _preferredProvider;
    const keyManager = getAPIKeyManager();

    // If preferred is specified and we have keys, try that first?
    // Actually the logic in the bad file prioritized Groq hardcoded if keys exist.
    // I will keep that logic as it seems intentional for cost/speed.

    // Try Groq first if available
    if (keyManager.hasKeys("groq")) {
        try {
            return await callGroqAPI(prompt);
        } catch (error) {
            console.warn("[LLMService] Groq failed, falling back to Gemini:", error);
            // Fallthrough to Gemini
        }
    }

    // Fallback to Gemini
    return await callGeminiAPI(prompt);
}

/**
 * Parse JSON from LLM response, handling markdown code blocks and text around JSON
 */
function parseJSONFromResponse<T>(response: string): T {
    // Remove markdown code blocks if present
    let cleaned = response.trim();
    if (cleaned.startsWith("```json")) {
        cleaned = cleaned.slice(7);
    } else if (cleaned.startsWith("```")) {
        cleaned = cleaned.slice(3);
    }
    if (cleaned.endsWith("```")) {
        cleaned = cleaned.slice(0, -3);
    }
    cleaned = cleaned.trim();

    // Attempt 1: Direct parse
    try {
        return JSON.parse(cleaned);
    } catch {
        // Attempt 2: Try to find a JSON object { ... } or array [ ... ] in the response
        const jsonObjectMatch = cleaned.match(/\{[\s\S]*\}/);
        if (jsonObjectMatch) {
            try {
                return JSON.parse(jsonObjectMatch[0]);
            } catch { /* fall through */ }
        }

        const jsonArrayMatch = cleaned.match(/\[[\s\S]*\]/);
        if (jsonArrayMatch) {
            try {
                return JSON.parse(jsonArrayMatch[0]);
            } catch { /* fall through */ }
        }

        throw new LLMServiceError(`Failed to parse LLM response as JSON: ${response.substring(0, 200)}...`);
    }
}

/**
 * Call LLM expecting JSON output. Retries once with a stricter prompt on parse failure.
 */
async function callLLMForJSON<T>(prompt: string, provider: LLMProvider = "google"): Promise<T> {
    // First attempt
    try {
        const response = await callLLM(prompt, provider);
        return parseJSONFromResponse<T>(response);
    } catch (firstError) {
        if (!(firstError instanceof LLMServiceError) || !String(firstError.message).includes("Failed to parse")) {
            throw firstError;
        }

        console.warn("[LLMService] JSON parse failed on first attempt, retrying with stricter prompt");

        // Retry with a much stricter prompt
        const stricterPrompt = `${prompt}\n\nIMPORTANT: You MUST respond with ONLY a valid JSON object. No explanation text before or after. No markdown. Just the raw JSON.`;
        const retryResponse = await callLLM(stricterPrompt, provider);
        return parseJSONFromResponse<T>(retryResponse);
    }
}

/**
 * Analyze user query to extract intent
 */
export async function analyzeIntent(
    query: string,
    categories: Category[],
    messages: Array<{ role: string; content: string }> = [],
    provider: LLMProvider = "google"
): Promise<LLMIntentResponse> {
    const categoryList = categories.map(c => `- ${c.name} (ID: ${c.id})`).join("\n");

    const history = messages.length > 0
        ? `Conversation History:\n${messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join("\n")}\n\n`
        : "";

    const prompt = `Hy this is Gene, your Master for doing shopping at "Smart Avenue" retail store in India.
How can I help You? Will you like me to serve you as master to do shopping?

${history}Analyze the following customer query and extract their intent.

Available product categories:
${categoryList}

Customer query: "${query}"

If the customer is asking for a product that is clearly NOT in our categories or is explicitly requesting a new item we don't stock, identify it as a "request".
Otherwise, treat it as a search for existing products.

Respond with a JSON object (and nothing else) in this exact format:
{
  "category": "category ID from the list above, or null if unclear",
  "subcategory": "subcategory ID if applicable, or null",
  "requirements": ["list of specific requirements extracted from the query"],
  "budgetMin": null or number in INR,
  "budgetMax": null or number in INR (e.g., if they say "under 500", set this to 500),
  "preferences": ["any stated preferences like 'premium', 'simple', 'colorful', etc."],
  "useCase": "brief description of what they want to use the product for",
  "confidence": 0.0 to 1.0 indicating how confident you are in understanding their intent,
  "productRequestData": null or {
      "name": "product name",
      "category": "probable category",
      "maxBudget": number or null,
      "specifications": ["list of specs"]
  } if they are requesting a new item. Only populate this if the intent is clearly to request something you don't have.
}`;

    return await callLLMForJSON<GenericIntentResponse>(prompt, provider);
}

/**
 * Score and rank products for the user's needs
 */
export async function rankProducts(
    query: string,
    products: Product[],
    intent: LLMIntentResponse,
    provider: LLMProvider = "google"
): Promise<Array<{ productId: string; matchScore: number; highlights: string[]; whyRecommended: string }>> {
    if (products.length === 0) {
        return [];
    }

    const productList = products.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        tags: p.tags,
    }));

    const prompt = `Hy this is Gene, your Shopping Master.
I'm here to help you get premium products like teddy for your loved ones or stylish stationary at very affordable prices.

Customer query: "${query}"

Intent analysis:
- Use case: ${intent.useCase}
- Requirements: ${intent.requirements.join(", ") || "none specified"}
- Preferences: ${intent.preferences.join(", ") || "none specified"}
- Budget: ${intent.budgetMin ? `₹${intent.budgetMin}` : "any"} - ${intent.budgetMax ? `₹${intent.budgetMax}` : "any"}

Available products:
${JSON.stringify(productList, null, 2)}

Rank the top 3-5 most suitable products for this customer. For each product, explain why it matches their needs.

Respond with a JSON array (and nothing else) in this exact format:
[
  {
    "productId": "the product ID",
    "matchScore": 0-100 indicating how well it matches,
    "highlights": ["key features that match their needs"],
    "whyRecommended": "A 1-2 sentence explanation of why this product is recommended"
  }
]

Only include products that are relevant. If no products match well, return an empty array.`;

    return await callLLMForJSON<Array<{ productId: string; matchScore: number; highlights: string[]; whyRecommended: string }>>(prompt, provider);
}

/**
 * Generate a summary response for the user
 */
export async function generateSummary(
    query: string,
    recommendationCount: number,
    topProductName: string | null,
    provider: LLMProvider = "google"
): Promise<string> {
    if (recommendationCount === 0) {
        return "I couldn't find specific products matching your requirements. Could you provide more details about what you're looking for?";
    }

    const prompt = `Hy this is Gene, your Shopping Master at Smart Avenue.

Customer asked: "${query}"

You found ${recommendationCount} product recommendation(s)${topProductName ? `, with "${topProductName}" being the top match` : ""}.

Write a brief, friendly 1-2 sentence summary to introduce the recommendations. Be helpful and conversational as Gene. Do not use markdown formatting.`;

    const response = await callLLM(prompt, provider);
    return response.trim().replace(/```/g, "").replace(/^["']|["']$/g, "");
}

/**
 * Generate a response when no products are found
 * The AI should offer to take a request and ask for details like price
 */
export async function generateNoProductFoundResponse(
    query: string,
    intent: LLMIntentResponse,
    provider: LLMProvider = "google"
): Promise<string> {
    const prompt = `Hy this is Gene, your Shopping Master at Smart Avenue.
I help customers get premium products at very affordable prices.

CRITICAL INSTRUCTION:
- You MUST detect the language of the Customer Query.
- You MUST reply in the SAME language as the query (Hindi, Urdu, Hinglish, or English).
- Be the helpful Master Gene.

Customer query: "${query}"

Intent analysis:
- Product wanted: ${intent.category || intent.subcategory || "unknown product"}
- Use case: ${intent.useCase}
- Requirements: ${intent.requirements.join(", ") || "none specified"}

We do NOT have this product in stock right now.
1. Apologize that we don't have it currently.
2. Offer to note down their request as their Shopping Master.
3. Crucially, ask for their TARGET PRICE or BUDGET if they haven't provided it.
4. Ask for any other specific details (color, size, brand) if relevant.

Keep it concise (2-3 sentences max).`;

    const response = await callLLM(prompt, provider);
    return response.trim().replace(/```/g, "").replace(/^["']|["']$/g, "");
}

/**
 * Handle scenarios where a requested product is missing.
 * Determine if we have enough info to request it, or if we need to ask the user.
 */
export async function handleMissingProduct(
    query: string,
    intent: LLMIntentResponse,
    messages: Array<{ role: string; content: string }> = [],
    provider: LLMProvider = "google"
): Promise<{
    action: "request" | "ask_details";
    response: string;
    requestData?: {
        name: string;
        category?: string;
        maxBudget?: number;
        specifications?: string[];
    };
}> {
    const history = messages.length > 0
        ? `Conversation History:\n${messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join("\n")}\n\n`
        : "";

    const productName = intent.productRequestData?.name || intent.category || intent.subcategory || query;

    const prompt = `Hy this is Gene, your Shopping Master at Smart Avenue.
    
${history}Customer Query: "${query}"

Context: The customer is interested in "${productName}", but we DO NOT have this product in stock.
As their Master, I want to take a "Product Request" to stock it for them at an affordable price.

Decision Logic:
1. If budget or specific details are known, or if they explicitly asked to order it, submit the request.
2. Otherwise, ask for details as Gene.

Output a JSON object:
{
  "action": "request" (if we have enough to log it) OR "ask_details" (if we should ask for budget/specs first),
  "response": "The text response to the user. If requesting, say 'I've noted your request for [Product] [Details]...'. If asking, say 'We don't have [Product]. What is your budget/preference so I can request it?'",
  "requestData": { "name": "...", "category": "...", "maxBudget": number | 0 (use 0 if unknown), "specifications": ["..."] } (Required if action is 'request')
}`;

    try {
        const result = await callLLMForJSON<{
            action: "request" | "ask_details";
            response: string;
            requestData?: {
                name: string;
                category?: string;
                maxBudget?: number | string;
                specifications?: string[];
            };
        }>(prompt, provider);

        // Sanitize maxBudget to ensure it's a number
        if (result.requestData) {
            if (typeof result.requestData.maxBudget === 'string') {
                const parsed = parseFloat(result.requestData.maxBudget);
                result.requestData.maxBudget = isNaN(parsed) ? 0 : parsed;
            } else if (typeof result.requestData.maxBudget !== 'number') {
                result.requestData.maxBudget = 0;
            }
        }

        return result as {
            action: "request" | "ask_details";
            response: string;
            requestData?: {
                name: string;
                category?: string;
                maxBudget?: number;
                specifications?: string[];
            };
        };
    } catch (error) {
        // Graceful fallback: if JSON parsing completely fails, return a helpful response
        // instead of crashing the entire recommendation pipeline
        console.error("[handleMissingProduct] Failed to parse LLM response, using fallback:", error);

        const fallbackProductName = intent.productRequestData?.name || intent.category || intent.subcategory || query;
        return {
            action: "ask_details" as const,
            response: `Hy this is Gene. We don't currently have "${fallbackProductName}" in stock. As your Shopping Master, I'd love to help you get it! Could you share your preferred budget and details?`,
        };
    }
}

/**
 * Combined ranking and summary generation in a single LLM call
 * Reduces API calls from 3 to 2 for better performance
 */
export async function rankAndSummarize(
    query: string,
    products: Product[],
    intent: LLMIntentResponse,
): Promise<{
    rankings: Array<{ productId: string; matchScore: number; highlights: string[]; whyRecommended: string }>;
    summary: string;
}> {
    if (products.length === 0) {
        return {
            rankings: [],
            summary: "I couldn't find specific products matching your requirements. Could you provide more details about what you're looking for?",
        };
    }

    const productList = products.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        tags: p.tags,
    }));

    const prompt = `Hy this is Gene, your Shopping Master at Smart Avenue.
I am creative, persuasive, and I help you find premium products like stationary or teddies at affordable prices.

CRITICAL INSTRUCTION:
- You MUST reply in the SAME language as the query (English, Hindi, Urdu, or Hinglish).
- Be charming and speak as Gene, the Shopping Master.

Customer query: "${query}"

Intent analysis:
- Use case: ${intent.useCase}
- Requirements: ${intent.requirements.join(", ") || "none specified"}
- Preferences: ${intent.preferences.join(", ") || "none specified"}
- Budget: ${intent.budgetMin ? `₹${intent.budgetMin}` : "any"} - ${intent.budgetMax ? `₹${intent.budgetMax}` : "any"}

Available products:
${JSON.stringify(productList, null, 2)}

Respond with a JSON object (and nothing else) in this exact format:
{
  "rankings": [
    {
      "productId": "the product ID",
      "matchScore": 0-100 indicating how well it matches,
      "highlights": ["key features that match their needs"],
      "whyRecommended": "A persuasive 1-2 sentence pitch for this product"
    }
  ],
  "summary": "A creative, charming, and persuasive summary for the customer, in their language"
}

Only include relevant products. If no products match well, return empty rankings.`;

    return await callLLMForJSON<{
        rankings: Array<{ productId: string; matchScore: number; highlights: string[]; whyRecommended: string }>;
        summary: string;
    }>(prompt);
}

/**
 * AI Sentiment Summarizer: Generates a Pros & Cons summary from customer reviews
 */
export async function summarizeReviews(
    productName: string,
    reviews: { rating: number; comment: string }[]
): Promise<{ pros: string[]; cons: string[]; summary: string }> {
    if (reviews.length === 0) {
        return { pros: [], cons: [], summary: "No reviews available yet for this product." };
    }

    const reviewText = reviews.map(r => `Rating: ${r.rating}/5, Comment: ${r.comment}`).join("\n---\n");

    const prompt = `You are an expert product analyst for Smart Avenue.
Analyze the following customer reviews for "${productName}" and generate a concise "Pros & Cons" summary.

Reviews:
${reviewText}

Respond with a JSON object in this exact format:
{
  "pros": ["3-5 clear bullet points of what customers liked"],
  "cons": ["1-3 clear bullet points of what customers disliked or found lacking"],
  "summary": "A 2-sentence executive summary of overall sentiment."
}`;

    return await callLLMForJSON<{ pros: string[]; cons: string[]; summary: string }>(prompt);
}

/**
 * Smart Deal Explainer: Explains why a specific deal/price is a "catch" for the user
 */
export async function generateDealExplanation(
    product: { name: string; price: number; originalPrice?: number; description: string },
    userIntent?: string
): Promise<string> {
    const savings = product.originalPrice ? product.originalPrice - product.price : 0;
    const savingsPercent = product.originalPrice ? Math.round((savings / product.originalPrice) * 100) : 0;

    const prompt = `You are a charismatic sales associate at Smart Avenue.
Explain why the current deal on "${product.name}" is amazing for the customer.

Product Info:
- Current Price: ₹${product.price}
- Original Price: ${product.originalPrice ? `₹${product.originalPrice}` : "N/A"}
- Savings: ${savings > 0 ? `₹${savings} (${savingsPercent}% off)` : "Best value in category"}
${userIntent ? `- User's Goal: ${userIntent}` : ""}

Provide a persuasive, 1-2 sentence "pitch" that makes the user feel they are getting a great deal. Be friendly and culturally relevant to India.`;

    // Use light model for simple creative text
    const response = await callGroqAPI(prompt);
    return response.trim().replace(/^["']|["']$/g, "");
}

/**
 * AI Social Proof Generator: Generates trending snippets for products
 */
export async function generateSocialProof(
    product: { name: string; categoryId: string; tags: string[] },
    salesStats?: { salesInLastMonth: number; popularInCity?: string }
): Promise<string> {
    const prompt = `You are a social media trend expert for Smart Avenue.
Create a short, catchy "social proof" snippet for "${product.name}".

Context:
- Category: ${product.categoryId}
- Stats: ${salesStats ? `${salesStats.salesInLastMonth} people bought this recently${salesStats.popularInCity ? ` in ${salesStats.popularInCity}` : ""}` : "Currently trending"}

Example output: "#1 top-pick for office wear in Mumbai this week!" or "Trending: 50+ people in Delhi just bought this!"
Keep it under 100 characters. No hashtags.`;

    const response = await callGroqAPI(prompt);
    return response.trim().replace(/^["']|["']$/g, "");
}
