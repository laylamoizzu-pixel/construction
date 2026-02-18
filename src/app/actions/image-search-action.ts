"use server";

import { callVisionAPI } from "@/lib/llm-service";

export async function analyzeImage(formData: FormData) {
    const file = formData.get("image") as File;

    if (!file) {
        return { success: false, error: "No image provided" };
    }

    // Max 5MB
    if (file.size > 5 * 1024 * 1024) {
        return { success: false, error: "Image too large (max 5MB)" };
    }

    try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Image = buffer.toString("base64");
        const mimeType = file.type;
        const dataUrl = `data:${mimeType};base64,${base64Image}`;

        const searchKeywords = await callVisionAPI(dataUrl);

        return { success: true, query: searchKeywords };
    } catch (error) {
        console.error("Image analysis failed:", error);
        return { success: false, error: "Failed to analyze image. Please try again." };
    }
}
