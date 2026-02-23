"use server";

import { put } from "@vercel/blob";

/**
 * A generic utility to store and retrieve JSON configuration files
 * from Vercel Blob, enabling edge-optimized global reads.
 */

export async function getBlobJson<T>(filename: string, defaultData: T): Promise<T> {
    try {
        const url = `https://${process.env.VERCEL_PROJECT_ID}.public.blob.vercel-storage.com/${filename}`;

        // We fetch the data from the public URL.
        const response = await fetch(url, {
            // Using Next.js fetch caching capabilities
            next: { revalidate: 300, tags: [`blob-${filename}`] }
        });

        if (!response.ok) {
            // If the file doesn't exist yet, we silently return the default data
            if (response.status === 404) {
                return defaultData;
            }
            throw new Error(`Failed to fetch ${filename}: ${response.statusText}`);
        }

        return await response.json() as T;
    } catch (error) {
        console.error(`[Blob JSON] Error fetching ${filename}:`, error);
        return defaultData;
    }
}

export async function updateBlobJson<T>(filename: string, data: T): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
        const jsonString = JSON.stringify(data, null, 2);

        // Use Vercel Blob `put` to overwrite the existing file
        const blob = await put(filename, jsonString, {
            access: 'public',
            contentType: 'application/json',
            addRandomSuffix: false, // Important: keep the filename static so the URL is predictable
            allowOverwrite: true,
        });

        return { success: true, url: blob.url };
    } catch (error) {
        console.error(`[Blob JSON] Error updating ${filename}:`, error);
        return { success: false, error: error instanceof Error ? error.message : "Failed to update Blob JSON" };
    }
}
