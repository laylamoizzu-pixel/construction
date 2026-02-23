import { NextResponse } from "next/server";
import { getAdminDb, admin } from "@/lib/firebase-admin";
import { updateBlobJson } from "@/app/actions/blob-json";

// Helper: delay between Firestore reads to avoid quota issues
function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Helper: retry a Firestore read with exponential backoff
async function retryRead<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (err: unknown) {
            // Check if error is a Firestore quota error
            const typedErr = err as { code?: number };
            if (typedErr?.code === 8 && i < maxRetries - 1) {
                // RESOURCE_EXHAUSTED — wait and retry
                console.log(`Quota exceeded, retrying in ${(i + 1) * 5}s...`);
                await delay((i + 1) * 5000);
            } else {
                throw err;
            }
        }
    }
    throw new Error("Max retries exceeded");
}

/**
 * One-time migration: reads ALL existing data from Firestore
 * and writes it to Vercel Blob JSON files.
 * 
 * Call: GET /api/migrate-to-blob?secret=migrate-now
 */
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    if (searchParams.get("secret") !== "migrate-now") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const results: Record<string, string> = {};
    const db = getAdminDb();

    // Helper to clean Firestore Timestamps from data
    function cleanTimestamps(data: unknown): unknown {
        return JSON.parse(JSON.stringify(data, (_key: string, value: unknown) => {
            if (value && typeof value === 'object' && '_seconds' in value) {
                const ts = value as { _seconds: number };
                return new Date(ts._seconds * 1000).toISOString();
            }
            return value;
        }));
    }

    try {
        // 1. Migrate site_config/main → site_config.json
        console.log("Migrating site_config...");
        const siteConfigDoc = await retryRead(() => db.collection("site_config").doc("main").get());
        if (siteConfigDoc.exists) {
            await updateBlobJson("site_config.json", cleanTimestamps(siteConfigDoc.data()));
            results["site_config"] = "✅ Migrated";
        } else {
            results["site_config"] = "⚠️ No document found";
        }

        await delay(2000); // Pause between reads

        // 2. Migrate settings/aiConfig → llmo.json
        console.log("Migrating AI settings...");
        const aiConfigDoc = await retryRead(() => db.collection("settings").doc("aiConfig").get());
        if (aiConfigDoc.exists) {
            await updateBlobJson("llmo.json", cleanTimestamps(aiConfigDoc.data()));
            results["ai_settings"] = "✅ Migrated";
        } else {
            results["ai_settings"] = "⚠️ No document found";
        }

        await delay(2000);

        // 3. Migrate ai_prompts/* → llmo_prompts.json
        console.log("Migrating AI prompts...");
        const promptsSnapshot = await retryRead(() => db.collection("ai_prompts").get());
        if (!promptsSnapshot.empty) {
            const prompts: Record<string, unknown> = {};
            promptsSnapshot.forEach((doc: admin.firestore.QueryDocumentSnapshot) => {
                prompts[doc.id] = cleanTimestamps({ ...doc.data(), id: doc.id });
            });
            await updateBlobJson("llmo_prompts.json", prompts);
            results["ai_prompts"] = `✅ Migrated ${promptsSnapshot.size} prompts`;
        } else {
            results["ai_prompts"] = "⚠️ No prompts found";
        }

        await delay(2000);

        // 4. Migrate siteContent/* → site_content_{section}.json
        console.log("Migrating site content sections...");
        const siteContentSnapshot = await retryRead(() => db.collection("siteContent").get());
        if (!siteContentSnapshot.empty) {
            for (const doc of siteContentSnapshot.docs) {
                const section = doc.id;
                await updateBlobJson(`site_content_${section}.json`, cleanTimestamps(doc.data()));
                results[`siteContent_${section}`] = "✅ Migrated";
                await delay(1000); // Small pause between blob writes
            }
        } else {
            results["siteContent"] = "⚠️ No site content found";
        }

        return NextResponse.json({
            success: true,
            message: "Migration complete! All Firestore data transferred to Vercel Blob.",
            results
        });
    } catch (error) {
        console.error("Migration error:", error);
        return NextResponse.json({
            success: false,
            error: String(error),
            partialResults: results
        }, { status: 500 });
    }
}
