import * as dotenv from 'dotenv';
import path from 'path';
import {
    summarizeReviews,
    generateDealExplanation,
    generateSocialProof
} from '../src/lib/llm-service';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function testPhase1() {
    console.log("--- Phase 1 AI Features Verification ---");

    // 1. Test Social Proof Generator
    console.log("\n1. Testing Social Proof Generator...");
    try {
        const socialProof = await generateSocialProof(
            { name: "Premium Leather Wallet", categoryId: "accessories", tags: ["leather", "luxury"] },
            { salesInLastMonth: 124, popularInCity: "Mumbai" }
        );
        console.log("✅ Result:", socialProof);
    } catch (e) {
        console.error("❌ Social Proof Failed:", e);
    }

    // 2. Test Deal Explainer
    console.log("\n2. Testing Deal Explainer...");
    try {
        const deal = await generateDealExplanation(
            {
                name: "Smart Avenue Noise Canceling Headphones",
                price: 2499,
                originalPrice: 4999,
                description: "Pro-level sound quality with 40h battery life."
            },
            "I want high quality audio for my daily commute."
        );
        console.log("✅ Result:", deal);
    } catch (e) {
        console.error("❌ Deal Explainer Failed:", e);
    }

    // 3. Test Review Summarizer
    console.log("\n3. Testing Review Summarizer...");
    try {
        const reviews = [
            { rating: 5, comment: "Amazing battery life and very comfortable." },
            { rating: 4, comment: "Sound is great but the charging cable is a bit short." },
            { rating: 5, comment: "Best headphones I've owned at this price point." },
            { rating: 2, comment: "Connection drops occasionally when far from phone." }
        ];
        const summary = await summarizeReviews("Smart Avenue Headphones", reviews);
        console.log("✅ Result:", JSON.stringify(summary, null, 2));
    } catch (e) {
        console.error("❌ Review Summarizer Failed:", e);
    }

    console.log("\n--- Verification Complete ---");
}

testPhase1().catch(console.error);
