"use server";

import { adminDb } from "@/lib/firebase-admin";
import * as admin from "firebase-admin";

// ==================== OFFERS ====================

export interface Offer {
    id: string;
    title: string;
    discount: string;
    description: string;
    createdAt: Date;
}

export async function createOffer(title: string, discount: string, description: string) {
    try {
        const docRef = await adminDb.collection("offers").add({
            title,
            discount,
            description,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        return { success: true, id: docRef.id };
    } catch (error: unknown) {
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}

export async function getOffers(): Promise<Offer[]> {
    try {
        const snapshot = await adminDb.collection("offers").orderBy("createdAt", "desc").get();
        return snapshot.docs.map((doc: admin.firestore.QueryDocumentSnapshot) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: (doc.data().createdAt as admin.firestore.Timestamp)?.toDate() || new Date(),
        })) as Offer[];
    } catch (error) {
        console.error("Error fetching offers:", error);
        return [];
    }
}

export async function deleteOffer(id: string) {
    try {
        await adminDb.collection("offers").doc(id).delete();
        return { success: true };
    } catch (error: unknown) {
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}

// ==================== GALLERY ====================

export interface GalleryImage {
    id: string;
    imageUrl: string;
    storagePath: string;
    createdAt: Date;
}

export async function addGalleryImage(imageUrl: string, storagePath: string) {
    try {
        const docRef = await adminDb.collection("gallery").add({
            imageUrl,
            storagePath,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        return { success: true, id: docRef.id };
    } catch (error: unknown) {
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}

export async function getGalleryImages(): Promise<GalleryImage[]> {
    try {
        const snapshot = await adminDb.collection("gallery").orderBy("createdAt", "desc").get();
        return snapshot.docs.map((doc: admin.firestore.QueryDocumentSnapshot) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: (doc.data().createdAt as admin.firestore.Timestamp)?.toDate() || new Date(),
        })) as GalleryImage[];
    } catch (error) {
        console.error("Error fetching gallery images:", error);
        return [];
    }
}

export async function deleteGalleryImage(id: string) {
    try {
        await adminDb.collection("gallery").doc(id).delete();
        return { success: true };
    } catch (error: unknown) {
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}

// ==================== TEST CONNECTION ====================

export async function testFirebaseConnection() {
    try {
        const snapshot = await adminDb.listCollections();
        console.log("Successfully connected to Firebase!");
        return {
            success: true,
            message: "Connected to Firebase!",
            collections: snapshot.map((col: admin.firestore.CollectionReference) => col.id)
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
