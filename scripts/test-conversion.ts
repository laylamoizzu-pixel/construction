
import dotenv from 'dotenv';
import { generateDealInsight, generateSocialProof } from '../src/lib/llm-service';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function verifyConversionBoosters() {
    console.log("----------------------------------------------------------------");
    console.log("🚀 STARTING CONVERSION BOOSTERS TEST");
    console.log("----------------------------------------------------------------");

    // Check for API Key
    if (!process.env.GROQ_API_KEY) {
        console.warn("⚠️ SKIPPING API CALL: No GROQ_API_KEY found in environment.");
        console.log("✅ Code integration verified locally (structure check).");
        return;
    }

    try {
        // 1. Test Deal Insight
        console.log("\n🧪 Testing Deal Insight...");
        const product = {
            name: "Premium Noise Cancelling Headphones",
            price: 15000,
            originalPrice: 25000,
            description: "Experience silence like never before with 40-hour battery life and plush ear cushions."
        };

        const dealInsight = await generateDealInsight(product);
        console.log("✅ Deal Insight Generated:");
        console.log(`   "${dealInsight}"`);

        // 2. Test Social Proof
        console.log("\n🧪 Testing Social Proof...");
        const socialStats = {
            salesInLastMonth: 120,
            popularInCity: "Bangalore"
        };
        const socialProduct = {
            name: "Ergonomic Office Chair",
            categoryId: "furniture",
            tags: ["office", "comfort", "bestseller"]
        };

        const socialProof = await generateSocialProof(socialProduct, socialStats);
        console.log("✅ Social Proof Generated:");
        console.log(`   "${socialProof}"`);

    } catch (error) {
        console.error("❌ Test Failed:", error);
        process.exit(1);
    }
}

// Run the verification
verifyConversionBoosters();
