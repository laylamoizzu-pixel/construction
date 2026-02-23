
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Mock request body
const requestBody = {
    query: "Show me some trending electronics",
    messages: [],
    maxResults: 3
};

async function testRecommendationAPI() {
    console.log('--- Testing Recommendation API Failover ---');
    console.log('Note: This will call your local/remote API and should trigger fallback to Groq since GEMINI_API_KEY_1 is leaked.');

    try {
        // Since we are running in a node environment, we can't easily call the Next.js API route directly without a server running.
        // However, we can import the recommendation engine logic and test it directly!

        // Dynamic import to avoid issues with Next.js specific imports if possible
        // But recommendation-engine.ts imports from @/app/actions which uses Prisma...

        // Plan: Just check if the site is now returning healthy responses via a simple curl to the health endpoint first
        // and then try to hit the recommend endpoint if it's available.

        const healthUrl = "https://smartavenue.vercel.app/api/assistant/health";
        console.log(`Checking health at ${healthUrl}...`);
        const healthResponse = await fetch(healthUrl);
        const healthData = await healthResponse.json();
        console.log('Health Data:', JSON.stringify(healthData, null, 2));

        // If you want to test the logic locally without a full server, we can try to run a script that uses the fixed llm-service.
    } catch (e) {
        console.error('Test failed:', e);
    }
}

testRecommendationAPI();
