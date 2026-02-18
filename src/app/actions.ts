"use server";
// Force re-compile


import { getAdminDb, getAdminAuth, admin } from "@/lib/firebase-admin";
import { getSearchCache, CacheKeys } from "@/lib/search-cache";
import { revalidatePath } from "next/cache";
import { cache } from "react";

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

export const getOffers = cache(async function getOffers(): Promise<Offer[]> {
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
});

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

// ==================== DASHBOARD STATS ====================

export async function getDashboardStats() {
    try {
        const db = getAdminDb();
        const [offersSnap, productsSnap, categoriesSnap] = await Promise.all([
            db.collection("offers").get(),
            db.collection("products").get(),
            db.collection("categories").get(),
        ]);
        return {
            offersCount: offersSnap.size,
            productsCount: productsSnap.size,
            categoriesCount: categoriesSnap.size,
        };
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        return { offersCount: 0, productsCount: 0, categoriesCount: 0 };
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
    learnMoreLink?: string;
    backgroundImage: string;
}

export interface DepartmentContent {
    id: string;
    title: string;
    description: string;
    icon: string;
    image: string;
    link?: string;
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
    description?: string;
}

export interface CTAContent {
    title: string;
    text: string;
    ctaPrimary: string;
    ctaLink: string;
    ctaSecondary: string;
    backgroundImage: string;
    images?: string[];
}

export interface HighlightsContent {
    title: string;
    subtitle: string;
    description: string;
    viewAllLabel?: string;
    exploreLabel?: string;
}

export interface ProductsPageContent {
    heroTitle: string;
    heroSubtitle: string;
    heroImage: string;
    // Filter visibility
    showSearch?: boolean;
    showSort?: boolean;
    showPriceRange?: boolean;
    showCategories?: boolean;
    showAvailability?: boolean;
}

export interface ProductDetailPageContent {
    availabilityText: string;
    availabilityBadge: string;
    callToActionNumber: string;
    visitStoreLink: string;
    authenticityTitle: string;
    authenticityText: string;
    storeLocationTitle: string;
    storeLocationText: string;
    storeHoursText: string;
}

export interface OffersPageContent {
    heroTitle: string;
    heroSubtitle: string;
    heroImage: string;
    catalogueUrl?: string;
    catalogueTitle?: string;
    catalogueSubtitle?: string;
}

export interface DepartmentsPageContent {
    heroTitle: string;
    heroSubtitle: string;
    heroImage: string;
    heroLabel?: string;
}

export interface AboutPageContent {
    heroTitle: string;
    heroSubtitle: string;
    heroImage: string;
    visionTitle: string;
    visionText1: string;
    visionText2: string;
    visionImage: string;
    heroLabel?: string;
    visionLabel?: string;
    statsCustomersLabel?: string;
    statsSatisfactionLabel?: string;
    contactTitle?: string;
    contactSubtitle?: string;
    statsCustomers: string;
    statsSatisfaction: string;
    valuesTitle: string;
    valuesSubtitle: string;
    values: {
        title: string;
        desc: string;
        icon: string; // Icon name matching Lucide icons
        color?: string; // Tailwind class
    }[];
}

// Get site content by section
export const getSiteContent = cache(async function getSiteContent<T>(section: string): Promise<T | null> {
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
});

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
export const getDepartments = cache(async function getDepartments(): Promise<DepartmentContent[]> {
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
});

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

// Get staff data (role and permissions) by email
export async function getStaffData(email: string) {
    try {
        // Hardcoded super admin
        if (email === "admin@smartavenue99.com") {
            return {
                role: "Admin",
                permissions: ["*"] // All permissions
            };
        }

        const snapshot = await getAdminDb().collection("staff").where("email", "==", email).limit(1).get();
        if (!snapshot.empty) {
            const data = snapshot.docs[0].data();
            return {
                role: data.role ? data.role.charAt(0).toUpperCase() + data.role.slice(1) : "Staff",
                permissions: data.permissions || []
            };
        }
        return null;
    } catch (error) {
        console.error("Error fetching staff data:", error);
        return null;
    }
}

// Keep for compatibility or replace usages
export async function getStaffRole(email: string): Promise<string | null> {
    const data = await getStaffData(email);
    return data ? data.role : null;
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

export const getCategories = cache(async function getCategories(): Promise<Category[]> {
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
});

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
    } finally {
        getSearchCache().delete(CacheKeys.categories());
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
    } finally {
        getSearchCache().delete(CacheKeys.categories());
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
    } finally {
        getSearchCache().delete(CacheKeys.categories());
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
    videoUrl?: string | null;
    available: boolean;
    featured: boolean;
    offerId?: string;
    tags: string[];
    averageRating?: number;
    reviewCount?: number;
    createdAt: Date;
    updatedAt?: Date;
    highlights?: string[];
    specifications?: { key: string; value: string }[];
}

export const getProducts = cache(async function getProducts(
    categoryId?: string,
    available?: boolean,
    limitCount: number = 20, // Reduced default for efficiency, callers can override
    startAfterId?: string,
    subcategoryId?: string
): Promise<Product[]> {
    const cache = getSearchCache();

    // For simple queries (all products, no filters, no pagination), use cache
    const canUseCache = !startAfterId && !categoryId && !subcategoryId && available === undefined && limitCount >= 50;
    if (canUseCache) {
        const cacheKey = CacheKeys.allProducts();
        const cached = cache.get<Product[]>(cacheKey);
        if (cached) {
            return cached;
        }
    }

    try {
        let query: admin.firestore.Query = getAdminDb().collection("products");

        // Apply filters
        if (subcategoryId) {
            query = query.where("subcategoryId", "==", subcategoryId);
        } else if (categoryId) {
            query = query.where("categoryId", "==", categoryId);
        }

        if (available !== undefined) {
            query = query.where("available", "==", available);
        }

        // Apply ordering - Default to createdAt desc for consistency
        // Note: This may require composite indexes in Firestore for combined filters.
        // If an index error occurs, Firestore provides a link in the console to create it.
        let orderedQuery = query.orderBy("createdAt", "desc");

        // Apply pagination
        if (startAfterId) {
            const startAfterDoc = await getAdminDb().collection("products").doc(startAfterId).get();
            if (startAfterDoc.exists) {
                orderedQuery = orderedQuery.startAfter(startAfterDoc);
            }
        }

        const snapshot = await orderedQuery.limit(limitCount).get();

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
        // Fallback: If index is missing, retry without orderBy for basic functionality
        if (error instanceof Error && error.message.includes("index")) {
            console.warn("Falling back to unordered query due to missing index.");
            try {
                let fallbackQuery: admin.firestore.Query = getAdminDb().collection("products");
                if (subcategoryId) fallbackQuery = fallbackQuery.where("subcategoryId", "==", subcategoryId);
                else if (categoryId) fallbackQuery = fallbackQuery.where("categoryId", "==", categoryId);
                if (available !== undefined) fallbackQuery = fallbackQuery.where("available", "==", available);

                const snapshot = await fallbackQuery.limit(limitCount).get();
                return snapshot.docs.map((doc: admin.firestore.QueryDocumentSnapshot) => ({
                    id: doc.id,
                    ...doc.data(),
                    createdAt: (doc.data().createdAt as admin.firestore.Timestamp)?.toDate() || new Date(),
                    updatedAt: (doc.data().updatedAt as admin.firestore.Timestamp)?.toDate() || undefined,
                })) as Product[];
            } catch (fallbackError) {
                console.error("Fallback query also failed:", fallbackError);
            }
        }
        return [];
    }
});

/**
 * Get ALL products for export (no pagination/limit)
 * Warning: heavy operation, use sparingly
 */
export async function getAllProductsForExport(): Promise<Product[]> {
    try {
        const snapshot = await getAdminDb().collection("products").orderBy("createdAt", "desc").get();
        return snapshot.docs.map((doc: admin.firestore.QueryDocumentSnapshot) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: (doc.data().createdAt as admin.firestore.Timestamp)?.toDate() || new Date(),
            updatedAt: (doc.data().updatedAt as admin.firestore.Timestamp)?.toDate() || undefined,
        })) as Product[];
    } catch (error) {
        console.error("Error fetching all products for export:", error);
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
    subcategoryId?: string,
    available?: boolean // Changed from includeUnavailable to available
): Promise<Product[]> {
    // For admin/global search, we want to fetch a larger batch to find items
    // Using 2000 to be safe, filtering in memory is fast
    const allProducts = await getProducts(undefined, undefined, 2000);

    const searchLower = searchQuery.toLowerCase().trim();

    // 1. Filter by Availability
    // If available is true -> ensure p.available is true
    // If available is false -> ensure p.available is false
    // If available is undefined -> allow all
    let filtered = allProducts;

    if (available !== undefined) {
        filtered = filtered.filter(p => p.available === available);
    }

    // 2. Text search filter
    if (searchLower) {
        filtered = filtered.filter(p =>
            p.name.toLowerCase().includes(searchLower) ||
            (p.description && p.description.toLowerCase().includes(searchLower)) ||
            (p.tags && p.tags.some(tag => tag.toLowerCase().includes(searchLower)))
        );
    }

    // 3. Category Filter
    if (subcategoryId) {
        filtered = filtered.filter(p => p.subcategoryId === subcategoryId);
    } else if (categoryId) {
        filtered = filtered.filter(p => p.categoryId === categoryId);
    }

    return filtered;
}

