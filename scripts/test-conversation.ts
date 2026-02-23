
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function testAssistant(query: string) {
    console.log(`\n--- Testing Assistant with: "${query}" ---`);
    const url = "http://localhost:3000/api/assistant/recommend";

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                query: query,
                messages: [],
                maxResults: 3
            }),
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Assistant Response:', data.summary);
        } else {
            console.log('Failed:', response.status, await response.text());
        }
    } catch (e) {
        console.error('Error:', e);
    }
}

async function run() {
    await testAssistant("hy");
    await testAssistant("assalam walaiku");
    await testAssistant("namastai");
}

run();
