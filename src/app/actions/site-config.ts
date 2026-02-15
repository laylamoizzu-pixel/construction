"use server";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { getAdminDb } from "@/lib/firebase-admin";
import { SiteConfig, DEFAULT_SITE_CONFIG } from "@/types/site-config";
import { revalidatePath } from "next/cache";
import { cache } from "react";

const CONFIG_COLLECTION = "site_config";
const CONFIG_DOC_ID = "main";

/**
 * Deep merges two objects.
 * - Arrays are replaced, not merged.
 * - Objects are merged recursively.
 * - Primitives are overridden.
 */
function deepMerge(target: any, source: any): any {
    if (typeof target !== 'object' || target === null || typeof source !== 'object' || source === null) {
        return source;
    }

    if (Array.isArray(target) || Array.isArray(source)) {
        return source; // Arrays are replaced entirely
    }

    const output = { ...target };
    Object.keys(source).forEach(key => {
        if (key in target) {
            output[key] = deepMerge(target[key], source[key]);
        } else {
            output[key] = source[key];
        }
    });
    return output;
}

/**
 * Fetches the site configuration from Firestore.
 * Returns the default config if the document doesn't exist.
 */
export const getSiteConfig = cache(async function getSiteConfig(): Promise<SiteConfig> {
    try {
        const adminDb = getAdminDb();
        const docRef = adminDb.collection(CONFIG_COLLECTION).doc(CONFIG_DOC_ID);
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            // If no config exists, create the default one
            await docRef.set(DEFAULT_SITE_CONFIG);
            return DEFAULT_SITE_CONFIG;
        }

        const data = docSnap.data() as Partial<SiteConfig>;

        // Perform a deep merge to ensure all fields are present while respecting DB values
        const mergedConfig = deepMerge(DEFAULT_SITE_CONFIG, data) as SiteConfig;

        // Server-side migration: ensure slides exists if older hero config is present
        if (!mergedConfig.hero.slides && (mergedConfig.hero as any).title) {
            const legacyHero = mergedConfig.hero as any;
            mergedConfig.hero.slides = [{
                id: "migrated-1",
                title: legacyHero.title,
                subtitle: legacyHero.subtitle || "",
                ctaText: legacyHero.ctaText || "Learn More",
                ctaLink: legacyHero.ctaLink || "/products",
                learnMoreLink: legacyHero.learnMoreLink,
                backgroundImageUrl: legacyHero.backgroundImageUrl || "",
                overlayOpacity: legacyHero.overlayOpacity || 0.6,
            }];
        }

        return mergedConfig;
    } catch (error) {
        console.error("Error fetching site config:", error);
        return DEFAULT_SITE_CONFIG;
    }
});

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
