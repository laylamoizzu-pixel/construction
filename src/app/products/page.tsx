import { getFilteredProducts, getCategories, getOffers, getSiteContent, ProductsPageContent } from "@/app/actions";
import { getSiteConfig } from "@/app/actions/site-config";
import Image from "next/image";
import FilterSidebar from "@/components/FilterSidebar";
import InfiniteProductGrid from "@/components/InfiniteProductGrid";
import { constructMetadata } from "@/lib/seo-utils";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
    const config = await getSiteConfig();
    return constructMetadata({
        title: "All Products",
        description: "Browse our entire catalog of high-quality products across all departments at Smart Avenue 99. Discover great deals and curated selections.",
        urlPath: "/products",
        config
    });
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

    // Fetch data using the new in-memory comprehensive filter
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

    const maxPriceVal = Math.max(...allProducts.map(p => p.price), 10000);
    const heroTitle = pageContent?.heroTitle || "Our Box";
    const heroSubtitle = pageContent?.heroSubtitle || "Browse our curated collection of premium products.";
    const heroImage = pageContent?.heroImage || "";

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Tech Header */}
            <div className="bg-brand-dark pt-32 pb-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-[#0A0A0A]" />
                {heroImage ? (
                    <div className="absolute inset-0 opacity-40">
                        <Image src={heroImage} alt="Hero Background" fill className="object-cover" />
                    </div>
                ) : (
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-brand-blue/20 via-transparent to-transparent" />
                )}

                <div className="container mx-auto px-4 relative z-10">
                    <div className="flex flex-col md:flex-row items-end justify-between gap-6">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                                {heroTitle}
                            </h1>
                            <p className="text-slate-400 mt-2 max-w-lg">
                                {heroSubtitle}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <FilterSidebar categories={categories} maxPriceRange={maxPriceVal} settings={pageContent || undefined} />

                    {/* Main Content */}
                    <div className="flex-1">
                        <div className="mb-6 flex items-center justify-between">
                            <p className="text-slate-500 text-sm">
                                Discovery Mode: <span className="text-brand-blue font-semibold italic">Slow & Steady Discovery</span>
                            </p>
                        </div>

                        {/* Infinite Scroll Grid */}
                        <InfiniteProductGrid
                            initialProducts={allProducts}
                            categories={categories}
                            offers={offers}
                            filters={filters}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
