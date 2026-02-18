"use server";

import { callGroqWhisperAPI } from "@/lib/llm-service";

export async function processVoiceSearch(formData: FormData) {
    const file = formData.get("audio") as File;

    if (!file) {
        throw new Error("No audio file provided");
    }

    try {
        console.log(`[VoiceSearch] Processing audio: ${file.name}, size: ${file.size}, type: ${file.type}`);

        // Prepare FormData for the API call
        const apiFormData = new FormData();
        apiFormData.append("file", file);
        apiFormData.append("model", "whisper-large-v3-turbo");

        const transcript = await callGroqWhisperAPI(apiFormData);
        console.log(`[VoiceSearch] Transcript: ${transcript}`);

        return { success: true, text: transcript };
    } catch (error) {
        console.error("[VoiceSearch] Error processing voice:", error);
        return { success: false, error: "Failed to process voice command" };
    }
}
