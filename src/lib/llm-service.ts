/**
 * LLM Service
 * 
 * Wrapper for LLM providers (Google, OpenAI, Anthropic) with automatic key rotation and error handling.
 * Settings (temperature, maxTokens, provider, persona) are loaded from admin config via Firestore.
 */

import { getAPIKeyManager } from "./api-key-manager";
import {
    LLMIntentResponse,
    LLMServiceError,
    APIKeyExhaustedError,
    LLMProvider
} from "@/types/assistant-types";
import { Product, Category } from "@/app/actions";
import { getAIConfig } from "./ai-config";
import { validateCategoryId, validateRankings } from "./llm-validators";
import { getPrompt } from "./prompt-registry";

// Extended intent response to include product requests
interface GenericIntentResponse extends LLMIntentResponse {
    requestProduct?: {
        name: string;
        description: string;
    } | null;
}

const MAX_RETRIES = 3;

// Default fallback values (overridden by admin config from Firestore)
const DEFAULT_TEMPERATURE = 0.7;
const DEFAULT_MAX_TOKENS = 2048;

const GROQ_API_BASE = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile"; // Meta model for better multi-language support (Hindi, Urdu, Hinglish)
const GROQ_MODEL_LIGHT = "llama-3.1-8b-instant";
// 90b vision decommissioned, using 11b
// 90b/11b vision decommissioned on Groq, using Gemini 2.0 Flash
// const GROQ_MODEL_VISION = "llama-3.2-11b-vision-preview";
// DeepSeek models decommissioned, falling back to Llama 3.3 70B
const GROQ_MODEL_REASONING = "llama-3.3-70b-versatile";
const GROQ_MODEL_GIFT = "llama-3.3-70b-versatile";
const GROQ_MODEL_WHISPER = "whisper-large-v3-turbo";

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const GROQ_AUDIO_BASE = "https://api.groq.com/openai/v1/audio/transcriptions";
const GEMINI_MODEL = "gemini-2.0-flash";

/**
 * Options for LLM calls — allows overriding default temperature and maxTokens.
 * When not provided, values are loaded from admin config.
 */
