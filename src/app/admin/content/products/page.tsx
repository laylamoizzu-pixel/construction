"use client";

import React, { useState, useEffect } from "react";


import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import {
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleProductAvailability,
    getCategories,
    getOffers,
    Product,
    Category,
    Offer
} from "@/app/actions";
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
    Film
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import CloudinaryUpload from "@/components/CloudinaryUpload";

export default function ProductsManager() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [offers, setOffers] = useState<Offer[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);


    // ... filters state
    const [filterCategory, setFilterCategory] = useState<string>("");
    const [filterAvailable, setFilterAvailable] = useState<string>("");

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
        tags: ""
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

    const loadProducts = React.useCallback(async () => {
        const categoryFilter = filterCategory || undefined;
        const availableFilter = filterAvailable === "" ? undefined : filterAvailable === "true";
        const data = await getProducts(categoryFilter, availableFilter);
        setProducts(data);
    }, [filterCategory, filterAvailable]);

    useEffect(() => {
        if (user && !loading) {
            loadProducts();
        }
    }, [user, loading, loadProducts]);

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
            tags: ""
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
            tags: formData.tags.split(",").map(t => t.trim()).filter(Boolean)
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
            tags: product.tags.join(", ")
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

    const handleToggleAvailability = async (id: string, current: boolean) => {
        await toggleProductAvailability(id, !current);
        await loadProducts();
    };

    const mainCategories = categories.filter(c => !c.parentId);
    const getSubcategories = (parentId: string) => categories.filter(c => c.parentId === parentId);
    const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || "Unknown";
    const getOfferName = (id: string) => offers.find(o => o.id === id);

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
                        onClick={() => { resetForm(); setShowForm(!showForm); }}
                        className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        Add Product
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
                    <div className="flex items-center gap-4 flex-wrap">
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
                        {(filterCategory || filterAvailable) && (
                            <button
                                onClick={() => { setFilterCategory(""); setFilterAvailable(""); }}
                                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
                            >
                                Clear Filters
                            </button>
                        )}
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

                {/* Products list */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="p-4 border-b border-gray-100">
                        <h3 className="font-semibold text-gray-800">All Products ({products.length})</h3>
                    </div>

                    {loading && products.length === 0 ? (
                        <div className="p-8 text-center">
                            <Loader2 className="w-8 h-8 animate-spin text-amber-600 mx-auto" />
                        </div>
                    ) : products.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <p>No products yet. Add your first product!</p>
                        </div>
                    ) : (
                        <div>
                            <div className="divide-y divide-gray-100">
                                {products.map((product) => {
                                    const offer = product.offerId ? getOfferName(product.offerId) : null;
                                    return (
                                        <div key={product.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                                            <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                                                {product.imageUrl ? (
                                                    <Image
                                                        src={product.imageUrl}
                                                        alt={product.name}
                                                        fill
                                                        className="object-cover"
                                                        unoptimized
                                                        onError={(e) => {
                                                            // Next.js Image component onError handling is different, usually needs state to switch to fallback
                                                            // For simplicity in this fix, we might want to keep it simple or implement fallback state logic
                                                            // But straightforward replacement with unoptimized is requested.
                                                            // The previous onError logic: (e.target as HTMLImageElement).src = ...
                                                            // This doesn't work easily with next/image.
                                                            // I will omit onError for now or use a simple fallback if I had time to implement state.
                                                            // Given this is an admin dashboard, broken image icon is acceptable or I can try a different approach.
                                                            // However, since I must provide valid TSX in replacement:
                                                            const target = e.target as HTMLImageElement;
                                                            target.style.display = 'none'; // Simple fallback to hide broken image
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Package className="w-6 h-6 text-gray-300" />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                                    <h4 className="font-semibold text-gray-800 truncate">{product.name}</h4>
                                                    {!product.available && (
                                                        <span className="px-2 py-0.5 text-xs bg-red-100 text-red-600 rounded">
                                                            Unavailable
                                                        </span>
                                                    )}
                                                    {product.featured && (
                                                        <span className="px-2 py-0.5 text-xs bg-amber-100 text-amber-600 rounded">
                                                            Featured
                                                        </span>
                                                    )}
                                                    {offer && (
                                                        <span className="px-2 py-0.5 text-xs bg-green-100 text-green-600 rounded flex items-center gap-1">
                                                            <Tag className="w-3 h-3" />
                                                            {offer.discount}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-500">
                                                    {getCategoryName(product.categoryId)}
                                                    {product.subcategoryId && ` → ${getCategoryName(product.subcategoryId)}`}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="font-bold text-amber-600">₹{product.price}</span>
                                                    {product.originalPrice && (
                                                        <span className="text-sm text-gray-400 line-through">₹{product.originalPrice}</span>
                                                    )}
                                                    {product.videoUrl && (
                                                        <span className="flex items-center gap-1 text-[10px] bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded ml-2">
                                                            <Film className="w-3 h-3" /> Video
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleToggleAvailability(product.id, product.available)}
                                                    className={`p-2 rounded-lg transition-colors ${product.available ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}
                                                    title={product.available ? "Mark as Out of Stock" : "Mark as In Stock"}
                                                >
                                                    {product.available ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(product)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                >
                                                    <Edit2 className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(product.id)}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
