"use server";

import prisma from "@/lib/db";
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

        // 1. Prefetch master data (Categories & Offers)
        const [categories, offers] = await Promise.all([
            prisma.category.findMany(),
            prisma.offer.findMany()
        ]);

        const categoryMap = new Map<string, string>(); // Name(lowercase) -> ID
        const offerMap = new Map<string, string>(); // Title(lowercase) -> ID

        categories.forEach(cat => {
            if (cat.name) categoryMap.set(cat.name.toLowerCase(), cat.id);
            categoryMap.set(cat.id, cat.id);
            if (cat.slug) categoryMap.set(cat.slug.toLowerCase(), cat.id);
        });

        offers.forEach(off => {
            if (off.title) offerMap.set(off.title.toLowerCase(), off.id);
            offerMap.set(off.id, off.id);
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

        // 3. Batched check for existing products
        const productNameArray = Array.from(productNames);
        const existingProductMap = new Map<string, string>(); // Name -> Id

        const CHUNK_SIZE = 500;
        const nameChunks = [];
        for (let i = 0; i < productNameArray.length; i += CHUNK_SIZE) {
            nameChunks.push(productNameArray.slice(i, i + CHUNK_SIZE));
        }

        await Promise.all(nameChunks.map(async (chunk) => {
            const products = await prisma.product.findMany({
                where: { name: { in: chunk } },
                select: { id: true, name: true }
            });
            products.forEach(p => {
                existingProductMap.set(p.name, p.id);
            });
        }));

        // 4. Operations
        let totalImported = 0;

        // We'll process in sequential chunks to avoid connection pool exhaustion
        const PROCESS_CHUNK = 50;
        for (let i = 0; i < validRows.length; i += PROCESS_CHUNK) {
            const chunk = validRows.slice(i, i + PROCESS_CHUNK);
            const operations = chunk.map(row => {
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
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const productData: any = {
                    name: Name,
                    price: Number(Price),
                    categoryId: categoryId || "uncategorized-orphan",
                    available: Available === true || String(Available).toLowerCase() === "true",
                };

                // Conditional updates for optional fields
                if (Description || !isUpdate) productData.description = Description || "";
                if (OriginalPrice || !isUpdate) productData.originalPrice = OriginalPrice ? Number(OriginalPrice) : null;
                if (subcategoryId || !isUpdate) productData.subcategoryId = subcategoryId || null;

                if (ImageUrl) {
                    productData.imageUrl = ImageUrl;
                    productData.images = [ImageUrl];
                } else if (!isUpdate) {
                    productData.imageUrl = null;
                    productData.images = [];
                }

                if (Featured !== undefined || !isUpdate) productData.featured = Featured === true || String(Featured).toLowerCase() === "true";
                if (offerId || !isUpdate) productData.offerId = offerId || null;
                if (Tags || !isUpdate) productData.tags = Tags ? String(Tags).split(',').map((s: string) => s.trim()) : [];

                if (isUpdate) {
                    return prisma.product.update({
                        where: { id: existingId },
                        data: productData
                    });
                } else {
                    productData.reviewCount = 0;
                    productData.averageRating = 0;
                    return prisma.product.create({
                        data: productData
                    });
                }
            });

            await prisma.$transaction(operations);
            totalImported += operations.length;
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
