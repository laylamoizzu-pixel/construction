/**
 * AI Config Loader
 * 
 * Cached configuration loader that fetches AISettings from Firestore
 * with a 60-second in-memory TTL to avoid hitting Firestore on every LLM call.
 */

import { AISettings } from "@/app/actions/ai-settings-actions";

// In-memory cache
let cachedConfig: AISettings | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

/**
 * Get AI configuration with caching.
 * Fetches from Firestore on first call and caches for 60 seconds.
 * Falls back to defaults if Firestore is unavailable.
 */
export async function getAIConfig(): Promise<AISettings> {
    const now = Date.now();

    // Return cached config if still fresh
    if (cachedConfig && (now - cacheTimestamp) < CACHE_TTL_MS) {
        return cachedConfig;
    }

    try {
        // Dynamic import to avoid circular dependencies with server actions
        const { getAISettings } = await import("@/app/actions/ai-settings-actions");
        cachedConfig = await getAISettings();
        cacheTimestamp = now;
        console.log("[AIConfig] Loaded AI settings from Firestore (cached for 60s)");
        return cachedConfig;
    } catch (error) {
        console.error("[AIConfig] Failed to load settings, using defaults:", error);

        // Return defaults if Firestore fails
        const defaults: AISettings = {
            enabled: true,
            showVibeSelector: true,
            personaName: "Genie",
            greeting: "Hi, I'm Genie, your personal Shopping Master! 🧞‍♂️ How can I help you today?",
            systemPrompt: "You are Genie, a charming and helpful AI Shopping Master at Smart Avenue. You help customers find products, give styling advice, and provide excellent shopping assistance. Be friendly, knowledgeable, and persuasive. Support English, Hindi, and Hinglish.",
            temperature: 0.7,
            maxTokens: 2048,
            providerPriority: "auto",
            maxRecommendations: 5,
            enableVoiceInput: false,
            enableProductRequests: true,
        };
        cachedConfig = defaults;
        cacheTimestamp = now;
        return defaults;
    }
}

/**
 * Invalidate the cached config.
 * Call this when admin saves new settings so changes take effect immediately.
 */
export function invalidateAIConfig(): void {
    cachedConfig = null;
    cacheTimestamp = 0;
    console.log("[AIConfig] Cache invalidated — next call will fetch fresh settings");
}
