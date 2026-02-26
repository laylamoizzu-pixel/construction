"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, Filter, ChevronDown, Check, Search } from "lucide-react";
import { FilterState, parseSearchParams, buildSearchParams, SORT_OPTIONS } from "@/lib/filter-utils";
import { Category, ProductsPageContent } from "@/app/actions";
import { cn } from "@/lib/utils";

interface FilterSidebarProps {
    categories: Category[];
    maxPriceRange?: number;
    settings?: Partial<ProductsPageContent>;
}

function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);
    return debouncedValue;
}

export default function FilterSidebar({ categories, settings }: FilterSidebarProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isOpen, setIsOpen] = useState(false);
    const [filters, setFilters] = useState<FilterState>(() => parseSearchParams(searchParams));

    const initialRender = useRef(true);

    const vis = {
        showSearch: settings?.showSearch ?? true,
        showSort: settings?.showSort ?? true,
        showPriceRange: settings?.showPriceRange ?? true,
        showCategories: settings?.showCategories ?? true,
        showAvailability: settings?.showAvailability ?? true,
    };

    useEffect(() => {
        setFilters(parseSearchParams(searchParams));
    }, [searchParams]);

    const debouncedFilters = useDebounce(filters, 400);

    useEffect(() => {
        if (initialRender.current) {
            initialRender.current = false;
            return;
        }
        const params = buildSearchParams(debouncedFilters);
        router.push(`/products?${params.toString()}`);
    }, [debouncedFilters, router]);

    const updateFilters = (newFilters: Partial<FilterState>) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    };

    const clearFilters = () => {
        updateFilters({
            minPrice: undefined,
            maxPrice: undefined,
            categories: [],
            rating: undefined,
            sort: "newest",
            available: false,
            search: ""
        });
        setIsOpen(false);
    };

    const toggleCategory = (catId: string) => {
        const current = filters.categories || [];
        const newCats = current.includes(catId)
            ? current.filter(c => c !== catId)
            : [...current, catId];
        updateFilters({ categories: newCats });
    };

    const SidebarContent = () => (
        <div className="space-y-12">
            {/* Search */}
            {vis.showSearch && (
                <div className="space-y-4">
                    <h3 className="text-brand-gold font-bold uppercase tracking-[0.2em] text-[10px]">Search</h3>
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-charcoal/20 group-focus-within:text-brand-gold transition-colors" />
                        <input
                            type="text"
                            placeholder="Location, Project, Type..."
                            value={filters.search || ""}
                            onChange={(e) => updateFilters({ search: e.target.value })}
                            className="w-full pl-12 pr-4 py-4 bg-brand-charcoal/[0.03] border border-brand-charcoal/5 rounded-2xl text-sm focus:ring-1 focus:ring-brand-gold/50 focus:bg-white outline-none transition-all placeholder:text-brand-charcoal/20"
                        />
                    </div>
                </div>
            )}

            {/* Price Range */}
            {vis.showPriceRange && (
                <div className="space-y-4">
                    <h3 className="text-brand-gold font-bold uppercase tracking-[0.2em] text-[10px]">Price Limits</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <span className="text-[10px] text-brand-charcoal/30 uppercase font-bold tracking-widest pl-2">Min</span>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-charcoal/20 text-xs">₹</span>
                                <input
                                    type="number"
                                    value={filters.minPrice || ""}
                                    onChange={(e) => updateFilters({ minPrice: e.target.value ? Number(e.target.value) : undefined })}
                                    className="w-full pl-8 pr-4 py-3 bg-brand-charcoal/[0.03] border border-brand-charcoal/5 rounded-xl text-sm focus:ring-1 focus:ring-brand-gold/50 focus:bg-white outline-none transition-all"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <span className="text-[10px] text-brand-charcoal/30 uppercase font-bold tracking-widest pl-2">Max</span>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-charcoal/20 text-xs">₹</span>
                                <input
                                    type="number"
                                    value={filters.maxPrice || ""}
                                    onChange={(e) => updateFilters({ maxPrice: e.target.value ? Number(e.target.value) : undefined })}
                                    className="w-full pl-8 pr-4 py-3 bg-brand-charcoal/[0.03] border border-brand-charcoal/5 rounded-xl text-sm focus:ring-1 focus:ring-brand-gold/50 focus:bg-white outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Categories */}
            {vis.showCategories && (
                <div className="space-y-4">
                    <h3 className="text-brand-gold font-bold uppercase tracking-[0.2em] text-[10px]">Property Types</h3>
                    <div className="space-y-2">
                        {categories.map(cat => (
                            <label key={cat.id} className="flex items-center gap-4 cursor-pointer group">
                                <div className={cn(
                                    "w-5 h-5 rounded-full border transition-all flex items-center justify-center",
                                    filters.categories?.includes(cat.id)
                                        ? "border-brand-gold bg-brand-gold shadow-premium"
                                        : "border-brand-charcoal/10 group-hover:border-brand-gold/50"
                                )}>
                                    {filters.categories?.includes(cat.id) && <Check className="w-3 h-3 text-white" />}
                                </div>
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={filters.categories?.includes(cat.id)}
                                    onChange={() => toggleCategory(cat.id)}
                                />
                                <span className={cn(
                                    "text-sm transition-colors",
                                    filters.categories?.includes(cat.id) ? "text-brand-charcoal font-bold" : "text-brand-charcoal/40 group-hover:text-brand-charcoal"
                                )}>
                                    {cat.name}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>
            )}

            {/* Sort */}
            {vis.showSort && (
                <div className="space-y-4">
                    <h3 className="text-brand-gold font-bold uppercase tracking-[0.2em] text-[10px]">Sort Hierarchy</h3>
                    <div className="grid grid-cols-1 gap-2">
                        {SORT_OPTIONS.map(option => (
                            <button
                                key={option.value}
                                onClick={() => updateFilters({ sort: option.value })}
                                className={cn(
                                    "px-4 py-3 rounded-xl text-xs font-bold text-left transition-all uppercase tracking-widest",
                                    filters.sort === option.value
                                        ? "bg-brand-charcoal text-white shadow-premium"
                                        : "bg-brand-charcoal/5 text-brand-charcoal/40 hover:bg-brand-charcoal/10"
                                )}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="pt-8 border-t border-brand-charcoal/5">
                <button
                    onClick={clearFilters}
                    className="w-full py-4 text-[10px] font-bold uppercase tracking-[0.4em] text-brand-charcoal/20 hover:text-brand-gold transition-colors"
                >
                    Clear All Filters
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <div className="hidden lg:block sticky top-32 max-h-[calc(100vh-160px)] overflow-y-auto no-scrollbar pr-4">
                <div className="flex items-center gap-4 mb-12">
                    <div className="w-10 h-10 rounded-full bg-brand-charcoal flex items-center justify-center">
                        <Filter className="w-4 h-4 text-brand-gold" />
                    </div>
                    <h2 className="font-bold text-xl tracking-tight text-brand-charcoal">Advanced Filters</h2>
                </div>
                <SidebarContent />
            </div>

            {/* Mobile Trigger */}
            <div className="lg:hidden mb-12">
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-full flex items-center justify-between px-6 py-5 bg-brand-charcoal text-white rounded-[2rem] font-bold text-sm shadow-premium active:scale-[0.98] transition-all"
                >
                    <span className="flex items-center gap-3"><Filter className="w-5 h-5 text-brand-gold" /> Refinery</span>
                    <ChevronDown className="w-4 h-4 opacity-50" />
                </button>
            </div>

            {/* Mobile Drawer */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-brand-charcoal/60 backdrop-blur-md z-[100] lg:hidden"
                        />
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 30, stiffness: 300 }}
                            className="fixed inset-y-0 right-0 w-full max-w-sm bg-brand-white z-[101] shadow-2xl p-8 overflow-y-auto lg:hidden"
                        >
                            <div className="flex items-center justify-between mb-12">
                                <h2 className="text-2xl font-bold tracking-tight text-brand-charcoal">Filters</h2>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="w-10 h-10 rounded-full bg-brand-charcoal/5 flex items-center justify-center hover:bg-brand-charcoal/10 transition-colors"
                                >
                                    <X className="w-5 h-5 text-brand-charcoal" />
                                </button>
                            </div>
                            <SidebarContent />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
