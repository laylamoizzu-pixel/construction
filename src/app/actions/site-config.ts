"use server";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { SiteConfig, DEFAULT_SITE_CONFIG } from "@/types/site-config";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { getBlobJson, updateBlobJson } from "./blob-json";

const BLOB_FILENAME = "site_config.json";

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
 * Fetches the site configuration from Vercel Blob.
 * Returns the default config if the file doesn't exist.
 */
async function _fetchSiteConfig(): Promise<SiteConfig> {
    try {
        const data = await getBlobJson<Partial<SiteConfig>>(BLOB_FILENAME, DEFAULT_SITE_CONFIG);
        const mergedConfig = deepMerge(DEFAULT_SITE_CONFIG, data) as SiteConfig;

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

        // Migrate headerLinks from { name, href } to { label, href }
        if (mergedConfig.headerLinks) {
            mergedConfig.headerLinks = mergedConfig.headerLinks.map((link: any) => {
                if ('name' in link && !('label' in link)) {
                    return { ...link, label: link.name };
                }
                return link;
            });
        }

        return mergedConfig;
    } catch (error) {
        console.error("Error fetching site config form Blob:", error);
        return DEFAULT_SITE_CONFIG;
    }
}

export const getSiteConfig = unstable_cache(_fetchSiteConfig, ["site-config"], {
    revalidate: 300,
    tags: ["site-config"],
});

/**
 * Updates the site configuration in Vercel Blob.
 */
export async function updateSiteConfig(newConfig: SiteConfig): Promise<{ success: boolean; error?: string }> {
    try {
        const result = await updateBlobJson(BLOB_FILENAME, newConfig);

        if (!result.success) {
            throw new Error(result.error || "Failed to save to Blob");
        }

        // Revalidate all pages since this affects global layout/theme
        revalidatePath("/", "layout");
        revalidateTag("site-config");

        return { success: true };
    } catch (error) {
        console.error("Error updating site config in Blob:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to update configuration"
        };
    }
}