export const getProduct = cache(async function getProduct(id: string): Promise<Product | null> {
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
});

// ==================== REVIEWS ====================

// Add new product
export async function createProduct(data: Record<string, unknown>) {
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
    } finally {
        getSearchCache().clearPrefix("products");
        getSearchCache().clearPrefix("query");
    }
}

// Update product
export async function updateProduct(id: string, data: Record<string, unknown>) {
    try {
        await getAdminDb().collection("products").doc(id).update({
            ...data,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        revalidatePath("/");
        revalidatePath("/products");
        revalidatePath("/admin/content/products");
        revalidatePath(`/products/${id}`);

        return { success: true };
    } catch (error: unknown) {
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    } finally {
        getSearchCache().clearPrefix("products");
        getSearchCache().clearPrefix("query");
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
    } finally {
        getSearchCache().clearPrefix("products");
        getSearchCache().clearPrefix("query");
    }
}

// Bulk delete products
export async function deleteProducts(ids: string[]) {
    try {
        const batch = getAdminDb().batch();
        const collection = getAdminDb().collection("products");

        ids.forEach(id => {
            batch.delete(collection.doc(id));
        });

        await batch.commit();

        revalidatePath("/");
        revalidatePath("/products");
        revalidatePath("/admin/content/products");

        return { success: true };
    } catch (error: unknown) {
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    } finally {
        getSearchCache().clearPrefix("products");
        getSearchCache().clearPrefix("query");
    }
}

// Bulk update products (availability, featured, category, etc.)
export async function bulkUpdateProducts(ids: string[], data: Record<string, unknown>) {
    try {
        const db = getAdminDb();
        const collection = db.collection("products");

        // Firestore batch limit is 500; chunk if needed
        const chunks = [];
        for (let i = 0; i < ids.length; i += 500) {
            chunks.push(ids.slice(i, i + 500));
        }

        for (const chunk of chunks) {
            const batch = db.batch();
            chunk.forEach(id => {
                batch.update(collection.doc(id), {
                    ...data,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                });
            });
            await batch.commit();
        }

        revalidatePath("/");
        revalidatePath("/products");
        revalidatePath("/admin/content/products");

        return { success: true, count: ids.length };
    } catch (error: unknown) {
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    } finally {
        getSearchCache().clearPrefix("products");
        getSearchCache().clearPrefix("query");
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
        revalidatePath(`/products/${id}`);

        return { success: true };
    } catch (error: unknown) {
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    } finally {
        getSearchCache().clearPrefix("products");
        getSearchCache().clearPrefix("query");
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
    } finally {
        getSearchCache().clearPrefix("products");
    }
}

export const getReviews = cache(async function getReviews(productId: string): Promise<Review[]> {
    try {
        console.log(`[getReviews] Fetching reviews for product: ${productId}`);
        const db = getAdminDb();

        try {
            // First attempt: with orderBy (requires index)
            const snapshot = await db
                .collection("reviews")
                .where("productId", "==", productId)
                .orderBy("createdAt", "desc")
                .get();

            console.log(`[getReviews] Found ${snapshot.size} reviews (ordered)`);
            return snapshot.docs.map((doc: admin.firestore.QueryDocumentSnapshot) => ({
                id: doc.id,
                ...doc.data(),
                createdAt: (doc.data().createdAt as admin.firestore.Timestamp)?.toDate() || new Date(),
            })) as Review[];
        } catch (orderError) {
            console.warn(`[getReviews] Ordered query failed (possibly missing index), attempting fallback:`, orderError instanceof Error ? orderError.message : String(orderError));

            // Fallback: without orderBy
            const snapshot = await db
                .collection("reviews")
                .where("productId", "==", productId)
                .get();

            console.log(`[getReviews] Found ${snapshot.size} reviews (fallback unordered)`);

            // Sort in-memory if possible or just return as is
            const reviews = snapshot.docs.map((doc: admin.firestore.QueryDocumentSnapshot) => ({
                id: doc.id,
                ...doc.data(),
                createdAt: (doc.data().createdAt as admin.firestore.Timestamp)?.toDate() || new Date(),
            })) as Review[];

            return reviews.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
        }
    } catch (error) {
        console.error("[getReviews] Fatal error fetching reviews:", error);
        return [];
    }
});

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
    } finally {
        getSearchCache().clearPrefix("products");
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

// ==================== ADMIN ACCOUNT SETTINGS ====================

export interface AdminProfile {
    name: string;
    email: string;
    phone?: string;
    role: string;
    photoUrl?: string;
}

export async function getAdminProfile(email: string): Promise<AdminProfile | null> {
    try {
        const snapshot = await getAdminDb().collection("staff").where("email", "==", email).limit(1).get();
        if (!snapshot.empty) {
            const data = snapshot.docs[0].data();
            return {
                name: data.name || "",
                email: data.email || email,
                phone: data.phone || "",
                role: data.role ? data.role.charAt(0).toUpperCase() + data.role.slice(1) : "Staff",
                photoUrl: data.photoUrl || "",
            };
        }
        // For the hardcoded super admin
        if (email === "admin@smartavenue99.com") {
            return {
                name: "Super Admin",
                email,
                phone: "",
                role: "Admin",
                photoUrl: "",
            };
        }
        return null;
    } catch (error) {
        console.error("Error fetching admin profile:", error);
        return null;
    }
}

export async function updateAdminProfile(email: string, data: { name?: string; phone?: string }) {
    try {
        const db = getAdminDb();
        const snapshot = await db.collection("staff").where("email", "==", email).limit(1).get();

        if (!snapshot.empty) {
            const docId = snapshot.docs[0].id;
            await db.collection("staff").doc(docId).update({
                ...data,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
        } else {
            // Create a staff record if none exists (e.g. for super admin)
            await db.collection("staff").add({
                email,
                ...data,
                role: "admin",
                permissions: ["*"],
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });
        }

        // Also update the Firebase Auth display name
        try {
            const authUser = await getAdminAuth().getUserByEmail(email);
            if (authUser) {
                await getAdminAuth().updateUser(authUser.uid, {
                    displayName: data.name || undefined,
                });
            }
        } catch (authError) {
            console.warn("Could not update Firebase Auth display name:", authError);
        }

        revalidatePath("/admin/settings");
        revalidatePath("/admin/staff");

        return { success: true };
    } catch (error: unknown) {
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}

export async function updateAdminEmail(currentEmail: string, newEmail: string) {
    try {
        // Update Firebase Auth email
        const authUser = await getAdminAuth().getUserByEmail(currentEmail);
        if (!authUser) {
            return { success: false, error: "User not found in Firebase Auth" };
        }

        await getAdminAuth().updateUser(authUser.uid, { email: newEmail });

        // Update the Firestore staff record
        const db = getAdminDb();
        const snapshot = await db.collection("staff").where("email", "==", currentEmail).limit(1).get();
        if (!snapshot.empty) {
            await db.collection("staff").doc(snapshot.docs[0].id).update({
                email: newEmail,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
        }

        revalidatePath("/admin/settings");
        revalidatePath("/admin/staff");

        return { success: true };
    } catch (error: unknown) {
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}
