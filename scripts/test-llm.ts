
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Helper to mock the context if needed, but we'll try to import the service directly
// We need to handle the fact that we can't easily import from src/ without tsconfig-paths registration
// So we'll run this with `npx tsx scripts/test-llm.ts` which should handle paths if configured, 
// OR we rely on relative imports if we were inside src.
// Since we are in scripts/, we might need to adjust imports or use tsconfig-paths.
// Just to be safe, I'm using relative path assumption or alias provided by tsx.

import { analyzeIntent, rankAndSummarize } from '../src/lib/llm-service';
import { Product } from '../src/app/actions';

async function main() {
    console.log("Starting LLM Test...");

    // 1. Test Intent Analysis
    console.log("\n--- Testing Intent Analysis (Groq) ---");
    const query = "I am looking for a running shoe under 5000";
    const categories = [
        { id: "cat_shoes", name: "Shoes", description: "Footwear", image: "", parentId: null },
        { id: "cat_electronics", name: "Electronics", description: "Gadgets", image: "", parentId: null }
    ];

    try {
        const intent = await analyzeIntent(query, categories); // Should use default (Groq)
        console.log("Intent Result:", JSON.stringify(intent, null, 2));
    } catch (error) {
        console.error("Intent Analysis Failed:", error);
    }

    // 2. Test Rank & Summarize
    console.log("\n--- Testing Rank & Summarize (Groq) ---");
    const products: Product[] = [
        {
            id: "p1", name: "SpeedRunner 3000", description: "High performance running shoe",
            price: 4500, categoryId: "cat_shoes", images: [], tags: ["running", "sports"],
            available: true, featured: false, createdAt: new Date(), updatedAt: new Date()
        },
        {
            id: "p2", name: "ComfyWalker", description: "Casual walking shoe",
            price: 2000, categoryId: "cat_shoes", images: [], tags: ["walking", "casual"],
            available: true, featured: false, createdAt: new Date(), updatedAt: new Date()
        },
        {
            id: "p3", name: "ProLaptop X", description: "Gaming laptop",
            price: 80000, categoryId: "cat_electronics", images: [], tags: ["gaming", "computer"],
            available: true, featured: false, createdAt: new Date(), updatedAt: new Date()
        }
    ];

    try {
        // We'll mock the intent for this second call
        const mockIntent = {
            category: "cat_shoes",
            subcategory: null,
            requirements: ["running", "under 5000"],
            budgetMin: null,
            budgetMax: 5000,
            preferences: [],
            useCase: "running",
            confidence: 0.9
        };

        const result = await rankAndSummarize(query, products, mockIntent);
        console.log("Rank & Summary Result:", JSON.stringify(result, null, 2));
    } catch (error) {
        console.error("Rank & Summarize Failed:", error);
    }
}

main().catch(console.error);
