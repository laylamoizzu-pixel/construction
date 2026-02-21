import { put, del, list } from '@vercel/blob';

/**
 * Uploads a file to Vercel Blob.
 * 
 * @param file The file or buffer to upload.
 * @param filename The desired filename (e.g., 'images/hero.jpg').
 * @param options Additional options for the upload.
 * @returns The resulting Blob metadata including the public URL.
 */
export async function uploadToBlob(
    file: File | string | ReadableStream | ArrayBuffer | Blob,
    filename: string,
    options?: { access?: 'public'; contentType?: string }
) {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
        throw new Error("BLOB_READ_WRITE_TOKEN is not defined.");
    }

    try {
        const blob = await put(filename, file, {
            access: options?.access || 'public',
            contentType: options?.contentType,
            // You can add more options like token if needed for client side uploads
        });
        return blob;
    } catch (error) {
        console.error("Error uploading to Vercel Blob:", error);
        throw error;
    }
}

/**
 * Deletes a file from Vercel Blob.
 * 
 * @param url The public URL of the blob to delete.
 */
export async function deleteFromBlob(url: string) {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
        throw new Error("BLOB_READ_WRITE_TOKEN is not defined.");
    }

    try {
        await del(url);
    } catch (error) {
        console.error("Error deleting from Vercel Blob:", error);
        throw error;
    }
}

/**
 * Lists files in Vercel Blob (useful for an admin gallery view).
 */
export async function listBlobs() {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
        throw new Error("BLOB_READ_WRITE_TOKEN is not defined.");
    }

    try {
        const { blobs } = await list();
        return blobs;
    } catch (error) {
        console.error("Error listing Vercel Blobs:", error);
        throw error;
    }
}
