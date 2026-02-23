import "server-only";
import { unstable_cache } from "next/cache";
import prisma from "@/lib/db";
import { getEdgeConfigValue, hasEdgeConfigKey } from "@/lib/edge-config";

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
        const offers = await prisma.offer.findMany({
            orderBy: { createdAt: "desc" },
        });
        return offers as unknown as Offer[];
    } catch (error) {
        console.error("Error fetching offers from Postgres:", error);
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
        await prisma.$queryRaw`SELECT 1`;
        console.log("Successfully connected to Postgres!");
        return {
            success: true,
            message: "Connected to Neon Postgres!",
        };
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        console.error("Postgres Connection Error:", errorMessage);
        return {
            success: false,
            message: "Failed to connect to Neon. Check your DATABASE_URL in .env.local.",
            error: errorMessage
        };
    }
}

// ==================== SITE CONTENT (Vercel Blob / Edge Config) ====================

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

// Get site content by section - cached per section 
async function _fetchSiteContent<T>(section: string): Promise<T | null> {
    try {
        // ALWAYS serve from Edge Config for ultra-low latency.
        // Firebase fallback removed as part of white-label migration.
        const edgeConfigKey = `siteContent_${section}`;
        const hasKey = await hasEdgeConfigKey(edgeConfigKey);

        if (hasKey) {
            const edgeData = await getEdgeConfigValue<T>(edgeConfigKey);
            if (edgeData) {
                return edgeData;
            }
        }
        console.warn(`[Content] Warning: Site content section '${section}' not found in Edge Config.`);
        return null;
    } catch (error) {
        console.error(`Error fetching ${section} content from Edge Config:`, error);
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
        const data = await getSiteContent<{ items: DepartmentContent[] }>("departments");
        return data?.items || [];
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
    console.warn("getStaffMembers called, but Staff hasn't been migrated to Postgres/Clerk yet.");
    return [];
}

export const getStaffMembers = unstable_cache(_fetchStaffMembers, ["staff-members"], {
    revalidate: 300,
    tags: ["staff"],
});

export async function getStaffRole(email: string): Promise<string | null> {
    if (email === "admin@smartavenue99.com") return "Admin";
    console.warn("getStaffRole called, but Staff hasn't been migrated to Clerk yet.");
    return null;
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
        const categories = await prisma.category.findMany({
            orderBy: { order: "asc" },
        });
        return categories as Category[];
    } catch (error) {
        console.error("Error fetching categories from Postgres:", error);
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
        // Build Prisma query
        const where: Prisma.ProductWhereInput = {};
        if (categoryId) where.categoryId = categoryId;
        if (subcategoryId) where.subcategoryId = subcategoryId;
        if (available !== undefined) where.available = available;

        let cursorDetails = {};
        let skipAmount = 0;

        if (startAfterId) {
            // Prisma pagination using cursor
            cursorDetails = { cursor: { id: startAfterId } };
            skipAmount = 1; // Skip the cursor itself
        }

        const products = await prisma.product.findMany({
            where,
            orderBy: { createdAt: "desc" },
            take: limitCount,
            ...cursorDetails,
            skip: skipAmount
        });

        // Prisma returns Decimal/Date which maps cleanly to our interface
        return products as unknown as Product[];
    } catch (error) {
        console.error("Error fetching products from Postgres:", error);
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

    // Build a stable cache key
    const cacheKey = `products-${categoryId || "all"}-${available ?? "any"}-${limitCount}-${subcategoryId || "none"}`;

    const cachedFetch = unstable_cache(
        () => _fetchProducts(categoryId, available, limitCount, undefined, subcategoryId),
        [cacheKey],
        { revalidate: 300, tags: ["products"] }
    );

    return cachedFetch();
}

import { Prisma } from "@prisma/client";

export async function searchProducts(
    searchQuery: string,
    categoryId?: string,
    subcategoryId?: string
): Promise<Product[]> {
    try {
        const searchLower = searchQuery.toLowerCase().trim();
        const where: Prisma.ProductWhereInput = { available: true };

        if (categoryId) where.categoryId = categoryId;
        if (subcategoryId) where.subcategoryId = subcategoryId;

        // Use Prisma's explicit OR for text search
        if (searchLower) {
            where.OR = [
                { name: { contains: searchLower, mode: 'insensitive' } },
                { description: { contains: searchLower, mode: 'insensitive' } },
                { tags: { has: searchLower } }
            ];
        }

        const products = await prisma.product.findMany({
            where,
            take: 100 // Cap search results
        });

        return products as unknown as Product[];
    } catch (error) {
        console.error("Error searching products in Postgres:", error);
        return [];
    }
}

async function _fetchProduct(id: string): Promise<Product | null> {
    try {
        const product = await prisma.product.findUnique({
            where: { id }
        });
        return product as unknown as Product | null;
    } catch (error) {
        console.error("Error fetching product from Postgres:", error);
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
        const reviews = await prisma.review.findMany({
            where: { productId },
            orderBy: { createdAt: "desc" },
        });
        return reviews as unknown as Review[];
    } catch (error) {
        console.error("Error fetching reviews from Postgres:", error);
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
        const reviews = await prisma.review.findMany({
            orderBy: { createdAt: "desc" },
            take: 50,
            include: { product: { select: { name: true } } }
        });

        return reviews.map(r => ({
            ...r,
            productName: r.product?.name
        })) as unknown as (Review & { productName?: string })[];
    } catch (error) {
        console.error("Error fetching all reviews from Postgres:", error);
        return [];
    }
}

export const getAllReviews = unstable_cache(_fetchAllReviews, ["all-reviews"], {
    revalidate: 300,
    tags: ["reviews"],
});
