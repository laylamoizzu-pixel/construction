"use server";

import { put, list } from "@vercel/blob";
import { revalidateTag } from "next/cache";

/**
 * A generic utility to store and retrieve JSON configuration files
 * from Vercel Blob, enabling edge-optimized global reads.
 */

export async function getBlobJson<T>(filename: string, defaultData: T): Promise<T> {
    try {
        // Use the Vercel Blob API to find the file dynamically rather than guessing the URL
        const { blobs } = await list({
            prefix: filename,
            limit: 1,
            token: process.env.BLOB_READ_WRITE_TOKEN
        });

        if (blobs.length === 0) {
            return defaultData;
        }

        const blob = blobs[0];
        const url = `${blob.url}?v=${new Date(blob.uploadedAt).getTime()}`;

        // Fetch data from the actual public URL with a versioned parameter to bust CDN caches
        const response = await fetch(url, {
            next: { revalidate: 300, tags: [`blob-${filename}`] }
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

        return { success: true, url: blob.url };
    } catch (error) {
        console.error(`[Blob JSON] Error updating ${filename}:`, error);
        return { success: false, error: error instanceof Error ? error.message : "Failed to update Blob JSON" };
    }
}
