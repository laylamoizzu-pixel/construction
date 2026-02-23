/**
 * API Key Manager with Multi-Provider Support
 * 
 * Manages multiple API keys for different providers (Google, OpenAI, Anthropic)
 * with automatic rotation, rate limit detection, and health monitoring.
 * 
 * Keys can be loaded from:
 * 1. Environment variables (GEMINI_API_KEY_*, OPENAI_API_KEY, ANTHROPIC_API_KEY)
 * 2. Database (Prisma/PostgreSQL) - managed via admin UI
 */

import {
    APIKeyConfig,
    APIKeyManagerStatus,
    KeyHealthStatus,
    APIKeyExhaustedError,
    LLMProvider
} from "@/types/assistant-types";




// Cooldown duration in milliseconds after a key is rate-limited
const RATE_LIMIT_COOLDOWN_MS = 60 * 1000; // 1 minute

// Cooldown duration after consecutive errors
const ERROR_COOLDOWN_MS = 30 * 1000; // 30 seconds

// Max consecutive errors before key cooldown
const MAX_CONSECUTIVE_ERRORS = 3;

// Cache duration for database keys
const DATABASE_CACHE_MS = 60 * 1000; // 1 minute

export interface KeyInfo {
    key: string;
    id?: string;
    provider: LLMProvider;
}

class APIKeyManager {
    private keys: APIKeyConfig[] = [];
    private activeKeyIndex: Record<LLMProvider, number> = {
        google: 0,
        openai: 0,
        anthropic: 0,
        groq: 0
    };
    private lastRotation: Date | null = null;
    private initialized: boolean = false;
    private lastDatabaseLoad: Date | null = null;
    private databaseKeys: KeyInfo[] = [];

    constructor() {
        this.initializeFromEnv();
    }

    private initializeFromEnv(): void {
        if (this.initialized) return;

        const envKeys: KeyInfo[] = [];

        // Google Gemini keys
        [
            process.env.GEMINI_API_KEY_1,
            process.env.GEMINI_API_KEY_2,
            process.env.GEMINI_API_KEY_3,
        ].forEach((key, index) => {
            if (key && key.trim() !== "") {
                envKeys.push({ key: key.trim(), provider: "google", id: `env-google-${index + 1}` });
            }
        });

        // OpenAI keys
        if (process.env.OPENAI_API_KEY) {
            envKeys.push({ key: process.env.OPENAI_API_KEY.trim(), provider: "openai", id: "env-openai" });
        }

        // Anthropic keys
        if (process.env.ANTHROPIC_API_KEY) {
            envKeys.push({ key: process.env.ANTHROPIC_API_KEY.trim(), provider: "anthropic", id: "env-anthropic" });
        }

        // Groq keys - support GROQ_API_KEY_1 through GROQ_API_KEY_10 for rotation
        const groqKeyNames = [
            "GROQ_API_KEY",  // backward compat with single key
            "GROQ_API_KEY_1", "GROQ_API_KEY_2", "GROQ_API_KEY_3",
            "GROQ_API_KEY_4", "GROQ_API_KEY_5", "GROQ_API_KEY_6",
            "GROQ_API_KEY_7", "GROQ_API_KEY_8", "GROQ_API_KEY_9",
            "GROQ_API_KEY_10",
        ];
        const seenGroqKeys = new Set<string>();
        groqKeyNames.forEach(name => {
            const val = process.env[name];
            if (val && val.trim() !== "" && !seenGroqKeys.has(val.trim())) {
                seenGroqKeys.add(val.trim());
                envKeys.push({ key: val.trim(), provider: "groq", id: `env-groq-${name}` });
            }
        });

        this.rebuildKeyList(envKeys, this.databaseKeys);
        this.initialized = true;

        if (this.keys.length === 0) {
            console.warn("[APIKeyManager] No API keys configured from env. Keys may be loaded from Firestore.");
        } else {
            console.log(`[APIKeyManager] Initialized with ${this.keys.length} API key(s) from env`);
        }
    }

