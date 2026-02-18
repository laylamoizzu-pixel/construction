
import * as dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from 'url';
import fetch from "node-fetch";

// Fix for __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
const envPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

async function testVision() {
    // Dynamic import
    const { callVisionAPI } = await import("../src/lib/llm-service");

    console.log("----------------------------------------------------------------");
    console.log("👁️ STARTING VISUAL SEARCH TEST");
    console.log("----------------------------------------------------------------");

    try {
        // 1. Use a known public image URL for testing (Headphones)
        const TEST_IMAGE_URL = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80";
        console.log(`Testing with external image: ${TEST_IMAGE_URL}`);

        // 2. Fetch image
        const stats = await fetch(TEST_IMAGE_URL);
        const buffer = await stats.arrayBuffer();
        const base64 = Buffer.from(buffer).toString("base64");
        const dataUrl = `data:image/jpeg;base64,${base64}`;

        console.log(`Image converted to base64 (${base64.length} chars)`);

        // 3. Call Vision API
        const start = Date.now();
        console.log("Calling Groq Vision API...");
        const keywords = await callVisionAPI(dataUrl);
        const duration = Date.now() - start;

        console.log(`⏱️ Duration: ${duration}ms`);
        console.log("✅ Result Keywords:", keywords);

        if (!keywords || keywords.length < 3) {
            throw new Error("Invalid or empty response from Vision API");
        }

    } catch (error) {
        console.error("❌ Visual Search Test Failed:", error);
        process.exit(1);
    }
}

testVision();
