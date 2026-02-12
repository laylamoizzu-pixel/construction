"use server";

import { getAdminDb } from "@/lib/firebase-admin";
import { SiteConfig, DEFAULT_SITE_CONFIG } from "@/types/site-config";
import { revalidatePath } from "next/cache";

const CONFIG_COLLECTION = "site_config";
const CONFIG_DOC_ID = "main";

/**
 * Fetches the site configuration from Firestore.
 * Returns the default config if the document doesn't exist.
 */
export async function getSiteConfig(): Promise<SiteConfig> {
    try {
        const adminDb = getAdminDb();
        const docRef = adminDb.collection(CONFIG_COLLECTION).doc(CONFIG_DOC_ID);
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            // If no config exists, create the default one
            await docRef.set(DEFAULT_SITE_CONFIG);
            return DEFAULT_SITE_CONFIG;
        }

        // Merge with default to ensure all fields are present (in case of schema updates)
        const data = docSnap.data() as Partial<SiteConfig>;

        // Deep merge helper could be useful here, but for now simple spread at top level
        // For a robust app, we should deeply merge.
        return {
            ...DEFAULT_SITE_CONFIG,
            ...data,
            branding: { ...DEFAULT_SITE_CONFIG.branding, ...data.branding },
            theme: { ...DEFAULT_SITE_CONFIG.theme, ...data.theme },
            hero: { ...DEFAULT_SITE_CONFIG.hero, ...data.hero },
            promotions: { ...DEFAULT_SITE_CONFIG.promotions, ...data.promotions },
            footer: { ...DEFAULT_SITE_CONFIG.footer, ...data.footer },
            sections: { ...DEFAULT_SITE_CONFIG.sections, ...data.sections },
            contact: { ...DEFAULT_SITE_CONFIG.contact, ...data.contact },
        };
    } catch (error) {
        console.error("Error fetching site config:", error);
        return DEFAULT_SITE_CONFIG;
    }
}

/**
 * Updates the site configuration in Firestore.
 */
export async function updateSiteConfig(newConfig: SiteConfig): Promise<{ success: boolean; error?: string }> {
    try {
        const adminDb = getAdminDb();
        const docRef = adminDb.collection(CONFIG_COLLECTION).doc(CONFIG_DOC_ID);
        await docRef.set(newConfig);

        // Revalidate all pages since this affects global layout/theme
        revalidatePath("/", "layout");

        return { success: true };
    } catch (error) {
        console.error("Error updating site config:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to update configuration"
        };
    }
}