export interface LLMCallOptions {
    temperature?: number;
    maxTokens?: number;
    provider?: LLMProvider;
    model?: string;
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
async function callGroqAPI(prompt: string, model: string = GROQ_MODEL, retryCount: number = 0, options?: LLMCallOptions): Promise<string> {
    const keyManager = getAPIKeyManager();
    let apiKey: string;

    try {
        apiKey = keyManager.getActiveKey("groq");
    } catch (error) {
        throw error;
    }

    // Use provided options, fallback to defaults
    const temperature = options?.temperature ?? (model.includes("deepseek") ? 0.6 : DEFAULT_TEMPERATURE);
    const maxTokens = options?.maxTokens ?? DEFAULT_MAX_TOKENS;

    try {
        const response = await fetch(GROQ_API_BASE, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    { role: "user", content: prompt }
                ],
                temperature,
                max_tokens: maxTokens,
                top_p: model.includes("deepseek") ? 0.95 : 1,
            }),
        });

        if (response.status === 429) {
            keyManager.markKeyRateLimited(apiKey);
            if (retryCount < MAX_RETRIES) {
                console.log(`[LLMService] Groq Rate limited, retrying (attempt ${retryCount + 1})`);
                return callGroqAPI(prompt, model, retryCount + 1);
            }
            throw new LLMServiceError("Rate limit exceeded on Groq keys", 429);
        }

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[LLMService] Groq Error Body: ${errorText}`);

            // Handle terminal errors (Unauthorized or Leaked)
            if (response.status === 401 || response.status === 403) {
                keyManager.markKeyInvalid(apiKey);
                throw new LLMServiceError(`Groq API key is invalid or unauthorized: ${response.status}`, response.status);
            }

            keyManager.markKeyFailed(apiKey);
            if (retryCount < MAX_RETRIES) {
                console.log(`[LLMService] Groq Request failed (${response.status}), retrying`);
                return callGroqAPI(prompt, model, retryCount + 1);
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
        if (retryCount < MAX_RETRIES) return callGroqAPI(prompt, model, retryCount + 1);

        throw new LLMServiceError(`Unexpected Groq error: ${error instanceof Error ? error.message : "Unknown"}`);
    }
}

/**
 * Make a request to Groq Vision API
 */
/**
 * Make a request to Vision API (using Gemini as Groq Vision is deprecated)
 */
export async function callVisionAPI(base64Image: string, retryCount: number = 0): Promise<string> {
    const keyManager = getAPIKeyManager();
    let apiKey: string;

    try {
        apiKey = keyManager.getActiveKey("google");
    } catch (error) {
        throw error;
    }

    const url = `${GEMINI_API_BASE}/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

    try {
        // Clean base64 if it has prefix
        const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, "");

        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: "Identify the main product in this image. Return ONLY the product name and 2-3 key visual attributes (color, style) for a search query. No preamble." },
                        {
                            inline_data: {
                                mime_type: "image/jpeg",
                                data: cleanBase64
                            }
                        }
                    ]
                }],
                generationConfig: { maxOutputTokens: 100 },
            }),
        });

        if (response.status === 429) {
            keyManager.markKeyRateLimited(apiKey);
            if (retryCount < MAX_RETRIES) return callVisionAPI(base64Image, retryCount + 1);
            throw new LLMServiceError("Rate limit exceeded on Gemini keys", 429);
        }

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[LLMService] Vision Error: ${errorText}`);
            keyManager.markKeyFailed(apiKey);
            if (retryCount < MAX_RETRIES) return callVisionAPI(base64Image, retryCount + 1);
            throw new LLMServiceError(`Vision API failed: ${response.statusText}`, response.status);
        }

        const data: GeminiResponse = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) throw new LLMServiceError("No response from Vision API");

        keyManager.markKeySuccess(apiKey);
        return text.trim();
    } catch (error) {
        if (error instanceof LLMServiceError || error instanceof APIKeyExhaustedError) throw error;
        keyManager.markKeyFailed(apiKey);
        if (retryCount < MAX_RETRIES) return callVisionAPI(base64Image, retryCount + 1);
        throw new LLMServiceError(`Unexpected Vision error: ${error instanceof Error ? error.message : "Unknown"}`);
    }
}


/**
 * Make a request to Groq Whisper API
 */
export async function callGroqWhisperAPI(audioFormData: FormData, retryCount: number = 0): Promise<string> {
    const keyManager = getAPIKeyManager();
    let apiKey: string;

    try {
        apiKey = keyManager.getActiveKey("groq");
    } catch (error) {
        throw error;
    }

    try {
        // Append model if not present, though usually caller might append it? 
        // Better to append here to enforce model choice.
        if (!audioFormData.has("model")) {
            audioFormData.append("model", GROQ_MODEL_WHISPER);
        }

        const response = await fetch(GROQ_AUDIO_BASE, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`
                // Content-Type is set automatically with boundary by fetch when body is FormData
            },
            body: audioFormData,
        });

        if (response.status === 429) {
            keyManager.markKeyRateLimited(apiKey);
            if (retryCount < MAX_RETRIES) return callGroqWhisperAPI(audioFormData, retryCount + 1);
            throw new LLMServiceError("Rate limit exceeded on Groq keys", 429);
        }

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[LLMService] Groq Whisper Error: ${errorText}`);
            keyManager.markKeyFailed(apiKey);
            if (retryCount < MAX_RETRIES) return callGroqWhisperAPI(audioFormData, retryCount + 1);
            throw new LLMServiceError(`Groq Whisper API failed: ${response.statusText}`, response.status);
        }

        const data: { text?: string } = await response.json();

        if (!data.text) {
            throw new LLMServiceError("No text in Whisper response");
        }

        keyManager.markKeySuccess(apiKey);
        return data.text.trim();

    } catch (error) {
        if (error instanceof LLMServiceError || error instanceof APIKeyExhaustedError) throw error;
        keyManager.markKeyFailed(apiKey);
        if (retryCount < MAX_RETRIES) return callGroqWhisperAPI(audioFormData, retryCount + 1);
        throw new LLMServiceError(`Unexpected Groq Whisper error: ${error instanceof Error ? error.message : "Unknown"}`);
    }
}

/**
 * Make a request to Gemini API
 */
async function callGeminiAPI(prompt: string, retryCount: number = 0, options?: LLMCallOptions): Promise<string> {
    const keyManager = getAPIKeyManager();
    let apiKey: string;

    try {
        apiKey = keyManager.getActiveKey("google");
    } catch (error) {
        throw error;
    }

    // Use provided options, fallback to defaults
    const temperature = options?.temperature ?? DEFAULT_TEMPERATURE;
    const maxTokens = options?.maxTokens ?? DEFAULT_MAX_TOKENS;

    const url = `${GEMINI_API_BASE}/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature, maxOutputTokens: maxTokens },
            }),
        });

        if (response.status === 429) {
            keyManager.markKeyRateLimited(apiKey);
            if (retryCount < MAX_RETRIES) return callGeminiAPI(prompt, retryCount + 1);
            throw new LLMServiceError("Rate limit exceeded on Gemini keys", 429);
        }

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[LLMService] Gemini Error: ${errorText}`);

            // Handle terminal errors (Unauthorized or Leaked)
            if (response.status === 401 || response.status === 403) {
                keyManager.markKeyInvalid(apiKey);
                throw new LLMServiceError(`Gemini API key is invalid or leaked: ${response.status}`, response.status);
            }

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
 * Prioritizes Groq > Gemini if in "auto" mode.
 */
async function callLLM(prompt: string, provider: LLMProvider | "auto" = "auto", model?: string, options?: LLMCallOptions): Promise<string> {
    const keyManager = getAPIKeyManager();

    // 1. Handle explicit provider requests with fallback if they fail
    if (provider === "groq") {
        try {
            return await callGroqAPI(prompt, model, 0, options);
        } catch (error) {
            console.warn("[LLMService] Groq requested but failed, falling back to Gemini:", error);
            // Fallthrough to Gemini
        }
    }

    if (provider === "google") {
        try {
            return await callGeminiAPI(prompt, 0, options);
        } catch (error) {
            console.warn("[LLMService] Gemini requested but failed, falling back to Groq:", error);
            if (keyManager.hasKeys("groq")) {
                return await callGroqAPI(prompt, model, 0, options);
            }
            throw error; // Re-throw if no fallback available
        }
    }

    // 2. Default "auto" routing logic
    // Try Google first as it's often more capable (Gemini 2.0 Flash)
    if (keyManager.hasKeys("google")) {
        try {
            return await callGeminiAPI(prompt, 0, options);
        } catch (error) {
            console.warn("[LLMService] Gemini failed in auto mode, falling back to Groq:", error);
            // Fallthrough to Groq
        }
    }

    // Try Groq
    if (keyManager.hasKeys("groq")) {
        try {
            return await callGroqAPI(prompt, model, 0, options);
        } catch (error) {
            console.warn("[LLMService] Groq failed in auto mode, falling back to Gemini (retry):", error);
            // Last ditch effort back to Gemini if it hasn't been tried yet or to get final error
            return await callGeminiAPI(prompt, 0, options);
        }
    }

    // Fallback to Gemini if nothing else
    return await callGeminiAPI(prompt, 0, options);
}

/**
 * LLM call with dynamic config from admin settings.
 * Loads temperature, maxTokens, and provider priority from Firestore.
 */
async function callLLMWithConfig(prompt: string, overrideProvider?: LLMProvider, overrideModel?: string): Promise<string> {
    const config = await getAIConfig();

    const options: LLMCallOptions = {
        temperature: config.temperature,
        maxTokens: config.maxTokens,
    };

    // Determine provider: override > admin config > default
    let provider: LLMProvider | "auto";
    if (overrideProvider) {
        provider = overrideProvider;
    } else if (config.providerPriority === "groq") {
        provider = "groq";
    } else if (config.providerPriority === "google") {
        provider = "google";
    } else {
        provider = "auto";
    }

    return await callLLM(prompt, provider, overrideModel, options);
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
async function callLLMForJSON<T>(prompt: string, provider?: LLMProvider, model?: string): Promise<T> {
    // First attempt
    try {
        const response = await callLLMWithConfig(prompt, provider, model);
        return parseJSONFromResponse<T>(response);
    } catch (firstError) {
        if (!(firstError instanceof LLMServiceError) || !String(firstError.message).includes("Failed to parse")) {
            throw firstError;
        }

        console.warn("[LLMService] JSON parse failed on first attempt, retrying with stricter prompt");

        // Retry with a much stricter prompt
        const stricterPrompt = `${prompt}\n\nIMPORTANT: You MUST respond with ONLY a valid JSON object. No explanation text before or after. No markdown. Just the raw JSON.`;
        const retryResponse = await callLLMWithConfig(stricterPrompt, provider, model);
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
    provider: LLMProvider = "auto"
): Promise<LLMIntentResponse> {
    const categoryList = categories.map(c => `- ${c.name} (ID: ${c.id})`).join("\n");
    const validCategoryIds = new Set(categories.map(c => c.id));

    if (messages && messages.length > 0) {
        // use it purely to acknowledge it if passed, or optionally feed it to prompt if Prompt Library supports it
    }

    const prompt = await getPrompt("intent-analyze", {
        categoryList,
        query
    });

    const result = await callLLMForJSON<GenericIntentResponse>(prompt, provider);

    // Validate category ID against real categories to prevent hallucination
    result.category = validateCategoryId(result.category, validCategoryIds);
    result.subcategory = validateCategoryId(result.subcategory, validCategoryIds);

    return result;
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

    const config = await getAIConfig();
    const persona = config.personaName;
    const validProductIds = new Set(products.map(p => p.id));

    const productList = products.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        tags: p.tags,
    }));

    const prompt = `Hi, I'm ${persona}, your personal Shopping Master at Smart Avenue.

