import * as dotenv from 'dotenv';
import path from 'path';
import { getAPIKeyManager } from '../src/lib/api-key-manager';
import { LLMProvider } from '../src/types/assistant-types';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function verifyAllKeys() {
    console.log("--- 🚀 Comprehensive AI API Key Verification ---");

    const manager = getAPIKeyManager();
    // Use type assertion to access private 'keys' for testing purposes
    const allKeys = (manager as any).keys;

    console.log(`Initialized manager with ${allKeys.length} total keys.\n`);

    if (allKeys.length === 0) {
        console.error("❌ No keys found! Ensure .env.local is populated and paths are correct.");
        return;
    }

    const providers: LLMProvider[] = ['groq', 'google'];

    for (const provider of providers) {
        const providerKeys = allKeys.filter((k: any) => k.provider === provider);
        console.log(`\n--- Provider: ${provider.toUpperCase()} (${providerKeys.length} keys) ---`);

        if (providerKeys.length === 0) {
            console.log(`No keys configured for ${provider}.`);
            continue;
        }

        for (const keyConfig of providerKeys) {
            const masked = keyConfig.key.substring(0, 8) + "..." + keyConfig.key.substring(keyConfig.key.length - 4);
            process.stdout.write(`Testing Key ${keyConfig.index} (${masked})... `);

            try {
                let response: Response;
                if (provider === 'groq') {
                    response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${keyConfig.key}`
                        },
                        body: JSON.stringify({
                            model: "openai/gpt-oss-120b",
                            messages: [{ role: "user", content: "how are you" }],
                            max_tokens: 100
                        }),
                    });
                } else {
                    // Gemini
                    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${keyConfig.key}`;
                    response = await fetch(url, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            contents: [{ parts: [{ text: "Hi" }] }],
                            generationConfig: { maxOutputTokens: 5 },
                        }),
                    });
                }

                if (response.ok) {
                    console.log(`✅ WORKING`);
                } else {
                    const err = await response.text();
                    console.log(`❌ FAILED (${response.status} ${response.statusText})`);
                    try {
                        const parsedErr = JSON.parse(err);
                        console.error(`   Error details: ${JSON.stringify(parsedErr, null, 2)}`);
                    } catch {
                        console.error(`   Error details: ${err}`);
                    }
                }
            } catch (error) {
                console.log(`❌ ERROR`);
                console.error(`   Unexpected error:`, error);
            }
        }
    }

    console.log("\n--- Verification Complete ---");
}

verifyAllKeys().catch(console.error);
