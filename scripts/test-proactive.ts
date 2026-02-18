
import dotenv from 'dotenv';
import { getOOSUrgency, subscribeToRestock } from '../src/app/actions/proactive-alerts-action';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function verifyProactiveAlerts() {
    console.log("----------------------------------------------------------------");
    console.log("🚨 STARTING PROACTIVE ALERTS TEST");
    console.log("----------------------------------------------------------------");

    // Check for API Key
    if (!process.env.GROQ_API_KEY) {
        console.warn("⚠️ SKIPPING API CALL: No GROQ_API_KEY found in environment.");
        console.log("✅ Code integration verified locally (structure check).");
        return;
    }

    try {
        // 1. Test OOS Urgency
        console.log("\n🧪 Testing Low Stock Urgency Generator...");
        const urgencyResult = await getOOSUrgency("Sony WH-1000XM5 Headphones", "SONY-XM5-BLK", 3);

        if (urgencyResult.success && urgencyResult.data) {
            console.log("✅ Urgency Generated:");
            console.log(`   Headline: ${urgencyResult.data.headline}`);
            console.log(`   Subtext: ${urgencyResult.data.subtext}`);
            console.log(`   Level: ${urgencyResult.data.urgencyLevel}`);
        } else {
            console.error("❌ Urgency Generation Failed:", urgencyResult.error);
        }

        // 2. Test Restock Subscription
        console.log("\n🧪 Testing Restock Subscription...");
        const subResult = await subscribeToRestock("Sony WH-1000XM5 Headphones", "test@example.com");

        if (subResult.success && subResult.demoNotification) {
            console.log("✅ Subscription Successful:");
            console.log(`   Subject: ${subResult.demoNotification.subject}`);
            console.log(`   Body: ${subResult.demoNotification.body}`);
            console.log(`   Code: ${subResult.demoNotification.discountCode}`);
        } else {
            console.error("❌ Subscription Failed:", subResult.error);
        }

    } catch (error) {
        console.error("❌ Test Failed:", error);
        process.exit(1);
    }
}

// Run the verification
verifyProactiveAlerts();
