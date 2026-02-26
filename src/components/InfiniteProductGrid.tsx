"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { Package, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Product, getProducts, Offer, Category } from "@/app/actions";
import GenieRequestTrigger from "@/components/GenieRequestTrigger";
import { ProductCard } from "./ProductCard";

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

    const hasActiveFilters = !!(filters.search || filters.minPrice !== undefined || filters.maxPrice !== undefined || filters.available !== undefined || (filters.sort && filters.sort !== 'newest'));

    const [hasMore, setHasMore] = useState(!hasActiveFilters && initialProducts.length === 20);
    const [lastId, setLastId] = useState<string | undefined>(
        initialProducts.length > 0 ? initialProducts[initialProducts.length - 1].id : undefined
    );

    const observer = useRef<IntersectionObserver | null>(null);
    const loadMore = useCallback(async () => {
        if (loading || !hasMore || hasActiveFilters) return;
        setLoading(true);

        try {
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

    useEffect(() => {
        setProducts(initialProducts);
        setHasMore(!hasActiveFilters && initialProducts.length === 20);
        setLastId(initialProducts.length > 0 ? initialProducts[initialProducts.length - 1].id : undefined);
    }, [initialProducts, hasActiveFilters]);

    const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || "Unknown";
    const getOffer = (id?: string) => id ? offers.find(o => o.id === id) : null;

    const displayProducts = products;

    if (displayProducts.length === 0 && !loading && !hasMore) {
        return (
            <div className="flex flex-col gap-16">
                <div className="text-center py-32 bg-brand-charcoal/5 rounded-[2.5rem] border border-dashed border-brand-silver">
                    <Package className="w-16 h-16 text-brand-charcoal/10 mx-auto mb-6" />
                    <h3 className="text-2xl font-bold text-brand-charcoal">No properties found</h3>
                    <p className="text-brand-charcoal/40 font-light mt-2">Try adjusting your filters for a wider selection.</p>
                    <Link href="/products" className="inline-block mt-8 text-brand-gold font-bold uppercase tracking-widest text-[10px] hover:underline">
                        Clear all filters
                    </Link>
                </div>
                <GenieRequestTrigger searchQuery={filters.search} />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-24">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-12">
                {displayProducts.map((product, index) => {
                    const offer = getOffer(product.offerId);
                    const categoryName = getCategoryName(product.categoryId);
                    const isLast = index === displayProducts.length - 1;

                    return (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{
                                duration: 0.8,
                                delay: (index % 3) * 0.1,
                                ease: [0.22, 1, 0.36, 1]
                            }}
                        >
                            <ProductCard
                                product={product}
                                categoryName={categoryName}
                                offer={offer}
                                isLast={isLast}
                                lastProductElementRef={lastProductElementRef}
                            />
                        </motion.div>
                    );
                })}
            </div>

            {loading && (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-10 h-10 text-brand-gold animate-spin" />
                </div>
            )}

            {!hasMore && products.length > 0 && (
                <div className="text-center py-12 text-brand-charcoal/20 text-[10px] font-bold uppercase tracking-[0.5em]">
                    End of Collection
                </div>
            )}
        </div>
    );
}
