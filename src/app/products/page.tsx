"use client";

import { getFilteredProducts, getCategories, getOffers, getSiteContent, ProductsPageContent } from "@/app/actions";
import { getSiteConfig } from "@/app/actions/site-config";
import Image from "next/image";
import FilterSidebar from "@/components/FilterSidebar";
import InfiniteProductGrid from "@/components/InfiniteProductGrid";
import { constructMetadata } from "@/lib/seo-utils";
import { Metadata } from "next";
import { Suspense } from "react";
import { motion } from "framer-motion";

async function ProductsHeader() {
    const pageContent = await getSiteContent<ProductsPageContent>("products-page");
    const heroTitle = pageContent?.heroTitle || "Our Properties";
    const heroSubtitle = pageContent?.heroSubtitle || "Discover fine real estate and architectural masterpieces.";
    const heroImage = pageContent?.heroImage || "";

    return (
        <div className="bg-brand-charcoal pt-48 pb-24 relative overflow-hidden">
            {/* Soft ambient glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-brand-gold/10 via-transparent to-transparent opacity-50" />

            {heroImage && (
                <div className="absolute inset-0 opacity-30">
                    <Image src={heroImage} alt="Hero Background" fill className="object-cover" />
                </div>
            )}

            <div className="container mx-auto px-6 md:px-12 relative z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                >
                    <span className="text-brand-gold font-bold tracking-[0.3em] uppercase text-[10px] mb-6 block">
                        Portfolio
                    </span>
                    <h1 className="text-5xl md:text-8xl font-bold text-white tracking-tight mb-8">
                        {heroTitle}
                    </h1>
                    <p className="text-white/40 text-xl md:text-2xl max-w-2xl mx-auto font-light leading-relaxed">
                        {heroSubtitle}
                    </p>
                </motion.div>
            </div>
        </div>
    );
}

interface ProductFilters {
    search?: string;
    category?: string | string[];
    subcategory?: string;
    minPrice?: number;
    maxPrice?: number;
    available?: boolean | "all";
    sort?: string;
    rating?: number;
}

async function ProductsContent({ filters }: { filters: ProductFilters }) {
    const productsPromise = getFilteredProducts(filters);
    const categoriesPromise = getCategories();
    const offersPromise = getOffers();
    const contentPromise = getSiteContent<ProductsPageContent>("products-page");

    const [allProducts, categories, offers, pageContent] = await Promise.all([
        productsPromise,
        categoriesPromise,
        offersPromise,
        contentPromise
    ]);

    const maxPriceVal = allProducts.length > 0 ? Math.max(...allProducts.map(p => p.price), 10000) : 1000000;

    return (
        <div className="flex flex-col lg:flex-row gap-16">
            {/* Sidebar */}
            <aside className="lg:w-80 shrink-0">
                <FilterSidebar categories={categories} maxPriceRange={maxPriceVal} settings={pageContent || undefined} />
            </aside>

            {/* Main Content */}
            <div className="flex-1">
                <div className="mb-12 flex items-center justify-between border-b border-brand-silver/30 pb-6">
                    <p className="text-brand-charcoal/40 text-[10px] font-bold uppercase tracking-[0.3em]">
                        Showing {allProducts.length} curated results
                    </p>
                </div>

                <InfiniteProductGrid
                    initialProducts={allProducts}
                    categories={categories}
                    offers={offers}
                    filters={filters}
                />
            </div>
        </div>
    );
}

export default async function ProductsPage({
    searchParams
}: {
    searchParams: Promise<{ category?: string | string[]; subcategory?: string; search?: string; minPrice?: string; maxPrice?: string; sort?: string; rating?: string; available?: string }>
}) {
    const params = await searchParams;

    const filters = {
        category: params.category,
        subcategory: params.subcategory,
        search: params.search,
        minPrice: params.minPrice ? Number(params.minPrice) : undefined,
        maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
        sort: params.sort,
        available: params.available === "true" ? true : undefined,
        rating: params.rating ? Number(params.rating) : undefined
    };

    return (
        <div className="min-h-screen bg-brand-white">
            <Suspense fallback={<div className="h-96 bg-brand-charcoal animate-pulse" />}>
                <ProductsHeader />
            </Suspense>

            <div className="container mx-auto px-6 md:px-12 py-24">
                <Suspense fallback={<div className="h-screen bg-brand-charcoal/5 animate-pulse rounded-[2.5rem]" />}>
                    <ProductsContent filters={filters} />
                </Suspense>
            </div>
        </div>
    );
}
