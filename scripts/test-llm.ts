
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function testGroq(key: string, name: string) {
    if (!key) return;
    console.log(`Testing ${name} with key: ${key.substring(0, 10)}...`);
    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${key}`,
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [{ role: "user", content: "Hi" }],
                max_tokens: 5,
            }),
        });

        if (response.ok) {
            const data = await response.json();
            console.log(`✅ ${name} Success:`, data.choices[0].message.content);
            return true;
        } else {
            console.log(`❌ ${name} Failed:`, response.status, await response.text());
            return false;
        }
    } catch (e) {
        console.log(`❌ ${name} Exception:`, e);
        return false;
    }
}

async function testGemini(key: string, name: string) {
    if (!key) return;
    console.log(`Testing ${name} with key: ${key.substring(0, 10)}...`);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`;
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: "Hi" }] }],
                generationConfig: { maxOutputTokens: 5 },
            }),
        });

        if (response.ok) {
            const data = await response.json();
            console.log(`✅ ${name} Success:`, data.candidates[0].content.parts[0].text);
            return true;
        } else {
            console.log(`❌ ${name} Failed:`, response.status, await response.text());
            return false;
        }
    } catch (e) {
        console.log(`❌ ${name} Exception:`, e);
        return false;
    }
}

async function run() {
    console.log('--- Starting Comprehensive LLM Connectivity Tests ---');

    await testGemini(process.env.GEMINI_API_KEY_1 || '', 'GEMINI_API_KEY_1');

    await testGroq(process.env.GROQ_API_KEY_1 || '', 'GROQ_API_KEY_1');
    await testGroq(process.env.GROQ_API_KEY_2 || '', 'GROQ_API_KEY_2');
    await testGroq(process.env.GROQ_API_KEY_3 || '', 'GROQ_API_KEY_3');
    await testGroq(process.env.GROQ_API_KEY_4 || '', 'GROQ_API_KEY_4');

    console.log('--- Tests Finished ---');
}

run();
