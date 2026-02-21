"use server";

import { admin } from "@/lib/firebase-admin";
import { AIPrompt, DEFAULT_PROMPTS } from "@/lib/prompt-defaults";
import { invalidatePromptRegistry } from "@/lib/prompt-registry";

const COLLECTION_NAME = "ai_prompts";

/**
 * Get all customized prompts from Firestore.
 * If none exist, returns an empty array (loader will merge with defaults).
 */
export async function getAIPrompts(): Promise<AIPrompt[]> {
    try {
        const snapshot = await admin.firestore().collection(COLLECTION_NAME).get();
        const prompts: AIPrompt[] = [];

        snapshot.forEach((doc: any) => {
            const data = doc.data() as AIPrompt;
            prompts.push({
                ...data,
                id: doc.id
            });
        });

        return prompts;
    } catch (error) {
        console.error("Error fetching AI prompts:", error);
        return [];
    }
}

/**
 * Save or update a specific prompt in Firestore.
 */
export async function updateAIPrompt(id: string, updateData: Partial<AIPrompt>): Promise<{ success: boolean; error?: string }> {
    try {
        // Basic validation
        if (!id || typeof id !== 'string') {
            return { success: false, error: "Invalid prompt ID" };
        }

        const docRef = admin.firestore().collection(COLLECTION_NAME).doc(id);
        const docSnap = await docRef.get();

        const now = new Date().toISOString();

        if (docSnap.exists) {
            // Update existing record
            await docRef.update({
                ...updateData,
                updatedAt: now
            });
        } else {
            // Create new record from defaults + updateData
            const defaultPrompt = DEFAULT_PROMPTS[id];
            if (!defaultPrompt) {
                return { success: false, error: "Prompt ID does not exist in defaults" };
            }

            await docRef.set({
                ...defaultPrompt,
                ...updateData,
                updatedAt: now,
                createdAt: now
            });
        }

        // Extremely important: bust the cache so the app uses the new prompt immediately
        invalidatePromptRegistry();

        return { success: true };
    } catch (error) {
        console.error("Error updating AI prompt:", error);
        return { success: false, error: "Failed to update prompt" };
    }
}

/**
 * Seed the database with defaults if it's empty.
 * Helpful for first-time setup or resetting.
 */
export async function seedDefaultPrompts(): Promise<{ success: boolean; error?: string }> {
    try {
        const batch = admin.firestore().batch();
        const now = new Date().toISOString();

        for (const [id, promptData] of Object.entries(DEFAULT_PROMPTS)) {
            const docRef = admin.firestore().collection(COLLECTION_NAME).doc(id);
            batch.set(docRef, {
                ...promptData,
                updatedAt: now,
                createdAt: now
            }, { merge: true }); // Merge so we don't overwrite if they exist
        }

        await batch.commit();
        invalidatePromptRegistry();
        return { success: true };
    } catch (error) {
        console.error("Error seeding default AI prompts:", error);
        return { success: false, error: "Failed to seed default prompts" };
    }
}
