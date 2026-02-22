import { NextResponse } from "next/server";
import { getAdminDb, admin } from "@/lib/firebase-admin";
import { updateBlobJson } from "@/app/actions/blob-json";

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

    try {
        // 1. Migrate site_config/main → site_config.json
        const siteConfigDoc = await db.collection("site_config").doc("main").get();
        if (siteConfigDoc.exists) {
            const data = siteConfigDoc.data();
            await updateBlobJson("site_config.json", data);
            results["site_config"] = "✅ Migrated";
        } else {
            results["site_config"] = "⚠️ No document found in Firestore";
        }

        // 2. Migrate settings/aiConfig → llmo.json
        const aiConfigDoc = await db.collection("settings").doc("aiConfig").get();
        if (aiConfigDoc.exists) {
            const data = aiConfigDoc.data();
            // Convert Firestore Timestamps to ISO strings
            const cleanData = JSON.parse(JSON.stringify(data, (key, value) => {
                if (value && typeof value === 'object' && value._seconds !== undefined) {
                    return new Date(value._seconds * 1000).toISOString();
                }
                return value;
            }));
            await updateBlobJson("llmo.json", cleanData);
            results["ai_settings"] = "✅ Migrated";
        } else {
            results["ai_settings"] = "⚠️ No document found in Firestore";
        }

        // 3. Migrate ai_prompts/* → llmo_prompts.json
        const promptsSnapshot = await db.collection("ai_prompts").get();
        if (!promptsSnapshot.empty) {
            const prompts: Record<string, any> = {};
            promptsSnapshot.forEach((doc: admin.firestore.QueryDocumentSnapshot) => {
                prompts[doc.id] = { ...doc.data(), id: doc.id };
            });
            await updateBlobJson("llmo_prompts.json", prompts);
            results["ai_prompts"] = `✅ Migrated ${promptsSnapshot.size} prompts`;
        } else {
            results["ai_prompts"] = "⚠️ No prompts found in Firestore";
        }

        // 4. Migrate siteContent/* → site_content_{section}.json
        const siteContentSnapshot = await db.collection("siteContent").get();
        if (!siteContentSnapshot.empty) {
            for (const doc of siteContentSnapshot.docs) {
                const section = doc.id;
                const data = doc.data();
                // Convert Firestore Timestamps
                const cleanData = JSON.parse(JSON.stringify(data, (key, value) => {
                    if (value && typeof value === 'object' && value._seconds !== undefined) {
                        return new Date(value._seconds * 1000).toISOString();
                    }
                    return value;
                }));
                await updateBlobJson(`site_content_${section}.json`, cleanData);
                results[`siteContent_${section}`] = "✅ Migrated";
            }
        } else {
            results["siteContent"] = "⚠️ No site content found in Firestore";
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
            results
        }, { status: 500 });
    }
}
