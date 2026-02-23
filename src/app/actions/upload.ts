"use server";

import { put } from "@vercel/blob";

export async function uploadFile(formData: FormData) {
    try {
        const file = formData.get("file") as File;
        const folder = formData.get("folder") as string || "uploads";

        if (!file) {
            return { success: false, error: "No file provided" };
        }

        const timestamp = Date.now();
        const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
        const filePath = `${folder}/${timestamp}_${safeName}`;

        const blob = await put(filePath, file, {
            access: 'public',
        });

        return { success: true, url: blob.url, path: filePath };

    } catch (error) {
        console.error("Server upload error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Upload failed"
        };
    }
}
