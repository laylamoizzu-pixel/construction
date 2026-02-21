import "server-only";
import { getAdminDb, admin } from "@/lib/firebase-admin";
import { unstable_cache } from "next/cache";

// ==================== OFFERS ====================

export interface Offer {
    id: string;
    title: string;
    discount: string;
    description: string;
    createdAt: Date;
}

async function _fetchOffers(): Promise<Offer[]> {
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

export const getOffers = unstable_cache(_fetchOffers, ["offers"], {
    revalidate: 300, // 5 minutes
    tags: ["offers"],
});

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
    ctaLink: string;
    ctaSecondary: string;
    backgroundImage: string;
}

export interface HighlightsContent {
    title: string;
    subtitle: string;
    description: string;
}

import { getEdgeConfigValue, hasEdgeConfigKey } from "@/lib/edge-config";

// Get site content by section - cached per section (with Edge Config fallback)
async function _fetchSiteContent<T>(section: string): Promise<T | null> {
    try {
        // 1. Try fetching from Edge Config first for ultra-low latency
        const edgeConfigKey = `siteContent_${section}`;
        const hasKey = await hasEdgeConfigKey(edgeConfigKey);

        if (hasKey) {
            console.log(`[Edge Config] Serving ${section} from edge`);
            const edgeData = await getEdgeConfigValue<T>(edgeConfigKey);
            if (edgeData) {
                return edgeData;
            }
        }

        // 2. Fallback to Firestore
        console.log(`[Firestore] Serving ${section} from database`);
        const doc = await getAdminDb().collection("siteContent").doc(section).get();
        if (doc.exists) {
            const data = doc.data();
            return {
                ...data,
                createdAt: (data?.createdAt as admin.firestore.Timestamp)?.toDate()?.toISOString() || undefined,
                updatedAt: (data?.updatedAt as admin.firestore.Timestamp)?.toDate()?.toISOString() || undefined,
            } as T;
        }
        return null;
    } catch (error) {
        console.error(`Error fetching ${section} content:`, error);
        return null;
    }
}

export async function getSiteContent<T>(section: string): Promise<T | null> {
    const cachedFetch = unstable_cache(
        () => _fetchSiteContent<T>(section),
        [`site-content-${section}`],
        { revalidate: 300, tags: ["site-content", `site-content-${section}`] }
    );
    return cachedFetch();
}

// Get all departments
async function _fetchDepartments(): Promise<DepartmentContent[]> {
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

export const getDepartments = unstable_cache(_fetchDepartments, ["departments"], {
    revalidate: 300,
    tags: ["departments", "site-content"],
});

// ==================== STAFF MANAGEMENT ====================

export interface StaffMember {
    id: string;
    email: string;
    name: string;
    role: "admin" | "manager" | "editor";
    permissions: string[];
    createdAt: Date;
}

async function _fetchStaffMembers(): Promise<StaffMember[]> {
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

export const getStaffMembers = unstable_cache(_fetchStaffMembers, ["staff-members"], {
    revalidate: 300,
    tags: ["staff"],
});

// Get staff role by email - not cached (auth-sensitive, fast single lookup)
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

async function _fetchCategories(): Promise<Category[]> {
    try {
        const snapshot = await getAdminDb().collection("categories").orderBy("order", "asc").get();
        return snapshot.docs.map((doc: admin.firestore.QueryDocumentSnapshot) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: (doc.data().createdAt as admin.firestore.Timestamp)?.toDate() || new Date(),
        })) as Category[];
    } catch (error) {
        console.error("Error fetching categories:", error);
        return [];
    }
}

export const getCategories = unstable_cache(_fetchCategories, ["categories"], {
    revalidate: 300,
    tags: ["categories"],
});

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
    // Allow extra fields from Firestore
    [key: string]: unknown;
}

async function _fetchProducts(
    categoryId?: string,
    available?: boolean,
    limitCount: number = 50,
    startAfterId?: string,
    subcategoryId?: string
): Promise<Product[]> {
    try {
        let query: admin.firestore.Query = getAdminDb().collection("products");

        if (categoryId) {
            query = query.where("categoryId", "==", categoryId);
        }

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
        return snapshot.docs.map((doc: admin.firestore.QueryDocumentSnapshot) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: (doc.data().createdAt as admin.firestore.Timestamp)?.toDate() || new Date(),
            updatedAt: (doc.data().updatedAt as admin.firestore.Timestamp)?.toDate() || undefined,
        })) as Product[];
    } catch (error) {
        console.error("Error fetching products:", error);
        return [];
    }
}

export async function getProducts(
    categoryId?: string,
    available?: boolean,
    limitCount: number = 50,
    startAfterId?: string,
    subcategoryId?: string
): Promise<Product[]> {
    // Paginated queries (startAfterId) cannot be cached because the cursor is dynamic
    if (startAfterId) {
        return _fetchProducts(categoryId, available, limitCount, startAfterId, subcategoryId);
    }

    // Build a stable cache key from the arguments
    const cacheKey = `products-${categoryId || "all"}-${available ?? "any"}-${limitCount}-${subcategoryId || "none"}`;

    const cachedFetch = unstable_cache(
        () => _fetchProducts(categoryId, available, limitCount, undefined, subcategoryId),
        [cacheKey],
        { revalidate: 300, tags: ["products"] }
    );

    return cachedFetch();
}

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

async function _fetchProduct(id: string): Promise<Product | null> {
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

export async function getProduct(id: string): Promise<Product | null> {
    const cachedFetch = unstable_cache(
        () => _fetchProduct(id),
        [`product-${id}`],
        { revalidate: 300, tags: ["products", `product-${id}`] }
    );
    return cachedFetch();
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

async function _fetchReviews(productId: string): Promise<Review[]> {
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

export async function getReviews(productId: string): Promise<Review[]> {
    const cachedFetch = unstable_cache(
        () => _fetchReviews(productId),
        [`reviews-${productId}`],
        { revalidate: 300, tags: ["reviews", `reviews-${productId}`] }
    );
    return cachedFetch();
}

async function _fetchAllReviews(): Promise<(Review & { productName?: string })[]> {
    try {
        const snapshot = await getAdminDb().collection("reviews").orderBy("createdAt", "desc").limit(50).get();

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

export const getAllReviews = unstable_cache(_fetchAllReviews, ["all-reviews"], {
    revalidate: 300,
    tags: ["reviews"],
});