    /**
     * Load keys from the database (to be called externally with database data)
     */
    public loadDatabaseKeys(keys: KeyInfo[]): void {
        const validKeys = keys.filter(k => k.key && k.key.trim() !== "");

        // Simple check for changes
        const currentKeysJson = JSON.stringify(this.databaseKeys);
        const newKeysJson = JSON.stringify(validKeys);

        if (currentKeysJson !== newKeysJson) {
            console.log(`[APIKeyManager] Loading ${validKeys.length} key(s) from database`);
            this.databaseKeys = validKeys;
            this.lastDatabaseLoad = new Date();

            // Re-read env keys to merge
            const envKeys: KeyInfo[] = [];

            [
                process.env.GEMINI_API_KEY_1,
                process.env.GEMINI_API_KEY_2,
                process.env.GEMINI_API_KEY_3,
            ].forEach((key, index) => {
                if (key && key.trim() !== "") {
                    envKeys.push({ key: key.trim(), provider: "google", id: `env-google-${index + 1}` });
                }
            });

            if (process.env.OPENAI_API_KEY) {
                envKeys.push({ key: process.env.OPENAI_API_KEY.trim(), provider: "openai", id: "env-openai" });
            }

            if (process.env.ANTHROPIC_API_KEY) {
                envKeys.push({ key: process.env.ANTHROPIC_API_KEY.trim(), provider: "anthropic", id: "env-anthropic" });
            }

            // Groq keys - support GROQ_API_KEY_1 through GROQ_API_KEY_10 for rotation
            const groqKeyNames = [
                "GROQ_API_KEY",
                "GROQ_API_KEY_1", "GROQ_API_KEY_2", "GROQ_API_KEY_3",
                "GROQ_API_KEY_4", "GROQ_API_KEY_5", "GROQ_API_KEY_6",
                "GROQ_API_KEY_7", "GROQ_API_KEY_8", "GROQ_API_KEY_9",
                "GROQ_API_KEY_10",
            ];
            const seenGroqKeys = new Set<string>();
            groqKeyNames.forEach(name => {
                const val = process.env[name];
                if (val && val.trim() !== "" && !seenGroqKeys.has(val.trim())) {
                    seenGroqKeys.add(val.trim());
                    envKeys.push({ key: val.trim(), provider: "groq", id: `env-groq-${name}` });
                }
            });

            this.rebuildKeyList(envKeys, validKeys);
        }
    }

    private rebuildKeyList(envKeys: KeyInfo[], databaseKeys: KeyInfo[]): void {
        // Combine keys, avoiding duplicates (based on key string)
        const allKeysMap = new Map<string, KeyInfo>();

        // Database keys take precedence
        databaseKeys.forEach(k => allKeysMap.set(k.key, k));

        // Add env keys if not already present
        envKeys.forEach(k => {
            if (!allKeysMap.has(k.key)) {
                allKeysMap.set(k.key, k);
            }
        });

        const keyInfos = Array.from(allKeysMap.values());

        // Preserve existing key state
        const existingKeyMap = new Map(this.keys.map(k => [k.key, k]));

        this.keys = keyInfos.map((info, index) => {
            const existing = existingKeyMap.get(info.key);
            if (existing) {
                return { ...existing, index, provider: info.provider };
            }
            return {
                key: info.key,
                id: info.id,
                provider: info.provider,
                index,
                callCount: 0,
                lastUsed: null,
                errorCount: 0,
                consecutiveErrors: 0,
                rateLimited: false,
                cooldownUntil: null,
            };
        });

        console.log(`[APIKeyManager] Total keys available: ${this.keys.length}`);
    }

    /**
     * Check if database cache needs refresh
     */
    public needsDatabaseRefresh(): boolean {
        if (!this.lastDatabaseLoad) return true;
        return Date.now() - this.lastDatabaseLoad.getTime() > DATABASE_CACHE_MS;
    }

    /**
     * Get the current active API key for a specific provider
     */
    public getActiveKey(provider: LLMProvider): string {
        const providerKeys = this.keys.filter(k => k.provider === provider);

        if (providerKeys.length === 0) {
            throw new APIKeyExhaustedError(`No API keys configured for provider: ${provider}`);
        }

        // Find a healthy key for this provider
        const healthyKey = this.findHealthyKey(provider);
        if (!healthyKey) {
            throw new APIKeyExhaustedError(`All ${provider} API keys are exhausted or rate-limited or in cooldown`);
        }

        return healthyKey.key;
    }

    /**
     * Find the next healthy key for a provider
     */
    private findHealthyKey(provider: LLMProvider): APIKeyConfig | null {
        const now = new Date();
        const providerKeys = this.keys.filter(k => k.provider === provider);

        if (providerKeys.length === 0) return null;

        // Try to continue employing the current active key for this provider
        // Note: we're using a simple round-robin or sticky strategy here
        // Note: we're using a simple round-robin or sticky strategy here

        // Find the index in the providerKeys array that corresponds to the active key
        // This is tricky because indices are global.

        // Let's just iterate through all provider keys and find the first healthy one
        // We can optimize rotation later if needed.

        for (const key of providerKeys) {
            if (this.isKeyHealthy(key, now)) {
                this.activeKeyIndex[provider] = key.index;
                return key;
            }
        }

        // Check for cooldown recovery
        for (const key of providerKeys) {
            if (key.cooldownUntil && key.cooldownUntil <= now) {
                key.cooldownUntil = null;
                key.rateLimited = false;
                key.consecutiveErrors = 0;

                this.activeKeyIndex[provider] = key.index;
                return key;
            }
        }

        return null;
    }

