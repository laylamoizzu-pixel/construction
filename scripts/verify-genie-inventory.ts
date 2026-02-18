import { getRecommendations } from "../src/lib/recommendation-engine";
import { RecommendationRequest } from "../src/types/assistant-types";

// Mock the console.log to keep output clean but allow us to see what's happening
// const originalLog = console.log;
// console.log = (...args) => {};

async function verifyGenieInventory() {
    console.log("Starting Genie Inventory Verification...\n");
    let passed = 0;
    let failed = 0;

    async function testCase(name: string, query: string, expectedCondition: (result: any) => boolean) {
        console.log(`Test: ${name}`);
        console.log(`Query: "${query}"`);

        try {
            const request: RecommendationRequest = {
                query: query,
                messages: [],
                maxResults: 5
            };

            const startTime = Date.now();
            const result = await getRecommendations(request);
            const duration = Date.now() - startTime;

            if (expectedCondition(result)) {
                console.log(`✅ PASSED in ${duration}ms`);
                passed++;
            } else {
                console.log(`❌ FAILED in ${duration}ms`);
                console.log("Result:", JSON.stringify(result, null, 2));
                failed++;
            }
        } catch (error) {
            console.log(`❌ ERROR:`, error);
            failed++;
        }
        console.log("-".repeat(50) + "\n");
    }

    // 1. Test Non-existent Product (Hallucination Check)
    await testCase(
        "Non-existent Product (Flying Car)",
        "Do you have a flying car?",
        (res) => {
            // Should return success=true (handled gracefully) but 0 recommendations
            // Or if it triggers a "request", that's also valid.
            // Strict check: recommendations should be empty.
            return res.success && res.recommendations.length === 0;
        }
    );

    // 2. Test Specific Category that might be empty or valid
    // Let's assume 'Electronics' exists or doesn't. 
    // If it exists, we expect products. If not, 0.
    // Let's try a nonsense category to ensure 0 results.
    await testCase(
        "Nonsense Category/Product",
        "Show me unobtainium widgets",
        (res) => {
            return res.success && res.recommendations.length === 0;
        }
    );

    // 3. Test Product Request Trigger
    // Asking for something we definitely don't have but is a valid product
    await testCase(
        "Valid but Missing Product (Rolex)",
        "I want to buy a Rolex watch",
        (res) => {
            // Should return 0 recommendations, and summary should mention taking a request
            return res.success && res.recommendations.length === 0 &&
                (res.summary.toLowerCase().includes("request") || res.summary.toLowerCase().includes("note down"));
        }
    );

    // 4. Test Available Product
    // We need to know at least one product that exists. 
    // Since we can't easily valid that without reading DB, we'll skip strict validation of "found"
    // and just ensure it doesn't error.
    // Ideally we'd seed the DB or read it first, but for this limited environment we'll just check structure.
    await testCase(
        "General Query (Stationery)",
        "Stationery",
        (res) => {
            // If we have stationery, it should return some. If not, 0. 
            // Main check is that it doesn't crash.
            return res.success;
        }
    );

    console.log(`\nVerification Complete: ${passed} Passed, ${failed} Failed`);

    if (failed > 0) process.exit(1);
}

verifyGenieInventory();
