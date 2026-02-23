"use server";

import prisma from "@/lib/db";
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

        const doc = await prisma.productRequest.create({
            data: {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ...validated as any,
                status: "PENDING",
            }
        });

        // Revalidate admin requests page
        revalidatePath("/admin/requests");

        return { success: true, id: doc.id };
    } catch (error) {
        console.error("Error creating product request:", error);
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}

export async function getProductRequests(status?: string) {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where = status ? { status: status as any } : {};

        const requests = await prisma.productRequest.findMany({
            where,
            orderBy: { createdAt: "desc" }
        });

        return requests as unknown as ProductRequest[];
    } catch (error) {
        console.error("Error fetching product requests from Postgres:", error);
        return [];
    }
}

export async function updateRequestStatus(id: string, status: string, notes?: string) {
    try {
        const updateData: { status: string; notes?: string } = { status };

        if (notes !== undefined) {
            updateData.notes = notes;
        }

        await prisma.productRequest.update({
            where: { id },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            data: updateData as any
        });

        revalidatePath("/admin/requests");
        return { success: true };
    } catch (error) {
        console.error("Error updating product request:", error);
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}
