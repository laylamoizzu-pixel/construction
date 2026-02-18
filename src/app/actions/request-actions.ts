"use server";

import { getAdminDb, admin } from "@/lib/firebase-admin";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// --- Types & Schema ---

const productRequestSchema = z.object({
    productName: z.string().min(1, "Product name is required"),
    brand: z.string().optional(),
    description: z.string().min(10, "Please provide more details"),
    minPrice: z.number().min(0).optional(),
    maxPrice: z.number().min(0).optional(),
    imageUrl: z.string().url().optional().or(z.literal("")),
    contactInfo: z.string().min(5, "Contact info is required"),
});

export type ProductRequestInput = z.infer<typeof productRequestSchema>;

export interface ProductRequest extends ProductRequestInput {
    id: string;
    status: "PENDING" | "REVIEWED" | "FULFILLED" | "REJECTED";
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

// --- Actions ---

export async function createProductRequest(data: ProductRequestInput) {
    try {
        const validated = productRequestSchema.parse(data);

        const docRef = await getAdminDb().collection("productRequests").add({
            ...validated,
            status: "PENDING",
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Revalidate admin requests page
        revalidatePath("/admin/requests");

        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Error creating product request:", error);
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}

export async function getProductRequests(status?: string) {
    try {
        let query: admin.firestore.Query = getAdminDb().collection("productRequests");

        if (status) {
            query = query.where("status", "==", status);
        }

        // Order by newest first
        query = query.orderBy("createdAt", "desc");

        const snapshot = await query.get();

        return snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: (doc.data().createdAt as admin.firestore.Timestamp)?.toDate() || new Date(),
            updatedAt: (doc.data().updatedAt as admin.firestore.Timestamp)?.toDate() || new Date(),
        })) as ProductRequest[];
    } catch (error) {
        console.error("Error fetching product requests:", error);
        return [];
    }
}

export async function updateRequestStatus(id: string, status: string, notes?: string) {
    try {
        const updateData: {
            status: string;
            updatedAt: admin.firestore.FieldValue;
            notes?: string;
        } = {
            status,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        if (notes !== undefined) {
            updateData.notes = notes;
        }

        await getAdminDb().collection("productRequests").doc(id).update(updateData);

        revalidatePath("/admin/requests");
        return { success: true };
    } catch (error) {
        console.error("Error updating product request:", error);
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}
