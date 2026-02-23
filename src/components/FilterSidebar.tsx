"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, Filter, ChevronDown, Check } from "lucide-react";
import { FilterState, parseSearchParams, buildSearchParams, SORT_OPTIONS } from "@/lib/filter-utils";
import { Category, ProductsPageContent } from "@/app/actions";

interface FilterSidebarProps {
    categories: Category[];
    maxPriceRange?: number; // The absolute max price in DB to set slider/input limits
    settings?: Partial<ProductsPageContent>;
}

// Simple debounce hook for applying text/number filters
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

    // Ref to skip initial render effect
    const initialRender = useRef(true);

    // Default visibility settings
    const vis = {
        showSearch: settings?.showSearch ?? true,
        showSort: settings?.showSort ?? true,
        showPriceRange: settings?.showPriceRange ?? true,
        showCategories: settings?.showCategories ?? true,
        showAvailability: settings?.showAvailability ?? true,
    };

    // Update local state when URL params change (e.g. from back button)
    useEffect(() => {
        setFilters(parseSearchParams(searchParams));
    }, [searchParams]);

    const debouncedFilters = useDebounce(filters, 400);

    // Apply filters to URL when debounced state changes
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
        const reset: FilterState = {
            minPrice: undefined,
            maxPrice: undefined,
            categories: [],
            rating: undefined,
            sort: "newest",
            available: false
        };
        setFilters(reset);
        setIsOpen(false);
    };

    const toggleCategory = (catId: string) => {
        const current = filters.categories || [];
        const newCats = current.includes(catId)
            ? current.filter(c => c !== catId)
            : [...current, catId];
        updateFilters({ categories: newCats });
    };

    // Shared Filter Content
    const FilterContent = () => (
        <div className="space-y-8">
            {/* Search */}
            {vis.showSearch && (
                <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Search</h3>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={filters.search || ""}
                            onChange={(e) => updateFilters({ search: e.target.value })}
                            className="w-full pl-3 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-blue/50 outline-none"
                        />
                    </div>
                </div>
            )}

            {/* Sort */}
            {vis.showSort && (
                <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Sort By</h3>
                    <div className="space-y-2">
                        {SORT_OPTIONS.map(option => (
                            <label key={option.value} className="flex items-center gap-3 cursor-pointer group">
                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${filters.sort === option.value ? "border-brand-blue bg-brand-blue" : "border-slate-300 group-hover:border-brand-blue"}`}>
                                    {filters.sort === option.value && <div className="w-2 h-2 bg-white rounded-full" />}
                                </div>
                                <input
                                    type="radio"
                                    name="sort"
                                    className="hidden"
                                    checked={filters.sort === option.value}
                                    onChange={() => updateFilters({ sort: option.value })}
                                />
                                <span className={`text-sm ${filters.sort === option.value ? "text-slate-900 font-medium" : "text-slate-600 group-hover:text-slate-900"}`}>
                                    {option.label}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>
            )}

            {/* Price Range */}
            {vis.showPriceRange && (
                <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Price Range</h3>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="relative flex-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">₹</span>
                            <input
                                type="number"
                                placeholder="Min"
                                value={filters.minPrice || ""}
                                onChange={(e) => updateFilters({ minPrice: e.target.value ? Number(e.target.value) : undefined })}
                                className="w-full pl-6 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-blue/50 outline-none"
                            />
                        </div>
                        <span className="text-slate-400">-</span>
                        <div className="relative flex-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">₹</span>
                            <input
                                type="number"
                                placeholder="Max"
                                value={filters.maxPrice || ""}
                                onChange={(e) => updateFilters({ maxPrice: e.target.value ? Number(e.target.value) : undefined })}
                                className="w-full pl-6 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-blue/50 outline-none"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Categories */}
            {vis.showCategories && (
                <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Categories</h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                        {categories.map(cat => (
                            <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${filters.categories?.includes(cat.id) ? "border-brand-blue bg-brand-blue" : "border-slate-300 group-hover:border-brand-blue"}`}>
                                    {filters.categories?.includes(cat.id) && <Check className="w-3.5 h-3.5 text-white" />}
                                </div>
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={filters.categories?.includes(cat.id)}
                                    onChange={() => toggleCategory(cat.id)}
                                />
                                <span className={`text-sm ${filters.categories?.includes(cat.id) ? "text-slate-900 font-medium" : "text-slate-600 group-hover:text-slate-900"}`}>
                                    {cat.name}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>
            )}

            {/* Availability */}
            {vis.showAvailability && (
                <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Availability</h3>
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-10 h-6 rounded-full p-1 transition-colors ${filters.available ? "bg-brand-blue" : "bg-slate-200"}`}>
                            <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${filters.available ? "translate-x-4" : "translate-x-0"}`} />
                        </div>
                        <input
                            type="checkbox"
                            className="hidden"
                            checked={filters.available || false}
                            onChange={() => updateFilters({ available: !filters.available })}
                        />
                        <span className="text-sm text-slate-600 group-hover:text-slate-900">In Stock Only</span>
                    </label>
                </div>
            )}

            {/* Actions */}
            <div className="pt-6 border-t border-slate-100 flex flex-col gap-3">
                <button
                    onClick={clearFilters}
                    className="w-full py-3 bg-slate-100 text-slate-600 rounded-xl font-medium hover:bg-slate-200 transition-colors"
                >
                    Clear All Filters
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <div className="hidden lg:block w-64 shrink-0">
                <div className="bg-white rounded-2xl p-6 border border-slate-100 sticky top-24 shadow-sm max-h-[calc(100vh-120px)] overflow-y-auto no-scrollbar">
                    <div className="flex items-center gap-2 mb-6 text-brand-dark">
                        <Filter className="w-5 h-5" />
                        <h2 className="font-bold text-lg">Filters</h2>
                    </div>
                    <FilterContent />
                </div>
            </div>

            {/* Mobile Trigger */}
            <div className="lg:hidden mb-6">
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 font-medium shadow-sm active:scale-[0.98] transition-all"
                >
                    <span className="flex items-center gap-2"><Filter className="w-5 h-5 text-brand-blue" /> Filter & Sort</span>
                    <ChevronDown className="w-4 h-4" />
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
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 lg:hidden"
                        />
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 right-0 w-full max-w-xs bg-white z-50 shadow-2xl p-6 overflow-y-auto lg:hidden"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-bold text-slate-900">Filters</h2>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"
                                >
                                    <X className="w-5 h-5 text-slate-600" />
                                </button>
                            </div>
                            <FilterContent />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
