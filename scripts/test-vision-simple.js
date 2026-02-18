const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const apiKey = "AIzaSyArWDz-BQcYPC7GUOMFReqkma0TuDCxQPM";
const apiBase = "https://generativelanguage.googleapis.com/v1beta";
const model = "gemini-1.5-flash";

async function testVision() {
    console.log(`🚀 Testing Gemini Vision API (${model})...`);

    if (!apiKey) {
        console.error("❌ Error: GEMINI_API_KEY_1 not found in .env.local");
        process.exit(1);
    }

    const url = `${apiBase}/models/${model}:generateContent?key=${apiKey}`;

    // 1x1 transparent PNG
    const minimalImage = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";

    try {
        console.log("📡 Calling Vision API...");

        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: "Identify what is in this image. Keep it very short." },
                        {
                            inline_data: {
                                mime_type: "image/png",
                                data: minimalImage
                            }
                        }
                    ]
                }],
                generationConfig: { maxOutputTokens: 50 },
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API Request failed: ${response.status} ${response.statusText}\n${errorText}`);
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        console.log("\n✅ Success! Gemini Response:");
        console.log("----------------------------");
        console.log(text || "No text in response");
        console.log("----------------------------");

    } catch (error) {
        console.error("\n❌ Error during test:");
        console.error(error.message);
        process.exit(1);
    }
}

testVision();
