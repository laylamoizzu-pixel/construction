"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Package, ChevronRight, Zap, Tag, Star, Loader2 } from "lucide-react";
import { Product, getProducts, Offer, Category } from "@/app/actions";
import SocialProofBadge from "@/components/ai/SocialProofBadge";
import GenieRequestTrigger from "@/components/GenieRequestTrigger";

interface InfiniteProductGridProps {
    initialProducts: Product[];
    categories: Category[];
    offers: Offer[];
    filters: {
        category?: string | string[];
        subcategory?: string;
        search?: string;
        minPrice?: number;
        maxPrice?: number;
        sort?: string;
        rating?: number;
        available?: boolean | "all";
    };
}

export default function InfiniteProductGrid({
    initialProducts,
    categories,
    offers,
    filters
}: InfiniteProductGridProps) {
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [loading, setLoading] = useState(false);

    // We only enable pagination if NO filters are active (except category/subcategory)
    // because our getFilteredProducts returns ALL matches at once.
    const hasActiveFilters = !!(filters.search || filters.minPrice !== undefined || filters.maxPrice !== undefined || filters.available !== undefined || (filters.sort && filters.sort !== 'newest'));

    const [hasMore, setHasMore] = useState(!hasActiveFilters && initialProducts.length === 20); // Assuming batch size 20
    const [lastId, setLastId] = useState<string | undefined>(
        initialProducts.length > 0 ? initialProducts[initialProducts.length - 1].id : undefined
    );

    const observer = useRef<IntersectionObserver | null>(null);
    const loadMore = useCallback(async () => {
        if (loading || !hasMore || hasActiveFilters) return;
        setLoading(true);

        try {
            // Determine active category for fetching
            const activeCategory = Array.isArray(filters.category) ? filters.category[0] : filters.category;

            const nextBatch = await getProducts(
                activeCategory,
                filters.available,
                20,
                lastId,
                filters.subcategory
            );

            if (nextBatch.length === 0) {
                setHasMore(false);
            } else {
                setProducts(prev => [...prev, ...nextBatch]);
                setLastId(nextBatch[nextBatch.length - 1].id);
                setHasMore(nextBatch.length === 20);
            }
        } catch (error) {
            console.error("Error loading products:", error);
            setHasMore(false);
        } finally {
            setLoading(false);
        }
    }, [loading, hasMore, lastId, filters.category, filters.subcategory, filters.available, hasActiveFilters]);

    const lastProductElementRef = useCallback((node: HTMLAnchorElement | null) => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                loadMore();
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, hasMore, loadMore]);

    // Reset when initialProducts change
    useEffect(() => {
        setProducts(initialProducts);
        setHasMore(!hasActiveFilters && initialProducts.length === 20);
        setLastId(initialProducts.length > 0 ? initialProducts[initialProducts.length - 1].id : undefined);
    }, [initialProducts, hasActiveFilters]);


    const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || "Unknown";
    const getOffer = (id?: string) => id ? offers.find(o => o.id === id) : null;

    // displayProducts is now exactly the products array (which comprises initialProducts populated from getFilteredProducts + any paginated ones)
    const displayProducts = products;

    if (displayProducts.length === 0 && !loading && !hasMore) {
        return (
            <div className="flex flex-col gap-8">
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                    <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-700">No properties found</h3>
                    <p className="text-slate-500">Try adjusting your filters.</p>
                    <Link href="/products" className="inline-block mt-4 text-brand-blue hover:underline">
                        Clear Filters
                    </Link>
                </div>

                {/* Genie Request Trigger */}
                <GenieRequestTrigger searchQuery={filters.search} />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayProducts.map((product, index) => {
                    const offer = getOffer(product.offerId);
                    const categoryName = getCategoryName(product.categoryId);
                    const isLast = index === displayProducts.length - 1;

                    return (
                        <Link
                            key={product.id}
                            ref={isLast ? lastProductElementRef : null}
                            href={`/products/${product.id}`}
                            className="group bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl hover:border-brand-blue/30 transition-all duration-300 flex flex-col"
                        >
                            <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                                <Image
                                    src={product.imageUrl}
                                    alt={product.name}
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
                                <div className="absolute bottom-3 left-3 right-3 flex justify-end">
                                    <SocialProofBadge product={product} compact={true} />
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

            {
                loading && (
                    <div className="flex justify-center py-8">
                        <Loader2 className="w-8 h-8 text-brand-blue animate-spin" />
                    </div>
                )
            }

            {
                !hasMore && products.length > 0 && (
                    <div className="text-center py-8 text-slate-400 text-sm">
                        You&apos;ve reached the end of our collection.
                    </div>
                )
            }
        </div >
    );
}
