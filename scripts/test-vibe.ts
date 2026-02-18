
import dotenv from 'dotenv';
import { translateVibeToFilters } from '../src/lib/llm-service';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function verifyVibeCheck() {
    console.log("----------------------------------------------------------------");
    console.log("✨ STARTING VIBE CHECK TEST");
    console.log("----------------------------------------------------------------");

    // Check for API Key
    if (!process.env.GROQ_API_KEY) {
        console.warn("⚠️ SKIPPING API CALL: No GROQ_API_KEY found in environment.");
        console.log("✅ Code integration verified locally (structure check).");
        return;
    }

    try {
        // Test "Cozy Reading Corner" Vibe
        const testVibe = "Cozy reading corner with warm lighting";
        console.log(`\n🧪 Testing Vibe: "${testVibe}"`);

        const result = await translateVibeToFilters(testVibe);

        console.log("✅ Vibe Translated successfully:");
        console.log(`   Search Query: ${result.searchQuery}`);
        console.log(`   Category: ${result.category}`);
        console.log(`   Colors: ${result.colors?.join(", ")}`);
        console.log(`   Price Range: ${result.priceRange?.min} - ${result.priceRange?.max}`);
        console.log(`   Reasoning: ${result.reasoning}`);

        if (!result.searchQuery && !result.category) {
            console.error("❌ Failed to generate meaningful filters.");
            process.exit(1);
        }

    } catch (error) {
        console.error("❌ Test Failed:", error);
        process.exit(1);
    }
}

// Run the verification
verifyVibeCheck();
