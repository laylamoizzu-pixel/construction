import fs from 'fs';
import path from 'path';
import { callVisionAPI } from '../src/lib/llm-service';

async function testGeminiVision() {
    console.log("🚀 Testing Gemini Vision API...");

    try {
        // We'll use a very small base64 pixel as a minimal test image 
        // to avoid dependency on an external file for the first check.
        // This is a 1x1 transparent PNG.
        const minimalImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";

        console.log("📡 Calling Vision API with minimal image...");
        const result = await callVisionAPI(minimalImage);

        console.log("\n✅ Success! Gemini Response:");
        console.log("----------------------------");
        console.log(result);
        console.log("----------------------------");

    } catch (error) {
        console.error("\n❌ Error during Vision API test:");
        console.error(error instanceof Error ? error.message : error);

        if (error instanceof Error && error.stack) {
            console.error("\nStack Trace:");
            console.error(error.stack);
        }
        process.exit(1);
    }
}

testGeminiVision();
