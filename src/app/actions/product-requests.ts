"use server";

import { getAdminDb, admin } from "@/lib/firebase-admin";

export interface ProductRequest {
    id: string;
    productName: string;
    description?: string;
    status: "pending" | "reviewed" | "fulfilled";
    createdAt: Date;
    userContact?: string;
}

export async function createProductRequest(productName: string, description: string = "", userContact: string = "") {
    try {
        const docRef = await getAdminDb().collection("product_requests").add({
            productName,
            description,
            userContact,
            status: "pending",
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // revalidatePath("/admin/requests"); // Future admin page

        return { success: true, id: docRef.id };
    } catch (error: unknown) {
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}

export async function getProductRequests(): Promise<ProductRequest[]> {
    try {
        const snapshot = await getAdminDb().collection("product_requests").orderBy("createdAt", "desc").get();
        return snapshot.docs.map((doc: admin.firestore.QueryDocumentSnapshot) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: (doc.data().createdAt as admin.firestore.Timestamp)?.toDate() || new Date(),
        })) as ProductRequest[];
    } catch (error) {
        console.error("Error fetching product requests:", error);
        return [];
    }
}

export async function updateProductRequestStatus(id: string, status: "pending" | "reviewed" | "fulfilled") {
    try {
        await getAdminDb().collection("product_requests").doc(id).update({
            status,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // revalidatePath("/admin/requests");

        return { success: true };
    } catch (error: unknown) {
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}
