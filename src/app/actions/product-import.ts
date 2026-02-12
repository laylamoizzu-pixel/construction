"use server";

import { getAdminDb, admin } from "@/lib/firebase-admin";
import { revalidatePath } from "next/cache";

// Type definition for Excel row
// Type definition for Excel row
interface ProductRow {
    [key: string]: unknown; // Allow flexible keys for initial parsing
}

export async function importProductsFromExcel(formData: FormData) {
    try {
        const file = formData.get('file') as File;
        if (!file) {
            return { success: false, error: "No file uploaded" };
        }

        const buffer = await file.arrayBuffer();
        const XLSX = await import('xlsx');
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet) as ProductRow[];

        if (!rows || rows.length === 0) {
            return { success: false, error: "Excel file is empty" };
        }

        const db = getAdminDb();

        // 1. Prefetch master data (Categories & Offers)
        const [categoriesSnap, offersSnap] = await Promise.all([
            db.collection("categories").get(),
            db.collection("offers").get()
        ]);

        const categoryMap = new Map<string, string>(); // Name(lowercase) -> ID
        const offerMap = new Map<string, string>(); // Title(lowercase) -> ID

        categoriesSnap.docs.forEach(doc => {
            const data = doc.data();
            if (data.name) categoryMap.set(data.name.toLowerCase(), doc.id);
            categoryMap.set(doc.id, doc.id);
        });

        offersSnap.docs.forEach(doc => {
            const data = doc.data();
            if (data.title) offerMap.set(data.title.toLowerCase(), doc.id);
            offerMap.set(doc.id, doc.id);
        });

        // 2. Prepare data & Identify duplicates
        const validRows: Record<string, unknown>[] = [];
        const productNames = new Set<string>();

        for (const rawRow of rows) {
            const row: Record<string, unknown> = {};
            Object.keys(rawRow).forEach(key => {
                row[key.trim().toLowerCase()] = rawRow[key];
            });

            const Name = row['name'];
            const Price = row['price'];

            if (Name && Price) {
                validRows.push(row);
                productNames.add(String(Name).trim());
            }
        }

        if (validRows.length === 0) {
            return { success: false, error: "No valid products found. Ensure columns 'Name' and 'Price' exist." };
        }

        // 3. Batched check for existing products (Firestore limit: 30 items per 'in' query)
        const productNameArray = Array.from(productNames);
        const existingProductMap = new Map<string, admin.firestore.DocumentReference>(); // Name -> Ref

        const CHUNK_SIZE = 30;
        const nameChunks = [];
        for (let i = 0; i < productNameArray.length; i += CHUNK_SIZE) {
            nameChunks.push(productNameArray.slice(i, i + CHUNK_SIZE));
        }

        await Promise.all(nameChunks.map(async (chunk) => {
            const snapshot = await db.collection("products").where("name", "in", chunk).get();
            snapshot.docs.forEach(doc => {
                existingProductMap.set(doc.data().name, doc.ref);
            });
        }));

        // 4. Batch Writes
        let batch = db.batch();
        let operationCount = 0;
        const BATCH_SIZE = 450; // Firestore limit 500
        let totalImported = 0;

        for (const row of validRows) {
            const Name = String(row['name']).trim();
            const Price = row['price'];

            // Extract other fields
            const Category = row['category'];
            const Subcategory = row['subcategory'];
            const OfferTitle = row['offertitle'];
            const Description = row['description'];
            const OriginalPrice = row['originalprice'];
            const ImageUrl = row['imageurl'];
            const Available = row['available'];
            const Featured = row['featured'];
            const Tags = row['tags'];

            // Resolve References
            let categoryId = "";
            let subcategoryId = "";

            if (Category) {
                const catKey = String(Category).trim().toLowerCase();
                if (categoryMap.has(catKey)) categoryId = categoryMap.get(catKey)!;
            }
            if (Subcategory) {
                const subKey = String(Subcategory).trim().toLowerCase();
                if (categoryMap.has(subKey)) subcategoryId = categoryMap.get(subKey)!;
            }

            let offerId = "";
            if (OfferTitle) {
                const offerKey = String(OfferTitle).trim().toLowerCase();
                if (offerMap.has(offerKey)) offerId = offerMap.get(offerKey)!;
            }

            // Determine Ref (Update vs Create)
            let productRef: admin.firestore.DocumentReference;
            const existingRef = existingProductMap.get(Name);
            const isUpdate = !!existingRef;

            if (isUpdate) {
                productRef = existingRef!;
            } else {
                productRef = db.collection("products").doc();
            }

            const productData: Record<string, unknown> = {
                name: Name,
                price: Number(Price),
                categoryId: categoryId || "",
                available: Available === true || String(Available).toLowerCase() === "true",
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            };

            // Conditional updates for optional fields
            if (Description || !isUpdate) productData.description = Description || "";
            if (OriginalPrice || !isUpdate) productData.originalPrice = OriginalPrice ? Number(OriginalPrice) : null;
            if (subcategoryId || !isUpdate) productData.subcategoryId = subcategoryId || null;

            if (ImageUrl) {
                productData.imageUrl = ImageUrl;
                productData.images = [ImageUrl];
            } else if (!isUpdate) {
                productData.imageUrl = "";
                productData.images = [];
            }

            if (Featured !== undefined || !isUpdate) productData.featured = Featured === true || String(Featured).toLowerCase() === "true";
            if (offerId || !isUpdate) productData.offerId = offerId || null;
            if (Tags || !isUpdate) productData.tags = Tags ? String(Tags).split(',').map((s: string) => s.trim()) : [];

            if (!isUpdate) {
                productData.createdAt = admin.firestore.FieldValue.serverTimestamp();
                productData.reviewCount = 0;
                productData.averageRating = 0;
            }

            if (isUpdate) {
                batch.update(productRef, productData as Partial<admin.firestore.DocumentData>);
            } else {
                batch.set(productRef, productData);
            }

            operationCount++;
            totalImported++;

            if (operationCount >= BATCH_SIZE) {
                await batch.commit();
                batch = db.batch();
                operationCount = 0;
            }
        }

        if (operationCount > 0) {
            await batch.commit();
        }

        revalidatePath("/products");
        revalidatePath("/admin/content/products");

        // Clear cache
        try {
            const { getSearchCache } = await import("@/lib/search-cache");
            getSearchCache().clearPrefix("products");
            getSearchCache().clearPrefix("query");
        } catch {
            // ignore
        }

        return { success: true, count: totalImported };

    } catch (error: unknown) {
        console.error("Import Error:", error);
        return { success: false, error: error instanceof Error ? error.message : "Unknown import error" };
    }
}
