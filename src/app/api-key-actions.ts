"use server";

/**
 * API Key Management Actions
 * 
 * Server actions for managing Gemini API keys in Prisma/PostgreSQL.
 */

import prisma from "@/lib/db";
import { Prisma } from "@prisma/client";
import { getAPIKeyManager, resetAPIKeyManager } from "@/lib/api-key-manager";
import { revalidatePath } from "next/cache";

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const GEMINI_MODEL = "gemini-2.0-flash";

// ==================== API KEY TYPES ====================

import { LLMProvider } from "@/types/assistant-types";

export interface StoredAPIKey {
    id: string;
    name: string;
    provider: LLMProvider;
    key: string;
    maskedKey: string;
    isActive: boolean;
    isValid: boolean | null;
    lastTested: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

// ==================== API KEY CRUD ====================

/**
 * Get all stored API keys
 */
export async function getAPIKeys(): Promise<StoredAPIKey[]> {
    try {
        const keys = await prisma.apiKey.findMany({
            orderBy: { createdAt: "desc" }
        });

        return keys.map((data) => ({
            id: data.id,
            name: data.name || `Key ${data.id.substring(0, 6)}`,
            provider: (data.provider as LLMProvider) || "google",
            key: data.key,
            maskedKey: maskKey(data.key),
            isActive: data.isActive,
            isValid: data.isValid,
            lastTested: data.lastTested,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
        }));
    } catch (error) {
        console.error("[getAPIKeys] Error:", error);
        return [];
    }
}

/**
 * Add a new API key
 */
export async function addAPIKey(name: string, key: string, provider: LLMProvider = "google") {
    try {
        if (!key || key.trim().length < 10) {
            return { success: false, error: "Invalid API key format" };
        }

        const trimmedKey = key.trim();

        const existing = await prisma.apiKey.findUnique({
            where: { key: trimmedKey }
        });

        if (existing) {
            return { success: false, error: "This API key already exists" };
        }

        const doc = await prisma.apiKey.create({
            data: {
                name: name.trim() || `Key ${Date.now()}`,
                provider,
                key: trimmedKey,
                isActive: true,
                isValid: null,
                lastTested: null,
            }
        });

        resetAPIKeyManager();
        revalidatePath("/admin/api-keys");

        return { success: true, id: doc.id };
    } catch (error) {
        console.error("[addAPIKey] Error:", error);
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}

/**
 * Update an existing API key
 */
export async function updateAPIKey(id: string, data: { name?: string; key?: string; provider?: LLMProvider; isActive?: boolean }) {
    try {
        const updateData: Prisma.ApiKeyUpdateInput = {};
        if (data.name !== undefined) updateData.name = data.name.trim();
        if (data.key !== undefined) {
            updateData.key = data.key.trim();
            updateData.isValid = null;
            updateData.lastTested = null;
        }
        if (data.provider !== undefined) updateData.provider = data.provider;
        if (data.isActive !== undefined) updateData.isActive = data.isActive;

        await prisma.apiKey.update({
            where: { id },
            data: updateData
        });

        resetAPIKeyManager();
        revalidatePath("/admin/api-keys");

        return { success: true };
    } catch (error) {
        console.error("[updateAPIKey] Prisma Error:", error);
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}

/**
 * Delete an API key
 */
export async function deleteAPIKey(id: string) {
    try {
        await prisma.apiKey.delete({
            where: { id }
        });

        resetAPIKeyManager();
        revalidatePath("/admin/api-keys");

        return { success: true };
    } catch (error) {
        console.error("[deleteAPIKey] Error:", error);
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}

// ==================== API KEY TESTING ====================

/**
 * Test if an API key is functional
 */
export async function testAPIKey(keyOrId: string, isId: boolean = false, providerStr?: string) {
    try {
        let apiKey = keyOrId;
        let provider: LLMProvider = (providerStr as LLMProvider) || "google";

        if (isId) {
            const doc = await prisma.apiKey.findUnique({
                where: { id: keyOrId }
            });
            if (!doc) {
                return { success: false, error: "API key not found", isValid: false };
            }
            apiKey = doc.key;
            provider = (doc.provider as LLMProvider) || "google";
        }

        if (!apiKey || apiKey.trim().length < 5) {
            return { success: false, error: "Invalid API key format", isValid: false };
        }

        let isValid = false;
        let errorMessage = "";
        let statusCode = 0;

        // Test based on provider
        if (provider === "google") {
            const url = `${GEMINI_API_BASE}/${GEMINI_MODEL}:generateContent?key=${apiKey.trim()}`;
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: "Hi" }] }],
                    generationConfig: { maxOutputTokens: 5 },
                }),
            });
            statusCode = response.status;
            isValid = response.ok;
            if (!isValid) {
                const data = await response.json().catch(() => ({}));
                errorMessage = data.error?.message || `HTTP ${statusCode}`;
            }
        } else if (provider === "openai") {
            const response = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey.trim()}`,
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: [{ role: "user", content: "Hi" }],
                    max_tokens: 5,
                }),
            });
            statusCode = response.status;
            isValid = response.ok;
            if (!isValid) {
                const data = await response.json().catch(() => ({}));
                errorMessage = data.error?.message || `HTTP ${statusCode}`;
            }
        } else if (provider === "anthropic") {
            const response = await fetch("https://api.anthropic.com/v1/messages", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": apiKey.trim(),
                    "anthropic-version": "2023-06-01"
                },
                body: JSON.stringify({
                    model: "claude-3-haiku-20240307",
                    messages: [{ role: "user", content: "Hi" }],
                    max_tokens: 5,
                }),
            });
            statusCode = response.status;
            isValid = response.ok;
            if (!isValid) {
                const errorText = await response.text();
                errorMessage = `HTTP ${statusCode} - ${errorText.substring(0, 100)}`;
            }
        } else if (provider === "groq") {
            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey.trim()}`,
                },
                body: JSON.stringify({
                    model: "llama3-8b-8192",
                    messages: [{ role: "user", content: "Hi" }],
                    max_tokens: 5,
                }),
            });
            statusCode = response.status;
            isValid = response.ok;
            if (!isValid) {
                const data = await response.json().catch(() => ({}));
                errorMessage = data.error?.message || `HTTP ${statusCode}`;
            }
        } else {
            return { success: false, error: "Unknown provider", isValid: false };
        }

        if (statusCode === 429) {
            isValid = true;
            errorMessage = "Rate limited (Key is valid)";
        }

        if (isId) {
            await prisma.apiKey.update({
                where: { id: keyOrId },
                data: {
                    isValid: isValid,
                    lastTested: new Date()
                }
            });
        }

        return {
            success: true,
            isValid: isValid,
            message: isValid ? "API key is working correctly" : errorMessage,
            statusCode: statusCode,
        };
    } catch (error) {
        console.error("[testAPIKey] Error:", error);

        if (isId) {
            try {
                await prisma.apiKey.update({
                    where: { id: keyOrId },
                    data: {
                        isValid: false,
                        lastTested: new Date()
                    }
                });
            } catch { /* ignore */ }
        }

        return {
            success: false,
            isValid: false,
            error: error instanceof Error ? error.message : "Network error",
        };
    }
}

// ==================== SYNC WITH API KEY MANAGER ====================

/**
 * Load active API keys from the database into the API Key Manager
 */
export async function syncAPIKeysToManager() {
    try {
        const snapshot = await prisma.apiKey.findMany({
            where: { isActive: true }
        });

        const keys = snapshot.map((data) => ({
            key: data.key,
            provider: (data.provider || "google") as LLMProvider,
            id: data.id
        })).filter(k => k.key && k.key.trim() !== "");

        const manager = getAPIKeyManager();
        manager.loadDatabaseKeys(keys);

        return { success: true, keyCount: keys.length };
    } catch (error) {
        console.error("[syncAPIKeysToManager] Error:", error);
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}

/**
 * Get the current health status of the API Key Manager
 */
export async function getAPIKeyManagerHealth() {
    // First sync keys from the database
    await syncAPIKeysToManager();

    const manager = getAPIKeyManager();
    return manager.getHealthStatus();
}

// ==================== HELPERS ====================

function maskKey(key: string): string {
    if (!key || key.length <= 8) return "****";
    return key.substring(0, 4) + "****" + key.substring(key.length - 4);
}
