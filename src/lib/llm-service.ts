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
const GROQ_MODEL = "llama-3.3-70b-versatile"; // Using Llama 3.3 70B for high quality
const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const GEMINI_MODEL = "gemini-2.0-flash";

interface GeminiResponse {
    candidates?: Array<{
        content?: {
            parts?: Array<{
                text?: string;
            }>;
        };
    }>;
    error?: {
        code: number;
        message: string;
    };
}

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
                temperature: 0.7,
                max_tokens: 2048,
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

        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) throw new LLMServiceError("No response text from Gemini");

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
 * Parse JSON from LLM response, handling markdown code blocks
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

    try {
        return JSON.parse(cleaned);
    } catch {
        throw new LLMServiceError(`Failed to parse LLM response as JSON: ${response.substring(0, 100)}...`);
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

    const prompt = `You are a product recommendation assistant for a retail store called "Smart Avenue" in India.

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

    const response = await callLLM(prompt, provider);
    return parseJSONFromResponse<GenericIntentResponse>(response);
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

    const prompt = `You are a product recommendation assistant for Smart Avenue retail store.

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

    const response = await callLLM(prompt, provider);
    return parseJSONFromResponse<Array<{ productId: string; matchScore: number; highlights: string[]; whyRecommended: string }>>(response);
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

    const prompt = `You are a friendly product recommendation assistant for Smart Avenue retail store in India.

Customer asked: "${query}"

You found ${recommendationCount} product recommendation(s)${topProductName ? `, with "${topProductName}" being the top match` : ""}.

Write a brief, friendly 1-2 sentence summary to introduce the recommendations. Be helpful and conversational. Do not use markdown formatting.`;

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
    const prompt = `You are an expert sales associate for Smart Avenue, known for being helpful and proactive.

CRITICAL INSTRUCTION:
- You MUST detect the language of the Customer Query.
- You MUST reply in the SAME language as the query.
- If the user asks in Hindi, reply in Hindi.
- If the user asks in Urdu, reply in Urdu.
- If the user asks in Hinglish, reply in Hinglish.
- If the user asks in English, reply in English.

Customer query: "${query}"

Intent analysis:
- Product wanted: ${intent.category || intent.subcategory || "unknown product"}
- Use case: ${intent.useCase}
- Requirements: ${intent.requirements.join(", ") || "none specified"}

We do NOT have this product in stock right now.
Your goal is to offer to take a "Product Request" for them.
1. Apologize that we don't have it currently.
2. Offer to note down their request so we can stock it.
3. Crucially, ask for their TARGET PRICE or BUDGET for this item if they haven't provided it.
4. Ask for any other specific details (color, size, brand) if relevant.

Keep the tone professional, helpful, and encouraging. Keep it concise (2-3 sentences max).`;

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

    const prompt = `You are a helpful sales assistant for Smart Avenue.
    
${history}Customer Query: "${query}"

Context: The customer is interested in "${productName}", but we DO NOT have this product in stock.
We want to take a "Product Request" to stock it for them.

To submit a request, we IDEALLY want:
1. Product Name (We have this: "${productName}")
2. Specifics (Color, size, brand, etc.)
3. Target Price / Budget

Current Knowledge:
- Budget: ${intent.budgetMax || intent.productRequestData?.maxBudget ? "Known" : "Unknown"}
- Specs: ${intent.requirements.length > 0 || intent.productRequestData?.specifications?.length ? "Known" : "Unknown"}

Decision Logic:
1. If the user has ALREADY provided a budget OR specific details in the history/query, we have enough to submit.
2. If the user has explicitly said "requests it" or "order it", submit.
3. If this is the FIRST time they mentioned it and gave NO details (just "do you have gucci bags?"), we should ASK for details first.
4. If they just answered a question about details (e.g. "My budget is 5k"), submit.

Output a JSON object:
{
  "action": "request" (if we have enough to log it) OR "ask_details" (if we should ask for budget/specs first),
  "response": "The text response to the user. If requesting, say 'I've noted your request for [Product] [Details]...'. If asking, say 'We don't have [Product]. What is your budget/preference so I can request it?'",
  "requestData": { "name": "...", "category": "...", "maxBudget": number, "specifications": ["..."] } (Required if action is 'request')
}`;

    const rawResponse = await callLLM(prompt, provider);
    return parseJSONFromResponse(rawResponse);
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

    const prompt = `You are an expert sales associate for Smart Avenue, known for being the world's best salesperson.
You are creative, persuasive, and charming.

CRITICAL INSTRUCTION:
- You MUST detect the language of the Customer Query.
- You MUST reply in the SAME language as the query.
- If the user asks in Hindi, reply in Hindi.
- If the user asks in Urdu, reply in Urdu.
- If the user asks in Hinglish, reply in Hinglish.
- If the user asks in English, reply in English.
- Be culturally relevant to Indian shoppers.

Customer query: "${query}"

Intent analysis:
- Use case: ${intent.useCase}
- Requirements: ${intent.requirements.join(", ") || "none specified"}
- Preferences: ${intent.preferences.join(", ") || "none specified"}
- Budget: ${intent.budgetMin ? `₹${intent.budgetMin}` : "any"} - ${intent.budgetMax ? `₹${intent.budgetMax}` : "any"}

Available products:
${JSON.stringify(productList, null, 2)}

Do two things:
1. Rank the top 3-5 most suitable products for this customer
3. Write a creative, persuasive, and personalized summary to introduce the recommendations. Speak directly to the customer.

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

    const response = await callLLM(prompt);
    return parseJSONFromResponse<{
        rankings: Array<{ productId: string; matchScore: number; highlights: string[]; whyRecommended: string }>;
        summary: string;
    }>(response);
}