    private isKeyHealthy(key: APIKeyConfig, now: Date): boolean {
        if (key.cooldownUntil && key.cooldownUntil > now) return false;
        if (key.rateLimited) return false;
        if (key.errorCount > 10 && key.consecutiveErrors > 5) return false; // Soft disable bugged keys
        return true;
    }

    public markKeySuccess(key: string): void {
        const keyConfig = this.keys.find(k => k.key === key);
        if (keyConfig) {
            keyConfig.callCount++;
            keyConfig.lastUsed = new Date();
            keyConfig.consecutiveErrors = 0;
        }
    }

    public markKeyFailed(key: string): void {
        const keyConfig = this.keys.find(k => k.key === key);
        if (keyConfig) {
            keyConfig.errorCount++;
            keyConfig.consecutiveErrors++;
            keyConfig.lastUsed = new Date();

            if (keyConfig.consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
                console.warn(`[APIKeyManager] Key ${keyConfig.index} (${keyConfig.provider}) reached max consecutive errors, entering cooldown`);
                keyConfig.cooldownUntil = new Date(Date.now() + ERROR_COOLDOWN_MS);
            }
        }
    }

    public markKeyRateLimited(key: string): void {
        const keyConfig = this.keys.find(k => k.key === key);
        if (keyConfig) {
            console.warn(`[APIKeyManager] Key ${keyConfig.index} (${keyConfig.provider}) rate-limited, entering cooldown`);
            keyConfig.rateLimited = true;
            keyConfig.cooldownUntil = new Date(Date.now() + RATE_LIMIT_COOLDOWN_MS);
            keyConfig.lastUsed = new Date();
        }
    }

    public markKeyInvalid(key: string): void {
        const keyConfig = this.keys.find(k => k.key === key);
        if (keyConfig) {
            console.error(`[APIKeyManager] Key ${keyConfig.index} (${keyConfig.provider}) marked as INVALID/LEAKED`);
            keyConfig.errorCount = 999;
            keyConfig.consecutiveErrors = 999;
            keyConfig.cooldownUntil = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year cooldown
            keyConfig.lastUsed = new Date();
        }
    }

    public getHealthStatus(): APIKeyManagerStatus {
        const now = new Date();

        return {
            totalKeys: this.keys.length,
            // Just returning 0 or a valid index to satisfy the interface, 
            // the UI might need updates to show per-provider status properly
            activeKeyIndex: 0,
            lastRotation: this.lastRotation,
            keys: this.keys.map((key): KeyHealthStatus => ({
                index: key.index,
                provider: key.provider,
                maskedKey: this.maskKey(key.key),
                callCount: key.callCount,
                isActive: this.activeKeyIndex[key.provider] === key.index,
                isHealthy: this.isKeyHealthy(key, now),
                rateLimited: key.rateLimited,
                cooldownRemaining: key.cooldownUntil
                    ? Math.max(0, Math.ceil((key.cooldownUntil.getTime() - now.getTime()) / 1000))
                    : null,
                id: key.id
            })),
        };
    }

    private maskKey(key: string): string {
        if (key.length <= 8) return "****";
        return key.substring(0, 4) + "****" + key.substring(key.length - 4);
    }

    public hasKeys(provider: LLMProvider): boolean {
        return this.keys.some(k => k.provider === provider);
    }

    public hasAnyKeys(): boolean {
        return this.keys.length > 0;
    }

    public getKeyCount(): number {
        return this.keys.length;
    }

    public invalidateCache(): void {
        this.lastDatabaseLoad = null;
    }
}

let apiKeyManagerInstance: APIKeyManager | null = null;

export function getAPIKeyManager(): APIKeyManager {
    if (!apiKeyManagerInstance) {
        apiKeyManagerInstance = new APIKeyManager();
    }
    return apiKeyManagerInstance;
}

export function resetAPIKeyManager(): void {
    if (apiKeyManagerInstance) {
        apiKeyManagerInstance.invalidateCache();
    }
}

export { APIKeyManager };
