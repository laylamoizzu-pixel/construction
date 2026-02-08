"use server";

import { getAdminDb, admin } from "@/lib/firebase-admin";

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
        const docRef = await getAdminDb().collection("offers").add({
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
        const snapshot = await getAdminDb().collection("offers").orderBy("createdAt", "desc").get();
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
        await getAdminDb().collection("offers").doc(id).delete();
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
        const docRef = await getAdminDb().collection("gallery").add({
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
        const snapshot = await getAdminDb().collection("gallery").orderBy("createdAt", "desc").get();
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
        await getAdminDb().collection("gallery").doc(id).delete();
        return { success: true };
    } catch (error: unknown) {
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}

// ==================== TEST CONNECTION ====================

export async function testFirebaseConnection() {
    try {
        const snapshot = await getAdminDb().listCollections();
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

// ==================== SITE CONTENT ====================

export interface HeroContent {
    title: string;
    subtitle: string;
    tagline: string;
    ctaPrimary: string;
    ctaSecondary: string;
    backgroundImage: string;
}

export interface DepartmentContent {
    id: string;
    title: string;
    description: string;
    icon: string;
    image: string;
}

export interface ContactContent {
    address: string;
    phone: string;
    email: string;
    mapEmbed: string;
    storeHours: string;
}

// Get site content by section
export async function getSiteContent<T>(section: string): Promise<T | null> {
    try {
        const doc = await getAdminDb().collection("siteContent").doc(section).get();
        if (doc.exists) {
            return doc.data() as T;
        }
        return null;
    } catch (error) {
        console.error(`Error fetching ${section} content:`, error);
        return null;
    }
}

// Update site content by section
export async function updateSiteContent(section: string, data: Record<string, unknown>) {
    try {
        await getAdminDb().collection("siteContent").doc(section).set({
            ...data,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
        return { success: true };
    } catch (error: unknown) {
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}

// Get all departments
export async function getDepartments(): Promise<DepartmentContent[]> {
    try {
        const doc = await getAdminDb().collection("siteContent").doc("departments").get();
        if (doc.exists) {
            return doc.data()?.items || [];
        }
        return [];
    } catch (error) {
        console.error("Error fetching departments:", error);
        return [];
    }
}

// Update departments
export async function updateDepartments(departments: DepartmentContent[]) {
    try {
        await getAdminDb().collection("siteContent").doc("departments").set({
            items: departments,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        return { success: true };
    } catch (error: unknown) {
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}

// ==================== STAFF MANAGEMENT ====================

export interface StaffMember {
    id: string;
    email: string;
    name: string;
    role: "admin" | "manager" | "editor";
    permissions: string[];
    createdAt: Date;
}

export async function getStaffMembers(): Promise<StaffMember[]> {
    try {
        const snapshot = await getAdminDb().collection("staff").orderBy("createdAt", "desc").get();
        return snapshot.docs.map((doc: admin.firestore.QueryDocumentSnapshot) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: (doc.data().createdAt as admin.firestore.Timestamp)?.toDate() || new Date(),
        })) as StaffMember[];
    } catch (error) {
        console.error("Error fetching staff:", error);
        return [];
    }
}

export async function createStaffMember(email: string, name: string, role: string, permissions: string[]) {
    try {
        const docRef = await getAdminDb().collection("staff").add({
            email,
            name,
            role,
            permissions,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        return { success: true, id: docRef.id };
    } catch (error: unknown) {
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}

export async function updateStaffMember(id: string, data: Partial<StaffMember>) {
    try {
        await getAdminDb().collection("staff").doc(id).update({
            ...data,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        return { success: true };
    } catch (error: unknown) {
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}

export async function deleteStaffMember(id: string) {
    try {
        await getAdminDb().collection("staff").doc(id).delete();
        return { success: true };
    } catch (error: unknown) {
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}

