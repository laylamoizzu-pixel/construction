import { getAIPrompts } from "@/app/actions/ai-prompts-actions";
import { AIPrompt, DEFAULT_PROMPTS } from "./prompt-defaults";

// Cache structure
let cachedPrompts: Record<string, AIPrompt> | null = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

/**
 * Loads all AI prompts from Firestore, falling back to defaults for missing ones.
 * Implements a 60-second in-memory cache to reduce Firestore reads.
 */
export async function getPromptRegistry(): Promise<Record<string, AIPrompt>> {
    const now = Date.now();

    // Return from cache if valid
    if (cachedPrompts && (now - lastFetchTime) < CACHE_TTL_MS) {
        return cachedPrompts;
    }

    try {
        // Fetch custom prompts from Firestore
        const customPromptsArray = await getAIPrompts();
        const customPrompts: Record<string, AIPrompt> = {};

        customPromptsArray.forEach((p: AIPrompt) => {
            customPrompts[p.id] = p;
        });

        // Merge defaults with custom overrides
        // If a custom prompt exists in DB, it completely overrides the default.
        const mergedPrompts = { ...DEFAULT_PROMPTS };

        for (const [id, customPrompt] of Object.entries(customPrompts)) {
            if (mergedPrompts[id]) {
                mergedPrompts[id] = { ...mergedPrompts[id], ...customPrompt };
            } else {
                // Ignore orphaned prompts in the DB that we don't know how to use
                console.warn(`[PromptRegistry] Found unknown prompt ID in DB: ${id}`);
            }
        }

        cachedPrompts = mergedPrompts;
        lastFetchTime = now;

        return cachedPrompts;
    } catch (error) {
        console.error("[PromptRegistry] Error loading prompts, falling back to defaults:", error);
        return DEFAULT_PROMPTS; // Safe fallback on error
    }
}

/**
 * Force invalidates the cache so the next call hits Firestore.
 * Call this immediately after an admin saves new prompt settings.
 */
export function invalidatePromptRegistry() {
    cachedPrompts = null;
    lastFetchTime = 0;
}

/**
 * Helper to get a single prompt template string by ID.
 * Optionally injects variables if provided as a record.
 * @param id The ID of the prompt (e.g., 'stylist', 'rank-summarize')
 * @param variables Optional key-value pairs to inject into the template (replaces {{key}} with value)
 */
export async function getPrompt(id: string, variables?: Record<string, string | number>): Promise<string> {
    const registry = await getPromptRegistry();
    const promptDef = registry[id];

    if (!promptDef) {
        throw new Error(`[PromptRegistry] Prompt ID '${id}' not found in registry.`);
    }

    if (!promptDef.isActive) {
        throw new Error(`[PromptRegistry] Prompt ID '${id}' is currently disabled by admin.`);
    }

    let templateText = promptDef.systemPrompt;

    // Simple template injection replacing {{key}} with value
    if (variables) {
        for (const [key, value] of Object.entries(variables)) {
            // Using global regex to replace all instances of {{key}}
            const regex = new RegExp(`{{${key}}}`, 'g');
            templateText = templateText.replace(regex, String(value));
        }
    }

    return templateText;
}
