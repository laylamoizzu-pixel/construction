import { getProducts, getCategories, getOffers, searchProducts, getSiteContent, ProductsPageContent } from "@/app/actions";
import Link from "next/link";
import { Package, Search, ChevronRight, Zap, Tag } from "lucide-react";
import Image from "next/image";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ProductsPage({
    searchParams
}: {
    searchParams: Promise<{ category?: string; subcategory?: string; search?: string }>
}) {
    const params = await searchParams;

    // Fetch data
    const productsPromise = getProducts();
    const categoriesPromise = getCategories();
    const offersPromise = getOffers();
    const contentPromise = getSiteContent<ProductsPageContent>("products-page");

    const [products, categories, offers, pageContent] = await Promise.all([
        productsPromise,
        categoriesPromise,
        offersPromise,
        contentPromise
    ]);

    // Note: In a real app with large data, search/filter should happen on server (Database query)
    // For now, we are fetching all and filtering in memory or using the searchProducts action if implemented efficiently

    const mainCategories = categories.filter(c => !c.parentId);

    const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || "Unknown";
    const getOffer = (id?: string) => id ? offers.find(o => o.id === id) : null;

    // Filter products
    let filteredProducts = params.search
        ? await searchProducts(params.search)
        : products;

    if (params.category) {
        filteredProducts = filteredProducts.filter(p => p.categoryId === params.category || p.subcategoryId === params.category);
    }

    // Simple availability filter (optional, maybe user wants to see out of stock items too)
    filteredProducts = filteredProducts.filter(p => p.available);

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
                            <div className="flex items-center gap-2 text-brand-lime font-mono text-xs mb-2">
                                <Package className="w-4 h-4" />
                                <span>INVENTORY_STATUS: LIVE</span>
                            </div>
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
                {/* Search & Filter Bar */}
                <div className="flex flex-col md:flex-row gap-4 mb-8 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <form action="/products">
                            <input
                                name="search"
                                defaultValue={params.search}
                                placeholder="Search collection..."
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-lg focus:ring-2 focus:ring-brand-blue/50 outline-none transition-all"
                            />
                        </form>
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                        <Link
                            href="/products"
                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${!params.category
                                ? "bg-brand-dark text-white"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                        >
                            All Items
                        </Link>
                        {mainCategories.map(cat => (
                            <Link
                                key={cat.id}
                                href={`/products?category=${cat.id}`}
                                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${params.category === cat.id
                                    ? "bg-brand-blue text-white"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                            >
                                {cat.name}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Products Grid */}
                {filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredProducts.map(product => {
                            const offer = getOffer(product.offerId);
                            const categoryName = getCategoryName(product.categoryId);

                            return (
                                <Link
                                    key={product.id}
                                    href={`/product/${product.id}`}
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
                        <p className="text-slate-500">Try adjusting your search or filters.</p>
                        {(params.search || params.category) && (
                            <Link href="/products" className="inline-block mt-4 text-brand-blue hover:underline">
                                Clear Filters
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
