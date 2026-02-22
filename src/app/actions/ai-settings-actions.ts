"use server";

import { revalidatePath } from "next/cache";
import { invalidateAIConfig } from "@/lib/ai-config";

// ==================== AI SETTINGS TYPES ====================

export interface AISettings {
    enabled: boolean;
    personaName: string;
    greeting: string;
    systemPrompt: string;
    temperature: number;
    maxTokens: number;
    providerPriority: "groq" | "google" | "auto";
    maxRecommendations: number;
    enableVoiceInput: boolean;
    enableProductRequests: boolean;
    updatedAt?: Date;
}

const DEFAULT_AI_SETTINGS: AISettings = {
    enabled: true,
    personaName: "Genie",
    greeting: "Hi, I'm Genie, your personal Shopping Master! 🧞‍♂️ How can I help you today? Would you like me to curate some amazing products for you?",
    systemPrompt: "You are Genie, a charming and helpful AI Shopping Master at Smart Avenue. You help customers find products, give styling advice, and provide excellent shopping assistance. Be friendly, knowledgeable, and persuasive. Support English, Hindi, and Hinglish.",
    temperature: 0.7,
    maxTokens: 2048,
    providerPriority: "auto",
    maxRecommendations: 5,
    enableVoiceInput: false,
    enableProductRequests: true,
};

// ==================== SERVER ACTIONS ====================

import { getBlobJson, updateBlobJson } from "./blob-json";

const BLOB_FILENAME = "llmo.json";

/**
 * Get AI settings from Vercel Blob (admin use)
 */
export async function getAISettings(): Promise<AISettings> {
    const data = await getBlobJson<Partial<AISettings>>(BLOB_FILENAME, DEFAULT_AI_SETTINGS);
    return {
        ...DEFAULT_AI_SETTINGS,
        ...data,
    };
}

/**
 * Update AI settings in Vercel Blob (admin use)
 */
export async function updateAISettings(data: Partial<AISettings>): Promise<{ success: boolean; error?: string }> {
    try {
        // Validate temperature range
        if (data.temperature !== undefined && (data.temperature < 0 || data.temperature > 2)) {
            return { success: false, error: "Temperature must be between 0 and 2" };
        }

        // Validate maxTokens
        if (data.maxTokens !== undefined && (data.maxTokens < 256 || data.maxTokens > 8192)) {
            return { success: false, error: "Max tokens must be between 256 and 8192" };
        }

        const currentSettings = await getAISettings();
        const newSettings = {
            ...currentSettings,
            ...data,
            updatedAt: new Date()
        };

        const result = await updateBlobJson(BLOB_FILENAME, newSettings);

        if (!result.success) {
            throw new Error(result.error || "Failed to save to Blob");
        }

        revalidatePath("/admin/ai-settings");

        // Invalidate cached AI config so next LLM call picks up new settings
        invalidateAIConfig();

        return { success: true };
    } catch (error: unknown) {
        console.error("[AI Settings] Error updating:", error);
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}

/**
 * Get public-facing AI settings (for the frontend chat widget)
 * Only returns fields safe for the client
 */
export async function getPublicAISettings(): Promise<{
    enabled: boolean;
    personaName: string;
    greeting: string;
    enableVoiceInput: boolean;
    enableProductRequests: boolean;
}> {
    try {
        const settings = await getAISettings();
        return {
            enabled: settings.enabled,
            personaName: settings.personaName,
            greeting: settings.greeting,
            enableVoiceInput: settings.enableVoiceInput,
            enableProductRequests: settings.enableProductRequests,
        };
    } catch (error) {
        console.error("[AI Settings] Error fetching public settings:", error);
        return {
            enabled: true,
            personaName: "Genie",
            greeting: DEFAULT_AI_SETTINGS.greeting,
            enableVoiceInput: false,
            enableProductRequests: true,
        };
    }
}
