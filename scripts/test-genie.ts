
import 'dotenv/config';
import type { Category } from '../src/app/actions';

async function main() {
    const { analyzeIntent } = await import('../src/lib/llm-service');

    console.log("Starting Genie Persona Verification...");

    const categories: Category[] = [
        { id: "cat_teddies", name: "Teddies", slug: "teddies", parentId: null, order: 0, createdAt: new Date() },
        { id: "cat_stationary", name: "Stationary", slug: "stationary", parentId: null, order: 1, createdAt: new Date() }
    ];

    const queries = [
        "Hy, who are you?",
        "I want to buy a teddy for my sister",
        "Do you have stylish stationary?"
    ];

    for (const query of queries) {
        console.log(`\nTesting Query: "${query}"`);
        try {
            const result = await analyzeIntent(query, categories);
            console.log("Genie's Response (Intent):", JSON.stringify(result, null, 2));
        } catch (error) {
            console.error("Verification Failed:", error);
        }
    }
}

main().catch(console.error);