Customer query: "${query}"

Intent analysis:
- Use case: ${intent.useCase}
- Requirements: ${intent.requirements.join(", ") || "none specified"}
- Preferences: ${intent.preferences.join(", ") || "none specified"}
- Budget: ${intent.budgetMin ? `₹${intent.budgetMin}` : "any"} - ${intent.budgetMax ? `₹${intent.budgetMax}` : "any"}

Available products:
${JSON.stringify(productList, null, 2)}

Rank the top 3-5 most suitable products for this customer. For each product, explain why it matches their needs.

CRITICAL INSTRUCTIONS:
1. You must ONLY recommend products from the "Available products" list provided above.
2. Do NOT mention, suggest, or hallucinate any products that are not in the list.
3. If the list is empty, return an empty array. Do NOT invent a product.

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

    const rankings = await callLLMForJSON<Array<{ productId: string; matchScore: number; highlights: string[]; whyRecommended: string }>>(prompt, provider);

    // Validate product IDs to prevent hallucination
    return validateRankings(rankings, validProductIds);
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

    const config = await getAIConfig();
    const persona = config.personaName;

    const prompt = `Hi, I'm ${persona}, your personal Shopping Master at Smart Avenue.

Customer asked: "${query}"

You found ${recommendationCount} product recommendation(s)${topProductName ? `, with "${topProductName}" being the top match` : ""}.

Write a brief, friendly 1-2 sentence summary to introduce the recommendations. Be helpful and conversational as ${persona}. Do not use markdown formatting.`;

    const response = await callLLMWithConfig(prompt, provider);
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
    const config = await getAIConfig();
    const persona = config.personaName;

    const prompt = `${config.systemPrompt}

CRITICAL INSTRUCTION:
- You MUST detect the language of the Customer Query.
- You MUST reply in the SAME language as the query (Hindi, Urdu, Hinglish, or English).
- Be the helpful Master ${persona}.

Customer query: "${query}"

Intent analysis:
- Product wanted: ${intent.category || intent.subcategory || "unknown product"}
- Use case: ${intent.useCase}
- Requirements: ${intent.requirements.join(", ") || "none specified"}

We do NOT have this product in stock right now.
1. Apologize that we don't have it currently.
2. STRICTLY DO NOT invent, hallucinate, or offer any product that you don't have context for.
3. Offer to note down their request as their Shopping Master.
4. Crucially, ask for their TARGET PRICE or BUDGET if they haven't provided it.
5. Ask for any other specific details (color, size, brand) if relevant.

Keep it concise (2-3 sentences max).`;

    const response = await callLLMWithConfig(prompt, provider);
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
    const config = await getAIConfig();
    const persona = config.personaName;
    const history = messages.length > 0
        ? `Conversation History:\n${messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join("\n")}\n\n`
        : "";

    const productName = intent.productRequestData?.name || intent.category || intent.subcategory || query;

    const prompt = `${config.systemPrompt}
    
${history}Customer Query: "${query}"

Context: The customer is interested in "${productName}", but we DO NOT have this product in stock.
As their Master, I want to take a "Product Request" to stock it for them at an affordable price.

Decision Logic:
1. If budget or specific details are known, or if they explicitly asked to order it, submit the request.
2. Otherwise, ask for details as ${persona}.

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
            response: `Hi, I'm ${persona}. We don't currently have "${fallbackProductName}" in stock. As your Shopping Master, I'd love to help you get it! Could you share your preferred budget and details?`,
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

    const config = await getAIConfig();
    const persona = config.personaName;
    const validProductIds = new Set(products.map(p => p.id));

    const productList = products.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        tags: p.tags,
    }));

    const prompt = `${config.systemPrompt}

CRITICAL INSTRUCTION:
- You MUST reply in the SAME language as the query (English, Hindi, Urdu, or Hinglish).
- Be charming and speak as ${persona}, the Shopping Master.

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

CRITICAL:
1. You must ONLY recommend products from the "Available products" list provided above.
2. If "Available products" is empty array [], you MUST return empty rankings [].
3. In the summary, if no products are found, say "I couldn't find exactly that in our current collection, but I can take a request for it!"
4. Do NOT make up products.

Only include relevant products. If no products match well, return empty rankings.`;

    const result = await callLLMForJSON<{
        rankings: Array<{ productId: string; matchScore: number; highlights: string[]; whyRecommended: string }>;
        summary: string;
    }>(prompt);

    // Validate product IDs to prevent hallucination
    result.rankings = validateRankings(result.rankings, validProductIds);

    return result;
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

    const prompt = await getPrompt("review-summarizer", {
        productName,
        reviewText
    });

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
    const stats = salesStats ? `${salesStats.salesInLastMonth} people bought this recently${salesStats.popularInCity ? ` in ${salesStats.popularInCity}` : ""}` : "Currently trending";

    const prompt = await getPrompt("social-proof", {
        productName: product.name,
        categoryId: product.categoryId,
        stats
    });

    const response = await callGroqAPI(prompt);
    return response.trim().replace(/^["']|["']$/g, "");
}

/**
 * AI Deal Explainer: Explains *why* a deal is good or the product value
 */
export async function generateDealInsight(
    product: { name: string; price: number; originalPrice?: number; description: string }
): Promise<string> {
    const discount = product.originalPrice
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0;

    const prompt = await getPrompt("deal-insight", {
        productName: product.name,
        price: product.price,
        discount: discount > 0 ? `(was ₹${product.originalPrice}, ${discount}% OFF)` : "",
        description: product.description.substring(0, 100) + "..."
    });

    // Using Llama 3.1 8B for fast, snappy copy
    const response = await callGroqAPI(prompt, GROQ_MODEL_LIGHT);
    return response.trim().replace(/^["']|["']$/g, "");
}

/**
 * AI Personal Stylist: Generates outfit recommendations based on user preferences and occasion
 */
export async function generateStylistAdvice(
    userPreferences: {
        gender: string;
        style: string;
        occasion: string;
        budget?: string;
        colors?: string[];
    },
    products: Product[] = []
): Promise<{
    advice: string;
    suggestedOutfit: {
        top?: string;
        bottom?: string;
        shoes?: string;
        accessory?: string;
        reasoning: string
    }
}> {
    const config = await getAIConfig();
    const persona = config.personaName;

    // Map of product IDs to full products for easy lookup later
    const validProducts = new Map(products.map(p => [p.id, p]));

    const productList = products.map(p => ({
        id: p.id,
        name: p.name,
        category: p.categoryId,
        price: p.price,
        colors: p.tags
    }));

    const prompt = await getPrompt("stylist", {
        persona,
        gender: userPreferences.gender,
        style: userPreferences.style,
        occasion: userPreferences.occasion,
        budget: userPreferences.budget || "Flexible",
        colors: userPreferences.colors?.join(", ") || "Any",
        productList: JSON.stringify(productList, null, 2)
    });

    // Using DeepSeek-R1 Distill Llama 70B for reasoning
    const result = await callLLMForJSON<{
        advice: string;
        suggestedOutfit: {
            top?: string;
            bottom?: string;
            shoes?: string;
            accessory?: string;
            reasoning: string
        }
    }>(prompt, "groq", GROQ_MODEL_REASONING);

    // Map IDs back to product names to satisfy the UI without requiring frontend changes, 
    // while ensuring strict catalog validation (removing hallucinations).
    if (result.suggestedOutfit) {
        if (result.suggestedOutfit.top && validProducts.has(result.suggestedOutfit.top)) {
            result.suggestedOutfit.top = validProducts.get(result.suggestedOutfit.top)?.name;
        } else {
            result.suggestedOutfit.top = undefined;
        }

        if (result.suggestedOutfit.bottom && validProducts.has(result.suggestedOutfit.bottom)) {
            result.suggestedOutfit.bottom = validProducts.get(result.suggestedOutfit.bottom)?.name;
        } else {
            result.suggestedOutfit.bottom = undefined;
        }

        if (result.suggestedOutfit.shoes && validProducts.has(result.suggestedOutfit.shoes)) {
            result.suggestedOutfit.shoes = validProducts.get(result.suggestedOutfit.shoes)?.name;
        } else {
            result.suggestedOutfit.shoes = undefined;
        }

        if (result.suggestedOutfit.accessory && validProducts.has(result.suggestedOutfit.accessory)) {
            result.suggestedOutfit.accessory = validProducts.get(result.suggestedOutfit.accessory)?.name;
        } else {
            result.suggestedOutfit.accessory = undefined;
        }
    }

    return result;
}

/**
 * Gift Concierge: Recommends gifts based on recipient persona
 */
export async function generateGiftRecommendations(
    recipient: {
        relation: string;
        age: string;
        interests: string[];
        occasion: string;
        budget: string;
    },
    products: Product[] = []
): Promise<{
    thoughtProcess: string;
    recommendations: Array<{ item: string; reason: string; category: string }>;
}> {
    const config = await getAIConfig();
    const persona = config.personaName;

    const validProducts = new Map(products.map(p => [p.id, p]));

    const productList = products.map(p => ({
        id: p.id,
        name: p.name,
        category: p.categoryId,
        price: p.price,
        description: p.description.substring(0, 100) + "..."
    }));

    const prompt = await getPrompt("gift-concierge", {
        persona,
        relation: recipient.relation,
        age: recipient.age,
        interests: recipient.interests.join(", "),
        occasion: recipient.occasion,
        budget: recipient.budget,
        productList: JSON.stringify(productList, null, 2)
    });

    // Using DeepSeek-R1 Distill Qwen 32B for creative/empathetic tasks
    const result = await callLLMForJSON<{
        thoughtProcess: string;
        recommendations: Array<{ productId?: string; item?: string; reason: string; category: string }>;
    }>(prompt, "groq", GROQ_MODEL_GIFT);

    // Validate IDs and map to product names for the frontend
    const validatedRecommendations = [];
    for (const rec of result.recommendations) {
        if (!rec.productId) continue;
        const product = validProducts.get(rec.productId);
        if (product) {
            validatedRecommendations.push({
                item: product.name,
                reason: rec.reason,
                category: rec.category || product.categoryId
            });
        }
    }

    return {
        thoughtProcess: result.thoughtProcess,
        recommendations: validatedRecommendations
    };
}

/**
 * Compare & Contrast: Analyzes two products side-by-side
 */
export async function generateProductComparison(
    product1: { name: string; price: number; description: string; features: string[] },
    product2: { name: string; price: number; description: string; features: string[] }
): Promise<{
    comparisonPoints: Array<{ feature: string; item1Value: string; item2Value: string; verdict: string }>;
    summary: string;
    recommendation: string;
}> {
    const prompt = await getPrompt("product-compare", {
        "product1.name": product1.name,
        "product1.price": product1.price.toString(),
        "product1.description": product1.description,
        "product1.features": product1.features.join(", "),
        "product2.name": product2.name,
        "product2.price": product2.price.toString(),
        "product2.description": product2.description,
        "product2.features": product2.features.join(", ")
    });

    // Using DeepSeek-R1 Distill Llama 70B for reasoning comparison
    return await callLLMForJSON<{
        comparisonPoints: Array<{ feature: string; item1Value: string; item2Value: string; verdict: string }>;
        summary: string;
        recommendation: string;
    }>(prompt, "groq", GROQ_MODEL_REASONING);
}

/**
 * Phase 4: Proactive Alerts
 */

/**
 * Out of Stock / Low Stock Urgency Generator
 */
export async function generateOOSUrgency(
    productName: string,
    sku: string,
    stockLevel: number,
    viewCount: number
): Promise<{ headline: string; subtext: string; urgencyLevel: "high" | "medium" | "low" }> {
    const prompt = await getPrompt("stock-urgency", {
        productName,
        sku,
        stockLevel: stockLevel.toString(),
        viewCount: viewCount.toString()
    });

    // Using Llama 3.1 8B (Light) for fast inference
    return await callLLMForJSON<{
        headline: string;
        subtext: string;
        urgencyLevel: "high" | "medium" | "low";
    }>(prompt, "groq", GROQ_MODEL_LIGHT);
}

/**
 * Restock Notification Message Generator
 */
export async function generateBackInStockMessage(
    productName: string,
    customerName: string
): Promise<{ subject: string; body: string; discountCode?: string }> {
    const prompt = `You are a customer loyalty bot for Smart Avenue.
    Context:
    - Customer: ${customerName}
    - Item Back in Stock: ${productName}
    
    Task:
    Write a friendly, exciting notification message telling them their item is back.
    Suggest a small discount code 'WELCOMEBACK5' to nudge them.

    Response JSON:
    {
      "subject": "Email/Push subject line (Emojis allowed)",
      "body": "Warm, short, 2-sentence message.",
      "discountCode": "WELCOMEBACK5"
    }`;

    return await callLLMForJSON<{
        subject: string;
        body: string;
        discountCode?: string;
    }>(prompt, "groq", GROQ_MODEL_LIGHT);
}

/**
 * Phase 5: Interactive Features
 */

/**
 * Multilingual Local Language Assistant
 * Handles general queries, product advice, and store info in Indian context.
 */
export async function chatWithAssistant(
    message: string,
    history: { role: "user" | "assistant"; content: string }[]
): Promise<{ reply: string; suggestedActions?: string[] }> {
    // Construct conversation history for context
    const conversationContext = history.map(msg => `${msg.role === "user" ? "Customer" : "Assistant"}: ${msg.content}`).join("\n");

    const prompt = await getPrompt("general-chat", {
        conversationContext,
        message
    });

    // Using Llama 3.3 70B for high-quality multilingual chat
    return await callLLMForJSON<{
        reply: string;
        suggestedActions?: string[];
    }>(prompt, "groq", GROQ_MODEL);
}

/**
 * Translates a "Vibe" (abstract mood) into concrete product filters.
 */
export async function translateVibeToFilters(vibe: string): Promise<{
    searchQuery?: string;
    category?: string;
    colors?: string[];
    priceRange?: { min?: number; max?: number };
    sort?: "price_asc" | "price_desc" | "newest" | "rating";
    reasoning: string;
}> {
    const prompt = await getPrompt("vibe-translator", {
        vibe
    });

    // Using Llama 3.3 70B for nuanced semantic understanding
    return await callLLMForJSON<{
        searchQuery?: string;
        category?: string;
        colors?: string[];
        priceRange?: { min?: number; max?: number };
        sort?: "price_asc" | "price_desc" | "newest" | "rating";
        reasoning: string;
    }>(prompt, "groq", GROQ_MODEL);
}
