/**
 * migrate-to-prisma.ts
 * 
 * One-time migration script: Reads all Products, Categories, Offers,
 * and Reviews from Firestore and upserts them into Neon Postgres via Prisma.
 * 
 * Usage: npx ts-node --project tsconfig.scripts.json scripts/migrate-to-prisma.ts
 */

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { PrismaClient } from "@prisma/client";
import * as admin from "firebase-admin";

// ── Firebase Admin Init ──
const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
};

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    });
}

const firestore = admin.firestore();
const prisma = new PrismaClient();

// ── Helpers ──
function toDate(ts: admin.firestore.Timestamp | undefined): Date {
    return ts?.toDate() ?? new Date();
}

function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function retryRead<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (err: any) {
            if (err?.code === 8 && i < maxRetries - 1) {
                console.log(`  ⏳ Quota hit, retrying in ${(i + 1) * 5}s...`);
                await delay((i + 1) * 5000);
            } else {
                throw err;
            }
        }
    }
    throw new Error("Max retries exceeded");
}

// ── Migration Functions ──

async function migrateCategories() {
    console.log("\n📂 Migrating Categories...");
    const snapshot = await retryRead(() =>
        firestore.collection("categories").orderBy("order", "asc").get()
    );

    // Separate parents and children
    const parents = snapshot.docs.filter(doc => !doc.data().parentId);
    const children = snapshot.docs.filter(doc => doc.data().parentId);
    const sortedDocs = [...parents, ...children];

    let count = 0;
    for (const doc of sortedDocs) {
        const data = doc.data();
        await prisma.category.upsert({
            where: { id: doc.id },
            update: {
                name: data.name || "Unnamed",
                slug: data.slug || doc.id,
                parentId: data.parentId || null,
                order: data.order ?? 0,
            },
            create: {
                id: doc.id,
                name: data.name || "Unnamed",
                slug: data.slug || doc.id,
                parentId: data.parentId || null,
                order: data.order ?? 0,
            },
        });
        count++;
    }
    console.log(`  ✅ ${count} categories migrated.`);
    return count;
}

async function migrateOffers() {
    console.log("\n🏷️  Migrating Offers...");
    const snapshot = await retryRead(() =>
        firestore.collection("offers").orderBy("createdAt", "desc").get()
    );

    let count = 0;
    for (const doc of snapshot.docs) {
        const data = doc.data();
        await prisma.offer.upsert({
            where: { id: doc.id },
            update: {
                title: data.title || "Untitled",
                discount: data.discount || "0%",
                description: data.description || "",
            },
            create: {
                id: doc.id,
                title: data.title || "Untitled",
                discount: data.discount || "0%",
                description: data.description || "",
                createdAt: toDate(data.createdAt),
            },
        });
        count++;
    }
    console.log(`  ✅ ${count} offers migrated.`);
    return count;
}

async function migrateProducts() {
    console.log("\n📦 Migrating Products...");

    // Fetch in batches to avoid memory issues with 10k+ products
    const BATCH_SIZE = 500;
    let lastDoc: admin.firestore.QueryDocumentSnapshot | null = null;
    let totalCount = 0;

    while (true) {
        let query = firestore
            .collection("products")
            .orderBy("createdAt", "desc")
            .limit(BATCH_SIZE);

        if (lastDoc) {
            query = query.startAfter(lastDoc);
        }

        const snapshot = await retryRead(() => query.get());
        if (snapshot.empty) break;

        for (const doc of snapshot.docs) {
            const data = doc.data();
            try {
                await prisma.product.upsert({
                    where: { id: doc.id },
                    update: {
                        name: data.name || "Unnamed Product",
                        description: data.description || "",
                        price: data.price ?? 0,
                        originalPrice: data.originalPrice ?? null,
                        categoryId: data.categoryId,
                        subcategoryId: data.subcategoryId ?? null,
                        imageUrl: data.imageUrl ?? null,
                        images: data.images ?? [],
                        available: data.available ?? true,
                        featured: data.featured ?? false,
                        offerId: data.offerId ?? null,
                        tags: data.tags ?? [],
                        averageRating: data.averageRating ?? 0,
                        reviewCount: data.reviewCount ?? 0,
                    },
                    create: {
                        id: doc.id,
                        name: data.name || "Unnamed Product",
                        description: data.description || "",
                        price: data.price ?? 0,
                        originalPrice: data.originalPrice ?? null,
                        categoryId: data.categoryId,
                        subcategoryId: data.subcategoryId ?? null,
                        imageUrl: data.imageUrl ?? null,
                        images: data.images ?? [],
                        available: data.available ?? true,
                        featured: data.featured ?? false,
                        offerId: data.offerId ?? null,
                        tags: data.tags ?? [],
                        averageRating: data.averageRating ?? 0,
                        reviewCount: data.reviewCount ?? 0,
                        createdAt: toDate(data.createdAt),
                    },
                });
                totalCount++;
            } catch (err: any) {
                console.error(`  ❌ Failed to migrate product ${doc.id}: ${err.message}`);
            }
        }

        lastDoc = snapshot.docs[snapshot.docs.length - 1];
        console.log(`  ... ${totalCount} products migrated so far`);
        await delay(1000); // Small pause between batches
    }

    console.log(`  ✅ ${totalCount} products migrated.`);
    return totalCount;
}

async function migrateReviews() {
    console.log("\n⭐ Migrating Reviews...");
    const snapshot = await retryRead(() =>
        firestore.collection("reviews").orderBy("createdAt", "desc").get()
    );

    let count = 0;
    for (const doc of snapshot.docs) {
        const data = doc.data();
        try {
            await prisma.review.upsert({
                where: { id: doc.id },
                update: {
                    productId: data.productId,
                    userId: data.userId || "anonymous",
                    userName: data.userName || "Anonymous",
                    rating: data.rating ?? 5,
                    comment: data.comment || "",
                },
                create: {
                    id: doc.id,
                    productId: data.productId,
                    userId: data.userId || "anonymous",
                    userName: data.userName || "Anonymous",
                    rating: data.rating ?? 5,
                    comment: data.comment || "",
                    createdAt: toDate(data.createdAt),
                },
            });
            count++;
        } catch (err: any) {
            console.error(`  ❌ Failed to migrate review ${doc.id}: ${err.message}`);
        }
    }
    console.log(`  ✅ ${count} reviews migrated.`);
    return count;
}

// ── Main ──
async function main() {
    console.log("🚀 Starting Firestore → Neon Postgres Migration");
    console.log("================================================\n");

    const results: Record<string, number> = {};

    try {
        results.categories = await migrateCategories();
        await delay(2000);

        results.offers = await migrateOffers();
        await delay(2000);

        results.products = await migrateProducts();
        await delay(2000);

        results.reviews = await migrateReviews();

        console.log("\n================================================");
        console.log("🎉 Migration Complete!");
        console.log("================================================");
        console.log("Summary:");
        for (const [key, count] of Object.entries(results)) {
            console.log(`  ${key}: ${count} records`);
        }
    } catch (error) {
        console.error("\n💥 Migration failed:", error);
    } finally {
        await prisma.$disconnect();
        process.exit(0);
    }
}

main();
