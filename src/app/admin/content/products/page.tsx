"use client";

import React, { useState, useEffect } from "react";


import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import {
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    deleteProducts,
    bulkUpdateProducts,
    toggleProductAvailability,
    getCategories,
    getOffers,
    searchProducts,
    getAllProductsForExport,
    Product,
    Category,
    Offer
} from "@/app/actions";
import * as XLSX from "xlsx";
import {
    Loader2,
    ArrowLeft,
    Plus,
    Trash2,
    Package,
    Save,
    Edit2,
    Eye,
    EyeOff,
    Tag,
    X,
    Filter,
    FileSpreadsheet,
    Search,
    Star,
    StarOff,
    FolderInput,
    CheckSquare,
    XSquare
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import CloudinaryUpload from "@/components/CloudinaryUpload";
import ExcelImportModal from "@/components/admin/ExcelImportModal";

export default function ProductsManager() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [offers, setOffers] = useState<Offer[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [bulkActionLoading, setBulkActionLoading] = useState(false);
    const [showBulkCategoryPicker, setShowBulkCategoryPicker] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);



    // ... filters state
    const [filterCategory, setFilterCategory] = useState<string>("");
    const [filterAvailable, setFilterAvailable] = useState<string>("");
    const [searchQuery, setSearchQuery] = useState("");
    const [hasMore, setHasMore] = useState(false);

    // Dynamic filtering logic
    const filteredProducts = React.useMemo(() => {
        return products.filter(product => {
            const searchLower = searchQuery.toLowerCase().trim();
            if (!searchLower) return true;

            const nameMatch = product.name.toLowerCase().includes(searchLower);
            const descMatch = product.description?.toLowerCase().includes(searchLower);
            const tagMatch = product.tags?.some(tag => tag.toLowerCase().includes(searchLower));

            return nameMatch || descMatch || tagMatch;
        });
    }, [products, searchQuery]);

    const [formData, setFormData] = useState<{
        name: string;
        description: string;
        price: string;
        originalPrice: string;
        categoryId: string;
        subcategoryId: string;
        imageUrl: string; // Keep for backward compatibility/single main image
        images: string[]; // New: support multiple images
        videoUrl: string | null;
        available: boolean;
        featured: boolean;
        offerId: string;
        tags: string;
        highlights: string;
        specifications: { key: string; value: string }[];
    }>({
        name: "",
        description: "",
        price: "",
        originalPrice: "",
        categoryId: "",
        subcategoryId: "",
        imageUrl: "", // Main image (first match in images array)
        images: [],
        videoUrl: null,
        available: true,
        featured: false,
        offerId: "",
        tags: "",
        highlights: "",
        specifications: [] as { key: string; value: string }[]
    });

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/admin/login");
        }
    }, [authLoading, user, router]);

    useEffect(() => {
        if (user) {
            loadData();
        }
    }, [user]);

    const loadData = async () => {
        setLoading(true);
        const [productsData, categoriesData, offersData] = await Promise.all([
            getProducts(),
            getCategories(),
            getOffers()
        ]);
        setProducts(productsData);
        setCategories(categoriesData);
        setOffers(offersData);
        setLoading(false);
    };

    const loadProducts = React.useCallback(async (isLoadMore: boolean = false) => {
        if (isLoadMore) {
            setLoadingMore(true);
        } else {
            setLoading(true);
        }

        // Determine if selected category is a subcategory
        let categoryId: string | undefined = undefined;
        let subcategoryId: string | undefined = undefined;

        if (filterCategory) {
            // Check if it's a subcategory (has parentId)
            const cat = categories.find(c => c.id === filterCategory);
            if (cat?.parentId) {
                subcategoryId = filterCategory;
            } else {
                categoryId = filterCategory;
            }
        }

        // Correctly parse available filter: "true" -> true, "false" -> false, "" -> undefined
        const availableFilter = filterAvailable === "" ? undefined : filterAvailable === "true";

        let data: Product[] = [];

        if (searchQuery.trim()) {
            // Pass the availableFilter directly (tri-state)
            data = await searchProducts(searchQuery, categoryId, subcategoryId, availableFilter);
            setHasMore(false); // Search fetches a large batch, don't paginate for now
        } else {
            const limit = 20000; // Keep high limit as we do client-side sort optimization in actions
            const startAfter = isLoadMore ? products[products.length - 1]?.id : undefined;
            // Pass subcategory and available filter
            data = await getProducts(categoryId, availableFilter, limit, startAfter, subcategoryId);
            setHasMore(data.length === limit);
        }

        if (isLoadMore) {
            setProducts(prev => [...prev, ...data]);
        } else {
            setProducts(data);
        }
        setLoading(false);
        setLoadingMore(false);
    }, [filterCategory, filterAvailable, searchQuery, products, categories]);


    useEffect(() => {
        if (user) {
            // Debounced search or immediate filter change
            const timer = setTimeout(() => {
                loadProducts();
            }, searchQuery ? 500 : 0);
            return () => clearTimeout(timer);
        }
    }, [user, loadProducts, searchQuery, filterCategory, filterAvailable]);

    const resetForm = () => {
        setFormData({
            name: "",
            description: "",
            price: "",
            originalPrice: "",
            categoryId: "",
            subcategoryId: "",
            imageUrl: "",
            images: [],
            videoUrl: null,
            available: true,
            featured: false,
            offerId: "",
            tags: "",
            highlights: "",
            specifications: []
        });
        setEditingId(null);
    };



    const removeImage = (indexToRemove: number) => {
        setFormData(prev => {
            const updatedImages = prev.images.filter((_, index) => index !== indexToRemove);
            return {
                ...prev,
                images: updatedImages,
                imageUrl: updatedImages.length > 0 ? updatedImages[0] : ""
            };
        });
    };

    const addImageUrl = (url: string) => {
        if (!url) return;
        setFormData(prev => {
            const updatedImages = [...prev.images, url];
            return {
                ...prev,
                images: updatedImages,
                imageUrl: prev.imageUrl || url
            };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        const productData = {
            name: formData.name,
            description: formData.description,
            price: parseFloat(formData.price) || 0,
            originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
            categoryId: formData.categoryId,
            subcategoryId: formData.subcategoryId || undefined,
            imageUrl: formData.images.length > 0 ? formData.images[0] : formData.imageUrl,
            images: formData.images.length > 0 ? formData.images : (formData.imageUrl ? [formData.imageUrl] : []),
            videoUrl: formData.videoUrl,
            available: formData.available,
            featured: formData.featured,
            offerId: formData.offerId || undefined,
            tags: formData.tags.split(",").map(t => t.trim()).filter(Boolean),
            highlights: formData.highlights.split("\n").map(h => h.trim()).filter(Boolean),
            specifications: formData.specifications.filter(s => s.key.trim() && s.value.trim())
        };

        let result;
        if (editingId) {
            result = await updateProduct(editingId, productData);
        } else {
            result = await createProduct(productData);
        }

        if (result.success) {
            resetForm();
            setShowForm(false);
            await loadProducts();
        }
        setSaving(false);
    };

    const handleEdit = (product: Product) => {
        setFormData({
            name: product.name,
            description: product.description,
            price: product.price.toString(),
            originalPrice: product.originalPrice?.toString() || "",
            categoryId: product.categoryId,
            subcategoryId: product.subcategoryId || "",
            imageUrl: product.imageUrl,
            images: product.images && product.images.length > 0 ? product.images : (product.imageUrl ? [product.imageUrl] : []),
            videoUrl: product.videoUrl || null,
            available: product.available,
            featured: product.featured,
            offerId: product.offerId || "",
            tags: product.tags.join(", "),
            highlights: product.highlights ? product.highlights.join("\n") : "",
            specifications: product.specifications || []
        });
        setEditingId(product.id);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this product?")) {
            await deleteProduct(id);
            await loadProducts();
        }
    };

    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const toggleSelection = (id: string) => {
        const newSelection = new Set(selectedIds);
        if (newSelection.has(id)) {
            newSelection.delete(id);
        } else {
            newSelection.add(id);
        }
        setSelectedIds(newSelection);
    };

    const toggleAll = () => {
        if (selectedIds.size === filteredProducts.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredProducts.map(p => p.id)));
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.size === 0) return;

        if (confirm(`Are you sure you want to delete ${selectedIds.size} products? This action cannot be undone.`)) {
            setBulkActionLoading(true);
            await deleteProducts(Array.from(selectedIds));
            setSelectedIds(new Set());
            await loadProducts();
            setBulkActionLoading(false);
        }
    };

    const handleBulkAvailability = async (available: boolean) => {
        if (selectedIds.size === 0) return;
        setBulkActionLoading(true);
        // Optimistic update
        setProducts(prev => prev.map(p =>
            selectedIds.has(p.id) ? { ...p, available } : p
        ));
        const res = await bulkUpdateProducts(Array.from(selectedIds), { available });
        if (!res.success) {
            alert("Failed to update availability");
            await loadProducts(); // Revert
        }
        setSelectedIds(new Set());
        setBulkActionLoading(false);
    };

    const handleBulkFeatured = async (featured: boolean) => {
        if (selectedIds.size === 0) return;
        setBulkActionLoading(true);
        // Optimistic update
        setProducts(prev => prev.map(p =>
            selectedIds.has(p.id) ? { ...p, featured } : p
        ));
        const res = await bulkUpdateProducts(Array.from(selectedIds), { featured });
        if (!res.success) {
            alert("Failed to update featured status");
            await loadProducts();
        }
        setSelectedIds(new Set());
        setBulkActionLoading(false);
    };

    const handleBulkCategoryChange = async (categoryId: string) => {
        if (selectedIds.size === 0 || !categoryId) return;
        const catName = getCategoryName(categoryId);
        if (!confirm(`Move ${selectedIds.size} products to category "${catName}"?`)) return;
        setBulkActionLoading(true);
        // Optimistic update
        setProducts(prev => prev.map(p =>
            selectedIds.has(p.id) ? { ...p, categoryId } : p
        ));
        const res = await bulkUpdateProducts(Array.from(selectedIds), { categoryId });
        if (!res.success) {
            alert("Failed to change category");
            await loadProducts();
        }
        setSelectedIds(new Set());
        setShowBulkCategoryPicker(false);
        setBulkActionLoading(false);
    };

    const handleToggleAvailability = async (id: string, current: boolean) => {
        // Optimistic update
        setProducts(prev => prev.map(p =>
            p.id === id ? { ...p, available: !current } : p
        ));

        // Sync with server
        const res = await toggleProductAvailability(id, !current);

        // Revert if failed
        if (!res.success) {
            alert("Failed to update availability");
            setProducts(prev => prev.map(p =>
                p.id === id ? { ...p, available: current } : p
            ));
        } else {
            // Optional: Reload to ensure consistency, but not strictly necessary if optimistic worked
            // await loadProducts(); 
        }
    };

    const mainCategories = categories.filter(c => !c.parentId);
    const getSubcategories = (parentId: string) => categories.filter(c => c.parentId === parentId);
    const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || "Unknown";
    const getOfferName = (id: string) => offers.find(o => o.id === id);

    const handleExport = async () => {
        try {
            setLoading(true); // Show global loading or specific export state
            const allProducts = await getAllProductsForExport();

            const exportData = allProducts.map(p => ({
                "ID": p.id,
                "Name": p.name,
                "Description": p.description,
                "Category": getCategoryName(p.categoryId),
                "Subcategory": p.subcategoryId ? getCategoryName(p.subcategoryId) : "",
                "Price": p.price,
                "Original Price": p.originalPrice || "",
                "Available": p.available ? "Yes" : "No",
                "Featured": p.featured ? "Yes" : "No",
                "Offer": p.offerId ? getOfferName(p.offerId)?.title : "",
                "Tags": p.tags ? p.tags.join(", ") : "",
                "Image URL": p.imageUrl || "",
                "Created At": p.createdAt ? new Date(p.createdAt).toLocaleDateString() : ""
            }));

            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Products");

            // Auto-width columns
            const colWidths = [
                { wch: 20 }, // ID
                { wch: 30 }, // Name
                { wch: 40 }, // Description
                { wch: 15 }, // Category
                { wch: 15 }, // Subcategory
                { wch: 10 }, // Price
                { wch: 10 }, // Original Price
                { wch: 10 }, // Available
                { wch: 10 }, // Featured
                { wch: 20 }, // Offer
                { wch: 20 }, // Tags
                { wch: 50 }, // Image URL
                { wch: 15 }, // Created At
            ];
            ws['!cols'] = colWidths;

            XLSX.writeFile(wb, `smart_avenue_products_${new Date().toISOString().split('T')[0]}.xlsx`);
        } catch (error) {
            console.error("Export failed:", error);
            alert("Failed to export products. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <Link href="/admin" className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-gray-800">Products</h1>
                        <p className="text-gray-500">Manage your product catalog</p>
                    </div>
                    <Link
                        href="/admin/content/categories"
                        className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
                    >
                        Manage Categories
                    </Link>
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors shadow-sm font-medium"
                    >
                        <FileSpreadsheet className="w-5 h-5 text-green-600" />
                        Export Excel
                    </button>
                    <button
                        onClick={() => setShowImportModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors shadow-sm font-medium"
                    >
                        <FolderInput className="w-5 h-5 text-blue-600" />
                        Import Excel
                    </button>

                    <button
                        onClick={() => { resetForm(); setShowForm(!showForm); }}
                        className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors shadow-sm font-medium"
                    >
                        <Plus className="w-5 h-5" />
                        Add Product
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <div className="flex-1 relative w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search products by name or tag..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                            />
                        </div>
                        <div className="flex items-center gap-4 flex-wrap w-full md:w-auto">
                            <Filter className="w-5 h-5 text-gray-400" />
                            <select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            >
                                <option value="">All Categories</option>
                                {mainCategories.map(cat => (
                                    <optgroup key={cat.id} label={cat.name}>
                                        <option value={cat.id}>{cat.name}</option>
                                        {getSubcategories(cat.id).map(sub => (
                                            <option key={sub.id} value={sub.id}>  └ {sub.name}</option>
                                        ))}
                                    </optgroup>
                                ))}
                            </select>
                            <select
                                value={filterAvailable}
                                onChange={(e) => setFilterAvailable(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            >
                                <option value="">All Status</option>
                                <option value="true">Available</option>
                                <option value="false">Unavailable</option>
                            </select>
                            {(filterCategory || filterAvailable || searchQuery) && (
                                <button
                                    onClick={() => { setFilterCategory(""); setFilterAvailable(""); setSearchQuery(""); }}
                                    className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Product Form */}
                {showForm && (
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-800">
                                {editingId ? "Edit Product" : "Add New Product"}
                            </h3>
                            <button onClick={() => { setShowForm(false); resetForm(); }}>
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Premium Cotton Towel Set"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Media (Images & Video)</label>
                                    <CloudinaryUpload
                                        folder="products"
                                        multiple
                                        currentImages={formData.images}
                                        currentVideo={formData.videoUrl}
                                        onUpload={(files) => {
                                            const newImages = files.filter(f => f.resourceType === "image").map(f => f.url);
                                            const newVideo = files.find(f => f.resourceType === "video")?.url || formData.videoUrl;
                                            setFormData(prev => ({
                                                ...prev,
                                                images: [...prev.images, ...newImages],
                                                imageUrl: prev.imageUrl || newImages[0] || "",
                                                videoUrl: newVideo
                                            }));
                                        }}
                                        onRemoveImage={(index) => removeImage(index)}
                                        onRemoveVideo={() => setFormData(prev => ({ ...prev, videoUrl: null }))}
                                    />
                                    <div className="mt-4 flex flex-col gap-2">
                                        <div className="flex gap-2">
                                            <input
                                                type="url"
                                                placeholder="Or paste image URL here..."
                                                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-amber-500"
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        addImageUrl(e.currentTarget.value);
                                                        e.currentTarget.value = '';
                                                    }
                                                }}
                                                id="url-input"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const input = document.getElementById('url-input') as HTMLInputElement;
                                                    if (input) {
                                                        addImageUrl(input.value);
                                                        input.value = '';
                                                    }
                                                }}
                                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                                            >
                                                Add Image Link
                                            </button>
                                        </div>
                                        <div className="flex gap-2">
                                            <input
                                                type="url"
                                                placeholder="Or paste video URL here..."
                                                value={formData.videoUrl || ""}
                                                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value || null })}
                                                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-amber-500"
                                            />
                                            {formData.videoUrl && (
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, videoUrl: null })}
                                                    className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-medium transition-colors"
                                                >
                                                    Clear Video
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    placeholder="Product description..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
                                    <input
                                        type="number"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        placeholder="499"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Original Price (₹)</label>
                                    <input
                                        type="number"
                                        value={formData.originalPrice}
                                        onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                                        placeholder="699 (for showing discount)"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                                    <select
                                        value={formData.categoryId}
                                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value, subcategoryId: "" })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                                        required
                                    >
                                        <option value="">Select Category</option>
                                        {mainCategories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {formData.categoryId && getSubcategories(formData.categoryId).length > 0 && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
                                        <select
                                            value={formData.subcategoryId}
                                            onChange={(e) => setFormData({ ...formData, subcategoryId: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                                        >
                                            <option value="">None</option>
                                            {getSubcategories(formData.categoryId).map(sub => (
                                                <option key={sub.id} value={sub.id}>{sub.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Link to Offer</label>
                                    <select
                                        value={formData.offerId}
                                        onChange={(e) => setFormData({ ...formData, offerId: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                                    >
                                        <option value="">No Offer</option>
                                        {offers.map(offer => (
                                            <option key={offer.id} value={offer.id}>{offer.title} ({offer.discount})</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                                    <input
                                        type="text"
                                        value={formData.tags}
                                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                        placeholder="new, bestseller, premium"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                                    />
                                </div>
                            </div>

                            {/* Highlights */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Highlights (One per line)</label>
                                <textarea
                                    value={formData.highlights}
                                    onChange={(e) => setFormData({ ...formData, highlights: e.target.value })}
                                    rows={4}
                                    placeholder="• Premium quality material&#10;• 5-year warranty&#10;• Easy installation"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 font-mono text-sm"
                                />
                            </div>

                            {/* Specifications */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Specifications</label>
                                <div className="space-y-2 mb-2">
                                    {formData.specifications.map((spec, index) => (
                                        <div key={index} className="flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="Key (e.g. Material)"
                                                value={spec.key}
                                                onChange={(e) => {
                                                    const newSpecs = [...formData.specifications];
                                                    newSpecs[index].key = e.target.value;
                                                    setFormData({ ...formData, specifications: newSpecs });
                                                }}
                                                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Value (e.g. 100% Cotton)"
                                                value={spec.value}
                                                onChange={(e) => {
                                                    const newSpecs = [...formData.specifications];
                                                    newSpecs[index].value = e.target.value;
                                                    setFormData({ ...formData, specifications: newSpecs });
                                                }}
                                                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newSpecs = formData.specifications.filter((_, i) => i !== index);
                                                    setFormData({ ...formData, specifications: newSpecs });
                                                }}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, specifications: [...formData.specifications, { key: "", value: "" }] })}
                                    className="text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1"
                                >
                                    <Plus className="w-4 h-4" /> Add Specification
                                </button>
                            </div>

                            <div className="flex items-center gap-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.available}
                                        onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                                        className="w-4 h-4 text-amber-500 focus:ring-amber-500 rounded"
                                    />
                                    <span className="text-sm text-gray-700">Available for sale</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.featured}
                                        onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                                        className="w-4 h-4 text-amber-500 focus:ring-amber-500 rounded"
                                    />
                                    <span className="text-sm text-gray-700">Featured product</span>
                                </label>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => { setShowForm(false); resetForm(); }}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex items-center gap-2 px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg disabled:opacity-50"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    {editingId ? "Update Product" : "Save Product"}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Products Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="p-4 w-10">
                                        <input
                                            type="checkbox"
                                            checked={filteredProducts.length > 0 && selectedIds.size === filteredProducts.length}
                                            onChange={toggleAll}
                                            className="w-4 h-4 text-amber-600 rounded border-gray-300 focus:ring-amber-500 cursor-pointer"
                                        />
                                    </th>
                                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-16">Image</th>
                                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Product Name</th>
                                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Status</th>
                                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Featured</th>
                                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading && products.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="p-8 text-center">
                                            <Loader2 className="w-8 h-8 animate-spin text-amber-600 mx-auto" />
                                        </td>
                                    </tr>
                                ) : products.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="p-12 text-center text-gray-500">
                                            <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                            <p className="text-lg font-medium text-gray-900">No products found</p>
                                            <p className="text-sm">Get started by creating a new product.</p>
                                        </td>
                                    </tr>
                                ) : filteredProducts.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="p-12 text-center text-gray-500">
                                            <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                            <p className="text-lg font-medium text-gray-900">No matching products</p>
                                            <p className="text-sm">Try adjusting your search or filters.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredProducts.map((product) => {
                                        const offer = product.offerId ? getOfferName(product.offerId) : null;
                                        const isSelected = selectedIds.has(product.id);

                                        return (
                                            <tr
                                                key={product.id}
                                                className={`group hover:bg-gray-50 transition-colors ${isSelected ? 'bg-amber-50/50' : ''}`}
                                            >
                                                <td className="p-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => toggleSelection(product.id)}
                                                        className="w-4 h-4 text-amber-600 rounded border-gray-300 focus:ring-amber-500 cursor-pointer"
                                                    />
                                                </td>
                                                <td className="p-4">
                                                    <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden relative border border-gray-200">
                                                        {product.imageUrl ? (
                                                            <Image
                                                                src={(() => {
                                                                    if (product.imageUrl.includes("cloudinary.com") && !product.imageUrl.includes("f_auto,q_auto")) {
                                                                        return product.imageUrl.replace("/upload/", "/upload/f_auto,q_auto/");
                                                                    }
                                                                    return product.imageUrl;
                                                                })()}
                                                                alt={product.name}
                                                                fill
                                                                className="object-cover"
                                                                unoptimized
                                                                onError={(e) => {
                                                                    const target = e.target as HTMLImageElement;
                                                                    target.style.display = 'none';
                                                                }}
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <Package className="w-5 h-5 text-gray-300" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-4 max-w-xs">
                                                    <div className="font-medium text-gray-900 truncate" title={product.name}>
                                                        {product.name}
                                                    </div>
                                                    {offer && (
                                                        <span className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 text-[10px] bg-green-100 text-green-700 rounded font-medium">
                                                            <Tag className="w-3 h-3" />
                                                            {offer.discount}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-4 text-sm text-gray-500">
                                                    <div className="flex flex-col">
                                                        <span>{getCategoryName(product.categoryId)}</span>
                                                        {product.subcategoryId && (
                                                            <span className="text-xs text-gray-400">└ {getCategoryName(product.subcategoryId)}</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="font-semibold text-gray-900">₹{product.price}</div>
                                                    {product.originalPrice && (
                                                        <div className="text-xs text-gray-400 line-through">₹{product.originalPrice}</div>
                                                    )}
                                                </td>
                                                <td className="p-4 text-center">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                        }`}>
                                                        {product.available ? 'Active' : 'Draft'}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-center">
                                                    {product.featured ? (
                                                        <Star className="w-4 h-4 text-amber-400 fill-amber-400 mx-auto" />
                                                    ) : (
                                                        <StarOff className="w-4 h-4 text-gray-300 mx-auto" />
                                                    )}
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => handleEdit(product)}
                                                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleToggleAvailability(product.id, product.available)}
                                                            className={`p-1.5 rounded transition-colors ${product.available ? 'text-gray-500 hover:text-red-600 hover:bg-red-50' : 'text-gray-500 hover:text-green-600 hover:bg-green-50'
                                                                }`}
                                                            title={product.available ? "Mark Unavailable" : "Mark Available"}
                                                        >
                                                            {product.available ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                        </button>
                                                        <div className="w-px h-4 bg-gray-200 mx-1" />
                                                        <button
                                                            onClick={() => handleDelete(product.id)}
                                                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {hasMore && !searchQuery && (
                        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-center">
                            <button
                                onClick={() => loadProducts(true)}
                                disabled={loadingMore}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-all shadow-sm disabled:opacity-50"
                            >
                                {loadingMore ? (
                                    <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                                ) : (
                                    <Plus className="w-4 h-4" />
                                )}
                                {loadingMore ? "Loading..." : "Load More Products"}
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <ExcelImportModal
                isOpen={showImportModal}
                onClose={() => setShowImportModal(false)}
                onSuccess={() => {
                    loadData();
                }}
            />

            {/* Floating Bulk Action Bar */}
            {selectedIds.size > 0 && (
                <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-6 pointer-events-none">
                    <div className="pointer-events-auto bg-gray-900/95 backdrop-blur-lg text-white rounded-2xl shadow-2xl border border-gray-700/50 px-5 py-3 flex items-center gap-3 flex-wrap max-w-5xl animate-in slide-in-from-bottom-4 fade-in duration-300">
                        {/* Selection Info */}
                        <div className="flex items-center gap-2 pr-3 border-r border-gray-700">
                            <CheckSquare className="w-4 h-4 text-amber-400" />
                            <span className="font-semibold text-sm whitespace-nowrap">
                                {selectedIds.size} selected
                            </span>
                            <button
                                onClick={() => setSelectedIds(new Set())}
                                className="ml-1 p-1 hover:bg-gray-700 rounded-lg transition-colors"
                                title="Deselect All"
                            >
                                <XSquare className="w-4 h-4 text-gray-400 hover:text-white" />
                            </button>
                        </div>

                        {/* Availability Actions */}
                        <button
                            onClick={() => handleBulkAvailability(true)}
                            disabled={bulkActionLoading}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600/80 hover:bg-green-600 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 whitespace-nowrap"
                            title="Mark all selected as Available"
                        >
                            <Eye className="w-4 h-4" />
                            Available
                        </button>
                        <button
                            onClick={() => handleBulkAvailability(false)}
                            disabled={bulkActionLoading}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-600/80 hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 whitespace-nowrap"
                            title="Mark all selected as Unavailable"
                        >
                            <EyeOff className="w-4 h-4" />
                            Unavailable
                        </button>

                        <div className="w-px h-6 bg-gray-700" />

                        {/* Featured Actions */}
                        <button
                            onClick={() => handleBulkFeatured(true)}
                            disabled={bulkActionLoading}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600/80 hover:bg-amber-600 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 whitespace-nowrap"
                            title="Mark all selected as Featured"
                        >
                            <Star className="w-4 h-4" />
                            Featured
                        </button>
                        <button
                            onClick={() => handleBulkFeatured(false)}
                            disabled={bulkActionLoading}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-600/80 hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 whitespace-nowrap"
                            title="Remove Featured from all selected"
                        >
                            <StarOff className="w-4 h-4" />
                            Unfeature
                        </button>

                        <div className="w-px h-6 bg-gray-700" />

                        {/* Category Change */}
                        <div className="relative">
                            <button
                                onClick={() => setShowBulkCategoryPicker(!showBulkCategoryPicker)}
                                disabled={bulkActionLoading}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/80 hover:bg-blue-600 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 whitespace-nowrap"
                                title="Move selected to a category"
                            >
                                <FolderInput className="w-4 h-4" />
                                Move Category
                            </button>
                            {showBulkCategoryPicker && (
                                <div className="absolute bottom-full mb-2 left-0 bg-white text-gray-800 rounded-xl shadow-2xl border border-gray-200 py-2 w-56 max-h-64 overflow-y-auto z-50">
                                    <div className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Move to...</div>
                                    {mainCategories.map(cat => (
                                        <div key={cat.id}>
                                            <button
                                                onClick={() => handleBulkCategoryChange(cat.id)}
                                                className="w-full text-left px-3 py-2 hover:bg-amber-50 text-sm transition-colors flex items-center gap-2"
                                            >
                                                <span className="font-medium">{cat.name}</span>
                                            </button>
                                            {getSubcategories(cat.id).map(sub => (
                                                <button
                                                    key={sub.id}
                                                    onClick={() => handleBulkCategoryChange(sub.id)}
                                                    className="w-full text-left px-3 py-2 pl-7 hover:bg-amber-50 text-sm text-gray-600 transition-colors"
                                                >
                                                    └ {sub.name}
                                                </button>
                                            ))}
                                        </div>
                                    ))}
                                    <div className="border-t border-gray-100 mt-1 pt-1">
                                        <button
                                            onClick={() => setShowBulkCategoryPicker(false)}
                                            className="w-full text-left px-3 py-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="w-px h-6 bg-gray-700" />

                        {/* Delete */}
                        <button
                            onClick={handleBulkDelete}
                            disabled={bulkActionLoading}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600/80 hover:bg-red-600 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 whitespace-nowrap"
                            title="Delete all selected products"
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete
                        </button>

                        {bulkActionLoading && (
                            <Loader2 className="w-4 h-4 animate-spin text-amber-400 ml-1" />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
