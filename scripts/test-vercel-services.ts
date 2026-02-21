import "dotenv/config";
import { getEdgeConfigValue, hasEdgeConfigKey } from "../src/lib/edge-config";
import { listBlobs } from "../src/lib/blob";

async function testVercelServices() {
    console.log("======================================");
    console.log("🧪 Testing Vercel Edge Config & Blob 🧪");
    console.log("======================================\n");

    // 1. Test Edge Config
    console.log("--- Edge Config ---");
    if (!process.env.EDGE_CONFIG) {
        console.log("⚠️ EDGE_CONFIG environment variable is missing.");
        console.log("   Setup: https://vercel.com/docs/storage/edge-config/quickstart");
    } else {
        try {
            const testKey = "siteContent_hero"; // Replace with a key you will actually use
            console.log(`Checking for key: "${testKey}"...`);

            const hasKey = await hasEdgeConfigKey(testKey);
            console.log(`Exists: ${hasKey}`);

            if (hasKey) {
                const value = await getEdgeConfigValue(testKey);
                console.log(`Value:`, JSON.stringify(value, null, 2));
                console.log("\n✅ Edge Config connection successful!");
            } else {
                console.log(`\nℹ️ Connected to Edge Config, but key "${testKey}" not found.`);
                console.log("   This is normal if you haven't added it in the Vercel Dashboard yet.");
            }
        } catch (error) {
            console.error("❌ Edge Config Error:", error);
        }
    }

    console.log("\n--- Vercel Blob ---");
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
        console.log("⚠️ BLOB_READ_WRITE_TOKEN environment variable is missing.");
        console.log("   Setup: https://vercel.com/docs/storage/vercel-blob/quickstart");
    } else {
        try {
            console.log("Attempting to list blobs...");
            const blobs = await listBlobs();
            console.log(`Found ${blobs.length} blobs in storage.`);

            if (blobs.length > 0) {
                console.log("First blob:", blobs[0].url);
            }
            console.log("\n✅ Vercel Blob connection successful!");

        } catch (error) {
            console.error("❌ Vercel Blob Error:", error);
        }
    }

    console.log("\n======================================");
}

testVercelServices();
