
import fs from 'fs';
import path from 'path';
import type { Product } from '../src/app/actions';

// Load environment variables from .env.local manually
try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
        const envConfig = fs.readFileSync(envPath, 'utf8');
        envConfig.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                const value = match[2].trim().replace(/^["']|["']$/g, '');
                process.env[key] = value;
            }
        });
        console.log("Loaded .env.local properties:", Object.keys(process.env).filter(k => k.includes('KEY')));

        if (!process.env.GROQ_API_KEY) {
            console.error("GROQ_API_KEY not found in process.env after loading! Make sure .env.local exists.");
        } else {
            console.log("GROQ_API_KEY is properly set in process.env");
        }
    }
} catch (e) {
    console.warn("Failed to load .env.local", e);
}

async function main() {
    console.log("GROQ_API_KEY before import:", process.env.GROQ_API_KEY ? "EXISTS" : "MISSING");
    // Dynamic import to ensure env vars are loaded first
    const { analyzeIntent, rankAndSummarize } = await import('../src/lib/llm-service');
    // const { Product } = await import('../src/app/actions'); // Product is a type, just import it normally or mock it

    console.log("Starting LLM Test...");

    // 1. Test Intent Analysis
    console.log("\n--- Testing Intent Analysis (Groq) ---");
    const query = "I am looking for a running shoe under 5000";
    const categories: any[] = [
        { id: "cat_shoes", name: "Shoes", description: "Footwear", image: "", parentId: null, slug: "shoes", order: 0, createdAt: new Date() },
        { id: "cat_electronics", name: "Electronics", description: "Gadgets", image: "", parentId: null, slug: "electronics", order: 1, createdAt: new Date() }
    ];

    try {
        // @ts-ignore
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
            available: true, featured: false, createdAt: new Date(), updatedAt: new Date(),
            imageUrl: "placeholder.jpg"
        },
        {
            id: "p2", name: "ComfyWalker", description: "Casual walking shoe",
            price: 2000, categoryId: "cat_shoes", images: [], tags: ["walking", "casual"],
            available: true, featured: false, createdAt: new Date(), updatedAt: new Date(),
            imageUrl: "placeholder.jpg"
        },
        {
            id: "p3", name: "ProLaptop X", description: "Gaming laptop",
            price: 80000, categoryId: "cat_electronics", images: [], tags: ["gaming", "computer"],
            available: true, featured: false, createdAt: new Date(), updatedAt: new Date(),
            imageUrl: "placeholder.jpg"
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
