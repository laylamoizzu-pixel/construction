import * as dotenv from 'dotenv';
import path from 'path';
import { getAPIKeyManager } from '../src/lib/api-key-manager.js';
import { LLMProvider } from '../src/types/assistant-types.js';




// Load environment variables from .env.local
dotenv.config(); // Loads .env by default
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') }); // Also try .env.local


async function verifyRotation() {
    console.log("--- API Key Rotation Verification ---");

    const manager = getAPIKeyManager();
    const groqKeys = (manager as any).keys.filter((k: any) => k.provider === 'groq');

    console.log(`Found ${groqKeys.length} Groq keys in manager.`);

    if (groqKeys.length === 0) {
        console.error("No Groq keys found! Check your .env.local file.");
        return;
    }

    // 1. Test each key individually
    console.log("\n1. Testing individual keys:");
    for (const keyConfig of groqKeys) {
        const masked = keyConfig.key.substring(0, 8) + "..." + keyConfig.key.substring(keyConfig.key.length - 4);
        console.log(`Testing Key ${keyConfig.index}: ${masked}`);

        try {
            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${keyConfig.key}`
                },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile",
                    messages: [{ role: "user", content: "Hi" }],
                    max_tokens: 5
                }),
            });

            if (response.ok) {
                console.log(`✅ Key ${keyConfig.index} is WORKING.`);
                manager.markKeySuccess(keyConfig.key);
            } else {
                const err = await response.text();
                console.error(`❌ Key ${keyConfig.index} FAILED: ${response.status} ${response.statusText}`);
                console.error(`   Error details: ${err}`);
                manager.markKeyFailed(keyConfig.key);
            }
        } catch (error) {
            console.error(`❌ Key ${keyConfig.index} encountered an UNEXPECTED error:`, error);
            manager.markKeyFailed(keyConfig.key);
        }
    }

    // 2. Test Rotation Logic
    console.log("\n2. Testing Rotation Logic:");

    // Get status before simulation
    let status = manager.getHealthStatus();
    let currentKey = manager.getActiveKey('groq');
    console.log(`Initial active key: ${currentKey.substring(0, 8)}...`);

    // Simulate rate limiting on the current active key
    console.log(`Simulating rate limit on current active key...`);
    manager.markKeyRateLimited(currentKey);

    try {
        const nextKey = manager.getActiveKey('groq');
        console.log(`New active key after rotation: ${nextKey.substring(0, 8)}...`);

        if (nextKey !== currentKey) {
            console.log("✅ Rotation detected! The manager switched to a different key.");
        } else {
            console.error("❌ Rotation FAILED! The manager returned the same key.");
        }
    } catch (error) {
        console.error("❌ Error getting next active key:", error);
    }

    // 3. Final Health Check
    console.log("\n3. Final Health Check Status:");
    status = manager.getHealthStatus();
    status.keys.filter(k => k.provider === 'groq').forEach((k: any) => {
        console.log(`Key ${k.index}: Healthy=${k.isHealthy}, RateLimited=${k.rateLimited}, Cooldown=${k.cooldownRemaining}s, Active=${k.isActive}`);
    });

    console.log("\n--- Verification Complete ---");
}

verifyRotation().catch(console.error);
