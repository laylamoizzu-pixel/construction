"use server";
// Force re-compile


import { getAdminDb, admin } from "@/lib/firebase-admin";
import { getSearchCache, CacheKeys } from "@/lib/search-cache";
import { revalidatePath } from "next/cache";

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

        revalidatePath("/offers");
        revalidatePath("/admin/content/offers");
        revalidatePath("/admin"); // For dashboard stats matches

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

        revalidatePath("/offers");
        revalidatePath("/admin/content/offers");
        revalidatePath("/admin");

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

        revalidatePath("/gallery");
        revalidatePath("/admin/content/gallery");

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

        revalidatePath("/gallery");
        revalidatePath("/admin/content/gallery");

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

export interface FeaturesContent {
    title: string;
    subtitle: string;
    items: {
        title: string;
        desc: string;
        icon: string;
    }[];
}

export interface CTAContent {
    title: string;
    text: string;
    ctaPrimary: string;
    ctaSecondary: string;
    backgroundImage: string;
}

export interface HighlightsContent {
    title: string;
    subtitle: string;
    description: string;
}

// Get site content by section
export async function getSiteContent<T>(section: string): Promise<T | null> {
    try {
        const doc = await getAdminDb().collection("siteContent").doc(section).get();
        if (doc.exists) {
            const data = doc.data();
            // detailed generic serialization for common timestamp fields
            return {
                ...data,
                createdAt: (data?.createdAt as admin.firestore.Timestamp)?.toDate() || undefined,
                updatedAt: (data?.updatedAt as admin.firestore.Timestamp)?.toDate() || undefined,
            } as T;
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

        revalidatePath("/", "layout"); // Revalidate everything as site content (like contact info) can be global

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

        revalidatePath("/"); // Departments are usually on home page

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

        revalidatePath("/admin/staff");

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

        revalidatePath("/admin/staff");

        return { success: true };
    } catch (error: unknown) {
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}

export async function deleteStaffMember(id: string) {
    try {
        await getAdminDb().collection("staff").doc(id).delete();

        revalidatePath("/admin/staff");

        return { success: true };
    } catch (error: unknown) {
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}

// Get staff role by email
export async function getStaffRole(email: string): Promise<string | null> {
    try {
        // Hardcoded super admin
        if (email === "admin@smartavenue99.com") return "Admin";

        const snapshot = await getAdminDb().collection("staff").where("email", "==", email).limit(1).get();
        if (!snapshot.empty) {
            const data = snapshot.docs[0].data();
            // Capitalize first letter for consistency (admin -> Admin)
            return data.role ? data.role.charAt(0).toUpperCase() + data.role.slice(1) : "Staff";
        }
        return null;
    } catch (error) {
        console.error("Error fetching staff role:", error);
        return null;
    }
}

// ==================== CATEGORIES ====================

export interface Category {
    id: string;
    name: string;
    slug: string;
    parentId: string | null;
    order: number;
    createdAt: Date;
}

export async function getCategories(): Promise<Category[]> {
    const cache = getSearchCache();
    const cacheKey = CacheKeys.categories();

    // Check cache first
    const cached = cache.get<Category[]>(cacheKey);
    if (cached) {
        return cached;
    }

    try {
        const snapshot = await getAdminDb().collection("categories").orderBy("order", "asc").get();
        const categories = snapshot.docs.map((doc: admin.firestore.QueryDocumentSnapshot) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: (doc.data().createdAt as admin.firestore.Timestamp)?.toDate() || new Date(),
        })) as Category[];

        // Cache for 5 minutes
        cache.set(cacheKey, categories);
        return categories;
    } catch (error) {
        console.error("Error fetching categories:", error);
        return [];
    }
}

export async function createCategory(name: string, parentId: string | null = null) {
    try {
        const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
        const snapshot = await getAdminDb().collection("categories").get();
        const order = snapshot.size;

        const docRef = await getAdminDb().collection("categories").add({
            name,
            slug,
            parentId,
            order,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        revalidatePath("/products"); // Categories appear in product filters
        revalidatePath("/admin/content/categories");

        return { success: true, id: docRef.id };
    } catch (error: unknown) {
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}

export async function updateCategory(id: string, data: Partial<Category>) {
    try {
        await getAdminDb().collection("categories").doc(id).update({
            ...data,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        revalidatePath("/products");
        revalidatePath("/admin/content/categories");

        return { success: true };
    } catch (error: unknown) {
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}

export async function deleteCategory(id: string) {
    try {
        await getAdminDb().collection("categories").doc(id).delete();

        revalidatePath("/products");
        revalidatePath("/admin/content/categories");

        return { success: true };
    } catch (error: unknown) {
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}

// ==================== PRODUCTS ====================

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    originalPrice?: number;
    categoryId: string;
    subcategoryId?: string;
    imageUrl: string;
    images: string[];
    available: boolean;
    featured: boolean;
    offerId?: string;
    tags: string[];
    averageRating?: number;
    reviewCount?: number;
    createdAt: Date;
    updatedAt?: Date;
}

export async function getProducts(
    categoryId?: string,
    available?: boolean,
    limitCount: number = 50,
    startAfterId?: string
): Promise<Product[]> {
    const cache = getSearchCache();

    // For simple queries (all products, no filters, no pagination), use cache
    const canUseCache = !startAfterId && !categoryId && available === undefined && limitCount >= 50;
    if (canUseCache) {
        const cacheKey = CacheKeys.allProducts();
        const cached = cache.get<Product[]>(cacheKey);
        if (cached) {
            return cached;
        }
    }

    try {
        let query: admin.firestore.Query = getAdminDb().collection("products");

        if (categoryId) {
            query = query.where("categoryId", "==", categoryId);
        }
        // Note: Firestore requires an index for combining equality operators (==) with range/order operators (orderBy/limit)
        // creating the index is a manual step in Firebase console usually.
        // If 'available' is used effectively as a filter, we might need a composite index.
        if (available !== undefined) {
            query = query.where("available", "==", available);
        }

        query = query.orderBy("createdAt", "desc");

        if (startAfterId) {
            const startAfterDoc = await getAdminDb().collection("products").doc(startAfterId).get();
            if (startAfterDoc.exists) {
                query = query.startAfter(startAfterDoc);
            }
        }

        const snapshot = await query.limit(limitCount).get();
        const products = snapshot.docs.map((doc: admin.firestore.QueryDocumentSnapshot) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: (doc.data().createdAt as admin.firestore.Timestamp)?.toDate() || new Date(),
            updatedAt: (doc.data().updatedAt as admin.firestore.Timestamp)?.toDate() || undefined,
        })) as Product[];

        // Cache if this was a cacheable query
        if (canUseCache) {
            cache.set(CacheKeys.allProducts(), products);
        }

        return products;
    } catch (error) {
        console.error("Error fetching products:", error);
        return [];
    }
}

/**
 * Search products by text query with in-memory filtering
 * Optimized for speed by caching products and filtering client-side
 */
export async function searchProducts(
    searchQuery: string,
    categoryId?: string,
    subcategoryId?: string
): Promise<Product[]> {
    // Get all products (uses cache) and filter available ones in-memory
    const allProducts = await getProducts();

    const searchLower = searchQuery.toLowerCase().trim();

    // Filter to available products first
    let filtered = allProducts.filter(p => p.available);

    // Text search filter
    if (searchLower) {
        filtered = filtered.filter(p =>
            p.name.toLowerCase().includes(searchLower) ||
            (p.description && p.description.toLowerCase().includes(searchLower)) ||
            (p.tags && p.tags.some(tag => tag.toLowerCase().includes(searchLower)))
        );
    }

    // Category filter
    if (categoryId) {
        filtered = filtered.filter(p =>
            p.categoryId === categoryId || p.subcategoryId === categoryId
        );
    }

    // Subcategory filter
    if (subcategoryId) {
        filtered = filtered.filter(p => p.subcategoryId === subcategoryId);
    }

    return filtered;
}

export async function getProduct(id: string): Promise<Product | null> {
    try {
        const doc = await getAdminDb().collection("products").doc(id).get();
        if (doc.exists) {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: (data?.createdAt as admin.firestore.Timestamp)?.toDate() || new Date(),
                updatedAt: (data?.updatedAt as admin.firestore.Timestamp)?.toDate() || undefined,
            } as Product;
        }
        return null;
    } catch (error) {
        console.error("Error fetching product:", error);
        return null;
    }
}

// ==================== REVIEWS ====================

// Add new product
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createProduct(data: any) {
    try {
        const docRef = await getAdminDb().collection("products").add({
            ...data,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        revalidatePath("/");
        revalidatePath("/products");
        revalidatePath("/admin/content/products");

        return { success: true, id: docRef.id };
    } catch (error: unknown) {
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}

// Update product
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateProduct(id: string, data: any) {
    try {
        await getAdminDb().collection("products").doc(id).update({
            ...data,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        revalidatePath("/");
        revalidatePath("/products");
        revalidatePath("/admin/content/products");
        revalidatePath(`/product/${id}`);

        return { success: true };
    } catch (error: unknown) {
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}

// Delete product
export async function deleteProduct(id: string) {
    try {
        await getAdminDb().collection("products").doc(id).delete();

        revalidatePath("/");
        revalidatePath("/products");
        revalidatePath("/admin/content/products");

        return { success: true };
    } catch (error: unknown) {
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}

// Toggle product availability
export async function toggleProductAvailability(id: string, available: boolean) {
    try {
        await getAdminDb().collection("products").doc(id).update({
            available,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        revalidatePath("/");
        revalidatePath("/products");
        revalidatePath("/admin/content/products");
        revalidatePath(`/product/${id}`);

        return { success: true };
    } catch (error: unknown) {
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}

// ==================== REVIEWS ====================

export interface Review {
    id: string;
    productId: string;
    userId: string;
    userName: string;
    rating: number;
    comment: string;
    createdAt: Date;
}

export async function addReview(productId: string, userId: string, userName: string, rating: number, comment: string) {
    try {
        const db = getAdminDb();
        const reviewRef = db.collection("reviews").doc();
        const productRef = db.collection("products").doc(productId);

        await db.runTransaction(async (t) => {
            const productDoc = await t.get(productRef);
            if (!productDoc.exists) {
                throw new Error("Product not found");
            }

            const productData = productDoc.data() as Product;
            const currentCount = productData.reviewCount || 0;
            const currentRating = productData.averageRating || 0;

            const newCount = currentCount + 1;
            const newAverage = ((currentRating * currentCount) + rating) / newCount;

            t.set(reviewRef, {
                productId,
                userId,
                userName,
                rating,
                comment,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });

            t.update(productRef, {
                reviewCount: newCount,
                averageRating: newAverage,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
        });

        return { success: true };
    } catch (error: unknown) {
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}

export async function getReviews(productId: string): Promise<Review[]> {
    try {
        const snapshot = await getAdminDb()
            .collection("reviews")
            .where("productId", "==", productId)
            .orderBy("createdAt", "desc")
            .get();

        return snapshot.docs.map((doc: admin.firestore.QueryDocumentSnapshot) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: (doc.data().createdAt as admin.firestore.Timestamp)?.toDate() || new Date(),
        })) as Review[];
    } catch (error) {
        console.error("Error fetching reviews:", error);
        return [];
    }
}

export async function deleteReview(reviewId: string, productId: string, rating: number) {
    try {
        const db = getAdminDb();
        const reviewRef = db.collection("reviews").doc(reviewId);
        const productRef = db.collection("products").doc(productId);

        await db.runTransaction(async (t) => {
            const productDoc = await t.get(productRef);
            if (!productDoc.exists) {
                throw new Error("Product not found");
            }

            const productData = productDoc.data() as Product;
            const currentCount = productData.reviewCount || 0;
            const currentRating = productData.averageRating || 0;

            if (currentCount <= 1) {
                t.update(productRef, {
                    reviewCount: 0,
                    averageRating: 0,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                });
            } else {
                const newCount = currentCount - 1;
                // Calculate new average: (oldAvg * oldCount - ratingToRemove) / newCount
                const newAverage = ((currentRating * currentCount) - rating) / newCount;

                t.update(productRef, {
                    reviewCount: newCount,
                    averageRating: newAverage,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                });
            }

            t.delete(reviewRef);
        });

        return { success: true };
    } catch (error: unknown) {
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}

export async function getAllReviews(): Promise<(Review & { productName?: string })[]> {
    try {
        const snapshot = await getAdminDb().collection("reviews").orderBy("createdAt", "desc").limit(50).get();
        // To show product name, we might need to fetch products or just show ID. 
        // For efficiency, let's just return reviews and handle product name on frontend or fetch distinct products locally.
        // A better approach for admin is to fetch basic product info or map it.
        // Let's just return reviews for now.

        return snapshot.docs.map((doc: admin.firestore.QueryDocumentSnapshot) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: (doc.data().createdAt as admin.firestore.Timestamp)?.toDate() || new Date(),
        })) as Review[];
    } catch (error) {
        console.error("Error fetching all reviews:", error);
        return [];
    }
}





