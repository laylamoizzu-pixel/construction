"use server";

import { put, list } from "@vercel/blob";
import { revalidateTag, unstable_cache } from "next/cache";

/**
 * A generic utility to store and retrieve JSON configuration files
 * from Vercel Blob, enabling edge-optimized global reads.
 */

const blobUrlCache: Record<string, string> = {};

async function _resolveBlobUrl(filename: string): Promise<string | null> {
    const { blobs } = await list({
        prefix: filename,
        limit: 1,
        token: process.env.BLOB_READ_WRITE_TOKEN
    });

    if (blobs.length === 0) {
        return null;
    }

    const blob = blobs[0];
    return `${blob.url}?v=${new Date(blob.uploadedAt).getTime()}`;
}

const getCachedBlobUrl = unstable_cache(
    (filename: string) => _resolveBlobUrl(filename),
    ["blob-url-resolution"],
    { revalidate: 3600, tags: ["blob-url"] }
);

export async function getBlobJson<T>(filename: string, defaultData: T): Promise<T> {
    try {
        let url = blobUrlCache[filename];

        if (!url) {
            url = await getCachedBlobUrl(filename) || "";

            if (!url) {
                return defaultData;
            }
            blobUrlCache[filename] = url;
            console.log(`[Blob JSON] Resolved and cached URL for ${filename}`);
        }


        // Fetch data from the actual public URL with a versioned parameter to bust CDN caches
        const response = await fetch(url, {
            next: { revalidate: 3600, tags: [`blob-${filename}`] }
        });


        if (!response.ok) {
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

        // CRITICAL: Invalidate the underlying fetch cache for this specific blob
        revalidateTag(`blob-${filename}`);
        revalidateTag("blob-url");
        delete blobUrlCache[filename];


        return { success: true, url: blob.url };
    } catch (error) {
        console.error(`[Blob JSON] Error updating ${filename}:`, error);
        return { success: false, error: error instanceof Error ? error.message : "Failed to update Blob JSON" };
    }
}
