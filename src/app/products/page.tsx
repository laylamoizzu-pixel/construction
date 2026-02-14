import { getProducts, getCategories, getOffers, searchProducts, getSiteContent, ProductsPageContent } from "@/app/actions";
import Link from "next/link";
import { Package, ChevronRight, Zap, Tag, Star } from "lucide-react";
import Image from "next/image";
import FilterSidebar from "@/components/FilterSidebar";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ProductsPage({
    searchParams
}: {
    searchParams: Promise<{ category?: string | string[]; subcategory?: string; search?: string; minPrice?: string; maxPrice?: string; sort?: string; rating?: string; available?: string }>
}) {
    const params = await searchParams;

    // Fetch data
    const productsPromise = getProducts(undefined, undefined, 1000); // Fetch more to filter locally for now
    const categoriesPromise = getCategories();
    const offersPromise = getOffers();
    const contentPromise = getSiteContent<ProductsPageContent>("products-page");

    const [allProducts, categories, offers, pageContent] = await Promise.all([
        productsPromise,
        categoriesPromise,
        offersPromise,
        contentPromise
    ]);

    const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || "Unknown";
    const getOffer = (id?: string) => id ? offers.find(o => o.id === id) : null;

    // --- Filtering Logic ---
    let filteredProducts = allProducts;

    // 1. Search
    if (params.search) {
        const searchLower = params.search.toLowerCase();
        filteredProducts = filteredProducts.filter(p =>
            p.name.toLowerCase().includes(searchLower) ||
            (p.description && p.description.toLowerCase().includes(searchLower)) ||
            (p.tags && p.tags.some(tag => tag.toLowerCase().includes(searchLower)))
        );
    }

    // 2. Categories (Support multiple)
    const paramCategories = Array.isArray(params.category) ? params.category : (params.category ? [params.category] : []);
    if (paramCategories.length > 0) {
        filteredProducts = filteredProducts.filter(p =>
            paramCategories.includes(p.categoryId) || (p.subcategoryId && paramCategories.includes(p.subcategoryId))
        );
    }

    // 3. Price Range
    if (params.minPrice) {
        filteredProducts = filteredProducts.filter(p => p.price >= Number(params.minPrice));
    }
    if (params.maxPrice) {
        filteredProducts = filteredProducts.filter(p => p.price <= Number(params.maxPrice));
    }

    // 4. Availability
    if (params.available === "true") {
        filteredProducts = filteredProducts.filter(p => p.available);
    }

    // 5. Rating (Mock logic if rating not in DB, assuming it might be)
    if (params.rating) {
        const minRating = Number(params.rating);
        filteredProducts = filteredProducts.filter(p => (p.averageRating || 0) >= minRating);
    }

    // --- Sorting Logic ---
    const sortOption = params.sort || "newest";
    filteredProducts.sort((a, b) => {
        switch (sortOption) {
            case "price_asc":
                return a.price - b.price;
            case "price_desc":
                return b.price - a.price;
            case "rating":
                return (b.averageRating || 0) - (a.averageRating || 0);
            case "newest":
            default:
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
    });

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
                        {/* Active Filters Summary (Optional, could add pills here) */}
                        <div className="mb-6 flex items-center justify-between">
                            <p className="text-slate-500 text-sm">
                                Showing <span className="font-bold text-slate-900">{filteredProducts.length}</span> results
                            </p>
                        </div>

                        {/* Products Grid */}
                        {filteredProducts.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredProducts.map(product => {
                                    const offer = getOffer(product.offerId);
                                    const categoryName = getCategoryName(product.categoryId);

                                    return (
                                        <Link
                                            key={product.id}
                                            href={`/products/${product.id}`}
                                            className="group bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl hover:border-brand-blue/30 transition-all duration-300 flex flex-col"
                                        >
                                            <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                                                {/* Image */}
                                                <Image
                                                    src={product.imageUrl}
                                                    alt={product.name}
                                                    fill
                                                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                                                />

                                                {/* Overlay Gradient */}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                                {/* Status Tags */}
                                                <div className="absolute top-3 left-3 flex flex-col gap-2">
                                                    {product.featured && (
                                                        <span className="px-2 py-1 bg-brand-gold text-brand-dark text-xs font-bold rounded flex items-center gap-1 shadow-md">
                                                            <Zap className="w-3 h-3" /> FEATURED
                                                        </span>
                                                    )}
                                                    {offer && (
                                                        <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded flex items-center gap-1 shadow-md animate-pulse">
                                                            <Tag className="w-3 h-3" /> {offer.discount}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="p-5 flex flex-col flex-1">
                                                <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                                                    <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">{categoryName}</span>
                                                    {product.averageRating ? (
                                                        <span className="flex items-center gap-1 text-amber-500">
                                                            <Star className="w-3 h-3 fill-current" /> {product.averageRating.toFixed(1)}
                                                        </span>
                                                    ) : null}
                                                </div>

                                                <h3 className="font-bold text-lg text-brand-dark mb-1 line-clamp-2 bg-gradient-to-r from-brand-dark to-brand-dark bg-[length:0%_2px] bg-no-repeat bg-left-bottom group-hover:bg-[length:100%_2px] transition-all duration-500 from-transparent to-transparent group-hover:from-brand-blue group-hover:to-brand-blue pb-1">
                                                    {product.name}
                                                </h3>

                                                <p className="text-slate-500 text-sm line-clamp-2 mb-4 flex-1">
                                                    {product.description}
                                                </p>

                                                <div className="flex items-center justify-between mt-auto">
                                                    <div className="flex flex-col">
                                                        <span className="text-xs text-slate-400">Price</span>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xl font-bold text-brand-blue">
                                                                ₹{product.price.toLocaleString()}
                                                            </span>
                                                            {product.originalPrice && (
                                                                <span className="text-sm text-slate-400 line-through">
                                                                    ₹{product.originalPrice.toLocaleString()}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-colors duration-300">
                                                        <ChevronRight className="w-5 h-5" />
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                                <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-slate-700">No products found</h3>
                                <p className="text-slate-500">Try adjusting your filters.</p>
                                <Link href="/products" className="inline-block mt-4 text-brand-blue hover:underline">
                                    Clear Filters
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
