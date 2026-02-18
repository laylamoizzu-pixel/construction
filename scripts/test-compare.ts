
import * as dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from 'url';

// Fix for __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
const envPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

async function testComparison() {
    // Dynamic import
    const { generateProductComparison } = await import("../src/lib/llm-service");

    console.log("----------------------------------------------------------------");
    console.log("⚖️ STARTING COMPARISON FEATURE TEST");
    console.log("----------------------------------------------------------------");

    const p1 = {
        name: "Sony WH-1000XM5",
        price: 29990,
        description: "Industry leading noise cancellation, 30 hour battery life, crystal clear hands free calling.",
        features: ["Noise Cancellation", "30hr Battery", "Alexa Built-in"]
    };

    const p2 = {
        name: "Bose QuietComfort 45",
        price: 24900,
        description: "Iconic quiet, comfort, and sound. 24 hour battery life.",
        features: ["Noise Cancellation", "24hr Battery", "High-fidelity audio"]
    };

    console.log(`Analyzing: ${p1.name} vs ${p2.name}`);

    try {
        const start = Date.now();
        const result = await generateProductComparison(p1, p2);
        const duration = Date.now() - start;

        console.log(`⏱️ Duration: ${duration}ms`);
        console.log("✅ Comparison Points:", result.comparisonPoints.length);
        result.comparisonPoints.forEach(p => {
            console.log(`   - ${p.feature}: ${p.verdict}`);
        });
        console.log("✅ Summary:", result.summary);
        console.log("✅ Recommendation:", result.recommendation);

        if (!result.summary || result.comparisonPoints.length === 0) {
            throw new Error("Invalid output format");
        }

    } catch (error) {
        console.error("❌ Comparison Test Failed:", error);
        process.exit(1);
    }
}

testComparison();
