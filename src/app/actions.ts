"use server";

import { adminDb } from "@/lib/firebase-admin";

export async function testFirebaseConnection() {
    try {
        // This will attempt to list collections or fetch a doc
        // Note: This will fail until the user provides valid env vars
        const snapshot = await adminDb.listCollections();
        console.log("Successfully connected to Firebase!");
        return {
            success: true,
            message: "Connected to Firebase!",
            collections: snapshot.map((col: { id: string }) => col.id)
        };
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        console.error("Firebase Connection Error:", errorMessage);
        return {
            success: false,
            message: "Failed to connect to Firebase. Check your .env.local file.",
            error: errorMessage
        };
    }
}
