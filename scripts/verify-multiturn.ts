
import { getRecommendations } from '../src/lib/recommendation-engine';

async function runVerification() {
    console.log("--- Multi-Turn Context Verification (Jewelry Out-of-Stock) ---");

    // Turn 1: User asks for jewelry (which doesn't exist in cats)
    const turn1Query = "I am looking for some jewelry for a wedding gift.";
    console.log(`\nTURN 1 User: ${turn1Query}`);
    const turn1Response = await getRecommendations({
        query: turn1Query,
        messages: []
    });

    console.log(`TURN 1 Assistant: ${turn1Response.summary}`);

    // Check if it correctly identified as a missing product
    const isMissing = turn1Response.summary.toLowerCase().includes("don't have") ||
        turn1Response.summary.toLowerCase().includes("request");
    console.log(`Missing Product flow triggered: ${isMissing}`);

    // Turn 2: User provides budget
    const turn2Query = "My budget is ₹300";
    console.log(`\nTURN 2 User: ${turn2Query}`);

    const messages = [
        { role: "user" as const, content: turn1Query },
        { role: "assistant" as const, content: turn1Response.summary }
    ];

    const turn2Response = await getRecommendations({
        query: turn2Query,
        messages: messages
    });

    console.log(`TURN 2 Assistant: ${turn2Response.summary}`);

    // Verification: It should NOT recommend "BOX WATCH SET" or "VINTAGE JAR"
    const hasUnrelated = turn2Response.recommendations.some(r =>
        r.product.name.includes("WATCH") || r.product.name.includes("VINTAGE")
    );

    if (hasUnrelated) {
        console.error("❌ FAILURE: Unrelated products were recommended!");
        console.log("Recommendations:", turn2Response.recommendations.map(r => r.product.name));
    } else {
        console.log("✅ SUCCESS: No unrelated products recommended.");
    }

    // It should ideally have logged the request or asked for more details for jewelry specifically
    console.log("Intent Analysis (Turn 2):", JSON.stringify(turn2Response.intent, null, 2));
}

runVerification().catch(console.error);
